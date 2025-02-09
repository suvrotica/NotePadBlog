// src/lib/components/Sketch/fabric-types.ts
import type { 
  Canvas,
  IText,
  Rect,
  Circle,
  Group,
  FabricObject,
  CanvasOptions,
  ITextProps,
  RectProps,
  CircleProps,
  GroupProps
} from 'fabric';

// Re-export with our preferred names
export type {
  Canvas as FabricCanvas,
  IText as FabricIText,
  Rect as FabricRect,
  Circle as FabricCircle,
  Group as FabricGroup,
  FabricObject,
  CanvasOptions,
  ITextProps,
  RectProps,
  CircleProps,
  GroupProps
};

// Custom drawing options
export interface DrawingOptions {
  color: string;
  width: number;
}

// Shape positioning for our component
export interface ShapePosition {
  left: number;
  top: number;
}

// Helper type for SVG operations
export interface SVGOptions {
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
  signal?: AbortSignal;
}