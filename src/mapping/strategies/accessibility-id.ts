/**
 * Accessibility ID matching strategy (primary).
 * Compares design nodeName with app resourceId/accessibilityId.
 */

import type { DesignTraceRef } from '../../design/model/identifiers.js';
import type { AppTraceRef } from '../../app/model/identifiers.js';
import type { MatchEvidence } from '../model/mapping-result.js';

/** Extract ID suffix from resource-id (e.g. "com.app:id/login_button" -> "login_button") */
export function extractResourceIdSuffix(resourceId: string | undefined): string {
  if (!resourceId) return '';
  const idx = resourceId.lastIndexOf('/');
  if (idx >= 0) return resourceId.slice(idx + 1);
  const colon = resourceId.lastIndexOf(':');
  if (colon >= 0) return resourceId.slice(colon + 1);
  return resourceId;
}

/** Normalize for comparison (lowercase, underscores) */
export function normalizeId(id: string): string {
  return id.replace(/[- ]/g, '_').toLowerCase();
}

/** Score 0–1 for accessibility ID match */
export function accessibilityIdScore(
  designRef: DesignTraceRef,
  appRef: AppTraceRef
): number {
  const designId = normalizeId(designRef.nodeName ?? designRef.nodeId);
  const appResource = extractResourceIdSuffix(appRef.resourceId);
  const appAccessibility = normalizeId(appRef.accessibilityId ?? '');

  const appIds = [appResource, appAccessibility].filter(Boolean).map(normalizeId);
  if (designId.length === 0 || appIds.length === 0) return 0;

  for (const aid of appIds) {
    if (designId === aid) return 1;
    if (designId.includes(aid) || aid.includes(designId)) return 0.85;
  }
  return 0;
}

export function createAccessibilityIdEvidence(
  score: number,
  designRef: DesignTraceRef,
  appRef: AppTraceRef
): MatchEvidence {
  return {
    strategy: 'accessibility-id',
    score,
    details: `design.nodeName="${designRef.nodeName}" app.resourceId="${appRef.resourceId}" app.accessibilityId="${appRef.accessibilityId}"`,
  };
}
