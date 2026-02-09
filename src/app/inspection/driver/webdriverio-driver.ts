/**
 * WebdriverIO-backed Appium driver implementation.
 */

import type { AppiumDriver, WindowSize } from './appium-driver.js';

interface WebdriverBrowser {
  getPageSource(): Promise<string>;
  takeScreenshot(): Promise<string>;
  getWindowSize(): Promise<{ width: number; height: number }>;
  deleteSession(): Promise<void>;
  sessionId?: string;
}

export class WebdriverIoAppiumDriver implements AppiumDriver {
  readonly sessionId: string;
  readonly platform: 'android' | 'ios';

  constructor(
    private readonly browser: WebdriverBrowser,
    platform: 'android' | 'ios'
  ) {
    this.sessionId = browser.sessionId ?? '';
    this.platform = platform;
  }

  async getPageSource(): Promise<string> {
    const source = await this.browser.getPageSource();
    return typeof source === 'string' ? source : JSON.stringify(source);
  }

  async takeScreenshot(): Promise<string> {
    const result = await this.browser.takeScreenshot();
    return typeof result === 'string' ? result : Buffer.from(result).toString('base64');
  }

  async getWindowSize(): Promise<WindowSize> {
    const size = await this.browser.getWindowSize();
    return {
      width: size.width ?? 0,
      height: size.height ?? 0,
    };
  }

  async close(): Promise<void> {
    await this.browser.deleteSession();
  }
}
