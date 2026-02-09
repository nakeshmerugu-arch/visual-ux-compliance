/**
 * Canonical design component model.
 * Represents a single design element with hierarchy support.
 */

import type { DesignTraceRef } from './identifiers.js';
import type { DesignStyles } from './styles.js';

/** Semantic type of a design component */
export type DesignComponentType =
  | 'screen'
  | 'container'
  | 'text'
  | 'image'
  | 'button'
  | 'input'
  | 'icon'
  | 'unknown';

/** Canonical design component (element) */
export interface DesignComponent {
  readonly traceRef: DesignTraceRef;
  readonly type: DesignComponentType;
  readonly styles: DesignStyles;
  readonly text?: string;
  readonly children: readonly DesignComponent[];
}
