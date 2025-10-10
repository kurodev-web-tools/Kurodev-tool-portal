import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { ThumbnailTemplate } from '../components/TemplateSelector';
import { loadTemplates } from '@/lib/templateLoader';
import { v4 as uuidv4 } from 'uuid';

// ElementPositionTypeを定義
interface ElementPositionType {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type LayerType = 'image' | 'text' | 'shape';
export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow' | 'star' | 'polygon' | 'heart' | 'diamond';

export interface Layer {
  id: string;
  type: LayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  width: number | string; // string型を追加して'100%'などを許容
  height: number | string;
  rotation: number;
  zIndex: number; // zIndexプロパティを追加
  opacity?: number; // 不透明度プロパティを追加
  isBackground?: boolean; // 背景画像フラグを追加
  // Type-specific properties
  src?: string | null;
  text?: string;
  color?: string;
  fontSize?: string;
  fontFamily?: string; // Google Fonts対応
  fontWeight?: string; // フォントウェイト (100, 200...900, normal, bold, lighter)
  fontStyle?: string; // フォントスタイル (normal, italic, oblique)
  textDecoration?: string; // 文字装飾 (none, underline, line-through, overline)
  textShadow?: string; // 文字シャドウ (例: "2px 2px 4px rgba(0,0,0,0.5)")
  shapeType?: ShapeType;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

interface TemplateContextType {
  selectedTemplate: ThumbnailTemplate | null;
  setSelectedTemplate: (template: ThumbnailTemplate | null) => void;
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
}

const TemplateContext = createContext<TemplateContextType | null>(null);

export const TemplateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ThumbnailTemplate | null>(null);
  const [currentText, setCurrentText] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [customAspectRatio, setCustomAspectRatio] = useState({ width: 16, height: 9 });

  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // 初期テンプレートのロード
  useEffect(() => {
    const load = async () => {
      const templates = await loadTemplates();
      if (templates.length > 0) {
        setSelectedTemplate(templates[0]);
        setCurrentText(templates[0].initialText);
      }
    };
    load();
  }, []);

  const addLayer = useCallback((layer: Omit<Layer, 'id' | 'rotation' | 'zIndex'>) => {
    const newLayer: Layer = { 
      ...layer, 
      id: uuidv4(), 
      rotation: 0, 
      zIndex: 0, // 一時的に0に設定、後で配列順序に基づいて更新
    };
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
      prevLayers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer))
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
      const duplicatedLayer: Layer = {
        ...layerToDuplicate,
        id: uuidv4(),
        name: `${layerToDuplicate.name}のコピー`,
        x: layerToDuplicate.x + 20,
        y: layerToDuplicate.y + 20,
      };
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
      initialLayers.push({
        id: 'background-image', // 固定IDに変更
        type: 'image',
        name: '背景画像',
        visible: true,
        locked: false,
        x: 0,
        y: 0,
        width: '100%', // 100%に変更
        height: '100%', // 100%に変更
        rotation: 0,
        src: selectedTemplate.initialImageSrc,
        zIndex: 0, // 一時的に0、後で再計算
        isBackground: true, // 背景フラグを設定
      });
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
      });
    }

    // 配列順序に基づいてzIndexを更新（上が最前面になるように逆順）
    // テキストが先に追加されるように配列を逆にしてからzIndexを設定
    const layersWithZIndex = initialLayers.reverse().map((l, index) => ({ 
      ...l, 
      zIndex: initialLayers.length - 1 - index 
    }));
    
    setLayers(layersWithZIndex);
    setSelectedLayerId(layersWithZIndex.length > 0 ? layersWithZIndex[0]?.id || null : null);

  }, [selectedTemplate]);

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