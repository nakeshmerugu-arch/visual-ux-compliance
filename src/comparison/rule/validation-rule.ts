/**
 * ValidationRule interface – generic contract for rule-based comparison.
 * Each rule is independently executable and does not depend on reporting or UI automation.
 */

import type { DesignComponent } from '../../design/model/component.js';
import type { AppElement } from '../../app/model/element.js';
import type { ValidationResult } from '../model/validation-result.js';

/** Input to a validation rule: design component, app component, and rule-specific config */
export interface RuleInput<TConfig = unknown> {
  readonly design: DesignComponent;
  readonly app: AppElement;
  readonly config: TConfig;
}

/**
 * Contract for a validation rule.
 * Rules consume design and app models only; no framework dependencies.
 */
export interface ValidationRule<TConfig = unknown> {
  readonly ruleId: string;
  readonly ruleName: string;
  execute(input: RuleInput<TConfig>): ValidationResult;
}
