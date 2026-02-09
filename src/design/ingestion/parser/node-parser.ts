/**
 * Node parser – recursively parses Figma nodes into DesignComponent.
 * Orchestrates style, frame, component, and text parsers.
 */

import type { FigmaNode, FigmaTextNode, FigmaRgba } from '../figma/figma-types.js';
import type { DesignComponent } from '../../model/component.js';
import type { DesignTraceRef } from '../../model/identifiers.js';
import {
  parseFillColor,
  parseFigmaLayout,
  parseFigmaTypography,
  parseFigmaBorder,
  buildDesignStyles,
} from './style-parser.js';
import { mapNodeTypeToComponentType } from './component-parser.js';
import { isTextNode, extractTextContent } from './text-parser.js';

/** Context for parsing – provides file/page info for traceRef */
export interface ParseContext {
  readonly fileKey: string;
  readonly fileName?: string;
  readonly pageId?: string;
  readonly pageName?: string;
}

function createTraceRef(node: FigmaNode, ctx: ParseContext): DesignTraceRef {
  return {
    nodeId: node.id,
    fileKey: ctx.fileKey,
    pageId: ctx.pageId,
    pageName: ctx.pageName,
    nodeName: node.name,
  };
}

function getPaints(
  node: FigmaNode
): readonly { color?: FigmaRgba; opacity?: number; type?: string }[] | undefined {
  const n = node as FigmaNode & { fills?: unknown };
  const fills = n.fills;
  if (fills && Array.isArray(fills)) return fills as readonly { color?: FigmaRgba; opacity?: number; type?: string }[];
  return undefined;
}

function getStrokes(
  node: FigmaNode
): readonly { color?: FigmaRgba; type?: string }[] | undefined {
  const n = node as FigmaNode & { strokes?: unknown };
  const strokes = n.strokes;
  if (strokes && Array.isArray(strokes))
    return strokes as readonly { color?: FigmaRgba; type?: string }[];
  return undefined;
}

function getRect(node: FigmaNode): { x?: number; y?: number; width?: number; height?: number } | undefined {
  const n = node as FigmaNode & { absoluteBoundingBox?: unknown };
  return n.absoluteBoundingBox as { x?: number; y?: number; width?: number; height?: number } | undefined;
}

function getChildren(node: FigmaNode): readonly FigmaNode[] {
  const children = (node as FigmaNode & { children?: readonly FigmaNode[] }).children;
  if (children && Array.isArray(children)) return children;
  return [];
}

function getCornerRadius(node: FigmaNode): number | undefined {
  const n = node as FigmaNode & { cornerRadius?: number };
  return n.cornerRadius;
}

function getStrokeWeight(node: FigmaNode): number | undefined {
  const n = node as FigmaNode & { strokeWeight?: number };
  return n.strokeWeight;
}

/** Recursively parse a Figma node into DesignComponent */
export function parseNode(node: FigmaNode, ctx: ParseContext): DesignComponent {
  const traceRef = createTraceRef(node, ctx);
  const type = mapNodeTypeToComponentType((node as FigmaNode & { type: string }).type);
  const rect = getRect(node);
  const layout = parseFigmaLayout(rect, traceRef);

  let typography: ReturnType<typeof parseFigmaTypography> | undefined;
  let text: string | undefined;
  let backgroundColor: ReturnType<typeof parseFillColor> | undefined;
  let textColor: ReturnType<typeof parseFillColor> | undefined;

  if (isTextNode(node)) {
    typography = parseFigmaTypography((node as FigmaTextNode).style, traceRef);
    text = extractTextContent(node);
    const fills = getPaints(node);
    textColor = parseFillColor(fills);
  } else {
    const fills = getPaints(node);
    backgroundColor = parseFillColor(fills);
  }

  const strokes = getStrokes(node);
  const border = parseFigmaBorder(strokes, getStrokeWeight(node), getCornerRadius(node));

  const styles = buildDesignStyles(traceRef, {
    layout,
    typography,
    backgroundColor,
    textColor,
    border,
  });

  const children = getChildren(node).map((child) => parseNode(child, ctx));

  return {
    traceRef,
    type,
    styles,
    text,
    children,
  };
}
