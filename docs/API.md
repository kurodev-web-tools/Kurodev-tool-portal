# VTuber Tools Portal - API Documentation

## 概要

VTuber Tools Portalは、VTuberの活動を支援するWebツールスイートです。このドキュメントでは、主要なAPIとコンポーネントの使用方法について説明します。

## 共通フック

### useLayerOperations

レイヤー操作のためのカスタムフックです。

```typescript
import { useLayerOperations } from '@/hooks/shared/useLayerOperations';

const {
  handleLayerPositionUpdate,
  handleLayerSizeUpdate,
  handleLayerRotationUpdate,
  handleLayerVisibilityUpdate,
  handleLayerLockUpdate,
  handleLayerReorder,
  visibleLayers,
  reversedLayers
} = useLayerOperations(layers, setLayers);
```

#### パラメータ

- `layers: Layer[]` - レイヤー配列
- `setLayers: (layers: Layer[] | ((prev: Layer[]) => Layer[])) => void` - レイヤー更新関数

#### 戻り値

- `handleLayerPositionUpdate(id: string, x: number, y: number)` - レイヤーの位置を更新
- `handleLayerSizeUpdate(id: string, width: number, height: number)` - レイヤーのサイズを更新
- `handleLayerRotationUpdate(id: string, rotation: number)` - レイヤーの回転を更新
- `handleLayerVisibilityUpdate(id: string, visible: boolean)` - レイヤーの可視性を更新
- `handleLayerLockUpdate(id: string, locked: boolean)` - レイヤーのロック状態を更新
- `handleLayerReorder(sourceIndex: number, destinationIndex: number)` - レイヤーの順序を更新
- `visibleLayers: Layer[]` - 可視レイヤーの配列
- `reversedLayers: Layer[]` - 逆順のレイヤー配列

### useSelectedLayer

選択されたレイヤーの情報を取得するフックです。

```typescript
import { useSelectedLayer } from '@/hooks/shared/useLayerOperations';

const { selectedLayer, canEditSelectedLayer } = useSelectedLayer(layers, selectedLayerId);
```

#### パラメータ

- `layers: Layer[]` - レイヤー配列
- `selectedLayerId: string | null` - 選択されたレイヤーID

#### 戻り値

- `selectedLayer: Layer | undefined` - 選択されたレイヤー
- `canEditSelectedLayer: boolean` - レイヤーが編集可能かどうか

## 共通コンポーネント

### MobileControls

モバイル用のレイヤー操作コントロールコンポーネントです。

```typescript
import { MobileControls } from '@/components/shared/MobileControls';

<MobileControls
  selectedLayer={selectedLayer}
  onUpdateLayer={handleUpdateLayer}
  className="custom-class"
/>
```

#### プロパティ

- `selectedLayer: Layer | null` - 選択されたレイヤー
- `onUpdateLayer: (id: string, updates: Partial<Layer>) => void` - レイヤー更新時のコールバック
- `className?: string` - カスタムCSSクラス

#### 機能

- 位置調整（X/Y座標）
- サイズ調整（幅/高さ）
- 回転調整
- 透明度調整
- リセットボタン

### MobileDisplaySettings

モバイル用の表示設定コンポーネントです。

```typescript
import { MobileDisplaySettings } from '@/components/shared/MobileDisplaySettings';

<MobileDisplaySettings
  zoom={zoom}
  onZoomChange={setZoom}
  showGrid={showGrid}
  onShowGridChange={setShowGrid}
  showGuides={showGuides}
  onShowGuidesChange={setShowGuides}
  showSafeArea={showSafeArea}
  onShowSafeAreaChange={setShowSafeArea}
  showAspectGuide={showAspectGuide}
  onShowAspectGuideChange={setShowAspectGuide}
  gridSize={gridSize}
  onGridSizeChange={setGridSize}
  className="custom-class"
/>
```

#### プロパティ

- `zoom: number` - ズームレベル（0.1-3.0）
- `onZoomChange: (zoom: number) => void` - ズーム変更時のコールバック
- `showGrid: boolean` - グリッド表示の有無
- `onShowGridChange: (show: boolean) => void` - グリッド表示変更時のコールバック
- `showGuides: boolean` - ガイドライン表示の有無
- `onShowGuidesChange: (show: boolean) => void` - ガイドライン表示変更時のコールバック
- `showSafeArea?: boolean` - セーフエリア表示の有無（オプション）
- `onShowSafeAreaChange?: (show: boolean) => void` - セーフエリア表示変更時のコールバック（オプション）
- `showAspectGuide?: boolean` - アスペクト比ガイド表示の有無（オプション）
- `onShowAspectGuideChange?: (show: boolean) => void` - アスペクト比ガイド表示変更時のコールバック（オプション）
- `gridSize?: number` - グリッドサイズ（10-50px、デフォルト: 20）
- `onGridSizeChange?: (size: number) => void` - グリッドサイズ変更時のコールバック（オプション）
- `className?: string` - カスタムCSSクラス

#### 機能

- ズーム調整（スライダー + ボタン）
- フィットボタン（100%ズームにリセット）
- グリッド表示のオン/オフ
- ガイドライン表示のオン/オフ
- セーフエリア表示のオン/オフ（オプション）
- アスペクト比ガイド表示のオン/オフ（オプション）
- グリッドサイズ調整（オプション）

## ユーティリティ関数

### layerUtils

レイヤー操作のためのユーティリティ関数群です。

