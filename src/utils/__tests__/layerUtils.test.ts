/**
 * layerUtilsのユニットテスト
 * 
 * テスト対象:
 * - updateLayerPosition
 * - updateLayerSize
 * - updateLayerRotation
 * - updateLayerVisibility
 * - updateLayerLock
 * - reorderLayers
 * - findLayerById
 * - filterVisibleLayers
 * - getReversedLayers
 */

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
} from '../../utils/layerUtils';
import { Layer } from '@/types/layers';

// テスト用のモックレイヤーデータ
const mockLayers: Layer[] = [
  {
    id: '1',
    type: 'text',
    name: 'テキスト1',
    visible: true,
    locked: false,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    zIndex: 0,
    text: 'テストテキスト',
    color: '#FFFFFF',
    fontSize: '16px',
  },
  {
    id: '2',
    type: 'image',
    name: '画像1',
    visible: true,
    locked: false,
    x: 50,
    y: 50,
    width: 200,
    height: 200,
    rotation: 0,
    zIndex: 1,
    src: 'test-image.jpg',
  },
  {
    id: '3',
    type: 'shape',
    name: '図形1',
    visible: false,
    locked: true,
    x: 100,
    y: 100,
    width: 150,
    height: 150,
    rotation: 45,
    zIndex: 2,
    shapeType: 'rectangle',
    backgroundColor: '#FF0000',
    borderColor: '#000000',
    borderWidth: 2,
  },
];

