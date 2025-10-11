import { useState, useEffect, useMemo } from 'react';
import { loadTemplates } from '@/lib/templateLoader';
import { createGenreDisplayMapping } from '@/lib/genreMapping';
import { logger } from '@/lib/logger';

/**
 * テンプレート管理用のカスタムフック
 * thumbnail-generatorとasset-creatorで共通のロジックを提供
 */

export interface Template {
  id: string;
  name: string;
  genre: string;
  initialText: string;
  initialTextColor: string;
  initialFontSize: string;
  initialImageSrc: string;
  initialBackgroundImagePosition?: { x: number; y: number; width: number; height: number };
  initialCharacterImagePosition?: { x: number; y: number; width: number; height: number };
  initialTextPosition?: { x: number; y: number; width: number; height: number };
  supportedAspectRatios: string[];
}

interface UseTemplateManagementOptions {
  aspectRatio: string;
  customAspectRatio?: { width: number; height: number };
}

export function useTemplateManagement({ aspectRatio, customAspectRatio }: UseTemplateManagementOptions) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // テンプレート読み込み（同期的に即座に実行）
  useEffect(() => {
    try {
      setIsLoading(true);
      logger.debug('テンプレート読み込み開始', undefined, 'useTemplateManagement');
      const loadedTemplates = loadTemplates();
      logger.debug('テンプレート読み込み完了', { 
        count: loadedTemplates.length, 
        genres: [...new Set(loadedTemplates.map(t => t.genre))] 
      }, 'useTemplateManagement');
      setTemplates(loadedTemplates);
      setIsLoading(false);
    } catch (error) {
      logger.error('テンプレート読み込み失敗', error, 'useTemplateManagement');
      setTemplates([]);
      setIsLoading(false);
    }
  }, []);

  // 選択中のアスペクト比でテンプレートをフィルタリング
  const filteredTemplates = useMemo(() => {
    const filtered = templates.filter(t => 
      aspectRatio === 'custom' || t.supportedAspectRatios.includes(aspectRatio)
    );
    logger.debug('テンプレートフィルタリング', { 
      aspectRatio, 
      beforeCount: templates.length, 
      afterCount: filtered.length,
      genres: [...new Set(filtered.map(t => t.genre))]
    }, 'useTemplateManagement');
    return filtered;
  }, [templates, aspectRatio]);

  // フィルタリングされたテンプレートからユニークなジャンルを取得
  const availableGenres = useMemo(() => {
    const genres = [...new Set(filteredTemplates.map(t => t.genre))];
    logger.debug('利用可能なジャンル', { 
      availableGenres: genres,
      filteredCount: filteredTemplates.length,
      totalCount: templates.length,
      aspectRatio,
      allGenres: [...new Set(templates.map(t => t.genre))]
    }, 'useTemplateManagement');
    return genres;
  }, [filteredTemplates, templates, aspectRatio]);

  // ジャンルの表示名マッピングを動的に生成
  const genreNames = useMemo(() => 
    createGenreDisplayMapping(availableGenres),
    [availableGenres]
  );

  // ジャンル別にテンプレートをグループ化
  const templatesByGenre = useMemo(() => {
    return availableGenres.reduce((acc, genre) => {
      acc[genre] = filteredTemplates.filter(t => t.genre === genre);
      return acc;
    }, {} as Record<string, Template[]>);
  }, [availableGenres, filteredTemplates]);

  return {
    templates,
    filteredTemplates,
    availableGenres,
    genreNames,
    templatesByGenre,
    isLoading
  };
}

/**
 * カスタムアスペクト比管理用のヘルパー
 */
export function useCustomAspectRatio(
  customAspectRatio: { width: number; height: number },
  setCustomAspectRatio: (ratio: { width: number; height: number }) => void,
  setAspectRatio: (ratio: string) => void
) {
  const handleCustomAspectRatioChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    type: 'width' | 'height'
  ) => {
    const value = parseInt(e.target.value, 10);
    const newRatio = { ...customAspectRatio, [type]: value };
    if (!isNaN(value) && value > 0) {
      setCustomAspectRatio(newRatio);
      setAspectRatio('custom');
    }
  };

  return { handleCustomAspectRatioChange };
}


