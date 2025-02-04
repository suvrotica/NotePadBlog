// src/lib/components/MandelbrotSet/types.ts
export type ColorScheme = 'classic' | 'ocean' | 'fire';

export type MandelbrotProps = {
  width?: number;
  height?: number;
  maxIterations?: number;
  colorScheme?: ColorScheme;
};

export type WorkerMessage = {
  imageData: ImageData;
  row: number;
};

export type WorkerData = {
  width: number;
  height: number;
  maxIterations: number;
  zoom: number;
  centerX: number;
  centerY: number;
  colorScheme: ColorScheme;
};