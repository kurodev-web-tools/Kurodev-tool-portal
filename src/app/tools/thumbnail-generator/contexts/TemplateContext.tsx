import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThumbnailTemplate, templates } from '../components/TemplateSelector';

interface TemplateContextType {
  selectedTemplate: ThumbnailTemplate;
  setSelectedTemplate: (template: ThumbnailTemplate) => void;
  currentText: string;
  setCurrentText: (text: string) => void;
  currentTextColor: string;
  setCurrentTextColor: (color: string) => void;
  currentFontSize: string;
  setCurrentFontSize: (fontSize: string) => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const TemplateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ThumbnailTemplate>(templates[0]); // デフォルトテンプレート
  const [currentText, setCurrentText] = useState<string>(templates[0].initialText);
  const [currentTextColor, setCurrentTextColor] = useState<string>(templates[0].initialTextColor);
  const [currentFontSize, setCurrentFontSize] = useState<string>(templates[0].initialFontSize);

  // 選択されたテンプレートが変更されたら、テキスト関連の状態をリセット
  useEffect(() => {
    setCurrentText(selectedTemplate.initialText);
    setCurrentTextColor(selectedTemplate.initialTextColor);
    setCurrentFontSize(selectedTemplate.initialFontSize);
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
