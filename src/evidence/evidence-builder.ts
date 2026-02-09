/**
 * Evidence builder – attaches screenshots, Figma refs, metadata to validation results.
 * Optional; does not affect comparison logic.
 */

import type { ValidationResult } from '../comparison/model/validation-result.js';
import type { RunValidationResult } from '../comparison/model/aggregate-result.js';
import type { EvidenceAttachment } from './model/evidence-attachment.js';
import type { Screenshot } from '../app/inspection/screenshot/screenshot-service.js';
import { buildFigmaReference } from './figma-reference-builder.js';

export interface EvidenceBuilderOptions {
  readonly screenshot?: Screenshot;
  readonly figmaBaseUrl?: string;
  readonly includeMetadata?: boolean;
  readonly visualDiffPlaceholder?: boolean;
}

function toEvidenceRef(attachment: EvidenceAttachment): ValidationResult['evidence'] {
  return {
    expected: attachment.expected,
    actual: attachment.actual,
    delta: attachment.delta,
    visualReferenceUri:
      attachment.visualReferenceUri ??
      attachment.screenshot?.uri ??
      attachment.visualDiff?.uri,
    screenshotData: attachment.screenshot?.data,
    screenshotUri: attachment.screenshot?.uri,
    figmaUrl: attachment.figmaRef?.url,
    figmaNodeId: attachment.figmaRef?.nodeId,
    metadata: Array.isArray(attachment.metadata)
      ? undefined
      : attachment.metadata as { expected: unknown; actual: unknown } | undefined,
    visualDiffUri: attachment.visualDiff?.uri,
    visualDiffStatus: attachment.visualDiff?.status,
  };
}

function buildEvidenceForResult(
  result: ValidationResult,
  options: EvidenceBuilderOptions
): EvidenceAttachment {
  const { designRef, mismatches } = result;
  const firstMismatch = mismatches[0];
  const delta = firstMismatch?.delta;
  const deltaObj = delta as { expected?: unknown; actual?: unknown } | undefined;
  const expected = deltaObj?.expected ?? result.evidence?.expected;
  const actual = deltaObj?.actual ?? result.evidence?.actual;

  const attachment: EvidenceAttachment = {
    expected: expected ?? 'N/A',
    actual: actual ?? 'N/A',
    delta: delta ?? result.evidence?.delta,
    visualReferenceUri: result.evidence?.visualReferenceUri,
    ...(options.screenshot && {
      screenshot: {
        data: options.screenshot.data,
        timestamp: options.screenshot.timestamp,
      },
    }),
    ...(designRef && {
      figmaRef: buildFigmaReference(designRef, { baseUrl: options.figmaBaseUrl }),
    }),
    ...(options.includeMetadata !== false && {
      metadata: { expected: expected ?? 'N/A', actual: actual ?? 'N/A' },
    }),
    ...(options.visualDiffPlaceholder && {
      visualDiff: { status: 'pending' as const },
    }),
  };

  return attachment;
}

function enrichValidationResult(
  result: ValidationResult,
  options: EvidenceBuilderOptions
): ValidationResult {
  const attachment = buildEvidenceForResult(result, options);
  return {
    ...result,
    evidence: toEvidenceRef(attachment),
  };
}

/**
 * Attach evidence to validation results.
 * Optional; does not modify comparison logic.
 */
export function attachEvidence(
  results: readonly ValidationResult[],
  options: EvidenceBuilderOptions
): ValidationResult[] {
  return results.map((r) => enrichValidationResult(r, options));
}

/**
 * Attach evidence to run result.
 * Optional; does not modify comparison logic.
 */
export function attachEvidenceToRun(
  runResult: RunValidationResult,
  options: EvidenceBuilderOptions
): RunValidationResult {
  const screenResults = runResult.screenResults.map((sr) => ({
    ...sr,
    results: attachEvidence(sr.results, options),
  }));
  return {
    ...runResult,
    screenResults,
  };
}
