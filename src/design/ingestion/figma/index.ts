/**
 * Figma API – client and types.
 * Only layer that depends on Figma API.
 */

export type {
  FigmaFileResponse,
  FigmaDocumentNode,
  FigmaCanvasNode,
  FigmaFrameNode,
  FigmaNode,
  FigmaRgba,
  FigmaRect,
  FigmaTypeStyle,
  FigmaPaint,
} from './figma-types.js';

export type { FigmaApiClient, FigmaFileOptions } from './figma-api-client.js';
export { DefaultFigmaApiClient } from './figma-api-client.js';
