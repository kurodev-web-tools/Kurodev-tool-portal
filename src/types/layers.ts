/**
 * レイヤーシステムの共通型定義
 * 
 * thumbnail-generator と asset-creator で共通して使用される
 * レイヤーの型定義を提供します。
 */

import { MouseEvent, TouchEvent } from 'react';
import { ResizableDelta, Position } from 'react-rnd';

/**
 * レイヤーの基本型
 */
export type LayerType = 'image' | 'text' | 'shape';

/**
 * 図形の種類
 */
export type ShapeType = 
  // 基本図形
  | 'rectangle' 
  | 'circle' 
  | 'triangle' 
  | 'line' 
  | 'arrow' 
  | 'star' 
  | 'polygon' 
  | 'heart' 
  | 'diamond'
  // 装飾線
  | 'dashed-line'
  | 'dotted-line'
  | 'wavy-line'
  // 吹き出し
  | 'speech-bubble-round'
  | 'speech-bubble-square'
  | 'thought-bubble'
  // バッジ・リボン
  | 'badge'
  | 'ribbon';

/**
 * レイヤーの共通インターフェース
 */
export interface BaseLayer {
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
  zIndex: number;
  opacity?: number;
}

/**
 * テキストレイヤー
 */
export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  color: string;
  fontSize: string;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textShadow?: string;
  letterSpacing?: string;
  textStrokeWidth?: string;
  textStrokeColor?: string;
  textGradient?: string;
}

/**
 * 画像レイヤー
 */
export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string | null;
  isBackground?: boolean; // 背景画像として扱うフラグ（100%表示）
  imageFilters?: import('../utils/imageFilters').ImageFilters;
}

/**
 * 図形レイヤー
 */
export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shapeType: ShapeType;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

/**
 * レイヤーのユニオン型
 * 
 * この型を使用することで、TypeScriptの型ガードが機能し、
 * type に応じた適切なプロパティにアクセスできます。
 */
export type Layer = TextLayer | ImageLayer | ShapeLayer;

/**
 * react-rndイベント型定義
 * 
 * react-rndライブラリのイベントハンドラーで使用される型です。
 * any型の使用を避けるために定義しています。
 */
export type RndMouseOrTouchEvent = MouseEvent | TouchEvent;

/**
 * リサイズの方向
 */
export type ResizeDirection = 
  | 'top' 
  | 'right' 
  | 'bottom' 
  | 'left' 
  | 'topRight' 
  | 'bottomRight' 
  | 'bottomLeft' 
  | 'topLeft';

/**
 * リサイズコールバックの型
 */
export interface RndResizeCallback {
  (
    e: RndMouseOrTouchEvent,
    dir: ResizeDirection,
    elementRef: HTMLElement,
    delta: ResizableDelta,
    position: Position
  ): void;
}

/**
 * レイヤー操作のためのコールバック型
 */
export interface LayerCallbacks {
  onSelect?: () => void;
  onDragStop?: (e: unknown, d: Position) => void;
  onResize?: RndResizeCallback;
  onResizeStop?: RndResizeCallback;
  onRotateStart?: () => void;
  onRotate?: (angle: number) => void;
  onRotateStop?: () => void;
}

/**
 * レイヤー作成時のパラメータ型
 * 
 * id, rotation, zIndex は自動的に設定されるため、
 * 作成時には不要です。
 */
export type CreateLayerParams = Omit<Layer, 'id' | 'rotation' | 'zIndex'>;

/**
 * レイヤー更新時のパラメータ型
 * 
 * すべてのフィールドがオプショナルです。
 */
export type UpdateLayerParams = Partial<Layer>;

/**
 * 型ガード: TextLayer かどうかを判定
 */
export function isTextLayer(layer: Layer): layer is TextLayer {
  return layer.type === 'text';
}

/**
 * 型ガード: ImageLayer かどうかを判定
 */
export function isImageLayer(layer: Layer): layer is ImageLayer {
  return layer.type === 'image';
}

/**
 * 型ガード: ShapeLayer かどうかを判定
 */
export function isShapeLayer(layer: Layer): layer is ShapeLayer {
  return layer.type === 'shape';
}


