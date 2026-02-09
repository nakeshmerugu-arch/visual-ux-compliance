/**
 * Unmapped elements – for debuggability when mapping fails.
 */

import type { DesignComponent } from '../../design/model/component.js';
import type { AppElement } from '../../app/model/element.js';

/** Design component that could not be mapped to any app element */
export interface UnmappedDesignComponent {
  readonly design: DesignComponent;
  readonly reason?: string;
}

/** App element that could not be mapped to any design component */
export interface UnmappedAppElement {
  readonly app: AppElement;
  readonly reason?: string;
}
