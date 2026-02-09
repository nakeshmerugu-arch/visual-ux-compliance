/**
 * Output directory structure for CI/headless execution.
 */

import type { RunValidationResult } from '../comparison/model/aggregate-result.js';
import { writeHtmlReport } from '../report/html-report-generator.js';
import type { Screenshot } from '../app/inspection/screenshot/screenshot-service.js';

export interface OutputPaths {
  readonly root: string;
  readonly report: string;
  readonly resultJson: string;
  readonly screenshotsDir: string;
}

export function getOutputPaths(
  outputDir: string,
  runId: string,
  options: { reportFilename?: string; saveResultJson?: boolean } = {}
): OutputPaths {
  const reportFilename = options.reportFilename ?? 'report.html';
  const root = `${outputDir}/${runId}`;
  return {
    root,
    report: `${root}/${reportFilename}`,
    resultJson: `${root}/result.json`,
    screenshotsDir: `${root}/screenshots`,
  };
}

export async function ensureOutputDirs(paths: OutputPaths): Promise<void> {
  const { mkdir } = await import('node:fs/promises');
  await mkdir(paths.root, { recursive: true });
  await mkdir(paths.screenshotsDir, { recursive: true });
}

export async function writeReport(
  runResult: RunValidationResult,
  reportPath: string,
  title?: string
): Promise<void> {
  await writeHtmlReport(runResult, { outputPath: reportPath, title });
}

export async function writeResultJson(
  runResult: RunValidationResult,
  outputPath: string
): Promise<void> {
  const { writeFile } = await import('node:fs/promises');
  const sanitized = sanitizeForJson(runResult);
  await writeFile(outputPath, JSON.stringify(sanitized, null, 2), 'utf-8');
}

function sanitizeForJson(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForJson);
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = sanitizeForJson(v);
  }
  return result;
}

export async function writeScreenshot(
  screenshot: Screenshot,
  screenshotsDir: string,
  prefix = 'screen'
): Promise<string> {
  const { writeFile } = await import('node:fs/promises');
  const filename = `${prefix}-${Date.now()}.png`;
  const path = `${screenshotsDir}/${filename}`;
  const buffer = Buffer.from(screenshot.data, 'base64');
  await writeFile(path, buffer);
  return path;
}
