/**
 * Delta model – represents the difference between expected (design) and actual (app).
 * Immutable, supports various comparison dimensions.
 */

/** Type of property/attribute that was compared */
export type DeltaPropertyType =
  | 'position'
  | 'size'
  | 'typography'
  | 'color'
  | 'spacing'
  | 'visibility'
  | 'text'
  | 'layout'
  | 'other';

/** Structured delta for a single property */
export interface Delta {
  readonly propertyType: DeltaPropertyType;
  readonly propertyName: string;
  readonly expected: unknown;
  readonly actual: unknown;
  readonly tolerance?: number;
  readonly withinTolerance: boolean;
}
