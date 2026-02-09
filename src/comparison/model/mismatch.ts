/**
 * Mismatch model – represents a single validation failure.
 * Every mismatch is traceable to design element, app element, and rule.
 */

import type { DesignTraceRef } from '../../design/model/identifiers.js';
import type { AppTraceRef } from '../../app/model/identifiers.js';
import type { Severity } from './severity.js';
import type { Delta } from './delta.js';

/** A single mismatch between design and app */
export interface Mismatch {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly designRef: DesignTraceRef;
  readonly appRef: AppTraceRef;
  readonly severity: Severity;
  readonly delta: Delta;
  readonly message: string;
}
