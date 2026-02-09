/**
 * Canonical app screen model.
 * Represents a runtime snapshot of a screen in the app.
 */

import type { AppTraceRef } from './identifiers.js';
import type { AppElement } from './element.js';

/** App screen (runtime snapshot) */
export interface AppScreen {
  readonly traceRef: AppTraceRef;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly elements: readonly AppElement[];
}
