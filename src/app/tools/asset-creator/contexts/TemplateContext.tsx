import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Template } from '@/hooks/useTemplateManagement';
import { v4 as uuidv4 } from 'uuid';
import { Layer, LayerType, ShapeType } from '@/types/layers';

// ElementPositionTypeを定義
interface ElementPositionType {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 共通型を再エクスポート
export type { Layer, LayerType, ShapeType };

interface TemplateContextType {
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template | null) => void;
  currentText: string;
  setCurrentText: (text: string) => void;
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  addLayer: (layer: Omit<Layer, 'id' | 'rotation' | 'zIndex'>) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  reorderLayers: (startIndex: number, endIndex: number) => void;
  duplicateLayer: (id: string) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  customAspectRatio: { width: number; height: number };
  setCustomAspectRatio: (aspect: { width: number; height: number }) => void;
  restoreState: (layers: Layer[], selectedLayerId: string | null) => void;
}

const TemplateContext = createContext<TemplateContextType | null>(null);

// デフォルトテンプレート定義
const DEFAULT_TEMPLATE: Template = {
  id: 'default',
  name: 'デフォルト',
  genre: 'simple',
  initialText: 'テキスト',
  initialTextColor: '#000000',
  initialFontSize: '4rem',
  initialImageSrc: '',
  supportedAspectRatios: ['1:1', '4:3', '9:16', '16:9'],
};

