import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import {
  STORAGE_KEYS,
  loadHashtagFavoritesFromStorage,
  saveHashtagFavoritesToStorage,
} from '../types/storage';

/**
 * ハッシュタグ管理フック
 */
export function useHashtagManagement() {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtagInput, setNewHashtagInput] = useState('');

  /**
   * ハッシュタグの安全な更新（重複チェック付き）
   */
  const setHashtagsSafely = useCallback((next: string[]) => {
    if (next.length === 0) return;
    setHashtags((prev) => {
      if (prev.length === next.length && prev.every((tag, index) => tag === next[index])) {
        return prev;
      }
      return next;
    });
  }, []);

  /**
   * ハッシュタグのお気に入りを読み込み
   */
  const loadHashtagFavorites = useCallback((): string[] => {
    return loadHashtagFavoritesFromStorage(STORAGE_KEYS.HASHTAG_FAVORITES);
  }, []);

  /**
   * ハッシュタグのお気に入りを保存
   */
  const saveHashtagToFavorites = useCallback(
    (tag: string) => {
      if (typeof window === 'undefined') return;

      try {
        const favorites = loadHashtagFavorites();
        if (!favorites.includes(tag)) {
          const updated = [...favorites, tag];
          saveHashtagFavoritesToStorage(STORAGE_KEYS.HASHTAG_FAVORITES, updated);
          toast.success('ハッシュタグをお気に入りに追加しました');
        }
      } catch (err) {
        console.error('ハッシュタグお気に入り保存失敗', err);
      }
    },
    [loadHashtagFavorites],
  );

  /**
   * ハッシュタグの追加
   */
  const addHashtag = useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim().replace(/^#/, ''); // #を削除
      if (!trimmedTag || hashtags.includes(trimmedTag)) return;

      const newHashtags = [...hashtags, trimmedTag];
      setHashtagsSafely(newHashtags);
      setNewHashtagInput('');
    },
    [hashtags, setHashtagsSafely],
  );

  /**
   * ハッシュタグの削除
   */
  const removeHashtag = useCallback(
    (tag: string) => {
      const newHashtags = hashtags.filter((t) => t !== tag);
      setHashtagsSafely(newHashtags);
    },
    [hashtags, setHashtagsSafely],
  );

  /**
   * ハッシュタグ候補の自動提案
   */
  const suggestHashtags = useCallback(
    (keywords: string, videoTheme: string): string[] => {
      const suggestions: string[] = [];

      // キーワードから生成
      const keywordList = keywords
        .split(/[,、，]/)
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
      keywordList.forEach((keyword) => {
        if (keyword.length <= 10) {
          suggestions.push(keyword);
        }
      });

      // 動画テーマから生成（簡易的なキーワード抽出）
      if (videoTheme.includes('ゲーム') || videoTheme.includes('ゲーム実況')) {
        suggestions.push('VTuber', 'ゲーム実況', '実況');
      }
      if (videoTheme.includes('歌') || videoTheme.includes('歌枠')) {
        suggestions.push('VTuber', '歌枠', '歌ってみた');
      }
      if (videoTheme.includes('コラボ')) {
        suggestions.push('VTuber', 'コラボ', 'コラボ配信');
      }

      // 一般的なVTuberハッシュタグ
      suggestions.push('VTuber', 'バーチャルYouTuber', 'エンタメ');

      // 重複を削除して返す
      return Array.from(new Set(suggestions));
    },
    [],
  );

  /**
   * 概要欄からハッシュタグを抽出
   */
  const extractHashtagsFromDescription = useCallback((description: string): string[] => {
    const hashtagSection = description.match(/【ハッシュタグ】\s*\n([\s\S]*?)(?=\n【|$)/);
    if (!hashtagSection) return [];

    const hashtagLine = hashtagSection[1].trim();
    const matches = hashtagLine.match(/#([\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)/g);
    if (!matches) return [];

    return matches.map((tag) => tag.replace('#', ''));
  }, []);

  /**
   * 概要欄のハッシュタグセクションを更新
   */
  const updateDescriptionHashtags = useCallback(
    (
      newHashtags: string[],
      description: string,
      setDescription: (desc: string) => void,
    ): string => {
      const hashtagString =
        newHashtags.length > 0
          ? newHashtags.map((tag) => `#${tag}`).join(' ')
          : '#VTuber #ゲーム実況 #新作ゲーム #実況 #エンタメ';

      // 概要欄の【ハッシュタグ】セクションを更新
      let updatedDescription: string;
      if (description.includes('【ハッシュタグ】')) {
        updatedDescription = description.replace(
          /【ハッシュタグ】\s*\n([\s\S]*?)(?=\n【|$)/,
          `【ハッシュタグ】\n${hashtagString}`,
        );
      } else {
        // 【ハッシュタグ】セクションが存在しない場合は追加
        updatedDescription =
          description +
          (description.endsWith('\n') ? '' : '\n') +
          `\n【ハッシュタグ】\n${hashtagString}`;
      }

      setDescription(updatedDescription);
      return updatedDescription;
    },
    [],
  );

  /**
   * ハッシュタグの初期化（概要欄から抽出）
   */
  const initializeHashtagsFromDescription = useCallback(
    (description: string) => {
      const extracted = extractHashtagsFromDescription(description);
      if (extracted.length > 0) {
        setHashtagsSafely(extracted);
      }
    },
    [extractHashtagsFromDescription, setHashtagsSafely],
  );

  return {
    hashtags,
    setHashtags: setHashtagsSafely,
    newHashtagInput,
    setNewHashtagInput,
    addHashtag,
    removeHashtag,
    saveHashtagToFavorites,
    loadHashtagFavorites,
    suggestHashtags,
    extractHashtagsFromDescription,
    updateDescriptionHashtags,
    initializeHashtagsFromDescription,
  };
}
