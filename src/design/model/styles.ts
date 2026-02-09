/**
 * Canonical design style models.
 * Immutable, platform-agnostic representations of visual styles from design.
 */

import type { DesignTraceRef } from './identifiers.js';

/** Color in RGBA format (0–255 per channel, 0–1 alpha) */
export interface DesignColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

/** Typography style from design */
export interface DesignTypography {
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly fontWeight?: number;
  readonly lineHeight?: number;
  readonly letterSpacing?: number;
  readonly textAlign?: 'left' | 'center' | 'right' | 'justify';
}

/** Layout/spacing from design */
export interface DesignLayout {
  readonly width: number;
  readonly height: number;
  readonly x: number;
  readonly y: number;
  readonly paddingTop?: number;
  readonly paddingBottom?: number;
  readonly paddingLeft?: number;
  readonly paddingRight?: number;
  readonly gap?: number;
}

/** Border and corner style */
export interface DesignBorder {
  readonly width?: number;
  readonly color?: DesignColor;
  readonly radius?: number;
}

/** Aggregated design styles for an element */
export interface DesignStyles {
  readonly traceRef: DesignTraceRef;
  readonly typography?: DesignTypography;
  readonly layout?: DesignLayout;
  readonly backgroundColor?: DesignColor;
  readonly textColor?: DesignColor;
  readonly border?: DesignBorder;
}
