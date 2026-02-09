/**
 * Appium driver – factory and abstraction.
 */

export type { AppiumDriver, WindowSize } from './appium-driver.js';
export {
  createAppiumDriver,
  type CreateDriverOptions,
  type AndroidCapabilities,
  type IosCapabilities,
  type DriverCapabilities,
} from './driver-factory.js';
export { WebdriverIoAppiumDriver } from './webdriverio-driver.js';
