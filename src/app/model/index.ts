/**
 * App model – canonical app UI models (runtime snapshot).
 * All models are immutable and support traceability to runtime inspection.
 */

export type {
  AppSessionId,
  AppScreenId,
  AppElementId,
  AppTraceRef,
} from './identifiers.js';

export type {
  AppBounds,
  AppTypography,
  AppStyles,
} from './styles.js';

export type {
  AppElement,
  AppElementType,
} from './element.js';

export type { AppScreen } from './screen.js';
