/**
 * Parsers – Frame, Component, Text, Style.
 * Convert Figma nodes to design model primitives.
 */

export {
  parseFigmaColor,
  parseFillColor,
  parseFigmaTypography,
  parseFigmaLayout,
  parseFigmaBorder,
  buildDesignStyles,
} from './style-parser.js';

export { isFrameNode, isCanvasNode, getFramesFromCanvas, getFrameBounds } from './frame-parser.js';

export { mapNodeTypeToComponentType } from './component-parser.js';

export { isTextNode, extractTextContent, extractTextTypography } from './text-parser.js';

export { parseNode, type ParseContext } from './node-parser.js';
