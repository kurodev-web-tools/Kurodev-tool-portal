import { ResizableDelta, Position } from 'react-rnd';

// 基本的なレイヤープロパティ
export interface BaseLayerProps {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  isLocked: boolean;
  isVisible: boolean;
}

// テキストレイヤー固有のプロパティ
export interface TextLayerProps extends BaseLayerProps {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  backgroundColor: string;
  padding: number;
}

// 画像レイヤー固有のプロパティ
export interface ImageLayerProps extends BaseLayerProps {
  type: 'image';
  src: string;
  alt: string;
  objectFit: 'contain' | 'cover' | 'fill';
  opacity: number;
}

// 図形レイヤー固有のプロパティ
export interface ShapeLayerProps extends BaseLayerProps {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle';
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}

// ユニオン型としてのレイヤー
export type Layer = TextLayerProps | ImageLayerProps | ShapeLayerProps;

// イベントハンドラーの型
export interface LayerEventHandlers {
  onDragStop: (e: MouseEvent | TouchEvent, data: Position) => void;
  onResize: (e: MouseEvent | TouchEvent, dir: string, ref: HTMLElement, delta: ResizableDelta, position: Position) => void;
  onResizeStop: (e: MouseEvent | TouchEvent, dir: string, ref: HTMLElement, delta: ResizableDelta, position: Position) => void;
  onRotateStart: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  onRotate: (angle: number) => void;
  onRotateStop: () => void;
}

// バリデーション結果の型
export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  error?: string;
}

// ファイルアップロード関連の定数
export const FILE_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const,
} as const;

// 型ガード関数
export function isTextLayer(layer: Layer): layer is TextLayerProps {
  return layer.type === 'text';
}

export function isImageLayer(layer: Layer): layer is ImageLayerProps {
  return layer.type === 'image';
}

export function isShapeLayer(layer: Layer): layer is ShapeLayerProps {
  return layer.type === 'shape';
}

// ファイルバリデーション関数
export function validateImageFile(file: File): ValidationResult<File> {
  if (!file) {
    return { isValid: false, error: 'ファイルが選択されていません。' };
  }

  if (file.size > FILE_CONSTANTS.MAX_FILE_SIZE) {
    return { isValid: false, error: 'ファイルサイズが大きすぎます（上限: 10MB）。' };
  }

  if (!FILE_CONSTANTS.ACCEPTED_IMAGE_TYPES.includes(file.type as typeof FILE_CONSTANTS.ACCEPTED_IMAGE_TYPES[number])) {
    return { isValid: false, error: '対応していないファイル形式です。' };
  }

  return { isValid: true, data: file };
}