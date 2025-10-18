/**
 * レイヤー操作のためのカスタムフック
 * 
 * thumbnail-generator と asset-creator で共通して使用される
 * レイヤー操作フックを提供します。
 */

import { useCallback, useMemo } from 'react';
import { Layer } from '@/types/layers';
import {
  updateLayerPosition,
  updateLayerSize,
  updateLayerRotation,
  updateLayerVisibility,
  updateLayerLock,
  reorderLayers,
  findLayerById,
  filterVisibleLayers,
  getReversedLayers,
} from '@/utils/layerUtils';

/**
 * レイヤー操作のためのカスタムフック
 * 
 * @param layers - レイヤー配列
 * @param setLayers - レイヤー更新関数
 * @returns レイヤー操作用のハンドラーとメモ化された値
 */
export const useLayerOperations = (
  layers: Layer[],
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>
) => {
  // レイヤーの位置更新
  const handleLayerPositionUpdate = useCallback(
    (layerId: string, x: number, y: number) => {
      setLayers((prevLayers: Layer[]) => updateLayerPosition(prevLayers, layerId, x, y));
    },
    [setLayers]
  );

  // レイヤーのサイズ更新
  const handleLayerSizeUpdate = useCallback(
    (layerId: string, width: number, height: number) => {
      setLayers((prevLayers: Layer[]) => updateLayerSize(prevLayers, layerId, width, height));
    },
    [setLayers]
  );

  // レイヤーの回転更新
  const handleLayerRotationUpdate = useCallback(
    (layerId: string, rotation: number) => {
      setLayers((prevLayers: Layer[]) => updateLayerRotation(prevLayers, layerId, rotation));
    },
    [setLayers]
  );

  // レイヤーの可視性更新
  const handleLayerVisibilityUpdate = useCallback(
    (layerId: string, visible: boolean) => {
      setLayers((prevLayers: Layer[]) => updateLayerVisibility(prevLayers, layerId, visible));
    },
    [setLayers]
  );

  // レイヤーのロック状態更新
  const handleLayerLockUpdate = useCallback(
    (layerId: string, locked: boolean) => {
      setLayers((prevLayers: Layer[]) => updateLayerLock(prevLayers, layerId, locked));
    },
    [setLayers]
  );

  // レイヤーの順序更新
  const handleLayerReorder = useCallback(
    (sourceIndex: number, destinationIndex: number) => {
      setLayers((prevLayers: Layer[]) => reorderLayers(prevLayers, sourceIndex, destinationIndex));
    },
    [setLayers]
  );

  // メモ化された値の計算
  const visibleLayers = useMemo(() => filterVisibleLayers(layers), [layers]);
  const reversedLayers = useMemo(() => getReversedLayers(layers), [layers]);

  return {
    handleLayerPositionUpdate,
    handleLayerSizeUpdate,
    handleLayerRotationUpdate,
    handleLayerVisibilityUpdate,
    handleLayerLockUpdate,
    handleLayerReorder,
    visibleLayers,
    reversedLayers,
  };
};

/**
 * 選択されたレイヤーのための操作フック
 * 
 * @param layers - レイヤー配列
 * @param selectedLayerId - 選択中のレイヤーID
 * @returns 選択されたレイヤーと編集可能かどうか
 */
export const useSelectedLayer = (
  layers: Layer[],
  selectedLayerId: string | null
) => {
  // 選択されたレイヤーをメモ化
  const selectedLayer = useMemo(
    () => findLayerById(layers, selectedLayerId),
    [layers, selectedLayerId]
  );

  // 選択されたレイヤーが編集可能かどうかをメモ化
  const canEditSelectedLayer = useMemo(
    () => Boolean(selectedLayer && !selectedLayer.locked),
    [selectedLayer]
  );

  return {
    selectedLayer,
    canEditSelectedLayer,
  };
};

/**
 * キーボードイベントを処理するフック
 * 
 * @param onDelete - 削除時のコールバック
 * @param onCopy - コピー時のコールバック
 * @param onPaste - ペースト時のコールバック
 * @returns キーボードイベントハンドラー
 */
export const useKeyboardShortcuts = (
  onDelete: () => void,
  onCopy: () => void,
  onPaste: () => void
) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Command/Ctrl + C
      if ((event.metaKey || event.ctrlKey) && event.key === 'c') {
        event.preventDefault();
        onCopy();
      }
      // Command/Ctrl + V
      else if ((event.metaKey || event.ctrlKey) && event.key === 'v') {
        event.preventDefault();
        onPaste();
      }
      // Delete キー
      else if (event.key === 'Delete' || event.key === 'Backspace') {
        onDelete();
      }
    },
    [onCopy, onPaste, onDelete]
  );

  return { handleKeyDown };
};

