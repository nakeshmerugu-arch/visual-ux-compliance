/**
 * App inspection layer – Appium driver, extractors, screenshot.
 * Produces runtime UI snapshot; no comparison logic.
 * All UI data maps to canonical app models.
 */

export { AppInspectionService } from './app-inspection-service.js';

export {
  createAppiumDriver,
  type AppiumDriver,
  type AndroidCapabilities,
  type IosCapabilities,
} from './driver/index.js';

export { ScreenshotService, type Screenshot } from './screenshot/index.js';

export { parseAccessibilityTree } from './accessibility/index.js';
export { extractAndroidUi, extractIosUi } from './extractor/index.js';
