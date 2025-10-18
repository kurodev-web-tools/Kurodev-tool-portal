/**
 * useLayerOperationsフックのユニットテスト
 * 
 * テスト対象:
 * - レイヤーの位置更新
 * - レイヤーのサイズ更新
 * - レイヤーの回転更新
 * - レイヤーの可視性更新
 * - レイヤーのロック状態更新
 * - レイヤーの順序更新
 * - メモ化された値の計算
 */

import { renderHook, act } from '@testing-library/react';
import { useLayerOperations, useSelectedLayer } from '../useLayerOperations';
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

describe('useLayerOperations', () => {
  it('should initialize with correct default values', () => {
    const setLayers = jest.fn();
    const { result } = renderHook(() => useLayerOperations(mockLayers, setLayers));

    expect(result.current).toHaveProperty('handleLayerPositionUpdate');
    expect(result.current).toHaveProperty('handleLayerSizeUpdate');
    expect(result.current).toHaveProperty('handleLayerRotationUpdate');
    expect(result.current).toHaveProperty('handleLayerVisibilityUpdate');
    expect(result.current).toHaveProperty('handleLayerLockUpdate');
    expect(result.current).toHaveProperty('handleLayerReorder');
    expect(result.current).toHaveProperty('visibleLayers');
    expect(result.current).toHaveProperty('reversedLayers');
  });

  it('should update layer position correctly', () => {
    const setLayers = jest.fn();
    const { result } = renderHook(() => useLayerOperations(mockLayers, setLayers));

    act(() => {
      result.current.handleLayerPositionUpdate('1', 100, 200);
    });

    expect(setLayers).toHaveBeenCalledWith(expect.any(Function));
    
    // setLayersに渡された関数を実行して結果を確認
    const updateFunction = setLayers.mock.calls[0][0];
    const updatedLayers = updateFunction(mockLayers);
    
    expect(updatedLayers[0].x).toBe(100);
    expect(updatedLayers[0].y).toBe(200);
    expect(updatedLayers[1].x).toBe(50); // 他のレイヤーは変更されない
    expect(updatedLayers[1].y).toBe(50);
  });

  it('should update layer size correctly', () => {
    const setLayers = jest.fn();
    const { result } = renderHook(() => useLayerOperations(mockLayers, setLayers));

    act(() => {
      result.current.handleLayerSizeUpdate('2', 300, 400);
    });

    expect(setLayers).toHaveBeenCalledWith(expect.any(Function));
    
    const updateFunction = setLayers.mock.calls[0][0];
    const updatedLayers = updateFunction(mockLayers);
    
    expect(updatedLayers[1].width).toBe(300);
    expect(updatedLayers[1].height).toBe(400);
    expect(updatedLayers[0].width).toBe(100); // 他のレイヤーは変更されない
  });

  it('should update layer rotation correctly', () => {
    const setLayers = jest.fn();
    const { result } = renderHook(() => useLayerOperations(mockLayers, setLayers));

    act(() => {
      result.current.handleLayerRotationUpdate('3', 90);
    });

    expect(setLayers).toHaveBeenCalledWith(expect.any(Function));
    
    const updateFunction = setLayers.mock.calls[0][0];
    const updatedLayers = updateFunction(mockLayers);
    
    expect(updatedLayers[2].rotation).toBe(90);
    expect(updatedLayers[0].rotation).toBe(0); // 他のレイヤーは変更されない
  });

  it('should update layer visibility correctly', () => {
    const setLayers = jest.fn();
    const { result } = renderHook(() => useLayerOperations(mockLayers, setLayers));

    act(() => {
      result.current.handleLayerVisibilityUpdate('1', false);
    });

    expect(setLayers).toHaveBeenCalledWith(expect.any(Function));
    
    const updateFunction = setLayers.mock.calls[0][0];
    const updatedLayers = updateFunction(mockLayers);
    
    expect(updatedLayers[0].visible).toBe(false);
    expect(updatedLayers[1].visible).toBe(true); // 他のレイヤーは変更されない
  });

  it('should update layer lock status correctly', () => {
    const setLayers = jest.fn();
    const { result } = renderHook(() => useLayerOperations(mockLayers, setLayers));

    act(() => {
      result.current.handleLayerLockUpdate('2', true);
    });

    expect(setLayers).toHaveBeenCalledWith(expect.any(Function));
    
    const updateFunction = setLayers.mock.calls[0][0];
    const updatedLayers = updateFunction(mockLayers);
    
    expect(updatedLayers[1].locked).toBe(true);
    expect(updatedLayers[0].locked).toBe(false); // 他のレイヤーは変更されない
  });

  it('should reorder layers correctly', () => {
    const setLayers = jest.fn();
    const { result } = renderHook(() => useLayerOperations(mockLayers, setLayers));

    act(() => {
      result.current.handleLayerReorder(0, 2); // 最初のレイヤーを最後に移動
    });

    expect(setLayers).toHaveBeenCalledWith(expect.any(Function));
    
    const updateFunction = setLayers.mock.calls[0][0];
    const updatedLayers = updateFunction(mockLayers);
    
    expect(updatedLayers[0].id).toBe('2'); // 元々2番目だったレイヤーが最初に
    expect(updatedLayers[1].id).toBe('3'); // 元々3番目だったレイヤーが2番目に
    expect(updatedLayers[2].id).toBe('1'); // 元々1番目だったレイヤーが最後に
  });

  it('should calculate visible layers correctly', () => {
    const setLayers = jest.fn();
    const { result } = renderHook(() => useLayerOperations(mockLayers, setLayers));

    expect(result.current.visibleLayers).toHaveLength(2); // visible: trueのレイヤーは2つ
    expect(result.current.visibleLayers[0].id).toBe('1');
    expect(result.current.visibleLayers[1].id).toBe('2');
  });

  it('should calculate reversed layers correctly', () => {
    const setLayers = jest.fn();
    const { result } = renderHook(() => useLayerOperations(mockLayers, setLayers));

    expect(result.current.reversedLayers).toHaveLength(3);
    expect(result.current.reversedLayers[0].id).toBe('3'); // 最後のレイヤーが最初に
    expect(result.current.reversedLayers[1].id).toBe('2');
    expect(result.current.reversedLayers[2].id).toBe('1'); // 最初のレイヤーが最後に
  });

  it('should handle non-existent layer ID gracefully', () => {
    const setLayers = jest.fn();
    const { result } = renderHook(() => useLayerOperations(mockLayers, setLayers));

    act(() => {
      result.current.handleLayerPositionUpdate('non-existent', 100, 200);
    });

    expect(setLayers).toHaveBeenCalledWith(expect.any(Function));
    
    const updateFunction = setLayers.mock.calls[0][0];
    const updatedLayers = updateFunction(mockLayers);
    
    // 存在しないレイヤーIDの場合は変更されない
    expect(updatedLayers).toEqual(mockLayers);
  });
});

