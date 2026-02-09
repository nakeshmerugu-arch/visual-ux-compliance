/**
 * Config loader – loads runner config from YAML/JSON.
 */

import type { RunnerConfig } from './config.js';
import { loadRuleConfigFromFile } from '../comparison/config/rule-config-loader.js';
import type { RuleConfigs } from '../comparison/config/rule-config-loader.js';

function substituteEnv(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return obj.replace(/\$\{([^}]+)\}/g, (_, name) => process.env[name] ?? '');
  }
  if (Array.isArray(obj)) return obj.map(substituteEnv);
  if (obj != null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = substituteEnv(v);
    }
    return result;
  }
  return obj;
}

async function loadConfigFile(path: string): Promise<RunnerConfig> {
  const { readFile } = await import('node:fs/promises');
  const content = await readFile(path, 'utf-8');
  const ext = path.toLowerCase().slice(path.lastIndexOf('.'));

  let parsed: Record<string, unknown>;
  if (ext === '.json') {
    parsed = JSON.parse(content) as Record<string, unknown>;
  } else {
    const yaml = await import('yaml');
    parsed = yaml.parse(content) as Record<string, unknown>;
  }

  const resolved = substituteEnv(parsed) as Record<string, unknown>;
  const figma = resolved.figma as RunnerConfig['figma'];
  const appium = resolved.appium as RunnerConfig['appium'];
  const output = resolved.output as RunnerConfig['output'];

  if (!figma?.fileKey || !figma?.accessToken) {
    throw new Error('Config must include figma.fileKey and figma.accessToken');
  }
  if (!appium?.serverUrl || !appium?.capabilities) {
    throw new Error('Config must include appium.serverUrl and appium.capabilities');
  }
  if (!output?.dir) {
    throw new Error('Config must include output.dir');
  }

  return {
    figma,
    appium,
    rules: resolved.rules as RunnerConfig['rules'],
    output: {
      dir: output.dir,
      reportFilename: output.reportFilename ?? 'report.html',
      saveResultJson: output.saveResultJson ?? false,
    },
    attachEvidence: resolved.attachEvidence as boolean | undefined,
  };
}

export async function loadRunnerConfig(path: string): Promise<RunnerConfig> {
  const { resolve } = await import('node:path');
  const resolvedPath = resolve(process.cwd(), path);
  return loadConfigFile(resolvedPath);
}

export async function loadRuleConfigs(config: RunnerConfig): Promise<RuleConfigs> {
  const path = config.rules?.configPath;
  if (!path) return {};
  return loadRuleConfigFromFile(path);
}
