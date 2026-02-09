/**
 * Style parser – extracts design styles from Figma nodes.
 * Handles missing or optional Figma attributes gracefully.
 */

import type { DesignTraceRef } from '../../model/identifiers.js';
import type {
  DesignColor,
  DesignTypography,
  DesignLayout,
  DesignBorder,
  DesignStyles,
} from '../../model/styles.js';
import type { FigmaRgba, FigmaRect, FigmaTypeStyle } from '../figma/figma-types.js';

/** Convert Figma RGBA (0–1) to DesignColor (0–255 for RGB, 0–1 for alpha) */
export function parseFigmaColor(rgba: FigmaRgba | undefined, opacity?: number): DesignColor | undefined {
  if (!rgba) return undefined;
  const r = rgba.r ?? 0;
  const g = rgba.g ?? 0;
  const b = rgba.b ?? 0;
  const a = rgba.a ?? opacity ?? 1;
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a };
}

/** Extract first solid fill color from Figma paints */
export function parseFillColor(
  paints: readonly { color?: FigmaRgba; opacity?: number; type?: string }[] | undefined
): DesignColor | undefined {
  if (!paints || !Array.isArray(paints)) return undefined;
  const solid = paints.find((p) => p?.type === 'SOLID' || (p?.color != null));
  if (!solid?.color) return undefined;
  const color = solid.color;
  return parseFigmaColor(color, solid.opacity);
}

/** Parse Figma type style to DesignTypography */
export function parseFigmaTypography(
  style: FigmaTypeStyle | undefined,
  traceRef: DesignTraceRef
): DesignTypography | undefined {
  if (!style) return undefined;
  const fontFamily = style.fontFamily ?? style.fontPostScriptName;
  if (!fontFamily) return undefined;

  const fontSize = style.fontSize ?? 12;
  const textAlign = mapTextAlign(style.textAlignHorizontal);

  return {
    fontFamily,
    fontSize,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeightPx,
    letterSpacing: style.letterSpacing,
    textAlign,
  };
}

function mapTextAlign(
  horizontal: string | undefined
): 'left' | 'center' | 'right' | 'justify' | undefined {
  if (!horizontal) return undefined;
  const map: Record<string, 'left' | 'center' | 'right' | 'justify'> = {
    LEFT: 'left',
    CENTER: 'center',
    RIGHT: 'right',
    JUSTIFIED: 'justify',
  };
  return map[horizontal];
}

/** Parse Figma rect to DesignLayout */
export function parseFigmaLayout(rect: FigmaRect | undefined, traceRef: DesignTraceRef): DesignLayout {
  return {
    x: rect?.x ?? 0,
    y: rect?.y ?? 0,
    width: Math.max(0, rect?.width ?? 0),
    height: Math.max(0, rect?.height ?? 0),
  };
}

/** Parse border from Figma node */
export function parseFigmaBorder(
  strokes: readonly { color?: FigmaRgba; opacity?: number; type?: string }[] | undefined,
  strokeWeight: number | undefined,
  cornerRadius: number | undefined
): DesignBorder | undefined {
  const color = parseFillColor(strokes && Array.isArray(strokes) ? strokes : undefined);
  const width = strokeWeight ?? (color ? 1 : undefined);
  const radius = cornerRadius;

  if (!color && !width && radius === undefined) return undefined;
  return { width, color, radius };
}

/** Build DesignStyles from Figma node data */
export function buildDesignStyles(
  traceRef: DesignTraceRef,
  opts: {
    readonly layout?: DesignLayout;
    readonly typography?: DesignTypography;
    readonly backgroundColor?: DesignColor;
    readonly textColor?: DesignColor;
    readonly border?: DesignBorder;
  }
): DesignStyles {
  return {
    traceRef,
    typography: opts.typography,
    layout: opts.layout,
    backgroundColor: opts.backgroundColor,
    textColor: opts.textColor,
    border: opts.border,
  };
}
