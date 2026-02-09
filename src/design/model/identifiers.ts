/**
 * Design-side identifiers for traceability back to source (Figma).
 * All identifiers are immutable and framework-agnostic.
 */

/** Unique identifier for a design file (e.g., Figma file key) */
export interface DesignFileId {
  readonly fileKey: string;
  readonly fileName?: string;
}

/** Unique identifier for a design node within a file */
export interface DesignNodeId {
  readonly nodeId: string;
  readonly fileId: DesignFileId;
}

/** Traceability reference for any design element */
export interface DesignTraceRef {
  readonly nodeId: string;
  readonly fileKey: string;
  readonly pageId?: string;
  readonly pageName?: string;
  readonly nodeName?: string;
}
