/**
 * Text similarity matching strategy.
 */

import type { MatchEvidence } from '../model/mapping-result.js';

/** Normalize text for comparison */
export function normalizeText(text: string | undefined): string {
  if (text == null || typeof text !== 'string') return '';
  return text.trim().toLowerCase();
}

/** Compute similarity 0–1 (1 = exact match) */
export function textSimilarity(a: string | undefined, b: string | undefined): number {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (na.length === 0 && nb.length === 0) return 1;
  if (na.length === 0 || nb.length === 0) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.8;
  const longer = na.length > nb.length ? na : nb;
  const shorter = na.length > nb.length ? nb : na;
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i]!)) matches++;
  }
  return matches / longer.length;
}

export function createTextSimilarityEvidence(
  score: number,
  designText?: string,
  appText?: string
): MatchEvidence {
  return {
    strategy: 'text-similarity',
    score,
    details: `design="${designText ?? ''}" app="${appText ?? ''}"`,
  };
}