```typescript
import {
  updateLayerPosition,
  updateLayerSize,
  updateLayerRotation,
  updateLayerVisibility,
  updateLayerLock,
  reorderLayers,
  findLayerById,
  filterVisibleLayers,
  getReversedLayers
} from '@/utils/layerUtils';
```

#### 関数一覧

- `updateLayerPosition(layers: Layer[], layerId: string, x: number, y: number): Layer[]`
- `updateLayerSize(layers: Layer[], layerId: string, width: number, height: number): Layer[]`
- `updateLayerRotation(layers: Layer[], layerId: string, rotation: number): Layer[]`
- `updateLayerVisibility(layers: Layer[], layerId: string, visible: boolean): Layer[]`
- `updateLayerLock(layers: Layer[], layerId: string, locked: boolean): Layer[]`
- `reorderLayers(layers: Layer[], sourceIndex: number, destinationIndex: number): Layer[]`
- `findLayerById(layers: Layer[], layerId: string | null): Layer | undefined`
- `filterVisibleLayers(layers: Layer[]): Layer[]`
- `getReversedLayers(layers: Layer[]): Layer[]`

## 型定義

### Layer

基本的なレイヤー型です。

```typescript
interface Layer {
  id: string;
  type: 'text' | 'image' | 'shape';
  name: string;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}
```

### TextLayer

テキストレイヤーの型です。

```typescript
interface TextLayer extends Layer {
  type: 'text';
  text: string;
  color: string;
  fontSize: string;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textShadow?: string;
}
```

### ImageLayer

画像レイヤーの型です。

```typescript
interface ImageLayer extends Layer {
  type: 'image';
  src: string;
  alt?: string;
}
```

### ShapeLayer

図形レイヤーの型です。

```typescript
interface ShapeLayer extends Layer {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}
```

## 使用例

### 基本的なレイヤー操作

```typescript
import { useState } from 'react';
import { useLayerOperations } from '@/hooks/shared/useLayerOperations';
import { Layer } from '@/types/layers';

function MyComponent() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const {
    handleLayerPositionUpdate,
    handleLayerSizeUpdate,
    visibleLayers
  } = useLayerOperations(layers, setLayers);

  const handleMoveLayer = (id: string) => {
    handleLayerPositionUpdate(id, 100, 200);
  };

  const handleResizeLayer = (id: string) => {
    handleLayerSizeUpdate(id, 300, 400);
  };

  return (
    <div>
      {visibleLayers.map(layer => (
        <div key={layer.id}>
          <button onClick={() => handleMoveLayer(layer.id)}>
            移動
          </button>
          <button onClick={() => handleResizeLayer(layer.id)}>
            リサイズ
          </button>
        </div>
      ))}
    </div>
  );
}
```

### モバイルコントロールの使用

```typescript
import { useState } from 'react';
import { MobileControls } from '@/components/shared/MobileControls';
import { Layer } from '@/types/layers';

function MobileEditor() {
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null);

  const handleUpdateLayer = (id: string, updates: Partial<Layer>) => {
    // レイヤー更新ロジック
    console.log('Layer updated:', id, updates);
  };

  return (
    <div>
      <MobileControls
        selectedLayer={selectedLayer}
        onUpdateLayer={handleUpdateLayer}
      />
    </div>
  );
}
```

### 表示設定の使用

```typescript
import { useState } from 'react';
import { MobileDisplaySettings } from '@/components/shared/MobileDisplaySettings';

function DisplaySettings() {
  const [zoom, setZoom] = useState(1.0);
  const [showGrid, setShowGrid] = useState(false);
  const [showGuides, setShowGuides] = useState(false);

  return (
    <div>
      <MobileDisplaySettings
        zoom={zoom}
        onZoomChange={setZoom}
        showGrid={showGrid}
        onShowGridChange={setShowGrid}
        showGuides={showGuides}
        onShowGuidesChange={setShowGuides}
      />
    </div>
  );
}
```

## テスト

### ユニットテスト

```typescript
import { renderHook, act } from '@testing-library/react';
import { useLayerOperations } from '@/hooks/shared/useLayerOperations';

test('should update layer position', () => {
  const setLayers = jest.fn();
  const { result } = renderHook(() => useLayerOperations(mockLayers, setLayers));

  act(() => {
    result.current.handleLayerPositionUpdate('1', 100, 200);
  });

  expect(setLayers).toHaveBeenCalledWith(expect.any(Function));
});
```

### E2Eテスト

```typescript
import { test, expect } from '@playwright/test';

test('should add text layer', async ({ page }) => {
  await page.goto('/tools/asset-creator');
  
  await page.click('text=テキスト');
  await page.fill('input[placeholder*="テキスト"]', 'テストテキスト');
  
  await expect(page.locator('text=テストテキスト')).toBeVisible();
});
```

## 注意事項

1. **パフォーマンス**: 大量のレイヤーを扱う場合は、メモ化を適切に使用してください。
2. **型安全性**: TypeScriptの型定義を活用して、型安全性を保ってください。
3. **エラーハンドリング**: レイヤー操作時は適切なエラーハンドリングを実装してください。
4. **アクセシビリティ**: モバイルコントロールはアクセシビリティを考慮して設計されています。

## 更新履歴

- v1.0.0 - 初回リリース
- v1.1.0 - モバイルコントロール追加
- v1.2.0 - 表示設定機能追加
- v1.3.0 - E2Eテスト追加
