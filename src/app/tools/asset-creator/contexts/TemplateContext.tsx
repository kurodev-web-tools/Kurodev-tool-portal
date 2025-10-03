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
export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow' | 'star';

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
    const maxZIndex = layers.reduce((max, l) => Math.max(max, l.zIndex), -1);
    const newLayer: Layer = { 
      ...layer, 
      id: uuidv4(), 
      rotation: 0, 
      zIndex: maxZIndex + 1 
    };
    setLayers((prevLayers) => [...prevLayers, newLayer]);
    setSelectedLayerId(newLayer.id);
  }, [layers]);

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
      // zIndexを再割り当て
      return newLayers.map((layer, index) => ({ ...layer, zIndex: index }));
    });
  }, []);

  const duplicateLayer = useCallback((id: string) => {
    const layerToDuplicate = layers.find((layer) => layer.id === id);
    if (!layerToDuplicate) return;

    const duplicatedLayer: Layer = {
      ...layerToDuplicate,
      id: uuidv4(),
      name: `${layerToDuplicate.name}のコピー`,
      x: layerToDuplicate.x + 20,
      y: layerToDuplicate.y + 20,
      zIndex: layers.length, // 必ず一番上にくるように
    };

    const index = layers.findIndex((layer) => layer.id === id);
    const newLayers = [...layers];
    newLayers.splice(index + 1, 0, duplicatedLayer);
    setLayers(newLayers.map((l, i) => ({ ...l, zIndex: i }))); // zIndex再割当て
  }, [layers]);

  const moveLayerUp = useCallback((id: string) => {
    const index = layers.findIndex((layer) => layer.id === id);
    if (index > 0) {
      reorderLayers(index, index - 1);
    }
  }, [layers, reorderLayers]);

  const moveLayerDown = useCallback((id: string) => {
    const index = layers.findIndex((layer) => layer.id === id);
    if (index < layers.length - 1 && index !== -1) {
      reorderLayers(index, index + 1);
    }
  }, [layers, reorderLayers]);

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
        zIndex: 0, // zIndexを明示的に設定
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
        zIndex: 1, // zIndexを明示的に設定
      });
    }

    setLayers(initialLayers);
    setSelectedLayerId(initialLayers.length > 1 ? initialLayers[1].id : initialLayers[0]?.id || null);

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