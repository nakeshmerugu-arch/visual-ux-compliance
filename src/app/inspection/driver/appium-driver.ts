/**
 * Appium driver abstraction.
 * Only this layer depends on UI automation; app models remain framework-agnostic.
 */

/** Runtime window size */
export interface WindowSize {
  readonly width: number;
  readonly height: number;
}

/**
 * Appium driver interface.
 * Implementations wrap WebdriverIO or other Appium clients.
 */
export interface AppiumDriver {
  readonly sessionId: string;
  readonly platform: 'android' | 'ios';

  getPageSource(): Promise<string>;

  takeScreenshot(): Promise<string>;

  getWindowSize(): Promise<WindowSize>;

  close(): Promise<void>;
}
