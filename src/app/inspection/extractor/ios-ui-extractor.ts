/**
 * iOS UI extractor – converts raw accessibility tree to canonical AppElement.
 */

import type { RawAccessibilityNode } from '../accessibility/raw-accessibility-node.js';
import type { AppElement } from '../../model/element.js';
import type { AppTraceRef } from '../../model/identifiers.js';
import type { AppBounds } from '../../model/styles.js';

export interface IosExtractorContext {
  readonly sessionId: string;
  readonly screenId?: string;
}

/** Parse iOS rect "{{x, y}, {width, height}}" to AppBounds */
function parseRect(attrs: Record<string, string>): AppBounds {
  const rect = attrs['rect'] ?? attrs['frame'] ?? attrs['bounds'] ?? '';
  const match = rect.match(/\{\{([\d.-]+),\s*([\d.-]+)\},\s*\{([\d.-]+),\s*([\d.-]+)\}\}/);
  if (!match) {
    const x = parseFloat(attrs['x'] ?? attrs['X'] ?? '0') || 0;
    const y = parseFloat(attrs['y'] ?? attrs['Y'] ?? '0') || 0;
    const w = parseFloat(attrs['width'] ?? attrs['W'] ?? '0') || 0;
    const h = parseFloat(attrs['height'] ?? attrs['H'] ?? '0') || 0;
    return { x, y, width: w, height: h };
  }
  const [, x, y, width, height] = match.map(Number);
  return { x, y, width: Math.max(0, width), height: Math.max(0, height) };
}

/** Map iOS element type to AppElementType */
function mapIosTypeToElementType(tagName: string, attrs: Record<string, string>): AppElement['type'] {
  const type = (attrs['type'] ?? tagName).toLowerCase();
  const role = (attrs['AXRole'] ?? attrs['role'] ?? '').toLowerCase();
  const label = attrs['AXRoleDescription'] ?? '';

  if (type.includes('button') || role.includes('button') || label.includes('button')) return 'button';
  if (type.includes('textfield') || type.includes('securetextfield') || role.includes('textfield'))
    return 'input';
  if (type.includes('statictext') || type.includes('text') || role.includes('text')) return 'text';
  if (type.includes('image') || type.includes('imageview')) return 'image';
  if (type.includes('icon')) return 'icon';
  if (type.includes('cell') || type.includes('scroll') || type.includes('view') || type.includes('other'))
    return 'container';
  return 'unknown';
}

function extractText(attrs: Record<string, string>): string | undefined {
  const text =
    attrs['value'] ??
    attrs['label'] ??
    attrs['AXValue'] ??
    attrs['AXLabel'] ??
    attrs['name'] ??
    attrs['title'];
  if (text === undefined || text === null || text === '') return undefined;
  return String(text);
}

function extractElementId(attrs: Record<string, string>, index: number): string {
  const name = attrs['name'] ?? attrs['AXIdentifier'] ?? attrs['identifier'];
  if (name) return name;
  const aid = attrs['accessibilityIdentifier'];
  if (aid) return aid;
  return `ios-node-${index}`;
}

function extractRecursive(
  node: RawAccessibilityNode,
  ctx: IosExtractorContext,
  index: number
): AppElement {
  const attrs = node.attributes;
  const elementId = extractElementId(attrs, index);

  const traceRef: AppTraceRef = {
    elementId,
    sessionId: ctx.sessionId,
    platform: 'ios',
    screenId: ctx.screenId,
    accessibilityId: attrs['accessibilityIdentifier'] ?? attrs['AXIdentifier'],
  };

  const bounds = parseRect(attrs);
  const visible = attrs['visible'] !== 'false' && attrs['isVisible'] !== 'false';
  const enabled = attrs['enabled'] !== 'false' ? true : undefined;

  const type = mapIosTypeToElementType(node.tagName, attrs);
  const text = extractText(attrs);

  const children = node.children.map((c, i) => extractRecursive(c, ctx, index * 100 + i));

  return {
    traceRef,
    type,
    styles: { traceRef, bounds, visible, enabled },
    text,
    children,
  };
}

/** Extract AppElement tree from iOS raw accessibility nodes */
export function extractIosUi(
  nodes: RawAccessibilityNode[],
  ctx: IosExtractorContext
): AppElement[] {
  const root = nodes[0];
  if (!root) return [];

  const children =
    root.tagName === 'XCUIElementTypeApplication' ? root.children : [root];

  return children.map((node, i) => extractRecursive(node, ctx, i));
}
