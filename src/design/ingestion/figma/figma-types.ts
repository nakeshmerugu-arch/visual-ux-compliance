/**
 * Minimal Figma API response types.
 * Handles optional/missing attributes gracefully.
 * Reference: https://www.figma.com/developers/api
 */

/** Figma RGB color (0–1 per channel) */
export interface FigmaRgba {
  readonly r?: number;
  readonly g?: number;
  readonly b?: number;
  readonly a?: number;
}

/** Figma fill (solid paint) */
export interface FigmaSolidPaint {
  readonly type?: 'SOLID';
  readonly color?: FigmaRgba;
  readonly opacity?: number;
}

export type FigmaPaint = FigmaSolidPaint;

/** Bounding box from Figma (absolute coordinates) */
export interface FigmaRect {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
}

/** Figma typeface / font */
export interface FigmaTypeStyle {
  readonly fontFamily?: string;
  readonly fontPostScriptName?: string;
  readonly fontWeight?: number;
  readonly fontSize?: number;
  readonly lineHeightPx?: number;
  readonly letterSpacing?: number;
  readonly textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
}

/** Base node properties shared by all Figma nodes */
export interface FigmaNodeBase {
  readonly id: string;
  readonly name?: string;
  readonly type: string;
  readonly visible?: boolean;
  readonly children?: readonly FigmaNode[];
}

/** Frame node – contains children, has layout */
export interface FigmaFrameNode extends FigmaNodeBase {
  readonly type: 'FRAME';
  readonly absoluteBoundingBox?: FigmaRect;
  readonly fills?: readonly FigmaPaint[] | FigmaVariableAlias;
  readonly strokes?: readonly FigmaPaint[] | FigmaVariableAlias;
  readonly cornerRadius?: number;
  readonly strokeWeight?: number;
  readonly children?: readonly FigmaNode[];
}

/** Component node */
export interface FigmaComponentNode extends FigmaNodeBase {
  readonly type: 'COMPONENT' | 'COMPONENT_SET';
  readonly absoluteBoundingBox?: FigmaRect;
  readonly fills?: readonly FigmaPaint[] | FigmaVariableAlias;
  readonly children?: readonly FigmaNode[];
}

/** Instance of a component */
export interface FigmaInstanceNode extends FigmaNodeBase {
  readonly type: 'INSTANCE';
  readonly absoluteBoundingBox?: FigmaRect;
  readonly componentId?: string;
  readonly children?: readonly FigmaNode[];
}

/** Text node */
export interface FigmaTextNode extends FigmaNodeBase {
  readonly type: 'TEXT';
  readonly characters?: string;
  readonly style?: FigmaTypeStyle;
  readonly absoluteBoundingBox?: FigmaRect;
  readonly fills?: readonly FigmaPaint[] | FigmaVariableAlias;
}

/** Rectangle, ellipse, etc. – vector nodes */
export interface FigmaVectorNode extends FigmaNodeBase {
  readonly type: 'RECTANGLE' | 'ELLIPSE' | 'VECTOR' | 'LINE' | 'STAR' | 'POLYGON';
  readonly absoluteBoundingBox?: FigmaRect;
  readonly fills?: readonly FigmaPaint[] | FigmaVariableAlias;
  readonly strokes?: readonly FigmaPaint[] | FigmaVariableAlias;
  readonly cornerRadius?: number;
}

/** Variable alias – Figma variables reference */
export interface FigmaVariableAlias {
  readonly type?: 'VARIABLE_ALIAS';
  readonly id?: string;
}

/** Union of all Figma node types we parse */
export type FigmaNode =
  | FigmaFrameNode
  | FigmaComponentNode
  | FigmaInstanceNode
  | FigmaTextNode
  | FigmaVectorNode;

/** Document node (root) */
export interface FigmaDocumentNode extends Omit<FigmaNodeBase, 'children'> {
  readonly type: 'DOCUMENT';
  readonly children?: readonly FigmaCanvasNode[];
}

/** Canvas node (page) */
export interface FigmaCanvasNode extends FigmaNodeBase {
  readonly type: 'CANVAS';
  readonly children?: readonly FigmaNode[];
}

/** File response from GET /v1/files/:key */
export interface FigmaFileResponse {
  readonly name?: string;
  readonly document?: FigmaDocumentNode;
}
