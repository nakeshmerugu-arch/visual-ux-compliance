/**
 * Rule configuration loader – loads rule configs from YAML or JSON.
 * Externally configurable tolerances; immutable output.
 */

export interface RuleConfigs {
  readonly [ruleId: string]: Readonly<Record<string, unknown>> | undefined;
}

function deepFreeze<T>(obj: T): T {
  if (obj == null || typeof obj !== 'object') return obj;
  Object.freeze(obj);
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null) deepFreeze(value);
  }
  return obj;
}

/** Parse JSON config */
function parseJson(content: string): RuleConfigs {
  const parsed = JSON.parse(content) as Record<string, unknown>;
  const rules = (parsed.rules ?? parsed) as Record<string, unknown>;
  const result: Record<string, Readonly<Record<string, unknown>>> = {};
  for (const [ruleId, config] of Object.entries(rules)) {
    if (config != null && typeof config === 'object') {
      result[ruleId] = deepFreeze({ ...config });
    }
  }
  return Object.freeze(result) as RuleConfigs;
}

/** Parse YAML config */
async function parseYaml(content: string): Promise<RuleConfigs> {
  const yaml = await import('yaml');
  const parsed = yaml.parse(content) as Record<string, unknown>;
  const rules = (parsed?.rules ?? parsed) as Record<string, unknown> | undefined;
  if (!rules || typeof rules !== 'object') return Object.freeze({}) as RuleConfigs;
  const result: Record<string, Readonly<Record<string, unknown>>> = {};
  for (const [ruleId, config] of Object.entries(rules)) {
    if (config != null && typeof config === 'object') {
      result[ruleId] = deepFreeze({ ...(config as Record<string, unknown>) });
    }
  }
  return Object.freeze(result) as RuleConfigs;
}

/** Load rule configs from file path (infers format from extension) */
export async function loadRuleConfigFromFile(path: string): Promise<RuleConfigs> {
  const { readFile } = await import('node:fs/promises');
  const content = await readFile(path, 'utf-8');
  const ext = path.toLowerCase().slice(path.lastIndexOf('.'));
  if (ext === '.yaml' || ext === '.yml') return parseYaml(content);
  if (ext === '.json') return parseJson(content);
  try {
    return parseJson(content);
  } catch {
    return parseYaml(content);
  }
}

/** Load rule configs from string content */
export async function loadRuleConfig(
  content: string,
  format: 'json' | 'yaml'
): Promise<RuleConfigs> {
  return format === 'json' ? Promise.resolve(parseJson(content)) : parseYaml(content);
}
