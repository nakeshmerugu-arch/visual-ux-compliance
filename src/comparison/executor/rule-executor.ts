/**
 * Rule executor – applies validation rules per mapped component.
 * Never short-circuits on failure; all rules run; results are deterministic.
 */

import type { ValidationRule } from '../rule/validation-rule.js';
import type { ComponentMapping } from '../../mapping/model/mapping-result.js';
import type { ValidationResult } from '../model/validation-result.js';
import type { RuleConfigs } from '../config/rule-config-loader.js';

export interface RuleExecutorOptions {
  readonly ruleConfigs?: RuleConfigs;
}

/** Sort key for determinism: design node id, then rule id */
function mappingSortKey(m: ComponentMapping): string {
  return `${m.design.traceRef.nodeId}::${m.design.traceRef.fileKey}`;
}

function ruleSortKey(rule: ValidationRule): string {
  return rule.ruleId;
}

/**
 * Execute all rules on all component mappings.
 * Never short-circuits; every rule runs for every mapping.
 * Results are deterministic (sorted by mapping key, then rule key).
 */
export function executeRules(
  rules: readonly ValidationRule[],
  componentMappings: readonly ComponentMapping[],
  options: RuleExecutorOptions = {}
): ValidationResult[] {
  const configs = options.ruleConfigs ?? {};
  const results: ValidationResult[] = [];

  const sortedMappings = [...componentMappings].sort((a, b) =>
    mappingSortKey(a).localeCompare(mappingSortKey(b))
  );
  const sortedRules = [...rules].sort((a, b) =>
    ruleSortKey(a).localeCompare(ruleSortKey(b))
  );

  for (const mapping of sortedMappings) {
    for (const rule of sortedRules) {
      const config = configs[rule.ruleId] ?? {};
      const input = {
        design: mapping.design,
        app: mapping.app,
        config,
      };
      const result = rule.execute(input);
      results.push(result);
    }
  }

  return results;
}
