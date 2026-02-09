/**
 * Evidence generation – optional attachment of screenshots, Figma refs, metadata.
 * Does not affect comparison logic.
 */

export type {
  FigmaReference,
  ExpectedActualMetadata,
  VisualDiffPlaceholder,
  ScreenshotAttachment,
  EvidenceAttachment,
} from './model/index.js';

export { buildFigmaReference } from './figma-reference-builder.js';

export {
  attachEvidence,
  attachEvidenceToRun,
  type EvidenceBuilderOptions,
} from './evidence-builder.js';
