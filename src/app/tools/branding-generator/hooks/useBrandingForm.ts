import { useState, useCallback } from 'react';

export type ActivityStatus = 'active' | 'pre-activity';

export interface BrandingFormValues {
  description: string;
  persona: string;
  genre: string;
  avatar: string;
}

/**
 * ブランディングフォーム管理フック
 */
export function useBrandingForm() {
  const [activityStatus, setActivityStatus] = useState<ActivityStatus | null>(null);
  const [description, setDescription] = useState('');
  const [persona, setPersona] = useState('');
  const [genre, setGenre] = useState('');
  const [avatar, setAvatar] = useState('');

  /**
   * フォーム値を取得
   */
  const getFormValues = useCallback((): BrandingFormValues => {
    return {
      description,
      persona,
      genre,
      avatar,
    };
  }, [description, persona, genre, avatar]);

  /**
   * フォームをリセット
   */
  const resetForm = useCallback(() => {
    setDescription('');
    setPersona('');
    setGenre('');
    setAvatar('');
  }, []);

  /**
   * フォームのバリデーション
   */
  const validateForm = useCallback((): { isValid: boolean; error?: string } => {
    if (!activityStatus) {
      return { isValid: false, error: '活動状況を選択してください' };
    }

    if (activityStatus === 'active' && !description.trim()) {
      return { isValid: false, error: '自己紹介・活動内容を入力してください' };
    }

    if (activityStatus === 'pre-activity' && (!persona.trim() || !genre.trim())) {
      return { isValid: false, error: '目指すVTuber像と活動ジャンルを入力してください' };
    }

    return { isValid: true };
  }, [activityStatus, description, persona, genre]);

  /**
   * すべてをリセット（フォーム + 活動状況）
   */
  const resetAll = useCallback(() => {
    setActivityStatus(null);
    resetForm();
  }, [resetForm]);

  return {
    activityStatus,
    setActivityStatus,
    description,
    setDescription,
    persona,
    setPersona,
    genre,
    setGenre,
    avatar,
    setAvatar,
    getFormValues,
    resetForm,
    validateForm,
    resetAll,
  };
}

