/**
 * HTML report generator – produces reports from result models only.
 * No dependency on Appium or Figma APIs.
 */

import type { RunValidationResult } from '../comparison/model/aggregate-result.js';
import type { ScreenValidationResult } from '../comparison/model/aggregate-result.js';
import type { ValidationResult } from '../comparison/model/validation-result.js';
import type { Mismatch } from '../comparison/model/mismatch.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatValue(v: unknown): string {
  if (v === undefined || v === null) return '—';
  if (typeof v === 'object') return JSON.stringify(v, null, 2);
  return String(v);
}

function renderExecutiveSummary(run: RunValidationResult): string {
  const passedScreens = run.screenResults.filter((s) => s.passed).length;
  const failedScreens = run.screenResults.length - passedScreens;
  const statusClass = run.passed ? 'pass' : 'fail';
  const statusText = run.passed ? 'PASSED' : 'FAILED';

  return `
    <section class="executive-summary" id="executive-summary">
      <h2>Executive Summary</h2>
      <div class="summary-cards">
        <div class="card ${statusClass}">
          <span class="card-label">Overall</span>
          <span class="card-value">${escapeHtml(statusText)}</span>
        </div>
        <div class="card">
          <span class="card-label">Platform</span>
          <span class="card-value">${escapeHtml(run.platform)}</span>
        </div>
        <div class="card">
          <span class="card-label">Screens</span>
          <span class="card-value">${run.screenResults.length} total</span>
        </div>
        <div class="card">
          <span class="card-label">Passed Screens</span>
          <span class="card-value">${passedScreens}</span>
        </div>
        <div class="card">
          <span class="card-label">Failed Screens</span>
          <span class="card-value">${failedScreens}</span>
        </div>
        <div class="card">
          <span class="card-label">Total Mismatches</span>
          <span class="card-value">${run.totalMismatches}</span>
        </div>
      </div>
      <div class="run-meta">
        <span>Run ID: ${escapeHtml(run.runId)}</span>
        <span>Timestamp: ${escapeHtml(run.timestamp)}</span>
      </div>
    </section>
  `;
}

function renderScreenBreakdown(screens: readonly ScreenValidationResult[]): string {
  const items = screens
    .map((s) => {
      const statusClass = s.passed ? 'pass' : 'fail';
      const statusText = s.passed ? 'Passed' : 'Failed';
      return `
        <div class="screen-item ${statusClass}" id="screen-${escapeHtml(s.screenName.replace(/\s+/g, '-'))}">
          <div class="screen-header">
            <h3>${escapeHtml(s.screenName)}</h3>
            <span class="badge ${statusClass}">${escapeHtml(statusText)}</span>
          </div>
          <div class="screen-meta">
            <span>Design: ${escapeHtml(s.designRef.nodeId)}</span>
            <span>App: ${escapeHtml(s.appRef.screenId)}</span>
          </div>
          <div class="screen-stats">
            <span>${s.results.length} checks</span>
            <span>${s.totalMismatches} mismatches</span>
          </div>
          <details class="screen-details">
            <summary>View details</summary>
            <div class="screen-results">${renderValidationResults(s.results)}</div>
          </details>
        </div>
      `;
    })
    .join('');

  return `
    <section class="screen-breakdown" id="screen-breakdown">
      <h2>Screen Breakdown</h2>
      <div class="screen-list">${items}</div>
    </section>
  `;
}

function renderValidationResults(results: readonly ValidationResult[]): string {
  return results
    .map((r) => {
      const statusClass = r.passed ? 'pass' : 'fail';
      const hasEvidence = r.evidence != null;
      const evidenceHtml = hasEvidence ? renderEvidence(r) : '';
      const mismatchHtml =
        r.mismatches.length > 0
          ? r.mismatches.map((m) => renderMismatch(m, r.evidence)).join('')
          : '';

      return `
        <div class="validation-result ${statusClass}">
          <div class="result-header">
            <span class="rule">${escapeHtml(r.ruleName)}</span>
            <span class="badge ${statusClass}">${r.passed ? 'Passed' : 'Failed'}</span>
          </div>
          <div class="result-refs">
            <span>Design: ${escapeHtml(r.designRef.nodeId)}${r.designRef.nodeName ? ` (${escapeHtml(r.designRef.nodeName)})` : ''}</span>
            <span>App: ${escapeHtml(r.appRef.elementId)}</span>
          </div>
          ${mismatchHtml}
          ${evidenceHtml}
        </div>
      `;
    })
    .join('');
}

