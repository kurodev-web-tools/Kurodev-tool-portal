import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  titleGenerationInputSchema,
  type TitleGenerationFormValues,
} from '@/types/title-generator';
import {
  STORAGE_KEYS,
  loadInputDraftFromStorage,
  saveInputDraftToStorage,
} from '../types/storage';

const AUTO_SAVE_DELAY = 1000; // 自動保存の遅延時間（ミリ秒）

/**
 * フォーム状態管理フック
 */
export function useTitleForm() {
  const [isClient, setIsClient] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true); // 初回読み込みフラグ

  const form = useForm<TitleGenerationFormValues>({
    resolver: zodResolver(titleGenerationInputSchema),
    mode: 'onChange',
    defaultValues: {
      videoTheme: '',
      keywords: '',
      targetAudience: '',
      videoMood: '',
    },
  });

  const {
    register,
    watch,
    getValues,
    reset,
    trigger,
    getFieldState,
    formState: { errors },
  } = form;

  const videoTheme = watch('videoTheme');
  const keywords = watch('keywords');
  const targetAudience = watch('targetAudience');
  const videoMood = watch('videoMood');

  /**
   * フィールドエラーのパース
   */
  const parseFieldError = useCallback(
    (field: keyof TitleGenerationFormValues) => {
      const raw = errors[field]?.message as string | undefined;
      if (!raw) {
        return { message: undefined, suggestion: undefined };
      }
      const [message, suggestion] = raw.split('|');
      return { message, suggestion };
    },
    [errors],
  );

  const videoThemeError = parseFieldError('videoTheme');
  const keywordsError = parseFieldError('keywords');
  const targetAudienceError = parseFieldError('targetAudience');
  const videoMoodError = parseFieldError('videoMood');

  /**
   * クライアントサイドの確認
   */
  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * 自動保存タイマーのクリア
   */
  const clearAutoSaveTimer = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);

  /**
   * 入力内容の保存
   */
  const saveInputDraft = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const formValues = getValues();
      saveInputDraftToStorage(STORAGE_KEYS.INPUT_DRAFT, formValues);
    } catch (err) {
      console.error('入力内容保存失敗', err);
    }
  }, [getValues]);

  /**
   * 入力内容の読み込み（初回マウント時）
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const draft = loadInputDraftFromStorage(STORAGE_KEYS.INPUT_DRAFT);
      if (draft) {
        reset({
          videoTheme: draft.videoTheme ?? '',
          keywords: draft.keywords ?? '',
          targetAudience: draft.targetAudience ?? '',
          videoMood: draft.videoMood ?? '',
        });
      }
      isInitialLoadRef.current = false;
    } catch (err) {
      console.error('入力内容読み込み失敗', err);
      isInitialLoadRef.current = false;
    }
  }, [reset]);

  /**
   * 自動保存（入力値変更時、debounce付き）
   */
  useEffect(() => {
    // 初回読み込み時は自動保存をスキップ
    if (isInitialLoadRef.current) return;

    // 既存のタイマーをクリア
    clearAutoSaveTimer();

    // 新しいタイマーをセット（1秒後に保存）
    autoSaveTimerRef.current = setTimeout(() => {
      saveInputDraft();
      autoSaveTimerRef.current = null;
    }, AUTO_SAVE_DELAY);

    // クリーンアップ
    return () => {
      clearAutoSaveTimer();
    };
  }, [videoTheme, keywords, targetAudience, videoMood, saveInputDraft, clearAutoSaveTimer]);

  /**
   * コンポーネントアンマウント時のクリーンアップ
   */
  useEffect(() => {
    return () => {
      clearAutoSaveTimer();
    };
  }, [clearAutoSaveTimer]);

  /**
   * フォームのバリデーション
   */
  const validateForm = useCallback(async (): Promise<boolean> => {
    return await trigger();
  }, [trigger]);

  /**
   * フォームのリセット
   */
  const resetForm = useCallback(() => {
    reset({
      videoTheme: '',
      keywords: '',
      targetAudience: '',
      videoMood: '',
    });
    // 自動保存もクリア
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEYS.INPUT_DRAFT);
      } catch (err) {
        console.error('入力内容クリア失敗', err);
      }
    }
  }, [reset]);

  /**
   * 履歴からフォームを復元
   */
  const loadFromHistory = useCallback(
    (historyInput: TitleGenerationFormValues) => {
      reset(historyInput);
    },
    [reset],
  );

  return {
    form,
    register,
    watch,
    getValues,
    reset: resetForm,
    validateForm,
    loadFromHistory,
    getFieldState,
    isClient,
    // フォーム値
    videoTheme,
    keywords,
    targetAudience,
    videoMood,
    // エラー
    videoThemeError,
    keywordsError,
    targetAudienceError,
    videoMoodError,
  };
}
