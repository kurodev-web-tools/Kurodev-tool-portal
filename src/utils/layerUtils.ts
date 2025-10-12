/**
 * レイヤー操作のためのユーティリティ関数群
 * 
 * thumbnail-generator と asset-creator で共通して使用される
 * レイヤー操作関数を提供します。
 */

import { Layer } from '@/types/layers';

/**
 * レイヤーの位置を更新する関数
 */
export const updateLayerPosition = (
  layers: Layer[],
  layerId: string,
  x: number,
  y: number
): Layer[] => {
  return layers.map(layer =>
    layer.id === layerId
      ? { ...layer, x, y } as Layer
      : layer
  );
};

/**
 * レイヤーのサイズを更新する関数
 */
export const updateLayerSize = (
  layers: Layer[],
  layerId: string,
  width: number,
  height: number
): Layer[] => {
  return layers.map(layer =>
    layer.id === layerId
      ? { ...layer, width, height } as Layer
      : layer
  );
};

/**
 * レイヤーの回転を更新する関数
 */
export const updateLayerRotation = (
  layers: Layer[],
  layerId: string,
  rotation: number
): Layer[] => {
  return layers.map(layer =>
    layer.id === layerId
      ? { ...layer, rotation } as Layer
      : layer
  );
};

/**
 * レイヤーの可視性を更新する関数
 */
export const updateLayerVisibility = (
  layers: Layer[],
  layerId: string,
  visible: boolean
): Layer[] => {
  return layers.map(layer =>
    layer.id === layerId
      ? { ...layer, visible } as Layer
      : layer
  );
};

/**
 * レイヤーのロック状態を更新する関数
 */
export const updateLayerLock = (
  layers: Layer[],
  layerId: string,
  locked: boolean
): Layer[] => {
  return layers.map(layer =>
    layer.id === layerId
      ? { ...layer, locked } as Layer
      : layer
  );
};

/**
 * レイヤーの順序を更新する関数（ドラッグ&ドロップ用）
 */
export const reorderLayers = (
  layers: Layer[],
  sourceIndex: number,
  destinationIndex: number
): Layer[] => {
  const result = Array.from(layers);
  const [removed] = result.splice(sourceIndex, 1);
  result.splice(destinationIndex, 0, removed);
  return result;
};

/**
 * レイヤーの検索（メモ化用）
 */
export const findLayerById = (
  layers: Layer[],
  layerId: string | null
): Layer | undefined => {
  return layers.find(layer => layer.id === layerId);
};

/**
 * 可視レイヤーのフィルタリング（メモ化用）
 */
export const filterVisibleLayers = (layers: Layer[]): Layer[] => {
  return layers.filter(layer => layer.visible);
};

/**
 * レイヤーの並び順を反転（メモ化用）
 */
export const getReversedLayers = (layers: Layer[]): Layer[] => {
  return [...layers].reverse();
};

