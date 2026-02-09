/**
 * Accessibility tree reader – parses page source XML into raw node tree.
 */

import { XMLParser } from 'fast-xml-parser';
import type { RawAccessibilityNode } from './raw-accessibility-node.js';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

function getAttributes(obj: unknown): Readonly<Record<string, string>> {
  if (obj == null || typeof obj !== 'object') return {};
  const record = obj as Record<string, unknown>;
  const attrs = record['@_'];
  if (attrs == null || typeof attrs !== 'object') return {};
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (typeof v === 'string') result[k] = v;
  }
  return Object.freeze(result);
}

function getChildObjects(obj: unknown): unknown[] {
  if (obj == null || typeof obj !== 'object') return [];
  const record = obj as Record<string, unknown>;
  const result: unknown[] = [];
  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith('@_')) continue;
    if (Array.isArray(value)) result.push(...value);
    else if (value != null && typeof value === 'object') result.push(value);
  }
  return result;
}

function parseNode(obj: unknown, tagName: string): RawAccessibilityNode | null {
  if (obj == null || typeof obj !== 'object') return null;

  const attributes = getAttributes(obj);
  const childObjects = getChildObjects(obj);
  const children = childObjects
    .map((c) => {
      if (c == null || typeof c !== 'object') return null;
      const rec = c as Record<string, unknown>;
      const tag = Object.keys(rec).find((k) => !k.startsWith('@_')) ?? 'node';
      return parseNode(c, tag);
    })
    .filter((n): n is RawAccessibilityNode => n != null);

  return { tagName, attributes, children };
}

function findRootAndParse(parsed: unknown): RawAccessibilityNode[] {
  if (parsed == null || typeof parsed !== 'object') return [];

  const record = parsed as Record<string, unknown>;
  const rootTags = ['hierarchy', 'app', 'XCUIElementTypeApplication', 'AXDocument'];
  for (const tag of rootTags) {
    const val = record[tag];
    if (val != null) {
      const node = parseNode(val, tag);
      if (node) return [node];
    }
  }

  const firstKey = Object.keys(record).find((k) => !k.startsWith('@_'));
  if (firstKey) {
    const node = parseNode(record[firstKey], firstKey);
    if (node) return [node];
  }
  return [];
}

/** Parse page source XML into raw accessibility nodes */
export function parseAccessibilityTree(xmlSource: string): RawAccessibilityNode[] {
  try {
    const parsed = parser.parse(xmlSource);
    return findRootAndParse(parsed);
  } catch {
    return [];
  }
}
