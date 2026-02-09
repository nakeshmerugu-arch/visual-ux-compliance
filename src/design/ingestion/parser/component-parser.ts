/**
 * Component parser – maps Figma node types to DesignComponentType.
 * Full component parsing is in node-parser.
 */

import type { DesignComponent, DesignComponentType } from '../../model/component.js';

export type { DesignComponent };

/** Map Figma node type to DesignComponentType */
export function mapNodeTypeToComponentType(nodeType: string): DesignComponentType {
  const map: Record<string, DesignComponentType> = {
    FRAME: 'container',
    COMPONENT: 'container',
    COMPONENT_SET: 'container',
    INSTANCE: 'container',
    TEXT: 'text',
    RECTANGLE: 'container',
    ELLIPSE: 'container',
    VECTOR: 'image',
    LINE: 'icon',
    STAR: 'icon',
    POLYGON: 'icon',
  };
  return map[nodeType] ?? 'unknown';
}

