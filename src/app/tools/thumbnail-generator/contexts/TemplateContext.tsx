import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThumbnailTemplate, templates } from '../components/TemplateSelector';
import { v4 as uuidv4 } from 'uuid';

// ElementPositionTypeを定義
interface ElementPositionType {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type LayerType = 'image' | 'text' | 'shape';
export type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow';

export interface Layer {
  id: string;
  type: LayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
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
  selectedTemplate: ThumbnailTemplate;
  setSelectedTemplate: (template: ThumbnailTemplate) => void;
  currentText: string;
  setCurrentText: (text: string) => void;
  currentTextColor: string;
  setCurrentTextColor: (color: string) => void;
  currentFontSize: string;
  setCurrentFontSize: (fontSize: string) => void;
  backgroundImageSrc: string | null;
  setBackgroundImageSrc: (src: string | null) => void;
  backgroundImagePosition: ElementPositionType;
  setBackgroundImagePosition: React.Dispatch<React.SetStateAction<ElementPositionType>>;
  characterImagePosition: ElementPositionType;
  setCharacterImagePosition: React.Dispatch<React.SetStateAction<ElementPositionType>>;
  textPosition: ElementPositionType;
  setTextPosition: React.Dispatch<React.SetStateAction<ElementPositionType>>;
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  addLayer: (layer: Omit<Layer, 'id' | 'rotation'>) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  reorderLayers: (startIndex: number, endIndex: number) => void;
  duplicateLayer: (id: string) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
}

const TemplateContext = createContext<TemplateContextType>({
  selectedTemplate: templates[0],
  setSelectedTemplate: () => {},
  currentText: templates[0].initialText,
  setCurrentText: () => {},
  currentTextColor: templates[0].initialTextColor,
  setCurrentTextColor: () => {},
  currentFontSize: templates[0].initialFontSize,
  setCurrentFontSize: () => {},
  backgroundImageSrc: templates[0].initialImageSrc || null,
  setBackgroundImageSrc: () => {},
  backgroundImagePosition: { x: 0, y: 0, width: 1200, height: 675 },
  setBackgroundImagePosition: () => {},
  characterImagePosition: { x: 700, y: 175, width: 500, height: 500 },
  setCharacterImagePosition: () => {},
  textPosition: { x: 0, y: 0, width: 300, height: 100 }, // 仮の初期値
  setTextPosition: () => {},
  layers: [],
  setLayers: () => {},
  addLayer: () => {},
  removeLayer: () => {},
  updateLayer: () => {},
  selectedLayerId: null,
  setSelectedLayerId: () => {},
  reorderLayers: () => {},
  duplicateLayer: () => {},
  moveLayerUp: () => {},
  moveLayerDown: () => {},
});

export const TemplateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ThumbnailTemplate>(templates[0]);
  const [currentText, setCurrentText] = useState<string>(templates[0].initialText);
  const [currentTextColor, setCurrentTextColor] = useState<string>(templates[0].initialTextColor);
  const [currentFontSize, setCurrentFontSize] = useState<string>(templates[0].initialFontSize);
  const [backgroundImageSrc, setBackgroundImageSrc] = useState<string | null>(templates[0].initialImageSrc || null);
  const [backgroundImagePosition, setBackgroundImagePosition] = useState<ElementPositionType>({ x: 0, y: 0, width: 1200, height: 675 });
  const [characterImagePosition, setCharacterImagePosition] = useState<ElementPositionType>({ x: 700, y: 175, width: 500, height: 500 });
  const [textPosition, setTextPosition] = useState<ElementPositionType>({ x: 0, y: 0, width: 300, height: 100 });

  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const addLayer = (layer: Omit<Layer, 'id' | 'rotation'>) => {
    const newLayer: Layer = { ...layer, id: uuidv4(), rotation: 0 };
    setLayers((prevLayers) => [newLayer, ...prevLayers]); // 新しいレイヤーを一番上に追加
    setSelectedLayerId(newLayer.id);
  };

