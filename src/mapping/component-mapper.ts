/**
 * Component mapper – maps design components to app elements.
 * Uses matching strategies with confidence scores; debuggable.
 * No validations.
 */

import type { DesignComponent } from '../design/model/component.js';
import type { AppElement } from '../app/model/element.js';
import type { ComponentMapping, MatchEvidence } from './model/mapping-result.js';
import type { UnmappedDesignComponent, UnmappedAppElement } from './model/unmapped.js';
import {
  accessibilityIdScore,
  createAccessibilityIdEvidence,
} from './strategies/accessibility-id.js';
import {
  textSimilarity,
  createTextSimilarityEvidence,
} from './strategies/text-similarity.js';
import {
  componentTypeScore,
  createComponentTypeEvidence,
} from './strategies/component-type.js';
import {
  positionalProximityScore,
  createPositionalProximityEvidence,
} from './strategies/positional-proximity.js';

/** Weights for strategies (accessibility-id primary) */
export interface StrategyWeights {
  readonly accessibilityId: number;
  readonly textSimilarity: number;
  readonly componentType: number;
  readonly positionalProximity: number;
}

export const DEFAULT_STRATEGY_WEIGHTS: StrategyWeights = {
  accessibilityId: 0.4,
  textSimilarity: 0.25,
  componentType: 0.15,
  positionalProximity: 0.2,
};

export interface ComponentMapperOptions {
  readonly weights?: StrategyWeights;
  readonly minConfidence?: number;
  readonly screenWidth?: number;
  readonly screenHeight?: number;
}

function flattenDesignComponents(components: readonly DesignComponent[]): DesignComponent[] {
  const result: DesignComponent[] = [];
  for (const c of components) {
    result.push(c);
    if (c.children.length > 0) {
      result.push(...flattenDesignComponents([...c.children]));
    }
  }
  return result;
}

function flattenAppElements(elements: readonly AppElement[]): AppElement[] {
  const result: AppElement[] = [];
  for (const e of elements) {
    result.push(e);
    if (e.children.length > 0) {
      result.push(...flattenAppElements([...e.children]));
    }
  }
  return result;
}

function computeScore(
  design: DesignComponent,
  app: AppElement,
  options: Required<ComponentMapperOptions>
): { confidence: number; evidence: MatchEvidence[] } {
  const w = options.weights;

  const evidence: MatchEvidence[] = [];

  const a11yScore = accessibilityIdScore(design.traceRef, app.traceRef);
  evidence.push(createAccessibilityIdEvidence(a11yScore, design.traceRef, app.traceRef));

  const textScore = textSimilarity(design.text, app.text);
  evidence.push(createTextSimilarityEvidence(textScore, design.text, app.text));

  const typeScore = componentTypeScore(design, app);
  evidence.push(createComponentTypeEvidence(typeScore, design.type, app.type));

  const screenW = options.screenWidth ?? 1080;
  const screenH = options.screenHeight ?? 720;
  const posScore = positionalProximityScore(design, app, screenW, screenH);
  evidence.push(createPositionalProximityEvidence(posScore, design, app));

  const confidence =
    a11yScore * w.accessibilityId +
    textScore * w.textSimilarity +
    typeScore * w.componentType +
    posScore * w.positionalProximity;

  return { confidence, evidence };
}

export interface ComponentMapperResult {
  readonly mappings: readonly ComponentMapping[];
  readonly unmappedDesign: readonly UnmappedDesignComponent[];
  readonly unmappedApp: readonly UnmappedAppElement[];
}

export function mapComponents(
  designComponents: readonly DesignComponent[],
  appElements: readonly AppElement[],
  options: ComponentMapperOptions = {}
): ComponentMapperResult {
  const opts: Required<ComponentMapperOptions> = {
    weights: options.weights ?? DEFAULT_STRATEGY_WEIGHTS,
    minConfidence: options.minConfidence ?? 0.2,
    screenWidth: options.screenWidth ?? 1080,
    screenHeight: options.screenHeight ?? 720,
  };

  const designList = flattenDesignComponents([...designComponents]);
  const appList = flattenAppElements([...appElements]);

  const mappings: ComponentMapping[] = [];
  const usedAppIndices = new Set<number>();

  for (const design of designList) {
    let best: { app: AppElement; confidence: number; evidence: MatchEvidence[] } | null = null;
    let bestIdx = -1;

    for (let i = 0; i < appList.length; i++) {
      if (usedAppIndices.has(i)) continue;
      const app = appList[i]!;
      const { confidence, evidence } = computeScore(design, app, opts);
      if (confidence >= opts.minConfidence && (!best || confidence > best.confidence)) {
        best = { app, confidence, evidence };
        bestIdx = i;
      }
    }

    if (best) {
      usedAppIndices.add(bestIdx);
      mappings.push({
        design,
        app: best.app,
        confidence: best.confidence,
        evidence: best.evidence,
      });
    }
  }

  const unmappedDesign: UnmappedDesignComponent[] = designList.filter(
    (d) => !mappings.some((m) => m.design.traceRef.nodeId === d.traceRef.nodeId)
  ).map((d) => ({ design: d }));

  const unmappedApp: UnmappedAppElement[] = appList
    .filter((_, i) => !usedAppIndices.has(i))
    .map((a) => ({ app: a }));

  return { mappings, unmappedDesign, unmappedApp };
}
