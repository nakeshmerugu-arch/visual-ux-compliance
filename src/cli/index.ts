#!/usr/bin/env node
/**
 * CLI entrypoint – headless execution with configurable inputs.
 */

import { run } from './runner.js';
import { loadRunnerConfig } from './config-loader.js';

const DEFAULT_CONFIG = 'compliance.config.yaml';

const HELP = `Usage: compliance [options]

Design-to-Build Compliance Runner – headless execution.

Options:
  -c, --config <path>   Config file (default: compliance.config.yaml)
  -o, --output <dir>    Override output directory
  -v, --verbose         Verbose output
  -h, --help            Show this help

Environment:
  COMPLIANCE_CONFIG     Config file path
  COMPLIANCE_OUTPUT     Output directory
  FIGMA_ACCESS_TOKEN    Figma API token (use in config via \${FIGMA_ACCESS_TOKEN})
`;

function parseArgs(): { configPath: string; outputDir?: string; verbose: boolean } {
  const args = process.argv.slice(2);
  let configPath = DEFAULT_CONFIG;
  let outputDir: string | undefined;
  let verbose = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      console.log(HELP);
      process.exit(0);
    }
    if (arg === '--config' || arg === '-c') {
      configPath = args[++i] ?? configPath;
    } else if (arg === '--output' || arg === '-o') {
      outputDir = args[++i];
    } else if (arg === '--verbose' || arg === '-v') {
      verbose = true;
    }
  }

  if (process.env.COMPLIANCE_CONFIG) {
    configPath = process.env.COMPLIANCE_CONFIG;
  }
  if (process.env.COMPLIANCE_OUTPUT) {
    outputDir = process.env.COMPLIANCE_OUTPUT;
  }

  return { configPath, outputDir, verbose };
}

async function main(): Promise<number> {
  const { configPath, outputDir, verbose } = parseArgs();

  try {
    let config = await loadRunnerConfig(configPath);
    if (outputDir) {
      config = { ...config, output: { ...config.output, dir: outputDir } };
    }

    if (verbose) {
      console.error(`[compliance] Loading config from ${configPath}`);
      console.error(`[compliance] Output dir: ${config.output.dir}`);
    }

    const result = await run({ config });

    if (verbose) {
      console.error(`[compliance] Run ID: ${result.runResult.runId}`);
      console.error(`[compliance] Report: ${result.outputPaths.report}`);
      console.error(`[compliance] Passed: ${result.passed}`);
    }

    console.log(result.outputPaths.report);

    return result.passed ? 0 : 1;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[compliance] Error: ${msg}`);
    if (verbose && err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    return 1;
  }
}

main().then((code) => process.exit(code));