  const removeLayer = (id: string) => {
    setLayers((prevLayers) => prevLayers.filter((layer) => layer.id !== id));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer))
    );
  };

  const reorderLayers = (startIndex: number, endIndex: number) => {
    setLayers((prevLayers) => {
      const newLayers = Array.from(prevLayers);
      const [removed] = newLayers.splice(startIndex, 1);
      newLayers.splice(endIndex, 0, removed);
      return newLayers;
    });
  };

  const duplicateLayer = (id: string) => {
    setLayers((prevLayers) => {
      const layerToDuplicate = prevLayers.find((layer) => layer.id === id);
      if (!layerToDuplicate) {
        return prevLayers;
      }
      const duplicatedLayer: Layer = {
        ...layerToDuplicate,
        id: uuidv4(),
        name: `${layerToDuplicate.name}のコピー`,
      };
      const index = prevLayers.findIndex((layer) => layer.id === id);
      const newLayers = [...prevLayers];
      newLayers.splice(index + 1, 0, duplicatedLayer);
      return newLayers;
    });
  };

  const moveLayerUp = (id: string) => {
    setLayers((prevLayers) => {
      const index = prevLayers.findIndex((layer) => layer.id === id);
      if (index <= 0) return prevLayers;
      const newLayers = [...prevLayers];
      const [movedLayer] = newLayers.splice(index, 1);
      newLayers.splice(index - 1, 0, movedLayer);
      return newLayers;
    });
  };

  const moveLayerDown = (id: string) => {
    setLayers((prevLayers) => {
      const index = prevLayers.findIndex((layer) => layer.id === id);
      if (index < 0 || index >= prevLayers.length - 1) return prevLayers;
      const newLayers = [...prevLayers];
      const [movedLayer] = newLayers.splice(index, 1);
      newLayers.splice(index + 1, 0, movedLayer);
      return newLayers;
    });
  };

  useEffect(() => {
    setCurrentText(selectedTemplate.initialText);
    setCurrentTextColor(selectedTemplate.initialTextColor);
    setCurrentFontSize(selectedTemplate.initialFontSize);
    setBackgroundImageSrc(selectedTemplate.initialImageSrc || null);
    setBackgroundImagePosition(selectedTemplate.initialBackgroundImagePosition || { x: 0, y: 0, width: 1200, height: 675 });
    setCharacterImagePosition(selectedTemplate.initialCharacterImagePosition || { x: 700, y: 175, width: 500, height: 500 });
    setTextPosition(selectedTemplate.initialTextPosition || { x: 0, y: 0, width: 300, height: 100 });

    // テンプレート変更時に既存のレイヤーをクリアし、テンプレートの初期要素をレイヤーとして追加
    const initialLayers: Layer[] = [];
    if (selectedTemplate.initialImageSrc) {
      initialLayers.push({
        id: uuidv4(),
        type: 'image',
        name: '背景画像',
        visible: true,
        locked: false,
        x: 0,
        y: 0,
        width: 1200,
        height: 675,
        rotation: 0,
        src: selectedTemplate.initialImageSrc,
      });
    }
    if (selectedTemplate.initialText) {
      initialLayers.push({
        id: uuidv4(),
        type: 'text',
        name: 'テキスト',
        visible: true,
        locked: false,
        x: selectedTemplate.initialTextPosition?.x || 0,
        y: selectedTemplate.initialTextPosition?.y || 0,
        width: selectedTemplate.initialTextPosition?.width || 300,
        height: selectedTemplate.initialTextPosition?.height || 100,
        rotation: 0,
        text: selectedTemplate.initialText,
        color: selectedTemplate.initialTextColor,
        fontSize: selectedTemplate.initialFontSize,
      });
    }
    setLayers(initialLayers);
    setSelectedLayerId(initialLayers.length > 0 ? initialLayers[0].id : null); // 最初のレイヤーを選択状態にする

  }, [selectedTemplate]);

  return (
    <TemplateContext.Provider
      value={{
        selectedTemplate,
        setSelectedTemplate,
        currentText,
        setCurrentText,
        currentTextColor,
        setCurrentTextColor,
        currentFontSize,
        setCurrentFontSize,
        backgroundImageSrc,
        setBackgroundImageSrc,
        backgroundImagePosition,
        setBackgroundImagePosition,
        characterImagePosition,
        setCharacterImagePosition,
        textPosition,
        setTextPosition,
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
      }}
    >
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