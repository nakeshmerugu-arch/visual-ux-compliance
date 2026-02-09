/**
 * Appium driver factory – creates drivers for Android and iOS.
 */

import type { AppiumDriver } from './appium-driver.js';
import { WebdriverIoAppiumDriver } from './webdriverio-driver.js';

/** Android capabilities */
export interface AndroidCapabilities {
  readonly platformName: 'Android';
  readonly 'appium:automationName'?: string;
  readonly 'appium:app'?: string;
  readonly 'appium:appPackage'?: string;
  readonly 'appium:appActivity'?: string;
  readonly 'appium:deviceName'?: string;
  readonly 'appium:udid'?: string;
  readonly [key: string]: unknown;
}

/** iOS capabilities */
export interface IosCapabilities {
  readonly platformName: 'iOS';
  readonly 'appium:automationName'?: string;
  readonly 'appium:app'?: string;
  readonly 'appium:bundleId'?: string;
  readonly 'appium:deviceName'?: string;
  readonly 'appium:udid'?: string;
  readonly [key: string]: unknown;
}

export type DriverCapabilities = AndroidCapabilities | IosCapabilities;

export interface CreateDriverOptions {
  readonly capabilities: DriverCapabilities;
  readonly serverUrl?: string;
}

/** Create an Appium driver for the given capabilities */
export async function createAppiumDriver(options: CreateDriverOptions): Promise<AppiumDriver> {
  const browser = await createWebdriverIoSession(options);
  const platform = options.capabilities.platformName === 'Android' ? 'android' : 'ios';
  return new WebdriverIoAppiumDriver(browser, platform);
}

async function createWebdriverIoSession(options: CreateDriverOptions) {
  const { remote } = await import('webdriverio');
  const serverUrl = options.serverUrl ?? 'http://127.0.0.1:4723';

  const browser = await remote({
    hostname: new URL(serverUrl).hostname,
    port: parseInt(new URL(serverUrl).port || '4723', 10),
    path: new URL(serverUrl).pathname || '/',
    capabilities: options.capabilities as Record<string, unknown>,
  });

  return browser;
}
