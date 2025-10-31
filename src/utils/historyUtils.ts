/**
 * 操作履歴関連のユーティリティ
 */

import { Layer } from '@/types/layers';

/**
 * 操作タイプ
 */
export type HistoryActionType = 
  | 'initial'      // 初期状態
  | 'text-add'     // テキスト追加
  | 'text-edit'    // テキスト編集
  | 'image-add'    // 画像追加
  | 'shape-add'    // 図形追加
  | 'layer-delete' // レイヤー削除
  | 'layer-move'   // レイヤー移動
  | 'layer-resize' // レイヤーリサイズ
  | 'layer-rotate' // レイヤー回転
  | 'filter-apply' // フィルター適用
  | 'layer-reorder'// レイヤー順序変更
  | 'layer-property'// レイヤープロパティ変更（不透明度など）
  | 'unknown';     // 不明

/**
 * 履歴エントリのインターフェース
 */
export interface HistoryEntry {
  id: string;
  timestamp: number;
  actionType: HistoryActionType;
  description: string;
  layers: Layer[];
  selectedLayerId: string | null;
}

/**
 * 操作タイプを判定して説明文を生成
 */
export function detectActionType(
  prevLayers: Layer[],
  currentLayers: Layer[],
  prevSelectedId: string | null,
  currentSelectedId: string | null
): { type: HistoryActionType; description: string } {
  const prevCount = prevLayers.length;
  const currentCount = currentLayers.length;

  // レイヤー数が増えた場合
  if (currentCount > prevCount) {
    const newLayer = currentLayers.find(
      layer => !prevLayers.some(prev => prev.id === layer.id)
    );
    if (newLayer) {
      if (newLayer.type === 'text') {
        return { type: 'text-add', description: `テキスト「${newLayer.name || 'テキスト'}」を追加` };
      } else if (newLayer.type === 'image') {
        return { type: 'image-add', description: `画像「${newLayer.name || '画像'}」を追加` };
      } else if (newLayer.type === 'shape') {
        return { type: 'shape-add', description: `図形「${newLayer.name || '図形'}」を追加` };
      }
    }
  }

  // レイヤー数が減った場合
  if (currentCount < prevCount) {
    const deletedLayer = prevLayers.find(
      layer => !currentLayers.some(curr => curr.id === layer.id)
    );
    if (deletedLayer) {
      return { type: 'layer-delete', description: `「${deletedLayer.name}」を削除` };
    }
  }

  // レイヤー数が同じ場合、変更を検出
  for (const currentLayer of currentLayers) {
    const prevLayer = prevLayers.find(l => l.id === currentLayer.id);
    if (!prevLayer) continue;

    // 位置の変更
    if (prevLayer.x !== currentLayer.x || prevLayer.y !== currentLayer.y) {
      return { type: 'layer-move', description: `「${currentLayer.name}」を移動` };
    }

    // サイズの変更
    if (prevLayer.width !== currentLayer.width || prevLayer.height !== currentLayer.height) {
      return { type: 'layer-resize', description: `「${currentLayer.name}」のサイズを変更` };
    }

    // 回転の変更
    if (prevLayer.rotation !== currentLayer.rotation) {
      return { type: 'layer-rotate', description: `「${currentLayer.name}」を回転` };
    }

    // テキストレイヤーのテキスト内容の変更
    if (prevLayer.type === 'text' && currentLayer.type === 'text') {
      if (prevLayer.text !== currentLayer.text) {
        return { type: 'text-edit', description: `テキスト「${currentLayer.name}」を編集` };
      }
    }

    // 画像フィルターの変更
    if (prevLayer.type === 'image' && currentLayer.type === 'image') {
      const prevFilters = prevLayer.imageFilters;
      const currentFilters = currentLayer.imageFilters;
      if (JSON.stringify(prevFilters) !== JSON.stringify(currentFilters)) {
        return { type: 'filter-apply', description: `「${currentLayer.name}」にフィルターを適用` };
      }
    }

    // その他のプロパティ変更（不透明度など）
    if (prevLayer.opacity !== currentLayer.opacity) {
      return { type: 'layer-property', description: `「${currentLayer.name}」のプロパティを変更` };
    }
  }

  // 選択レイヤーの変更のみ
  if (prevSelectedId !== currentSelectedId) {
    return { type: 'layer-property', description: 'レイヤーを選択' };
  }

  return { type: 'unknown', description: '変更を適用' };
}

/**
 * 操作タイプに対応するアイコン名を取得
 */
export function getActionIcon(type: HistoryActionType): string {
  switch (type) {
    case 'initial':
      return '🎯';
    case 'text-add':
    case 'text-edit':
      return '📝';
    case 'image-add':
      return '🖼️';
    case 'shape-add':
      return '🔷';
    case 'layer-delete':
      return '🗑️';
    case 'layer-move':
      return '⬅️';
    case 'layer-resize':
      return '↔️';
    case 'layer-rotate':
      return '🔄';
    case 'filter-apply':
      return '🎨';
    case 'layer-reorder':
      return '↕️';
    case 'layer-property':
      return '⚙️';
    default:
      return '📋';
  }
}
