/**
 * Frame parser – extracts screen/frame structure from Figma.
 * Frames are top-level containers (screens) within a page.
 */

import type { FigmaFrameNode, FigmaCanvasNode, FigmaNode } from '../figma/figma-types.js';
import type { DesignTraceRef } from '../../model/identifiers.js';

/** Check if node is a frame (screen) */
export function isFrameNode(node: FigmaNode | undefined): node is FigmaFrameNode {
  return node != null && (node as FigmaNode & { type: string }).type === 'FRAME';
}

/** Check if node is a canvas (page) */
export function isCanvasNode(node: unknown): node is FigmaCanvasNode {
  return node != null && typeof node === 'object' && (node as { type?: string }).type === 'CANVAS';
}

/** Get frame nodes from a canvas (page) */
export function getFramesFromCanvas(canvas: FigmaCanvasNode): readonly FigmaFrameNode[] {
  const children = canvas.children;
  if (!children || !Array.isArray(children)) return [];
  return children.filter(isFrameNode);
}

/** Extract rect from frame for bounds */
export function getFrameBounds(
  frame: FigmaFrameNode
): { x: number; y: number; width: number; height: number } {
  const box = frame.absoluteBoundingBox;
  return {
    x: box?.x ?? 0,
    y: box?.y ?? 0,
    width: Math.max(0, box?.width ?? 0),
    height: Math.max(0, box?.height ?? 0),
  };
}
