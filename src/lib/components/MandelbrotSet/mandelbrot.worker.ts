// src/lib/components/MandelbrotSet/mandelbrot.worker.ts
import type { WorkerData } from './types';

type RGBAColor = [number, number, number, number];

const colorSchemes = {
  classic: (n: number, max: number): RGBAColor => {
    if (n === max) return [0, 0, 0, 255];
    const hue = (n / max) * 360;
    const sat = 100;
    const light = 50;
    const c = (1 - Math.abs(2 * light / 100 - 1)) * sat / 100;
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = light / 100 - c / 2;
    
    let r: number, g: number, b: number;
    if (hue < 60) [r, g, b] = [c, x, 0];
    else if (hue < 120) [r, g, b] = [x, c, 0];
    else if (hue < 180) [r, g, b] = [0, c, x];
    else if (hue < 240) [r, g, b] = [0, x, c];
    else if (hue < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255),
      255
    ];
  },
  
  ocean: (n: number, max: number): RGBAColor => {
    if (n === max) return [0, 0, 0, 255];
    const value = n / max;
    const intensity = Math.sqrt(value);
    return [
      Math.round(intensity * 30),
      Math.round(intensity * 100 + 155),
      Math.round(intensity * 255),
      255
    ];
  },
  
  fire: (n: number, max: number): RGBAColor => {
    if (n === max) return [0, 0, 0, 255];
    const value = n / max;
    const intensity = Math.pow(value, 1.5);
    return [
      Math.round(intensity * 255),
      Math.round(Math.pow(value, 2) * 200),
      Math.round(Math.pow(value, 3) * 128),
      255
    ];
  }
};

function mandelbrot(x0: number, y0: number, maxIterations: number): number {
  let x = 0;
  let y = 0;
  let iteration = 0;
  let x2 = 0;
  let y2 = 0;
  
  while (x2 + y2 <= 4 && iteration < maxIterations) {
    y = 2 * x * y + y0;
    x = x2 - y2 + x0;
    x2 = x * x;
    y2 = y * y;
    iteration++;
  }
  
  return iteration;
}

self.onmessage = (e: MessageEvent<WorkerData>) => {
  const {
    width,
    height,
    maxIterations,
    zoom,
    centerX,
    centerY,
    colorScheme
  } = e.data;
  
  const getColor = colorSchemes[colorScheme];
  const chunkSize = 50; // Process in chunks for better responsiveness
  
  for (let startRow = 0; startRow < height; startRow += chunkSize) {
    const endRow = Math.min(startRow + chunkSize, height);
    const imageData = new ImageData(width, endRow - startRow);
    
    for (let row = startRow; row < endRow; row++) {
      for (let col = 0; col < width; col++) {
        const x = (col - width / 2) / (width * zoom) + centerX;
        const y = (row - height / 2) / (height * zoom) + centerY;
        
        const iteration = mandelbrot(x, y, maxIterations);
        const color = getColor(iteration, maxIterations);
        
        const pixelIndex = ((row - startRow) * width + col) * 4;
        imageData.data[pixelIndex] = color[0];
        imageData.data[pixelIndex + 1] = color[1];
        imageData.data[pixelIndex + 2] = color[2];
        imageData.data[pixelIndex + 3] = color[3];
      }
    }
    
    self.postMessage({ imageData, row: startRow });
  }
};