describe('layerUtils', () => {
  describe('updateLayerPosition', () => {
    it('should update layer position correctly', () => {
      const result = updateLayerPosition(mockLayers, '1', 100, 200);
      
      expect(result[0].x).toBe(100);
      expect(result[0].y).toBe(200);
      expect(result[1].x).toBe(50); // 他のレイヤーは変更されない
      expect(result[1].y).toBe(50);
    });

    it('should return original array if layer not found', () => {
      const result = updateLayerPosition(mockLayers, 'non-existent', 100, 200);
      
      expect(result).toEqual(mockLayers);
    });

    it('should not mutate original array', () => {
      const originalLayers = [...mockLayers];
      updateLayerPosition(mockLayers, '1', 100, 200);
      
      expect(mockLayers).toEqual(originalLayers);
    });
  });

  describe('updateLayerSize', () => {
    it('should update layer size correctly', () => {
      const result = updateLayerSize(mockLayers, '2', 300, 400);
      
      expect(result[1].width).toBe(300);
      expect(result[1].height).toBe(400);
      expect(result[0].width).toBe(100); // 他のレイヤーは変更されない
    });

    it('should return original array if layer not found', () => {
      const result = updateLayerSize(mockLayers, 'non-existent', 300, 400);
      
      expect(result).toEqual(mockLayers);
    });
  });

  describe('updateLayerRotation', () => {
    it('should update layer rotation correctly', () => {
      const result = updateLayerRotation(mockLayers, '3', 90);
      
      expect(result[2].rotation).toBe(90);
      expect(result[0].rotation).toBe(0); // 他のレイヤーは変更されない
    });

    it('should handle negative rotation values', () => {
      const result = updateLayerRotation(mockLayers, '1', -45);
      
      expect(result[0].rotation).toBe(-45);
    });

    it('should handle rotation values greater than 360', () => {
      const result = updateLayerRotation(mockLayers, '1', 450);
      
      expect(result[0].rotation).toBe(450);
    });
  });

  describe('updateLayerVisibility', () => {
    it('should update layer visibility correctly', () => {
      const result = updateLayerVisibility(mockLayers, '1', false);
      
      expect(result[0].visible).toBe(false);
      expect(result[1].visible).toBe(true); // 他のレイヤーは変更されない
    });

    it('should handle visibility toggle', () => {
      const result = updateLayerVisibility(mockLayers, '3', true);
      
      expect(result[2].visible).toBe(true);
    });
  });

  describe('updateLayerLock', () => {
    it('should update layer lock status correctly', () => {
      const result = updateLayerLock(mockLayers, '2', true);
      
      expect(result[1].locked).toBe(true);
      expect(result[0].locked).toBe(false); // 他のレイヤーは変更されない
    });

    it('should handle lock toggle', () => {
      const result = updateLayerLock(mockLayers, '3', false);
      
      expect(result[2].locked).toBe(false);
    });
  });

  describe('reorderLayers', () => {
    it('should reorder layers correctly', () => {
      const result = reorderLayers(mockLayers, 0, 2); // 最初のレイヤーを最後に移動
      
      expect(result[0].id).toBe('2'); // 元々2番目だったレイヤーが最初に
      expect(result[1].id).toBe('3'); // 元々3番目だったレイヤーが2番目に
      expect(result[2].id).toBe('1'); // 元々1番目だったレイヤーが最後に
    });

    it('should handle same index reorder', () => {
      const result = reorderLayers(mockLayers, 1, 1);
      
      expect(result).toEqual(mockLayers);
    });

    it('should handle invalid indices gracefully', () => {
      const result = reorderLayers(mockLayers, -1, 2);
      
      expect(result).toEqual(mockLayers);
    });

    it('should handle out of bounds indices gracefully', () => {
      const result = reorderLayers(mockLayers, 0, 10);
      
      expect(result).toEqual(mockLayers);
    });
  });

  describe('findLayerById', () => {
    it('should find layer by ID correctly', () => {
      const result = findLayerById(mockLayers, '2');
      
      expect(result).toEqual(mockLayers[1]);
    });

    it('should return undefined for non-existent ID', () => {
      const result = findLayerById(mockLayers, 'non-existent');
      
      expect(result).toBeUndefined();
    });

    it('should return undefined for null ID', () => {
      const result = findLayerById(mockLayers, null);
      
      expect(result).toBeUndefined();
    });
  });

  describe('filterVisibleLayers', () => {
    it('should filter visible layers correctly', () => {
      const result = filterVisibleLayers(mockLayers);
      
      expect(result).toHaveLength(2); // visible: trueのレイヤーは2つ
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('should return empty array if no visible layers', () => {
      const hiddenLayers = mockLayers.map(layer => ({ ...layer, visible: false }));
      const result = filterVisibleLayers(hiddenLayers);
      
      expect(result).toHaveLength(0);
    });

    it('should return all layers if all are visible', () => {
      const visibleLayers = mockLayers.map(layer => ({ ...layer, visible: true }));
      const result = filterVisibleLayers(visibleLayers);
      
      expect(result).toHaveLength(3);
    });
  });

  describe('getReversedLayers', () => {
    it('should reverse layers correctly', () => {
      const result = getReversedLayers(mockLayers);
      
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('3'); // 最後のレイヤーが最初に
      expect(result[1].id).toBe('2');
      expect(result[2].id).toBe('1'); // 最初のレイヤーが最後に
    });

    it('should return empty array for empty input', () => {
      const result = getReversedLayers([]);
      
      expect(result).toHaveLength(0);
    });

    it('should return same array for single layer', () => {
      const singleLayer = [mockLayers[0]];
      const result = getReversedLayers(singleLayer);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('edge cases', () => {
    it('should handle empty layers array', () => {
      expect(updateLayerPosition([], '1', 100, 200)).toEqual([]);
      expect(updateLayerSize([], '1', 300, 400)).toEqual([]);
      expect(updateLayerRotation([], '1', 90)).toEqual([]);
      expect(updateLayerVisibility([], '1', false)).toEqual([]);
      expect(updateLayerLock([], '1', true)).toEqual([]);
      expect(reorderLayers([], 0, 1)).toEqual([]);
      expect(findLayerById([], '1')).toBeUndefined();
      expect(filterVisibleLayers([])).toEqual([]);
      expect(getReversedLayers([])).toEqual([]);
    });

    it('should handle null/undefined values gracefully', () => {
      expect(updateLayerPosition(mockLayers, null as any, 100, 200)).toEqual(mockLayers);
      expect(updateLayerSize(mockLayers, undefined as any, 300, 400)).toEqual(mockLayers);
      expect(findLayerById(mockLayers, null)).toBeUndefined();
      expect(findLayerById(mockLayers, undefined as any)).toBeUndefined();
    });
  });
});
