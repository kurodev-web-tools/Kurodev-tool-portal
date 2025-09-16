import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThumbnailTemplate, templates } from '../components/TemplateSelector';

// ImagePositionTypeを定義
interface ImagePositionType {
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
  // 新しく追加する状態
  backgroundImagePosition: ImagePositionType;
  setBackgroundImagePosition: (position: ImagePositionType) => void;
  characterImagePosition: ImagePositionType;
  setCharacterImagePosition: (position: ImagePositionType) => void;
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
  // 新しく追加する状態の初期値
  backgroundImagePosition: { x: 0, y: 0, width: 1200, height: 675 }, // 仮の初期値
  setBackgroundImagePosition: () => {},
  characterImagePosition: { x: 0, y: 0, width: 500, height: 500 }, // 仮の初期値
  setCharacterImagePosition: () => {},
});

export const TemplateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ThumbnailTemplate>(templates[0]);
  const [currentText, setCurrentText] = useState<string>(templates[0].initialText);
  const [currentTextColor, setCurrentTextColor] = useState<string>(templates[0].initialTextColor);
  const [currentFontSize, setCurrentFontSize] = useState<string>(templates[0].initialFontSize);
  const [backgroundImageSrc, setBackgroundImageSrc] = useState<string | null>(templates[0].initialImageSrc || null);
  const [characterImageSrc, setCharacterImageSrc] = useState<string | null>(null);
  // 新しく追加する状態
  const [backgroundImagePosition, setBackgroundImagePosition] = useState<ImagePositionType>({ x: 0, y: 0, width: 1200, height: 675 });
  const [characterImagePosition, setCharacterImagePosition] = useState<ImagePositionType>({ x: 0, y: 0, width: 500, height: 500 });

  useEffect(() => {
    setCurrentText(selectedTemplate.initialText);
    setCurrentTextColor(selectedTemplate.initialTextColor);
    setCurrentFontSize(selectedTemplate.initialFontSize);
    setBackgroundImageSrc(selectedTemplate.initialImageSrc || null);
    setCharacterImageSrc(null);
    // テンプレートが変更されたときに、画像の位置とサイズもリセット
    setBackgroundImagePosition({ x: 0, y: 0, width: 1200, height: 675 }); // テンプレートごとの初期値があればそれを使う
    setCharacterImagePosition({ x: 0, y: 0, width: 500, height: 500 }); // テンプレートごとの初期値があればそれを使う
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
        // 新しく追加した状態をvalueに追加
        backgroundImagePosition,
        setBackgroundImagePosition,
        characterImagePosition,
        setCharacterImagePosition,
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