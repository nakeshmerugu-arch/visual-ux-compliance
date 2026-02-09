/**
 * Canonical app element model.
 * Represents a single UI element in a runtime snapshot.
 */

import type { AppTraceRef } from './identifiers.js';
import type { AppStyles } from './styles.js';

/** Semantic type of an app element (when detectable) */
export type AppElementType =
  | 'container'
  | 'text'
  | 'image'
  | 'button'
  | 'input'
  | 'icon'
  | 'unknown';

/** Canonical app element (runtime UI snapshot) */
export interface AppElement {
  readonly traceRef: AppTraceRef;
  readonly type: AppElementType;
  readonly styles: AppStyles;
  readonly text?: string;
  readonly children: readonly AppElement[];
}
