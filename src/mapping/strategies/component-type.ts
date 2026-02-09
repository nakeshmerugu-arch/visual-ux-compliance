/**
 * Component type matching strategy.
 */

import type { DesignComponent } from '../../design/model/component.js';
import type { AppElement } from '../../app/model/element.js';
import type { MatchEvidence } from '../model/mapping-result.js';

const TYPE_SCORES: Record<string, number> = {
  button: 1,
  input: 1,
  text: 1,
  image: 1,
  icon: 1,
  container: 0.5,
  unknown: 0.2,
};

/** Score 0–1 for component type match */
export function componentTypeScore(
  design: DesignComponent,
  app: AppElement
): number {
  const d = design.type;
  const a = app.type;
  if (d === a) return TYPE_SCORES[d] ?? 0.5;
  const compatible = [
    ['text', 'container'],
    ['button', 'text'],
    ['container', 'unknown'],
  ];
  for (const [x, y] of compatible) {
    if ((d === x && a === y) || (d === y && a === x)) return 0.6;
  }
  return 0;
}

export function createComponentTypeEvidence(
  score: number,
  designType: string,
  appType: string
): MatchEvidence {
  return {
    strategy: 'component-type',
    score,
    details: `design.type="${designType}" app.type="${appType}"`,
  };
}
