/**
 * Design model – canonical design models (screens, components, styles).
 * All models are immutable and support traceability to source (e.g., Figma).
 */

export type {
  DesignFileId,
  DesignNodeId,
  DesignTraceRef,
} from './identifiers.js';

export type {
  DesignColor,
  DesignTypography,
  DesignLayout,
  DesignBorder,
  DesignStyles,
} from './styles.js';

export type {
  DesignComponent,
  DesignComponentType,
} from './component.js';

export type { DesignScreen } from './screen.js';
