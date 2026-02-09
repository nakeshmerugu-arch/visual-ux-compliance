/**
 * Figma API client abstraction.
 * Only this layer depends on Figma API; design models remain framework-agnostic.
 */

import type { FigmaFileResponse } from './figma-types.js';

/** Options for fetching a Figma file */
export interface FigmaFileOptions {
  readonly fileKey: string;
  readonly accessToken: string;
  readonly nodeIds?: string; // comma-separated, optional filter
  readonly depth?: number;
}

/**
 * Figma API client interface.
 * Implementations may use fetch, axios, or mock for tests.
 */
export interface FigmaApiClient {
  getFile(options: FigmaFileOptions): Promise<FigmaFileResponse>;
}

/** Default implementation using fetch */
export class DefaultFigmaApiClient implements FigmaApiClient {
  readonly baseUrl: string;

  constructor(baseUrl = 'https://api.figma.com') {
    this.baseUrl = baseUrl;
  }

  async getFile(options: FigmaFileOptions): Promise<FigmaFileResponse> {
    const { fileKey, accessToken, nodeIds, depth } = options;
    const url = new URL(`/v1/files/${fileKey}`, this.baseUrl);
    if (nodeIds) url.searchParams.set('ids', nodeIds);
    if (depth !== undefined) url.searchParams.set('depth', String(depth));

    const res = await fetch(url.toString(), {
      headers: {
        'X-Figma-Token': accessToken,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Figma API error ${res.status}: ${text}`);
    }

    return res.json() as Promise<FigmaFileResponse>;
  }
}
