/**
 * Screenshot service – captures runtime screenshots via Appium driver.
 * No comparison logic; produces base64 image data.
 */

import type { AppiumDriver } from '../driver/appium-driver.js';

/** Screenshot result */
export interface Screenshot {
  readonly data: string;
  readonly sessionId: string;
  readonly platform: 'android' | 'ios';
  readonly timestamp: string;
}

/**
 * Screenshot service.
 * Uses Appium driver to capture screenshots; no comparison logic.
 */
export class ScreenshotService {
  constructor(private readonly driver: AppiumDriver) {}

  async capture(): Promise<Screenshot> {
    const data = await this.driver.takeScreenshot();
    return {
      data,
      sessionId: this.driver.sessionId,
      platform: this.driver.platform,
      timestamp: new Date().toISOString(),
    };
  }
}
