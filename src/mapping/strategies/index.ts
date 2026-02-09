/**
 * Matching strategies.
 */

export {
  normalizeText,
  textSimilarity,
  createTextSimilarityEvidence,
} from './text-similarity.js';

export {
  extractResourceIdSuffix,
  normalizeId,
  accessibilityIdScore,
  createAccessibilityIdEvidence,
} from './accessibility-id.js';

export {
  componentTypeScore,
  createComponentTypeEvidence,
} from './component-type.js';

export {
  positionalProximityScore,
  createPositionalProximityEvidence,
} from './positional-proximity.js';
