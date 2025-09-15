import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThumbnailTemplate, templates } from '../components/TemplateSelector';

interface TemplateContextType {
  selectedTemplate: ThumbnailTemplate; // nullを許容しないように変更
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
}

const TemplateContext = createContext<TemplateContextType>({
  selectedTemplate: templates[0], // デフォルトテンプレート
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
});

export const TemplateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // selectedTemplateの初期値をtemplates[0]に直接設定
  const [selectedTemplate, setSelectedTemplate] = useState<ThumbnailTemplate>(templates[0]);
  const [currentText, setCurrentText] = useState<string>(templates[0].initialText);
  const [currentTextColor, setCurrentTextColor] = useState<string>(templates[0].initialTextColor);
  const [currentFontSize, setCurrentFontSize] = useState<string>(templates[0].initialFontSize);
  const [backgroundImageSrc, setBackgroundImageSrc] = useState<string | null>(templates[0].initialImageSrc || null);
  const [characterImageSrc, setCharacterImageSrc] = useState<string | null>(null);

  // 選択されたテンプレートが変更されたら、テキスト関連と背景画像の状態をリセット
  useEffect(() => {
    // selectedTemplateがnullでないことは保証されるため、selectedTemplate.initialTextなどに直接アクセス
    setCurrentText(selectedTemplate.initialText);
    setCurrentTextColor(selectedTemplate.initialTextColor);
    setCurrentFontSize(selectedTemplate.initialFontSize);
    setBackgroundImageSrc(selectedTemplate.initialImageSrc || null);
    setCharacterImageSrc(null); // キャラクター画像は常にリセット
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
