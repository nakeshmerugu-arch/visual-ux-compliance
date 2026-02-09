/**
 * Mapping result models – design ↔ app mappings with confidence scores.
 * All models support traceability and debuggability.
 */

import type { DesignScreen } from '../../design/model/screen.js';
import type { DesignComponent } from '../../design/model/component.js';
import type { AppScreen } from '../../app/model/screen.js';
import type { AppElement } from '../../app/model/element.js';

/** Matching strategy used */
export type MatchStrategy =
  | 'accessibility-id'
  | 'text-similarity'
  | 'component-type'
  | 'positional-proximity';

/** Evidence for a match – debuggable, explains why mapping was chosen */
export interface MatchEvidence {
  readonly strategy: MatchStrategy;
  readonly score: number;
  readonly details?: string;
}

/** Component mapping – design component to app element with confidence */
export interface ComponentMapping {
  readonly design: DesignComponent;
  readonly app: AppElement;
  readonly confidence: number;
  readonly evidence: readonly MatchEvidence[];
}

/** Screen mapping – design screen to app screen with confidence */
export interface ScreenMapping {
  readonly design: DesignScreen;
  readonly app: AppScreen;
  readonly confidence: number;
  readonly componentMappings: readonly ComponentMapping[];
}
