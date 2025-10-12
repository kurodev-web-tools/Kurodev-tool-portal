/**
 * asset-creatorツールの型定義
 * 
 * 共通のレイヤー型定義を再エクスポートし、
 * ツール固有の型定義とユーティリティを提供します。
 */

// 共通のレイヤー型定義を使用
export type {
  Layer,
  LayerType,
  ShapeType,
  BaseLayer,
  TextLayer,
  ImageLayer,
  ShapeLayer,
  RndMouseOrTouchEvent,
  ResizeDirection,
  RndResizeCallback,
  LayerCallbacks,
  CreateLayerParams,
  UpdateLayerParams,
} from '@/types/layers';

export {
  isTextLayer,
  isImageLayer,
  isShapeLayer,
} from '@/types/layers';

// 後方互換性のためのエイリアス型
import { Layer } from '@/types/layers';
export type { Layer as TextLayerProps, Layer as ImageLayerProps, Layer as ShapeLayerProps };

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