/**
 * Canonical app UI style models.
 * Immutable representations of runtime/computed styles from app inspection.
 */

import type { AppTraceRef } from './identifiers.js';

/** Runtime bounds (position and size) */
export interface AppBounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Runtime typography (when detectable) */
export interface AppTypography {
  readonly fontFamily?: string;
  readonly fontSize?: number;
  readonly textAlign?: 'left' | 'center' | 'right' | 'justify';
}

/** Aggregated runtime styles for an app element */
export interface AppStyles {
  readonly traceRef: AppTraceRef;
  readonly bounds: AppBounds;
  readonly visible: boolean;
  readonly enabled?: boolean;
  readonly typography?: AppTypography;
  readonly backgroundColor?: string;
  readonly textColor?: string;
}
