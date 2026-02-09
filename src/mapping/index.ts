/**
 * Screen & component mapping – design ↔ app with confidence scores.
 * No validations; debuggable.
 */

export type {
  MatchStrategy,
  MatchEvidence,
  ComponentMapping,
  ScreenMapping,
} from './model/index.js';

export type { UnmappedDesignComponent, UnmappedAppElement } from './model/index.js';

export {
  mapScreens,
  type ScreenMapperOptions,
} from './screen-mapper.js';

export {
  mapComponents,
  DEFAULT_STRATEGY_WEIGHTS,
  type ComponentMapperOptions,
  type ComponentMapperResult,
  type StrategyWeights,
} from './component-mapper.js';

export * from './strategies/index.js';
