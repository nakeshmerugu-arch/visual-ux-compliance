/**
 * Validation result model – outcome of a comparison.
 * Every result is traceable to design, app, and rules applied.
 */

import type { DesignTraceRef } from '../../design/model/identifiers.js';
import type { AppTraceRef } from '../../app/model/identifiers.js';
import type { Mismatch } from './mismatch.js';

/** Evidence reference for a failed validation */
export interface EvidenceRef {
  readonly expected: unknown;
  readonly actual: unknown;
  readonly delta: unknown;
  readonly visualReferenceUri?: string;
  readonly screenshotData?: string;
  readonly screenshotUri?: string;
  readonly figmaUrl?: string;
  readonly figmaNodeId?: string;
  readonly metadata?: { readonly expected: unknown; readonly actual: unknown };
  readonly visualDiffUri?: string;
  readonly visualDiffStatus?: 'pending' | 'available' | 'unavailable';
}

/** Outcome of validating a single design-element-to-app-element pair */
export interface ValidationResult {
  readonly passed: boolean;
  readonly designRef: DesignTraceRef;
  readonly appRef: AppTraceRef;
  readonly ruleId: string;
  readonly ruleName: string;
  readonly mismatches: readonly Mismatch[];
  readonly evidence?: EvidenceRef;
}
