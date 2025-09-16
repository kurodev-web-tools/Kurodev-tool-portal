import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThumbnailTemplate, templates } from '../components/TemplateSelector';

// ElementPositionTypeを定義
interface ElementPositionType {
  x: number;
  y: number;
  width: number;
  height: number;
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
  characterImageSrc: string | null;
  setCharacterImageSrc: (src: string | null) => void;
  backgroundImagePosition: ElementPositionType;
  setBackgroundImagePosition: (position: ElementPositionType) => void;
  characterImagePosition: ElementPositionType;
  setCharacterImagePosition: (position: ElementPositionType) => void;
  // 新しく追加する状態
  textPosition: ElementPositionType;
  setTextPosition: (position: ElementPositionType) => void;
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
  characterImageSrc: null,
  setCharacterImageSrc: () => {},
  backgroundImagePosition: { x: 0, y: 0, width: 1200, height: 675 },
  setBackgroundImagePosition: () => {},
  characterImagePosition: { x: 700, y: 175, width: 500, height: 500 },
  setCharacterImagePosition: () => {},
  // 新しく追加する状態の初期値
  textPosition: { x: 0, y: 0, width: 300, height: 100 }, // 仮の初期値
  setTextPosition: () => {},
});

export const TemplateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ThumbnailTemplate>(templates[0]);
  const [currentText, setCurrentText] = useState<string>(templates[0].initialText);
  const [currentTextColor, setCurrentTextColor] = useState<string>(templates[0].initialTextColor);
  const [currentFontSize, setCurrentFontSize] = useState<string>(templates[0].initialFontSize);
  const [backgroundImageSrc, setBackgroundImageSrc] = useState<string | null>(templates[0].initialImageSrc || null);
  const [characterImageSrc, setCharacterImageSrc] = useState<string | null>(null);
  const [backgroundImagePosition, setBackgroundImagePosition] = useState<ElementPositionType>({ x: 0, y: 0, width: 1200, height: 675 });
  const [characterImagePosition, setCharacterImagePosition] = useState<ElementPositionType>({ x: 700, y: 175, width: 500, height: 500 });
  // 新しく追加する状態
  const [textPosition, setTextPosition] = useState<ElementPositionType>({ x: 0, y: 0, width: 300, height: 100 });

  useEffect(() => {
    setCurrentText(selectedTemplate.initialText);
    setCurrentTextColor(selectedTemplate.initialTextColor);
    setCurrentFontSize(selectedTemplate.initialFontSize);
    setBackgroundImageSrc(selectedTemplate.initialImageSrc || null);
    setCharacterImageSrc(null);
    setBackgroundImagePosition(selectedTemplate.initialBackgroundImagePosition || { x: 0, y: 0, width: 1200, height: 675 });
    setCharacterImagePosition(selectedTemplate.initialCharacterImagePosition || { x: 700, y: 175, width: 500, height: 500 });
    // テンプレートが変更されたときに、テキストの位置とサイズもリセット
    setTextPosition(selectedTemplate.initialTextPosition || { x: 0, y: 0, width: 300, height: 100 });
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
        characterImageSrc,
        setCharacterImageSrc,
        backgroundImagePosition,
        setBackgroundImagePosition,
        characterImagePosition,
        setCharacterImagePosition,
        // 新しく追加した状態をvalueに追加
        textPosition,
        setTextPosition,
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