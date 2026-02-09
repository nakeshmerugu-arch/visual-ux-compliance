/**
 * App inspection service – produces runtime UI snapshot.
 * Orchestrates driver, accessibility tree, extractors, screenshot.
 * No comparison logic; all output maps to canonical app models.
 */

import type { AppiumDriver } from './driver/appium-driver.js';
import type { AppScreen } from '../model/screen.js';
import { parseAccessibilityTree } from './accessibility/accessibility-tree-reader.js';
import { extractAndroidUi } from './extractor/android-ui-extractor.js';
import { extractIosUi } from './extractor/ios-ui-extractor.js';

/**
 * App inspection service.
 * Produces runtime UI snapshot (AppScreen) from connected Appium driver.
 */
export class AppInspectionService {
  constructor(private readonly driver: AppiumDriver) {}

  async captureScreen(screenName?: string): Promise<AppScreen> {
    const [pageSource, windowSize] = await Promise.all([
      this.driver.getPageSource(),
      this.driver.getWindowSize(),
    ]);

    const rawNodes = parseAccessibilityTree(pageSource);
    const ctx = {
      sessionId: this.driver.sessionId,
      screenId: screenName ?? `screen-${Date.now()}`,
    };

    const elements =
      this.driver.platform === 'android'
        ? extractAndroidUi(rawNodes, ctx)
        : extractIosUi(rawNodes, ctx);

    return {
      traceRef: {
        elementId: ctx.screenId,
        sessionId: this.driver.sessionId,
        platform: this.driver.platform,
        screenId: ctx.screenId,
      },
      name: screenName ?? 'Current Screen',
      width: windowSize.width,
      height: windowSize.height,
      elements,
    };
  }
}
