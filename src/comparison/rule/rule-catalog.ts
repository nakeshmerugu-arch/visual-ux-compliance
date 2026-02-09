/**
 * Rule catalog – identifiers and metadata for all supported rules.
 * Rules are independently executable; catalog is for discovery and configuration.
 */

import type {
  PositionRuleConfig,
  SizeRuleConfig,
  FontSizeRuleConfig,
  FontFamilyRuleConfig,
  ColorRuleConfig,
  TextContentRuleConfig,
} from './rule-config.js';

/** Rule identifiers */
export const RULE_IDS = {
  POSITION: 'position',
  SIZE: 'size',
  FONT_SIZE: 'font-size',
  FONT_FAMILY: 'font-family',
  COLOR: 'color',
  TEXT_CONTENT: 'text-content',
} as const;

export type RuleId = (typeof RULE_IDS)[keyof typeof RULE_IDS];

/** Rule metadata – id, name, and config type */
export interface RuleDescriptor {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly configSchema?: string; // e.g., 'PositionRuleConfig'
}

/** Mapping of rule ID to its config type */
export type RuleConfigMap = {
  [RULE_IDS.POSITION]: PositionRuleConfig;
  [RULE_IDS.SIZE]: SizeRuleConfig;
  [RULE_IDS.FONT_SIZE]: FontSizeRuleConfig;
  [RULE_IDS.FONT_FAMILY]: FontFamilyRuleConfig;
  [RULE_IDS.COLOR]: ColorRuleConfig;
  [RULE_IDS.TEXT_CONTENT]: TextContentRuleConfig;
};

/** Catalog of all rules – id, name, description */
export const RULE_CATALOG: readonly RuleDescriptor[] = [
  { ruleId: RULE_IDS.POSITION, ruleName: 'Position', configSchema: 'PositionRuleConfig' },
  { ruleId: RULE_IDS.SIZE, ruleName: 'Size', configSchema: 'SizeRuleConfig' },
  { ruleId: RULE_IDS.FONT_SIZE, ruleName: 'Font Size', configSchema: 'FontSizeRuleConfig' },
  { ruleId: RULE_IDS.FONT_FAMILY, ruleName: 'Font Family', configSchema: 'FontFamilyRuleConfig' },
  { ruleId: RULE_IDS.COLOR, ruleName: 'Color', configSchema: 'ColorRuleConfig' },
  { ruleId: RULE_IDS.TEXT_CONTENT, ruleName: 'Text Content', configSchema: 'TextContentRuleConfig' },
];