function renderMismatch(mismatch: Mismatch, evidence?: ValidationResult['evidence']): string {
  return `
    <div class="mismatch">
      <div class="mismatch-header">
        <span class="severity severity-${escapeHtml(mismatch.severity.level)}">${escapeHtml(mismatch.severity.level)}</span>
        <span class="rule">${escapeHtml(mismatch.ruleName)}</span>
      </div>
      <p class="mismatch-message">${escapeHtml(mismatch.message)}</p>
      <div class="mismatch-delta">
        <table>
          <tr><th>Property</th><td>${escapeHtml(mismatch.delta.propertyName)}</td></tr>
          <tr><th>Expected</th><td><code>${escapeHtml(formatValue(mismatch.delta.expected))}</code></td></tr>
          <tr><th>Actual</th><td><code>${escapeHtml(formatValue(mismatch.delta.actual))}</code></td></tr>
          ${mismatch.delta.tolerance != null ? `<tr><th>Tolerance</th><td>${mismatch.delta.tolerance}</td></tr>` : ''}
        </table>
      </div>
      ${evidence ? renderIssueEvidence(evidence) : ''}
    </div>
  `;
}

function renderEvidence(result: ValidationResult): string {
  const ev = result.evidence;
  if (!ev) return '';

  return `
    <div class="evidence">
      <h4>Evidence</h4>
      ${renderIssueEvidence(ev)}
    </div>
  `;
}

function renderIssueEvidence(evidence: NonNullable<ValidationResult['evidence']>): string {
  const parts: string[] = [];

  if (evidence.metadata) {
    parts.push(`
      <div class="evidence-metadata">
        <strong>Expected:</strong> <code>${escapeHtml(formatValue(evidence.metadata.expected))}</code><br>
        <strong>Actual:</strong> <code>${escapeHtml(formatValue(evidence.metadata.actual))}</code>
      </div>
    `);
  } else if (evidence.expected !== undefined || evidence.actual !== undefined) {
    parts.push(`
      <div class="evidence-metadata">
        <strong>Expected:</strong> <code>${escapeHtml(formatValue(evidence.expected))}</code><br>
        <strong>Actual:</strong> <code>${escapeHtml(formatValue(evidence.actual))}</code>
      </div>
    `);
  }

  if (evidence.figmaUrl) {
    parts.push(
      `<a href="${escapeHtml(evidence.figmaUrl)}" target="_blank" rel="noopener" class="evidence-link">View in Figma</a>`
    );
  }

  if (evidence.screenshotData) {
    parts.push(
      `<div class="evidence-screenshot"><img src="data:image/png;base64,${evidence.screenshotData}" alt="Screenshot" /></div>`
    );
  } else if (evidence.screenshotUri) {
    parts.push(
      `<div class="evidence-screenshot"><img src="${escapeHtml(evidence.screenshotUri)}" alt="Screenshot" /></div>`
    );
  }

  if (evidence.visualDiffUri || evidence.visualDiffStatus === 'available') {
    parts.push(
      `<a href="${escapeHtml(evidence.visualDiffUri ?? '#')}" target="_blank" class="evidence-link">View visual diff</a>`
    );
  }

  if (parts.length === 0) return '';
  return `<div class="issue-evidence">${parts.join('')}</div>`;
}

