/**
 * Figma reference builder – builds Figma URLs from design trace ref.
 */

import type { DesignTraceRef } from '../design/model/identifiers.js';
import type { FigmaReference } from './model/evidence-attachment.js';

const FIGMA_BASE = 'https://www.figma.com';

/** Build Figma reference (URL + metadata) from DesignTraceRef */
export function buildFigmaReference(
  designRef: DesignTraceRef,
  options?: { baseUrl?: string }
): FigmaReference {
  const base = options?.baseUrl ?? FIGMA_BASE;
  const url = `${base}/file/${designRef.fileKey}?node-id=${encodeURIComponent(designRef.nodeId)}`;
  return {
    fileKey: designRef.fileKey,
    nodeId: designRef.nodeId,
    url,
    pageId: designRef.pageId,
    pageName: designRef.pageName,
    nodeName: designRef.nodeName,
  };
}
