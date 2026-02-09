/**
 * Evidence attachment model – extended evidence with screenshots, Figma refs, metadata.
 * Evidence generation is optional; does not affect comparison logic.
 */

import type { DesignTraceRef } from '../../design/model/identifiers.js';

/** Figma reference – URL and node info for traceability */
export interface FigmaReference {
  readonly fileKey: string;
  readonly nodeId: string;
  readonly url: string;
  readonly pageId?: string;
  readonly pageName?: string;
  readonly nodeName?: string;
}

/** Metadata: expected (design) vs actual (app) */
export interface ExpectedActualMetadata {
  readonly expected: unknown;
  readonly actual: unknown;
  readonly property?: string;
}

/** Visual diff placeholder – URI for future visual diff asset */
export interface VisualDiffPlaceholder {
  readonly uri?: string;
  readonly status: 'pending' | 'available' | 'unavailable';
}

/** Screenshot attachment */
export interface ScreenshotAttachment {
  readonly data?: string;
  readonly uri?: string;
  readonly timestamp?: string;
}

/** Full evidence attachment – attaches to ValidationResult (optional) */
export interface EvidenceAttachment {
  readonly expected: unknown;
  readonly actual: unknown;
  readonly delta: unknown;
  readonly visualReferenceUri?: string;
  readonly screenshot?: ScreenshotAttachment;
  readonly figmaRef?: FigmaReference;
  readonly metadata?: ExpectedActualMetadata | readonly ExpectedActualMetadata[];
  readonly visualDiff?: VisualDiffPlaceholder;
}
