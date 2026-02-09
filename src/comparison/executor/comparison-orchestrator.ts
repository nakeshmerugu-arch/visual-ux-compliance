/**
 * Comparison orchestrator – runs comparison execution across screen mappings.
 * Collects all ValidationResults; never short-circuits.
 */

import type { ValidationRule } from '../rule/validation-rule.js';
import type { ScreenMapping } from '../../mapping/model/mapping-result.js';
import type {
  ScreenValidationResult,
  RunValidationResult,
} from '../model/aggregate-result.js';
import type { ValidationResult } from '../model/validation-result.js';
import type { RuleConfigs } from '../config/rule-config-loader.js';
import { executeRules } from './rule-executor.js';

export interface ComparisonOrchestratorOptions {
  readonly ruleConfigs?: RuleConfigs;
  readonly runId?: string;
  readonly platform?: 'android' | 'ios';
}

function generateRunId(): string {
  return `run-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Run comparison for all screen mappings.
 * All rules run for all mappings; never short-circuits.
 */
export function runComparison(
  rules: readonly ValidationRule[],
  screenMappings: readonly ScreenMapping[],
  options: ComparisonOrchestratorOptions = {}
): RunValidationResult {
  const runId = options.runId ?? generateRunId();
  const platform = options.platform ?? 'android';
  const configs = options.ruleConfigs ?? {};

  const screenResults: ScreenValidationResult[] = [];
  const allMismatches: ValidationResult['mismatches'][number][] = [];

  const sortedScreens = [...screenMappings].sort((a, b) =>
    a.design.traceRef.nodeId.localeCompare(b.design.traceRef.nodeId)
  );

  for (const screenMapping of sortedScreens) {
    const results = executeRules(rules, screenMapping.componentMappings, {
      ruleConfigs: configs,
    });

    const mismatches = results.flatMap((r) => [...r.mismatches]);
    for (const m of mismatches) allMismatches.push(m);

    const passed = results.every((r) => r.passed);
    const totalMismatches = mismatches.length;

    screenResults.push({
      screenName: screenMapping.design.name,
      designRef: {
        nodeId: screenMapping.design.traceRef.nodeId,
        fileKey: screenMapping.design.traceRef.fileKey,
      },
      appRef: {
        screenId: screenMapping.app.traceRef.screenId ?? screenMapping.app.traceRef.elementId,
        sessionId: screenMapping.app.traceRef.sessionId,
      },
      passed,
      results,
      totalMismatches,
    });
  }

  const totalMismatches = allMismatches.length;
  const passed = screenResults.every((s) => s.passed);

  return {
    runId,
    timestamp: new Date().toISOString(),
    platform,
    screenResults,
    passed,
    totalMismatches,
    allMismatches,
  };
}
