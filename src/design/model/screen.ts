/**
 * Canonical design screen model.
 * Represents a screen/frame in the design system.
 */

import type { DesignTraceRef } from './identifiers.js';
import type { DesignComponent } from './component.js';

/** Design screen (page or frame) */
export interface DesignScreen {
  readonly traceRef: DesignTraceRef;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly components: readonly DesignComponent[];
}