export const TemplateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(DEFAULT_TEMPLATE);
  const [currentText, setCurrentText] = useState<string>(DEFAULT_TEMPLATE.initialText);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [customAspectRatio, setCustomAspectRatio] = useState({ width: 16, height: 9 });

  // 履歴復元機能
  const restoreState = useCallback((restoreLayers: Layer[], restoreSelectedLayerId: string | null) => {
    setLayers([...restoreLayers]);
    setSelectedLayerId(restoreSelectedLayerId);
  }, []);

  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const addLayer = useCallback((layer: Omit<Layer, 'id' | 'rotation' | 'zIndex'>) => {
    const newLayer = { 
      ...layer, 
      id: uuidv4(), 
      rotation: 0, 
      zIndex: 0, // 一時的に0に設定、後で配列順序に基づいて更新
    } as Layer;
    setLayers((prevLayers) => {
      const newLayers = [newLayer, ...prevLayers]; // 新しいレイヤーを一番上に追加
      // 配列順序に基づいてzIndexを更新（上が最前面になるように逆順）
      return newLayers.map((l, index) => ({ ...l, zIndex: newLayers.length - 1 - index }));
    });
    setSelectedLayerId(newLayer.id);
  }, []);

  const removeLayer = useCallback((id: string) => {
    setLayers((prevLayers) => prevLayers.filter((layer) => layer.id !== id));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  }, [selectedLayerId]);

  const updateLayer = useCallback((id: string, updates: Partial<Layer>) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) => (layer.id === id ? { ...layer, ...updates } as Layer : layer))
    );
  }, []);

  const reorderLayers = useCallback((startIndex: number, endIndex: number) => {
    setLayers((prevLayers) => {
      const newLayers = Array.from(prevLayers);
      const [removed] = newLayers.splice(startIndex, 1);
      newLayers.splice(endIndex, 0, removed);
      // 配列順序に基づいてzIndexを更新（上が最前面になるように逆順）
      return newLayers.map((l, index) => ({ ...l, zIndex: newLayers.length - 1 - index }));
    });
  }, []);

  const duplicateLayer = useCallback((id: string) => {
    setLayers((prevLayers) => {
      const layerToDuplicate = prevLayers.find((layer) => layer.id === id);
      if (!layerToDuplicate) {
        return prevLayers;
      }
      const duplicatedLayer = {
        ...layerToDuplicate,
        id: uuidv4(),
        name: `${layerToDuplicate.name}のコピー`,
        x: layerToDuplicate.x + 20,
        y: layerToDuplicate.y + 20,
      } as Layer;
      const index = prevLayers.findIndex((layer) => layer.id === id);
      const newLayers = [...prevLayers];
      newLayers.splice(index + 1, 0, duplicatedLayer);
      // 配列順序に基づいてzIndexを更新（上が最前面になるように逆順）
      return newLayers.map((l, index) => ({ ...l, zIndex: newLayers.length - 1 - index }));
    });
  }, []);

  const moveLayerUp = useCallback((id: string) => {
    setLayers((prevLayers) => {
      const index = prevLayers.findIndex((layer) => layer.id === id);
      if (index <= 0) return prevLayers;
      const newLayers = [...prevLayers];
      const [movedLayer] = newLayers.splice(index, 1);
      newLayers.splice(index - 1, 0, movedLayer);
      // 配列順序に基づいてzIndexを更新（上が最前面になるように逆順）
      return newLayers.map((l, index) => ({ ...l, zIndex: newLayers.length - 1 - index }));
    });
  }, []);

  const moveLayerDown = useCallback((id: string) => {
    setLayers((prevLayers) => {
      const index = prevLayers.findIndex((layer) => layer.id === id);
      if (index < 0 || index >= prevLayers.length - 1) return prevLayers;
      const newLayers = [...prevLayers];
      const [movedLayer] = newLayers.splice(index, 1);
      newLayers.splice(index + 1, 0, movedLayer);
      // 配列順序に基づいてzIndexを更新（上が最前面になるように逆順）
      return newLayers.map((l, index) => ({ ...l, zIndex: newLayers.length - 1 - index }));
    });
  }, []);

  useEffect(() => {
    const initialLayers: Layer[] = [];
    if (!selectedTemplate) {
      setLayers([]);
      setSelectedLayerId(null);
      return;
    }

    if (selectedTemplate.initialImageSrc) {
      // 背景画像は親要素の100%サイズで表示
      // ThumbnailImageコンポーネントがisBackgroundフラグを検知して、
      // 親コンテナのサイズに自動的にフィットするようになっている
      const imageLayer: any = {
        id: 'background-image',
        type: 'image',
        name: '背景画像',
        visible: true,
        locked: false,
        x: 0,
        y: 0,
        width: 1920, // 実際の表示はThumbnailImageコンポーネントで100%に調整
        height: 1080,
        rotation: 0,
        src: selectedTemplate.initialImageSrc,
        zIndex: 0,
        isBackground: true, // 背景画像フラグ
      };
      
      initialLayers.push(imageLayer as Layer);
    }

    if (selectedTemplate.initialText) {
      initialLayers.push({
        id: uuidv4(),
        type: 'text',
        name: 'テキスト',
        visible: true,
        locked: false,
        x: selectedTemplate.initialTextPosition?.x || 50,
        y: selectedTemplate.initialTextPosition?.y || 50,
        width: selectedTemplate.initialTextPosition?.width || 300,
        height: selectedTemplate.initialTextPosition?.height || 100,
        rotation: 0,
        text: selectedTemplate.initialText,
        color: selectedTemplate.initialTextColor,
        fontSize: selectedTemplate.initialFontSize,
        zIndex: 0, // 一時的に0、後で再計算
      } as Layer);
    }

    // 配列順序に基づいてzIndexを更新（上が最前面になるように逆順）
    // テキストが先に追加されるように配列を逆にしてからzIndexを設定
    const layersWithZIndex = initialLayers.reverse().map((l, index) => ({ 
      ...l, 
      zIndex: initialLayers.length - 1 - index 
    } as Layer));
    
    setLayers(layersWithZIndex);
    setSelectedLayerId(layersWithZIndex.length > 0 ? layersWithZIndex[0]?.id || null : null);

  }, [selectedTemplate, aspectRatio, customAspectRatio]);

  const contextValue = useMemo(() => ({
    selectedTemplate,
    setSelectedTemplate,
    currentText,
    setCurrentText,
    layers,
    setLayers,
    addLayer,
    removeLayer,
    updateLayer,
    selectedLayerId,
    setSelectedLayerId,
    reorderLayers,
    duplicateLayer,
    moveLayerUp,
    moveLayerDown,
    aspectRatio,
    setAspectRatio,
    customAspectRatio,
    setCustomAspectRatio,
    restoreState,
  }), [
    selectedTemplate,
    currentText,
    layers,
    selectedLayerId,
    addLayer,
    removeLayer,
    updateLayer,
    reorderLayers,
    duplicateLayer,
    moveLayerUp,
    moveLayerDown,
    aspectRatio,
    customAspectRatio,
    restoreState,
  ]);

  return (
    <TemplateContext.Provider value={contextValue}>
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplate = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
};