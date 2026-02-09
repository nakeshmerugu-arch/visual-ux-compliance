/**
 * CLI configuration – configurable inputs for headless execution.
 */

import type { DriverCapabilities } from '../app/inspection/driver/driver-factory.js';

export interface FigmaConfig {
  readonly fileKey: string;
  readonly accessToken: string;
  readonly nodeIds?: string;
  readonly depth?: number;
}

export interface AppiumConfig {
  readonly serverUrl: string;
  readonly capabilities: DriverCapabilities;
}

export interface RulesConfig {
  readonly configPath?: string;
}

export interface OutputConfig {
  readonly dir: string;
  readonly reportFilename?: string;
  readonly saveResultJson?: boolean;
}

export interface RunnerConfig {
  readonly figma: FigmaConfig;
  readonly appium: AppiumConfig;
  readonly rules?: RulesConfig;
  readonly output: OutputConfig;
  readonly attachEvidence?: boolean;
}

export interface CliOptions {
  readonly configPath: string;
  readonly outputDir?: string;
  readonly verbose?: boolean;
}
