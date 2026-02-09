/**
 * Positional proximity matching strategy.
 */

import type { DesignComponent } from '../../design/model/component.js';
import type { AppElement } from '../../app/model/element.js';
import type { MatchEvidence } from '../model/mapping-result.js';

function designCenter(design: DesignComponent): { x: number; y: number } {
  const layout = design.styles.layout;
  if (!layout) return { x: 0, y: 0 };
  return {
    x: layout.x + layout.width / 2,
    y: layout.y + layout.height / 2,
  };
}

function appCenter(app: AppElement): { x: number; y: number } {
  const b = app.styles.bounds;
  return {
    x: b.x + b.width / 2,
    y: b.y + b.height / 2,
  };
}

/** Euclidean distance between centers */
function distance(
  ax: number,
  ay: number,
  bx: number,
  by: number
): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

/** Score 0–1 based on proximity (closer = higher). Uses screen diagonal as scale. */
export function positionalProximityScore(
  design: DesignComponent,
  app: AppElement,
  screenWidth: number,
  screenHeight: number
): number {
  const dc = designCenter(design);
  const ac = appCenter(app);
  const d = distance(dc.x, dc.y, ac.x, ac.y);
  const diagonal = Math.sqrt(screenWidth ** 2 + screenHeight ** 2);
  if (diagonal <= 0) return 0;
  const normalized = d / diagonal;
  return Math.max(0, 1 - normalized);
}

export function createPositionalProximityEvidence(
  score: number,
  design: DesignComponent,
  app: AppElement
): MatchEvidence {
  const dc = designCenter(design);
  const ac = appCenter(app);
  const d = distance(dc.x, dc.y, ac.x, ac.y);
  return {
    strategy: 'positional-proximity',
    score,
    details: `designCenter=(${dc.x},${dc.y}) appCenter=(${ac.x},${ac.y}) distance=${d.toFixed(1)}`,
  };
}
