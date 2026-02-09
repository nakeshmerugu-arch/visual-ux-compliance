/**
 * Severity model for mismatches and validation outcomes.
 * Immutable, extensible severity classification.
 */

/** Severity level for a mismatch or validation failure */
export type SeverityLevel =
  | 'critical'   // Blocks release, must fix
  | 'high'       // Significant deviation, should fix
  | 'medium'     // Notable deviation, consider fixing
  | 'low'        // Minor deviation, optional
  | 'info';      // Informational, no action required

/** Severity with optional metadata */
export interface Severity {
  readonly level: SeverityLevel;
  readonly description?: string;
}