function renderStyles(): string {
  return `
    <style>
      :root { --pass: #22c55e; --fail: #ef4444; --bg: #0f172a; --surface: #1e293b; --text: #f1f5f9; --muted: #94a3b8; }
      * { box-sizing: border-box; }
      body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; background: var(--bg); color: var(--text); line-height: 1.5; }
      h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
      h2 { font-size: 1.25rem; margin: 2rem 0 1rem; border-bottom: 1px solid var(--surface); padding-bottom: 0.5rem; }
      h3 { font-size: 1rem; margin: 0 0 0.5rem; }
      h4 { font-size: 0.875rem; margin: 0.75rem 0 0.25rem; color: var(--muted); }
      .subtitle { color: var(--muted); margin-bottom: 2rem; }
      .executive-summary .summary-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; margin: 1rem 0; }
      .card { background: var(--surface); padding: 1rem; border-radius: 0.5rem; }
      .card.pass { border-left: 4px solid var(--pass); }
      .card.fail { border-left: 4px solid var(--fail); }
      .card-label { display: block; font-size: 0.75rem; color: var(--muted); }
      .card-value { font-size: 1.25rem; font-weight: 600; }
      .run-meta { font-size: 0.75rem; color: var(--muted); }
      .screen-list { display: flex; flex-direction: column; gap: 1rem; }
      .screen-item { background: var(--surface); padding: 1rem; border-radius: 0.5rem; border-left: 4px solid var(--muted); }
      .screen-item.pass { border-left-color: var(--pass); }
      .screen-item.fail { border-left-color: var(--fail); }
      .screen-header { display: flex; align-items: center; justify-content: space-between; }
      .screen-meta, .screen-stats { font-size: 0.75rem; color: var(--muted); margin-top: 0.25rem; }
      .badge { font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 0.25rem; }
      .badge.pass { background: rgba(34,197,94,0.2); color: var(--pass); }
      .badge.fail { background: rgba(239,68,68,0.2); color: var(--fail); }
      .screen-details summary { cursor: pointer; margin-top: 0.5rem; }
      .screen-results { margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem; }
      .validation-result { padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 0.25rem; }
      .result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem; }
      .result-refs { font-size: 0.75rem; color: var(--muted); }
      .mismatch { margin-top: 1rem; padding: 1rem; background: rgba(239,68,68,0.1); border-radius: 0.25rem; border-left: 4px solid var(--fail); }
      .mismatch-header { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; }
      .severity { font-size: 0.7rem; padding: 0.15rem 0.4rem; border-radius: 0.2rem; text-transform: uppercase; }
      .severity-critical, .severity-high { background: rgba(239,68,68,0.3); }
      .severity-medium { background: rgba(245,158,11,0.3); }
      .severity-low, .severity-info { background: rgba(148,163,184,0.3); }
      .mismatch-delta table { font-size: 0.875rem; width: 100%; }
      .mismatch-delta th { text-align: left; color: var(--muted); width: 6rem; }
      .mismatch-delta code { font-size: 0.8rem; word-break: break-all; }
      .evidence, .issue-evidence { margin-top: 0.75rem; font-size: 0.875rem; }
      .evidence-metadata { margin-bottom: 0.5rem; }
      .evidence-link { display: inline-block; margin-right: 1rem; color: #60a5fa; }
      .evidence-screenshot img { max-width: 100%; max-height: 200px; border-radius: 0.25rem; margin-top: 0.5rem; }
    </style>
  `;
}

export interface ReportOptions {
  readonly title?: string;
}

/**
 * Generate HTML report from RunValidationResult.
 * Reads only from result models; no Appium or Figma API calls.
 */
export function generateHtmlReport(
  runResult: RunValidationResult,
  options: ReportOptions = {}
): string {
  const title = options.title ?? 'Design-to-Build Compliance Report';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  ${renderStyles()}
</head>
<body>
  <header>
    <h1>${escapeHtml(title)}</h1>
    <p class="subtitle">Generated from validation results</p>
  </header>

  ${renderExecutiveSummary(runResult)}
  ${renderScreenBreakdown(runResult.screenResults)}

</body>
</html>`;

  return html;
}

export interface WriteReportOptions extends ReportOptions {
  readonly outputPath: string;
}

/**
 * Generate HTML report and write to file.
 */
export async function writeHtmlReport(
  runResult: RunValidationResult,
  options: WriteReportOptions
): Promise<void> {
  const { outputPath, ...reportOpts } = options;
  const html = generateHtmlReport(runResult, reportOpts);
  const { writeFile } = await import('node:fs/promises');
  await writeFile(outputPath, html, 'utf-8');
}
