import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThumbnailTemplate, ObjectPosition, ColorPalette, FontSettings } from '@/types/template';
import { templates } from '@/data/template-definitions';
import { v4 as uuidv4 } from 'uuid';
import { useMediaQuery } from '@/hooks/use-media-query';
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
  // 新しいテンプレート機能
  currentColorPalette: ColorPalette;
  setCurrentColorPalette: (palette: ColorPalette) => void;
  currentFontSettings: FontSettings;
  setCurrentFontSettings: (settings: FontSettings) => void;
  applyTemplate: (template: ThumbnailTemplate) => void;
  resetToTemplate: () => void;
  createTemplateFromCurrentLayers: (templateData: Partial<ThumbnailTemplate>) => ThumbnailTemplate;
}

const TemplateContext = createContext<TemplateContextType>({
  selectedTemplate: templates[0],
  setSelectedTemplate: () => {},
  currentText: templates[0].initialText || 'テキストを入力',
  setCurrentText: () => {},
  currentTextColor: templates[0].initialTextColor || '#000000',
  setCurrentTextColor: () => {},
  currentFontSize: templates[0].initialFontSize || '4rem',
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
  aspectRatio: '16:9',
  setAspectRatio: () => {},
  customAspectRatio: { width: 16, height: 9 },
  setCustomAspectRatio: () => {},
  restoreState: () => {},
  // 新しいテンプレート機能
  currentColorPalette: templates[0].colorPalette,
  setCurrentColorPalette: () => {},
  currentFontSettings: templates[0].fontSettings,
  setCurrentFontSettings: () => {},
  applyTemplate: () => {},
  resetToTemplate: () => {},
  createTemplateFromCurrentLayers: () => ({} as ThumbnailTemplate),
});

