/**
 * Design ingestion service – orchestrates Figma API fetch and normalization.
 * Single entry point for design ingestion; no comparison or Appium logic.
 */

import type { FigmaApiClient } from './figma/figma-api-client.js';
import type { DesignScreen } from '../model/screen.js';
import { normalizeFigmaFile } from './normalizer/design-normalizer.js';

export interface IngestDesignOptions {
  readonly fileKey: string;
  readonly accessToken: string;
  readonly nodeIds?: string;
  readonly depth?: number;
}

/**
 * Design ingestion service.
 * Fetches from Figma API and normalizes into canonical design models.
 */
export class DesignIngestionService {
  constructor(private readonly figmaClient: FigmaApiClient) {}

  async ingest(options: IngestDesignOptions): Promise<readonly DesignScreen[]> {
    const response = await this.figmaClient.getFile({
      fileKey: options.fileKey,
      accessToken: options.accessToken,
      nodeIds: options.nodeIds,
      depth: options.depth,
    });
    return normalizeFigmaFile(response, options.fileKey);
  }
}
