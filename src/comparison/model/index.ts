/**
 * Comparison model – validation result, mismatch, severity, and delta models.
 * All models are immutable and support full traceability.
 */

export type { SeverityLevel, Severity } from './severity.js';
export type { DeltaPropertyType, Delta } from './delta.js';
export type { Mismatch } from './mismatch.js';
export type { ValidationResult, EvidenceRef } from './validation-result.js';
export type { ScreenValidationResult, RunValidationResult } from './aggregate-result.js';
