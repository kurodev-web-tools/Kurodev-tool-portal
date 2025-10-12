import { Layer } from '../types';

/**
 * レイヤーの最適化ユーティリティ関数群
 */

// レイヤーの位置を更新する関数
export const updateLayerPosition = (
  layers: Layer[],
  layerId: string,
  x: number,
  y: number
): Layer[] => {
  return layers.map(layer =>
    layer.id === layerId
      ? { ...layer, x, y }
      : layer
  );
};

// レイヤーのサイズを更新する関数
export const updateLayerSize = (
  layers: Layer[],
  layerId: string,
  width: number,
  height: number
): Layer[] => {
  return layers.map(layer =>
    layer.id === layerId
      ? { ...layer, width, height }
      : layer
  );
};

// レイヤーの回転を更新する関数
export const updateLayerRotation = (
  layers: Layer[],
  layerId: string,
  rotation: number
): Layer[] => {
  return layers.map(layer =>
    layer.id === layerId
      ? { ...layer, rotation }
      : layer
  );
};

// レイヤーの可視性を更新する関数
export const updateLayerVisibility = (
  layers: Layer[],
  layerId: string,
  isVisible: boolean
): Layer[] => {
  return layers.map(layer =>
    layer.id === layerId
      ? { ...layer, isVisible }
      : layer
  );
};

// レイヤーのロック状態を更新する関数
export const updateLayerLock = (
  layers: Layer[],
  layerId: string,
  isLocked: boolean
): Layer[] => {
  return layers.map(layer =>
    layer.id === layerId
      ? { ...layer, isLocked }
      : layer
  );
};

// レイヤーの順序を更新する関数（zIndex）
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

// レイヤーの検索（メモ化用）
export const findLayerById = (layers: Layer[], layerId: string | null): Layer | undefined => {
  return layers.find(layer => layer.id === layerId);
};

// レイヤーのフィルタリング（メモ化用）
export const filterVisibleLayers = (layers: Layer[]): Layer[] => {
  return layers.filter(layer => layer.visible);
};

// レイヤーの並び順を反転（メモ化用）
export const getReversedLayers = (layers: Layer[]): Layer[] => {
  return [...layers].reverse();
};