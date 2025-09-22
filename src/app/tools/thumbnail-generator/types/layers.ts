export interface ElementPositionType {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type LayerType = 'image' | 'text' | 'shape';
export type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow';

export interface Layer {
  id: string;
  type: LayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  // Type-specific properties
  src?: string | null;
  text?: string;
  color?: string;
  fontSize?: string;
  shapeType?: ShapeType;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}
