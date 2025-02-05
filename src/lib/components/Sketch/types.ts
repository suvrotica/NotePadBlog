// src/lib/components/Sketch/types.ts
export interface SketchData {
    image: string;
    transform: {
      scale: number;
      rotation: number;
      translateX: number;
      translateY: number;
    };
  }
  
  export interface Sketch {
    id: string;
    title: string;
    data: SketchData;
    created: string;
    updated: string;
  }
  
  export interface WhiteboardProps {
    readOnly?: boolean;
    initialData?: SketchData | null;
    onUpdate?: (data: SketchData) => void;
  }