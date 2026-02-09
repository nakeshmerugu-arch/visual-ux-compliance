/**
 * Android UI extractor – converts raw accessibility tree to canonical AppElement.
 */

import type { RawAccessibilityNode } from '../accessibility/raw-accessibility-node.js';
import type { AppElement } from '../../model/element.js';
import type { AppTraceRef } from '../../model/identifiers.js';
import type { AppBounds, AppStyles } from '../../model/styles.js';

export interface AndroidExtractorContext {
  readonly sessionId: string;
  readonly screenId?: string;
}

/** Parse Android bounds "[x1,y1][x2,y2]" to { x, y, width, height } */
function parseBounds(attrs: Record<string, string>): AppBounds {
  const boundsStr = attrs['bounds'] ?? attrs['bounds-in-parent'] ?? '';
  const match = boundsStr.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
  if (!match) return { x: 0, y: 0, width: 0, height: 0 };
  const [, x1, y1, x2, y2] = match.map(Number);
  return {
    x: x1,
    y: y1,
    width: Math.max(0, x2 - x1),
    height: Math.max(0, y2 - y1),
  };
}

/** Map Android view class to AppElementType */
function mapClassToType(className: string, attrs: Record<string, string>): AppElement['type'] {
  const cl = className.toLowerCase();
  const clickable = attrs['clickable'] === 'true';
  const scrollable = attrs['scrollable'] === 'true';
  if (cl.includes('button') || (clickable && cl.includes('text'))) return 'button';
  if (cl.includes('edittext') || cl.includes('textfield')) return 'input';
  if (cl.includes('textview') || cl.includes('text')) return 'text';
  if (cl.includes('image') || cl.includes('imageview')) return 'image';
  if (cl.includes('recycler') || cl.includes('scroll') || cl.includes('layout')) return 'container';
  if (cl.includes('checkbox') || cl.includes('switch')) return 'input';
  return 'unknown';
}

function extractText(attrs: Record<string, string>): string | undefined {
  const text = attrs['text'] ?? attrs['content-desc'] ?? attrs['contentDescription'];
  if (text === undefined || text === null || text === '') return undefined;
  return String(text);
}

function extractElementId(attrs: Record<string, string>, index: number): string {
  const resourceId = attrs['resource-id'] ?? attrs['resourceId'];
  if (resourceId) return resourceId;
  const id = attrs['id'];
  if (id) return id;
  return `android-node-${index}`;
}

function extractRecursive(
  node: RawAccessibilityNode,
  ctx: AndroidExtractorContext,
  index: number
): AppElement {
  const attrs = node.attributes;
  const elementId = extractElementId(attrs, index);
  const className = attrs['class'] ?? attrs['className'] ?? '';

  const traceRef: AppTraceRef = {
    elementId,
    sessionId: ctx.sessionId,
    platform: 'android',
    screenId: ctx.screenId,
    resourceId: attrs['resource-id'] ?? attrs['resourceId'],
  };

  const bounds = parseBounds(attrs);
  const styles: AppStyles = {
    traceRef,
    bounds,
    visible: attrs['visible-to-user'] !== 'false',
    enabled: attrs['enabled'] !== 'false' ? true : undefined,
  };

  const type = mapClassToType(className, attrs);
  const text = extractText(attrs);
  const children = node.children
    .filter((c) => {
      const a = c.attributes;
      return a['visible-to-user'] !== 'false' && a['visibility'] !== 'gone';
    })
    .map((c, i) => extractRecursive(c, ctx, index * 100 + i));

  return { traceRef, type, styles, text, children };
}

/** Extract AppElement tree from Android raw accessibility nodes */
export function extractAndroidUi(
  nodes: RawAccessibilityNode[],
  ctx: AndroidExtractorContext
): AppElement[] {
  const hierarchy = nodes.find((n) => n.tagName === 'hierarchy');
  const rootNodes = hierarchy ? hierarchy.children : nodes;
  return rootNodes.map((n, i) => extractRecursive(n, ctx, i));
}
