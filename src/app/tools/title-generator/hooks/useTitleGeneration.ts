import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { generateTitleIdeas } from '@/services/aiClient';
import type { TitleGenerationRequest } from '@/types/ai';
import type { TitleOption, TitleGenerationFormValues } from '@/types/title-generator';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { logger } from '@/lib/logger';
import {
  STORAGE_KEYS,
  loadFavoritesFromStorage,
  saveFavoritesToStorage,
} from '../types/storage';
import type { DescriptionTemplate } from '../types/storage';

/**
 * タイトル生成フック
 */
export function useTitleGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegeneratingTitles, setIsRegeneratingTitles] = useState(false);
  const [isRegeneratingDescription, setIsRegeneratingDescription] = useState(false);
  const [regeneratingTitleId, setRegeneratingTitleId] = useState<string | null>(null);
  const { handleAsyncError } = useErrorHandler();

  /**
   * お気に入りタイトルを取得
   */
  const getSavedFavoriteTitles = useCallback((): Set<string> => {
    return loadFavoritesFromStorage(STORAGE_KEYS.FAVORITES);
  }, []);

  /**
   * タイトル生成
   */
  const generateTitles = useCallback(
    async (
      formValues: TitleGenerationFormValues,
      hashtags: string[],
      baseTitle?: string,
    ): Promise<{ titles: TitleOption[]; recommendedHashtags: string[] }> => {
      const request: TitleGenerationRequest = {
        videoTheme: formValues.videoTheme,
        keywords: formValues.keywords,
        targetAudience: formValues.targetAudience,
        mood: formValues.videoMood,
        baseTitle,
        hashtags,
      };

      const response = await generateTitleIdeas(request);
      const favorites = getSavedFavoriteTitles();
      const now = Date.now();

      const mapped: TitleOption[] = response.suggestions.map((suggestion, index) => ({
        id: suggestion.id ?? `title-${now}-${index}`,
        text: suggestion.text,
        isFavorite: favorites.has(suggestion.text),
      }));

      const sorted = [
        ...mapped.filter((title) => title.isFavorite),
        ...mapped.filter((title) => !title.isFavorite),
      ];

      return {
        titles: sorted,
        recommendedHashtags: response.recommendedHashtags,
      };
    },
    [getSavedFavoriteTitles],
  );

  /**
   * 概要欄生成（テンプレートベース）
   */
  const generateDescription = useCallback(
    (
      template: DescriptionTemplate,
      videoTheme: string,
      hashtags: string[],
      defaultHashtags: string[] = ['VTuber', 'ゲーム実況', '新作ゲーム', '実況', 'エンタメ'],
    ): string => {
      const sortedSections = [...template.sections]
        .filter((s) => s.enabled)
        .sort((a, b) => a.order - b.order);

      let description = '';

      sortedSections.forEach((section, index) => {
        let sectionContent = section.content;

        // プレースホルダーの置換
        sectionContent = sectionContent.replace(
          /{videoTheme}/g,
          videoTheme || '[動画のテーマ]',
        );
        sectionContent = sectionContent.replace(
          /{hashtags}/g,
          hashtags.length > 0
            ? hashtags.map((tag) => `#${tag}`).join(' ')
            : defaultHashtags.map((tag) => `#${tag}`).join(' '),
        );

        if (section.type === 'hashtag') {
          // ハッシュタグセクションは特別処理
          description += `【${section.title || 'ハッシュタグ'}】\n${sectionContent}\n`;
        } else if (section.title) {
          description += `【${section.title}】\n${sectionContent}\n`;
        } else {
          description += `${sectionContent}\n`;
        }

        if (index < sortedSections.length - 1) {
          description += '\n';
        }
      });

      return description.trim();
    },
    [],
  );

  /**
   * タイトルのみ再生成
   */
  const regenerateTitlesOnly = useCallback(
    async (
      formValues: TitleGenerationFormValues,
      hashtags: string[],
      onSuccess: (titles: TitleOption[]) => void,
    ) => {
      if (!formValues.videoTheme.trim()) {
        toast.error('入力エラー', {
          description: '動画のテーマ・内容を入力してください',
        });
        return;
      }

      setIsRegeneratingTitles(true);

      try {
        const { titles } = await generateTitles(formValues, hashtags);
        onSuccess(titles);
        toast.success('タイトルを再生成しました');
      } catch (err) {
        logger.error('タイトル再生成失敗', err, 'TitleGenerator');
        toast.error('タイトルの再生成に失敗しました');
      } finally {
        setIsRegeneratingTitles(false);
      }
    },
    [generateTitles],
  );

  /**
   * 概要欄のみ再生成
   */
  const regenerateDescriptionOnly = useCallback(
    (
      template: DescriptionTemplate,
      videoTheme: string,
      hashtags: string[],
      onSuccess: (description: string) => void,
    ) => {
      if (!videoTheme.trim()) {
        toast.error('入力エラー', {
          description: '動画のテーマ・内容を入力してください',
        });
        return;
      }

      setIsRegeneratingDescription(true);

      try {
        // ダミーの待機時間（実際のAPI呼び出しがある場合はここで実装）
        setTimeout(() => {
          const newDescription = generateDescription(template, videoTheme, hashtags);
          onSuccess(newDescription);
          toast.success('概要欄を再生成しました');
          setIsRegeneratingDescription(false);
        }, 1000);
      } catch (err) {
        logger.error('概要欄再生成失敗', err, 'TitleGenerator');
        toast.error('概要欄の再生成に失敗しました');
        setIsRegeneratingDescription(false);
      }
    },
    [generateDescription],
  );

  /**
   * 個別タイトル再生成（ダミー実装）
   */
  const regenerateSingleTitle = useCallback(
    (
      titleId: string,
      currentText: string,
      onSuccess: (titleId: string, newText: string) => void,
    ) => {
      setRegeneratingTitleId(titleId);

      try {
        // ダミーの待機時間
        setTimeout(() => {
          // 個別タイトル生成（ダミーデータ）
          const variants = [
            currentText.replace('【初見】', '【実況】'),
            currentText.replace('挑戦', '攻略'),
            currentText + '【衝撃の結末】',
          ];
          const newText = variants[Math.floor(Math.random() * variants.length)];
          onSuccess(titleId, newText);
          toast.success('タイトル案を再生成しました');
          setRegeneratingTitleId(null);
        }, 800);
      } catch (err) {
        logger.error('個別タイトル再生成失敗', err, 'TitleGenerator');
        toast.error('タイトル案の再生成に失敗しました');
        setRegeneratingTitleId(null);
      }
    },
    [],
  );

  /**
   * 別パターン生成
   */
  const generateVariantFromTitle = useCallback(
    async (
      baseTitleText: string,
      formValues: TitleGenerationFormValues,
      hashtags: string[],
      existingTitles: TitleOption[],
      onSuccess: (newTitles: TitleOption[]) => void,
    ) => {
      setIsRegeneratingTitles(true);

      try {
        const { titles: newTitles } = await generateTitles(
          formValues,
          hashtags,
          baseTitleText,
        );

        // 既存のタイトルに追加（お気に入りを維持）
        const existingTexts = new Set(existingTitles.map((t) => t.text));
        const filteredNew = newTitles.filter((t) => !existingTexts.has(t.text));
        const updated = [
          ...existingTitles.filter((t) => t.isFavorite),
          ...filteredNew,
          ...existingTitles.filter(
            (t) => !t.isFavorite && !existingTexts.has(t.text),
          ),
        ];

        onSuccess(updated);
        toast.success('別パターンを生成しました');
      } catch (err) {
        logger.error('別パターン生成失敗', err, 'TitleGenerator');
        toast.error('別パターンの生成に失敗しました');
      } finally {
        setIsRegeneratingTitles(false);
      }
    },
    [generateTitles],
  );

  /**
   * 完全な生成処理（タイトル + 概要欄）
   */
  const generateAll = useCallback(
    async (
      formValues: TitleGenerationFormValues,
      hashtags: string[],
      template: DescriptionTemplate,
      defaultHashtags: string[],
      onSuccess: (result: {
        titles: TitleOption[];
        description: string;
        recommendedHashtags: string[];
      }) => void,
    ) => {
      setIsLoading(true);

      await handleAsyncError(async () => {
        const { titles: sortedTitles, recommendedHashtags } = await generateTitles(
          formValues,
          hashtags,
        );

        const nextHashtags =
          hashtags.length > 0
            ? hashtags
            : recommendedHashtags.length > 0
              ? recommendedHashtags
              : defaultHashtags;

        const generatedDescription = generateDescription(
          template,
          formValues.videoTheme,
          nextHashtags,
          defaultHashtags,
        );

        onSuccess({
          titles: sortedTitles,
          description: generatedDescription,
          recommendedHashtags: nextHashtags,
        });
      }, '生成中にエラーが発生しました');

      setIsLoading(false);
    },
    [generateTitles, generateDescription, handleAsyncError],
  );

  return {
    isLoading,
    isRegeneratingTitles,
    isRegeneratingDescription,
    regeneratingTitleId,
    generateTitles,
    generateDescription,
    regenerateTitlesOnly,
    regenerateDescriptionOnly,
    regenerateSingleTitle,
    generateVariantFromTitle,
    generateAll,
  };
}
