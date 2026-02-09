/**
 * Screen mapper – maps design screens to app screens.
 * Produces confidence scores; debuggable.
 * No validations.
 */

import type { DesignScreen } from '../design/model/screen.js';
import type { AppScreen } from '../app/model/screen.js';
import type { ScreenMapping } from './model/mapping-result.js';
import { textSimilarity } from './strategies/text-similarity.js';
import {
  mapComponents,
  type StrategyWeights,
} from './component-mapper.js';

export interface ScreenMapperOptions {
  readonly minConfidence?: number;
  readonly componentWeights?: StrategyWeights;
}

function screenNameSimilarity(design: DesignScreen, app: AppScreen): number {
  return textSimilarity(design.name, app.name);
}

function dimensionSimilarity(design: DesignScreen, app: AppScreen): number {
  if (design.width <= 0 || design.height <= 0) return 0.5;
  const wRatio = Math.min(design.width, app.width) / Math.max(design.width, app.width);
  const hRatio = Math.min(design.height, app.height) / Math.max(design.height, app.height);
  return (wRatio + hRatio) / 2;
}

/** Compute screen-level confidence 0–1 */
function screenConfidence(design: DesignScreen, app: AppScreen): number {
  const nameScore = screenNameSimilarity(design, app);
  const dimScore = dimensionSimilarity(design, app);
  return nameScore * 0.6 + dimScore * 0.4;
}

export function mapScreens(
  designScreens: readonly DesignScreen[],
  appScreens: readonly AppScreen[],
  options: ScreenMapperOptions = {}
): ScreenMapping[] {
  const minConfidence = options.minConfidence ?? 0.2;
  const result: ScreenMapping[] = [];

  const usedAppIndices = new Set<number>();

  for (const design of designScreens) {
    let best: { app: AppScreen; confidence: number } | null = null;
    let bestIdx = -1;

    for (let i = 0; i < appScreens.length; i++) {
      if (usedAppIndices.has(i)) continue;
      const app = appScreens[i]!;
      const confidence = screenConfidence(design, app);
      if (confidence >= minConfidence && (!best || confidence > best.confidence)) {
        best = { app, confidence };
        bestIdx = i;
      }
    }

    if (best) {
      usedAppIndices.add(bestIdx);
      const componentResult = mapComponents(
        design.components,
        best.app.elements,
        {
          screenWidth: best.app.width,
          screenHeight: best.app.height,
          weights: options.componentWeights,
        }
      );

      result.push({
        design,
        app: best.app,
        confidence: best.confidence,
        componentMappings: componentResult.mappings,
      });
    }
  }

  return result;
}