describe('useSelectedLayer', () => {
  it('should return selected layer correctly', () => {
    const { result } = renderHook(() => useSelectedLayer(mockLayers, '2'));

    expect(result.current.selectedLayer).toEqual(mockLayers[1]);
    expect(result.current.canEditSelectedLayer).toBe(true); // locked: falseなので編集可能
  });

  it('should return undefined for non-existent layer ID', () => {
    const { result } = renderHook(() => useSelectedLayer(mockLayers, 'non-existent'));

    expect(result.current.selectedLayer).toBeUndefined();
    expect(result.current.canEditSelectedLayer).toBe(false);
  });

  it('should return undefined for null selectedLayerId', () => {
    const { result } = renderHook(() => useSelectedLayer(mockLayers, null));

    expect(result.current.selectedLayer).toBeUndefined();
    expect(result.current.canEditSelectedLayer).toBe(false);
  });

  it('should correctly identify locked layers as non-editable', () => {
    const { result } = renderHook(() => useSelectedLayer(mockLayers, '3'));

    expect(result.current.selectedLayer).toEqual(mockLayers[2]);
    expect(result.current.canEditSelectedLayer).toBe(false); // locked: trueなので編集不可
  });

  it('should recalculate when layers change', () => {
    const { result, rerender } = renderHook(
      ({ layers, selectedId }) => useSelectedLayer(layers, selectedId),
      {
        initialProps: { layers: mockLayers, selectedId: '1' }
      }
    );

    expect(result.current.selectedLayer?.id).toBe('1');

    // レイヤー配列を変更
    const newLayers = [...mockLayers, {
      id: '4',
      type: 'text' as const,
      name: '新しいテキスト',
      visible: true,
      locked: false,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      zIndex: 3,
      text: '新しいテキスト',
      color: '#000000',
      fontSize: '14px',
    }];

    rerender({ layers: newLayers, selectedId: '4' });

    expect(result.current.selectedLayer?.id).toBe('4');
    expect(result.current.canEditSelectedLayer).toBe(true);
  });
});
