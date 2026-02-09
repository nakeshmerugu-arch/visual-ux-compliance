/**
 * Rule engine contracts – ValidationRule interface and rule configurations.
 * No implementations; no dependencies on reporting or UI automation.
 */

export type { ValidationRule, RuleInput } from './validation-rule.js';

export type {
  ToleranceConfig,
  PositionRuleConfig,
  SizeRuleConfig,
  FontSizeRuleConfig,
  FontFamilyRuleConfig,
  ColorRuleConfig,
  TextContentRuleConfig,
} from './rule-config.js';

export {
  RULE_IDS,
  RULE_CATALOG,
  type RuleId,
  type RuleDescriptor,
  type RuleConfigMap,
} from './rule-catalog.js';