export const TemplateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // レスポンシブ対応
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
  const [selectedTemplate, setSelectedTemplate] = useState<ThumbnailTemplate>(templates[0]);
  const [currentText, setCurrentText] = useState<string>(templates[0].initialText || 'テキストを入力');
  const [currentTextColor, setCurrentTextColor] = useState<string>(templates[0].initialTextColor || '#000000');
  const [currentFontSize, setCurrentFontSize] = useState<string>(templates[0].initialFontSize || '4rem');
  const [backgroundImageSrc, setBackgroundImageSrc] = useState<string | null>(templates[0].initialImageSrc || null);
  const [backgroundImagePosition, setBackgroundImagePosition] = useState<ElementPositionType>({ x: 0, y: 0, width: 1200, height: 675 });
  const [characterImagePosition, setCharacterImagePosition] = useState<ElementPositionType>({ x: 700, y: 175, width: 500, height: 500 });
  const [textPosition, setTextPosition] = useState<ElementPositionType>({ x: 0, y: 0, width: 300, height: 100 });

  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [customAspectRatio, setCustomAspectRatio] = useState({ width: 16, height: 9 });
  
  // 履歴復元機能
  const restoreState = (restoreLayers: Layer[], restoreSelectedLayerId: string | null) => {
    setLayers([...restoreLayers]);
    setSelectedLayerId(restoreSelectedLayerId);
  };
  
  // 新しいテンプレート機能の状態
  const [currentColorPalette, setCurrentColorPalette] = useState<ColorPalette>(templates[0].colorPalette);
  const [currentFontSettings, setCurrentFontSettings] = useState<FontSettings>(templates[0].fontSettings);

  const addLayer = (layer: Omit<Layer, 'id' | 'rotation' | 'zIndex'>) => {
    const newLayer = { 
      ...layer, 
      id: uuidv4(), 
      rotation: 0, 
      zIndex: 0, // 一時的に0に設定、後で配列順序に基づいて更新
      // テキストレイヤーの場合、明示的にフォント設定が指定されていない場合のみデフォルトフォントを適用
      // テンプレートから追加される場合は既にフォント設定が含まれているため、そのまま使用
      ...(layer.type === 'text' && !('fontFamily' in layer && layer.fontFamily) && {
        fontFamily: 'Arial, sans-serif', // デフォルトフォント
        fontSize: ('fontSize' in layer && layer.fontSize) || '2rem',
        fontWeight: ('fontWeight' in layer && layer.fontWeight) || 'normal',
        fontStyle: ('fontStyle' in layer && layer.fontStyle) || 'normal',
        textDecoration: ('textDecoration' in layer && layer.textDecoration) || 'none',
        textShadow: ('textShadow' in layer && layer.textShadow) || 'none',
      })
    } as Layer;
    setLayers((prevLayers) => {
      const newLayers = [newLayer, ...prevLayers]; // 新しいレイヤーを一番上に追加
      // 配列順序に基づいてzIndexを更新（上が最前面になるように逆順）
      return newLayers.map((l, index) => ({ ...l, zIndex: newLayers.length - 1 - index }));
    });
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
      prevLayers.map((layer) => (layer.id === id ? { ...layer, ...updates } as Layer : layer))
    );
  };

  const reorderLayers = (startIndex: number, endIndex: number) => {
    setLayers((prevLayers) => {
      const newLayers = Array.from(prevLayers);
      const [removed] = newLayers.splice(startIndex, 1);
      newLayers.splice(endIndex, 0, removed);
      // 配列順序に基づいてzIndexを更新（上が最前面になるように逆順）
      return newLayers.map((l, index) => ({ ...l, zIndex: newLayers.length - 1 - index }));
    });
  };

  const duplicateLayer = (id: string) => {
    setLayers((prevLayers) => {
      const layerToDuplicate = prevLayers.find((layer) => layer.id === id);
      if (!layerToDuplicate) {
        return prevLayers;
      }
      const duplicatedLayer = {
        ...layerToDuplicate,
        id: uuidv4(),
        name: `${layerToDuplicate.name}のコピー`,
      } as Layer;
      const index = prevLayers.findIndex((layer) => layer.id === id);
      const newLayers = [...prevLayers];
      newLayers.splice(index + 1, 0, duplicatedLayer);
      // 配列順序に基づいてzIndexを更新（上が最前面になるように逆順）
      return newLayers.map((l, index) => ({ ...l, zIndex: newLayers.length - 1 - index }));
    });
  };

  const moveLayerUp = (id: string) => {
    setLayers((prevLayers) => {
      const index = prevLayers.findIndex((layer) => layer.id === id);
      if (index <= 0) return prevLayers;
      const newLayers = [...prevLayers];
      const [movedLayer] = newLayers.splice(index, 1);
      newLayers.splice(index - 1, 0, movedLayer);
      // 配列順序に基づいてzIndexを更新（上が最前面になるように逆順）
      return newLayers.map((l, index) => ({ ...l, zIndex: newLayers.length - 1 - index }));
    });
  };

  const moveLayerDown = (id: string) => {
    setLayers((prevLayers) => {
      const index = prevLayers.findIndex((layer) => layer.id === id);
      if (index < 0 || index >= prevLayers.length - 1) return prevLayers;
      const newLayers = [...prevLayers];
      const [movedLayer] = newLayers.splice(index, 1);
      newLayers.splice(index + 1, 0, movedLayer);
      // 配列順序に基づいてzIndexを更新（上が最前面になるように逆順）
      return newLayers.map((l, index) => ({ ...l, zIndex: newLayers.length - 1 - index }));
    });
  };

  // 新しいテンプレート機能
  const applyTemplate = (template: ThumbnailTemplate) => {
    setSelectedTemplate(template);
    setCurrentColorPalette(template.colorPalette);
    setCurrentFontSettings(template.fontSettings);
    
    // テンプレートのオブジェクトをレイヤーに変換
    const templateLayers: Layer[] = template.layout.objects.map((obj, index) => {
      const baseLayer = {
        id: uuidv4(),
        name: obj.type === 'text' ? 'テキスト' : obj.type === 'image' ? '画像' : '図形',
        visible: obj.visible,
        locked: obj.locked || false,
        x: obj.position.x,
        y: obj.position.y,
        width: obj.position.width,
        height: obj.position.height,
        rotation: obj.position.rotation || 0,
        zIndex: obj.zIndex,
        opacity: obj.position.opacity || 1,
      };

      // タイプ別のプロパティ設定
      if (obj.type === 'text' && obj.content) {
        return {
          ...baseLayer,
          type: 'text' as const,
          text: obj.content.text || '',
          color: obj.content.color || template.colorPalette.text,
          fontSize: obj.content.fontSize || template.fontSettings.size,
        } as Layer;
      } else if (obj.type === 'image' && obj.content) {
        return {
          ...baseLayer,
          type: 'image' as const,
          src: obj.content.imageSrc || null,
        } as Layer;
      } else if (obj.type === 'shape' && obj.content) {
        return {
          ...baseLayer,
          type: 'shape' as const,
          shapeType: (obj.content.shapeType as ShapeType) || 'rectangle',
          backgroundColor: obj.content.backgroundColor || template.colorPalette.primary,
          borderColor: obj.content.borderColor || template.colorPalette.accent,
          borderWidth: obj.content.borderWidth || 0,
        } as Layer;
      }

      // フォールバック（通常は到達しない）
      return {
        ...baseLayer,
        type: 'text' as const,
        text: '',
        color: '#000000',
        fontSize: '2rem',
      } as Layer;
    });

    setLayers(templateLayers);
    setSelectedLayerId(templateLayers.length > 0 ? templateLayers[0].id : null);
  };

  const resetToTemplate = () => {
    applyTemplate(selectedTemplate);
  };

  // 現在のレイヤーからテンプレートを作成
  const createTemplateFromCurrentLayers = (templateData: Partial<ThumbnailTemplate>): ThumbnailTemplate => {
    // レイヤーをオブジェクトに変換
    const objects = layers.map((layer, index) => ({
      id: layer.id,
      type: layer.type,
      position: {
        x: layer.x,
        y: layer.y,
        width: typeof layer.width === 'number' ? layer.width : parseInt(String(layer.width)),
        height: typeof layer.height === 'number' ? layer.height : parseInt(String(layer.height)),
        rotation: layer.rotation,
        opacity: layer.opacity || 1,
      },
      content: layer.type === 'text' ? {
        text: layer.text || '',
        fontSize: layer.fontSize || currentFontSettings.size,
        fontFamily: layer.fontFamily || currentFontSettings.family,
        color: layer.color || currentColorPalette.text,
      } : layer.type === 'image' ? {
        imageSrc: layer.src || '',
      } : layer.type === 'shape' ? {
        shapeType: layer.shapeType || 'rectangle',
        backgroundColor: layer.backgroundColor || currentColorPalette.primary,
        borderColor: layer.borderColor || currentColorPalette.accent,
        borderWidth: layer.borderWidth || 0,
      } : {},
      zIndex: layer.zIndex,
      visible: layer.visible,
      locked: layer.locked,
    }));

    const newTemplate: ThumbnailTemplate = {
      id: `template-${Date.now()}`,
      name: templateData.name || '新しいテンプレート',
      description: templateData.description || '',
      category: templateData.category || 'custom',
      style: templateData.style || 'simple',
      rating: 0,
      preview: '', // 後で生成
      supportedAspectRatios: [aspectRatio],
      layout: {
        background: {
          type: 'color',
          value: currentColorPalette.background,
        },
        objects,
      },
      colorPalette: currentColorPalette,
      fontSettings: currentFontSettings,
      settings: {
        defaultFontSize: currentFontSettings.size,
        defaultFontFamily: currentFontSettings.family,
        defaultTextColor: currentColorPalette.text,
        defaultBackgroundColor: currentColorPalette.background,
        maxObjects: 10,
        minObjectSize: 20,
        maxObjectSize: 800,
        allowAnimation: false,
        allowEffects: false,
        allowVideo: false,
        allowGif: false,
        exportFormats: ['png', 'jpg'],
        defaultExportFormat: 'png',
        exportQuality: 'high',
      },
      metadata: {
        version: '1.0.0',
        author: 'User',
        tags: templateData.metadata?.tags || [],
        difficulty: templateData.metadata?.difficulty || 'beginner',
        estimatedTime: 5,
        lastModified: new Date().toISOString(),
        usage: { views: 0, downloads: 0, favorites: 0 },
      },
      isCustom: true,
      createdAt: new Date().toISOString(),
      ...templateData,
    };

    return newTemplate;
  };

  useEffect(() => {
    // レガシーサポート（既存テンプレートとの互換性）
    setCurrentText(selectedTemplate.initialText || 'テキストを入力');
    setCurrentTextColor(selectedTemplate.initialTextColor || '#000000');
    setCurrentFontSize(selectedTemplate.initialFontSize || '4rem');
    setBackgroundImageSrc(selectedTemplate.initialImageSrc || null);
    setBackgroundImagePosition(selectedTemplate.initialBackgroundImagePosition || { x: 0, y: 0, width: 1200, height: 675 });
    setCharacterImagePosition(selectedTemplate.initialCharacterImagePosition || { x: 700, y: 175, width: 500, height: 500 });
    setTextPosition(selectedTemplate.initialTextPosition || { x: 0, y: 0, width: 300, height: 100 });

    // 新しいテンプレート機能の適用
    setCurrentColorPalette(selectedTemplate.colorPalette);
    setCurrentFontSettings(selectedTemplate.fontSettings);

    // テンプレートのオブジェクトをレイヤーに変換
    const templateLayers: Layer[] = selectedTemplate.layout.objects.map((obj) => {
      const baseLayer = {
        id: uuidv4(),
        type: obj.type === 'text' ? 'text' : obj.type === 'image' ? 'image' : 'shape',
        name: obj.type === 'text' ? 'テキスト' : obj.type === 'image' ? '画像' : '図形',
        visible: obj.visible,
        locked: obj.locked || false,
        x: obj.position.x,
        y: obj.position.y,
        width: obj.position.width,
        height: obj.position.height,
        rotation: obj.position.rotation || 0,
        zIndex: obj.zIndex,
        opacity: obj.position.opacity || 1,
      };

      // タイプ別のプロパティ設定
      if (obj.type === 'text' && obj.content) {
        return {
          ...baseLayer,
          type: 'text' as const,
          text: obj.content.text || '',
          color: obj.content.color || selectedTemplate.colorPalette.text,
          fontSize: obj.content.fontSize || selectedTemplate.fontSettings.size,
          fontFamily: obj.content.fontFamily || selectedTemplate.fontSettings.family,
          fontWeight: selectedTemplate.fontSettings.weight,
          fontStyle: selectedTemplate.fontSettings.style,
          textDecoration: selectedTemplate.fontSettings.textDecoration,
          textShadow: selectedTemplate.fontSettings.textShadow,
        } as Layer;
      } else if (obj.type === 'image' && obj.content) {
        return {
          ...baseLayer,
          type: 'image' as const,
          src: obj.content.imageSrc || null,
        } as Layer;
      } else if (obj.type === 'shape' && obj.content) {
        return {
          ...baseLayer,
          type: 'shape' as const,
          shapeType: (obj.content.shapeType as ShapeType) || 'rectangle',
          backgroundColor: obj.content.backgroundColor || selectedTemplate.colorPalette.primary,
          borderColor: obj.content.borderColor || selectedTemplate.colorPalette.accent,
          borderWidth: obj.content.borderWidth || 0,
        } as Layer;
      }

      // フォールバック
      return {
        ...baseLayer,
        type: 'text' as const,
        text: '',
        color: '#000000',
        fontSize: '2rem',
      } as Layer;
    });

    // レガシーサポート：オブジェクトが空の場合は既存のロジックを使用
    if (templateLayers.length === 0) {
      const initialLayers: Layer[] = [];
      
      // テキストレイヤーを最初に追加（最前面）
      if (selectedTemplate.initialText) {
        const initialX = isDesktop ? (selectedTemplate.initialTextPosition?.x || 550) : 50;
        const initialY = isDesktop ? (selectedTemplate.initialTextPosition?.y || 250) : 50;
        const initialWidth = isDesktop ? (selectedTemplate.initialTextPosition?.width || 300) : 150;
        const initialHeight = isDesktop ? (selectedTemplate.initialTextPosition?.height || 100) : 50;
        const initialFontSize = isDesktop ? selectedTemplate.initialFontSize : '1rem';
        
        initialLayers.push({
          id: uuidv4(),
          type: 'text',
          name: 'テキスト',
          visible: true,
          locked: false,
          x: initialX,
          y: initialY,
          width: initialWidth,
          height: initialHeight,
          rotation: 0,
          zIndex: 1000,
          text: selectedTemplate.initialText,
          color: selectedTemplate.initialTextColor,
          fontSize: initialFontSize,
          fontFamily: selectedTemplate.fontSettings.family,
          fontWeight: selectedTemplate.fontSettings.weight,
          fontStyle: selectedTemplate.fontSettings.style,
          textDecoration: selectedTemplate.fontSettings.textDecoration,
          textShadow: selectedTemplate.fontSettings.textShadow,
        } as Layer);
      }
      
      // 背景画像（中間層）
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
          zIndex: 500,
          src: selectedTemplate.initialImageSrc,
        } as Layer);
      }
      
      // 配列順序に基づいてzIndexを更新（上が最前面になるように逆順）
      const updatedInitialLayers = initialLayers.map((l, index) => ({ ...l, zIndex: initialLayers.length - 1 - index } as Layer));
      setLayers(updatedInitialLayers);
      setSelectedLayerId(updatedInitialLayers.length > 0 ? updatedInitialLayers[0].id : null);
    } else {
      // 配列順序に基づいてzIndexを更新（上が最前面になるように逆順）
      const updatedTemplateLayers = templateLayers.map((l, index) => ({ ...l, zIndex: templateLayers.length - 1 - index } as Layer));
      setLayers(updatedTemplateLayers);
      setSelectedLayerId(updatedTemplateLayers.length > 0 ? updatedTemplateLayers[0].id : null);
    }

  }, [selectedTemplate, isDesktop]);

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
        aspectRatio,
        setAspectRatio,
        customAspectRatio,
        setCustomAspectRatio,
        restoreState,
        // 新しいテンプレート機能
        currentColorPalette,
        setCurrentColorPalette,
        currentFontSettings,
        setCurrentFontSettings,
        applyTemplate,
        resetToTemplate,
        createTemplateFromCurrentLayers,
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