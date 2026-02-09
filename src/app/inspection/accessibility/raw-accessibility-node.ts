/**
 * Raw accessibility node – platform-agnostic intermediate from parsed XML.
 * Used before mapping to canonical AppElement.
 */

/** Raw node parsed from accessibility tree XML */
export interface RawAccessibilityNode {
  readonly tagName: string;
  readonly attributes: Readonly<Record<string, string>>;
  readonly children: readonly RawAccessibilityNode[];
}
