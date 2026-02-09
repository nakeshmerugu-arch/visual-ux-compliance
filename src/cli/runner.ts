/**
 * CLI runner – headless execution orchestration.
 */

import type { RunnerConfig } from './config.js';
import type { ValidationRule } from '../comparison/rule/validation-rule.js';
import { DesignIngestionService } from '../design/ingestion/design-ingestion-service.js';
import { DefaultFigmaApiClient } from '../design/ingestion/figma/index.js';
import { createAppiumDriver } from '../app/inspection/driver/index.js';
import { AppInspectionService } from '../app/inspection/app-inspection-service.js';
import { ScreenshotService } from '../app/inspection/screenshot/index.js';
import { mapScreens } from '../mapping/screen-mapper.js';
import { runComparison } from '../comparison/executor/comparison-orchestrator.js';
import { attachEvidenceToRun } from '../evidence/evidence-builder.js';
import type { RunValidationResult } from '../comparison/model/aggregate-result.js';
import { loadRuleConfigs } from './config-loader.js';
import {
  getOutputPaths,
  ensureOutputDirs,
  writeReport,
  writeResultJson,
  writeScreenshot,
} from './output-structure.js';

export interface RunnerResult {
  readonly runResult: RunValidationResult;
  readonly outputPaths: ReturnType<typeof getOutputPaths>;
  readonly passed: boolean;
}

export interface RunnerOptions {
  readonly config: RunnerConfig;
  readonly rules?: readonly ValidationRule[];
}

/**
 * Run the full compliance pipeline (headless).
 */
export async function run(options: RunnerOptions): Promise<RunnerResult> {
  const { config, rules = [] } = options;

  const figmaClient = new DefaultFigmaApiClient();
  const designService = new DesignIngestionService(figmaClient);

  const designScreens = await designService.ingest({
    fileKey: config.figma.fileKey,
    accessToken: config.figma.accessToken,
    nodeIds: config.figma.nodeIds,
    depth: config.figma.depth,
  });

  const driver = await createAppiumDriver({
    serverUrl: config.appium.serverUrl,
    capabilities: config.appium.capabilities,
  });

  let screenshot: Awaited<ReturnType<ScreenshotService['capture']>> | undefined;
  try {
    const appService = new AppInspectionService(driver);
    const appScreen = await appService.captureScreen();
    const screenshotService = new ScreenshotService(driver);
    screenshot = await screenshotService.capture();

    const ruleConfigs = await loadRuleConfigs(config);
    const screenMappings = mapScreens([...designScreens], [appScreen], {
      minConfidence: 0.2,
    });

    const platform =
      config.appium.capabilities.platformName === 'Android' ? 'android' : 'ios';

    let runResult = runComparison(rules, screenMappings, {
      ruleConfigs,
      platform,
    });

    if (config.attachEvidence && screenshot) {
      runResult = attachEvidenceToRun(runResult, {
        screenshot,
        includeMetadata: true,
        visualDiffPlaceholder: true,
      });
    }

    const outputPaths = getOutputPaths(config.output.dir, runResult.runId, {
      reportFilename: config.output.reportFilename,
      saveResultJson: config.output.saveResultJson,
    });

    await ensureOutputDirs(outputPaths);
    await writeReport(runResult, outputPaths.report, 'Design-to-Build Compliance Report');

    if (config.output.saveResultJson) {
      await writeResultJson(runResult, outputPaths.resultJson);
    }

    if (screenshot) {
      await writeScreenshot(screenshot, outputPaths.screenshotsDir, 'fullscreen');
    }

    return {
      runResult,
      outputPaths,
      passed: runResult.passed,
    };
  } finally {
    await driver.close();
  }
}
