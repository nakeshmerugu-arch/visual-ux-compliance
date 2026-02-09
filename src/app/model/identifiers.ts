/**
 * App-side identifiers for traceability to runtime inspection.
 * All identifiers are immutable and framework-agnostic.
 */

/** Runtime session identifier */
export interface AppSessionId {
  readonly sessionId: string;
  readonly platform: 'android' | 'ios';
}

/** Unique identifier for an app screen at runtime */
export interface AppScreenId {
  readonly sessionId: AppSessionId;
  readonly screenId: string;
  readonly screenName?: string;
}

/** Unique identifier for an app element at runtime */
export interface AppElementId {
  readonly elementId: string;
  readonly screenId: AppScreenId;
}

/** Traceability reference for any app element */
export interface AppTraceRef {
  readonly elementId: string;
  readonly sessionId: string;
  readonly platform: 'android' | 'ios';
  readonly screenId?: string;
  readonly accessibilityId?: string;
  readonly resourceId?: string;
  readonly xpath?: string;
}
