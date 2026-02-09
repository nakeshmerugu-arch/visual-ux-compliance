/**
 * Aggregate validation result for a screen or full run.
 * Reports are generated from these models only; no re-running comparisons.
 */

import type { ValidationResult } from './validation-result.js';
import type { Mismatch } from './mismatch.js';

/** Aggregated outcome for a screen-level comparison */
export interface ScreenValidationResult {
  readonly screenName: string;
  readonly designRef: { readonly nodeId: string; readonly fileKey: string };
  readonly appRef: { readonly screenId: string; readonly sessionId: string };
  readonly passed: boolean;
  readonly results: readonly ValidationResult[];
  readonly totalMismatches: number;
}

/** Full run outcome */
export interface RunValidationResult {
  readonly runId: string;
  readonly timestamp: string;
  readonly platform: 'android' | 'ios';
  readonly screenResults: readonly ScreenValidationResult[];
  readonly passed: boolean;
  readonly totalMismatches: number;
  readonly allMismatches: readonly Mismatch[];
}
