/**
 * Design ingestion layer – Figma API client, parsers, normalizer.
 * No comparison logic; no Appium logic.
 * Handles missing or optional Figma attributes gracefully.
 */

export { DesignIngestionService, type IngestDesignOptions } from './design-ingestion-service.js';

export { normalizeFigmaFile } from './normalizer/index.js';

export type { FigmaApiClient } from './figma/index.js';
export { DefaultFigmaApiClient } from './figma/index.js';

export * from './parser/index.js';
