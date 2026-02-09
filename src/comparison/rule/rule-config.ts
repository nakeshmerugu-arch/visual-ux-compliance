/**
 * Rule configuration types.
 * Each rule has its own config; tolerances are externally configurable (YAML/JSON).
 * All configs are immutable.
 */

/** Base config shared by rules that use numeric tolerance */
export interface ToleranceConfig {
  readonly tolerance?: number;
}

/** Position rule – validates x,y against design layout */
export interface PositionRuleConfig extends ToleranceConfig {
  readonly tolerance?: number; // pixels, default from ToleranceConfig
}

/** Size rule – validates width, height against design layout */
export interface SizeRuleConfig extends ToleranceConfig {
  readonly tolerance?: number; // pixels
  readonly validateWidth?: boolean;
  readonly validateHeight?: boolean;
}

/** Font size rule – validates fontSize against design typography */
export interface FontSizeRuleConfig extends ToleranceConfig {
  readonly tolerance?: number; // points
}

/** Font family rule – validates fontFamily against design typography */
export interface FontFamilyRuleConfig {
  readonly caseSensitive?: boolean;
  readonly allowAlternates?: boolean; // e.g., system font fallbacks
}

/** Color rule – validates backgroundColor or textColor against design */
export interface ColorRuleConfig extends ToleranceConfig {
  readonly tolerance?: number; // 0–255 per channel, or delta-E for perceptual
  readonly property?: 'backgroundColor' | 'textColor' | 'both';
}

/** Text content rule – validates text content against design */
export interface TextContentRuleConfig {
  readonly exactMatch?: boolean;
  readonly trimWhitespace?: boolean;
  readonly ignoreCase?: boolean;
}
