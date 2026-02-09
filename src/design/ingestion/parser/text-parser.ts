/**
 * Text node parser – extracts text content and typography from Figma TEXT nodes.
 */

import type { FigmaTextNode } from '../figma/figma-types.js';
import type { DesignTraceRef } from '../../model/identifiers.js';
import { parseFigmaTypography } from './style-parser.js';

/** Check if node is a text node */
export function isTextNode(node: unknown): node is FigmaTextNode {
  return node != null && typeof node === 'object' && (node as { type?: string }).type === 'TEXT';
}

/** Extract text content from Figma text node */
export function extractTextContent(node: FigmaTextNode): string | undefined {
  const chars = node.characters;
  if (chars === undefined || chars === null) return undefined;
  return typeof chars === 'string' ? chars : String(chars);
}

/** Extract typography from Figma text node */
export function extractTextTypography(
  node: FigmaTextNode,
  traceRef: DesignTraceRef
): ReturnType<typeof parseFigmaTypography> {
  return parseFigmaTypography(node.style, traceRef);
}
