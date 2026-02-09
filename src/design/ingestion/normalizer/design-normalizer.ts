/**
 * Design normalizer – converts Figma file response to canonical design models.
 * No comparison logic; no Appium logic.
 */

import type { FigmaFileResponse, FigmaDocumentNode, FigmaCanvasNode, FigmaFrameNode } from '../figma/figma-types.js';
import type { DesignScreen } from '../../model/screen.js';
import type { DesignComponent } from '../../model/component.js';
import { getFramesFromCanvas } from '../parser/frame-parser.js';
import { parseNode } from '../parser/node-parser.js';
import { getFrameBounds } from '../parser/frame-parser.js';

function getDocument(res: FigmaFileResponse): FigmaDocumentNode | undefined {
  const doc = res.document;
  if (!doc || (doc as FigmaDocumentNode & { type?: string }).type !== 'DOCUMENT') return undefined;
  return doc as FigmaDocumentNode;
}

function getCanvases(doc: FigmaDocumentNode): readonly FigmaCanvasNode[] {
  const children = doc.children;
  if (!children || !Array.isArray(children)) return [];
  return children.filter(
    (c): c is FigmaCanvasNode => c != null && (c as FigmaCanvasNode & { type?: string }).type === 'CANVAS'
  );
}

/** Normalize Figma file response into canonical DesignScreen models */
export function normalizeFigmaFile(
  response: FigmaFileResponse,
  fileKey: string
): readonly DesignScreen[] {
  const doc = getDocument(response);
  if (!doc) return [];

  const fileName = response.name;
  const canvases = getCanvases(doc);
  const screens: DesignScreen[] = [];

  for (const canvas of canvases) {
    const pageId = canvas.id;
    const pageName = canvas.name;
    const frames = getFramesFromCanvas(canvas);

    for (const frame of frames) {
      const bounds = getFrameBounds(frame);
      const ctx = { fileKey, fileName, pageId, pageName };
      const components = parseFrameChildren(frame, ctx);

      const screen: DesignScreen = {
        traceRef: {
          nodeId: frame.id,
          fileKey,
          pageId,
          pageName,
          nodeName: frame.name,
        },
        name: frame.name ?? 'Untitled',
        width: bounds.width,
        height: bounds.height,
        components,
      };
      screens.push(screen);
    }
  }

  return screens;
}

function parseFrameChildren(
  frame: FigmaFrameNode,
  ctx: { fileKey: string; fileName?: string; pageId?: string; pageName?: string }
): readonly DesignComponent[] {
  const children = frame.children;
  if (!children || !Array.isArray(children)) return [];
  return children.map((node) => parseNode(node, ctx));
}
