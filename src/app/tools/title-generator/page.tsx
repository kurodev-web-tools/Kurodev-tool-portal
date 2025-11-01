"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Copy, Check, Star, GripVertical, History, Trash2, Clock, Edit2, Eye, TrendingUp, AlertCircle, Hash, X, Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/hooks/use-sidebar";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { logger } from "@/lib/logger";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
export default function TitleGeneratorPage() {
  const { isDesktop } = useSidebar({
    defaultOpen: true,
    desktopDefaultOpen: true,
  });
  const [activeTab, setActiveTab] = useState("settings"); // モバイル用タブの状態
  const [leftPanelTab, setLeftPanelTab] = useState("input"); // 左サイドバーのタブ（入力/履歴）
  const [descriptionViewMode, setDescriptionViewMode] = useState<"edit" | "preview">("edit"); // 概要欄の表示モード（5.5対応）
  const [isLoading, setIsLoading] = useState(false); // ローディング状態
  const [finalTitle, setFinalTitle] = useState(""); // 最終タイトル
  const [finalDescription, setFinalDescription] = useState(""); // 最終概要欄
  
  // タイトル案のデータ構造（お気に入り機能対応）
  interface TitleOption {
    id: string;
    text: string;
    isFavorite: boolean;
  }
  
  // 生成履歴のデータ構造（5.3対応）
  interface GenerationHistory {
    id: string;
    timestamp: number;
    titles: TitleOption[];
    description: string;
    inputData: {
      videoTheme: string;
      keywords: string;
      targetAudience: string;
      videoMood: string;
    };
  }
  
  const [aiTitles, setAiTitles] = useState<TitleOption[]>([]); // AI提案タイトル案
  const [aiDescription, setAiDescription] = useState(""); // AI提案概要欄
  const [copiedItem, setCopiedItem] = useState<string | null>(null); // コピー状態
  const [history, setHistory] = useState<GenerationHistory[]>([]); // 生成履歴
  const [hashtags, setHashtags] = useState<string[]>([]); // ハッシュタグリスト（5.7対応）
  const [newHashtagInput, setNewHashtagInput] = useState(""); // 新規ハッシュタグ入力（5.7対応）
  
  // ローカルストレージキー
  const FAVORITES_STORAGE_KEY = 'title-generator-favorites';
  const HISTORY_STORAGE_KEY = 'title-generator-history';
  const INPUT_STORAGE_KEY = 'title-generator-input-draft'; // 入力内容の一時保存（5.4対応）
  const HASHTAG_FAVORITES_STORAGE_KEY = 'title-generator-hashtag-favorites'; // ハッシュタグのお気に入り（5.7対応）
  const MAX_HISTORY_ITEMS = 50; // 最大履歴件数
  const AUTO_SAVE_DELAY = 1000; // 自動保存の遅延時間（ミリ秒）
  const YOUTUBE_DESCRIPTION_LIMIT = 5000; // YouTube概要欄の文字数制限（5.5対応）
  const YOUTUBE_TITLE_RECOMMENDED_LENGTH = 60; // YouTubeタイトルの推奨文字数（5.6対応）
  const YOUTUBE_HASHTAG_RECOMMENDED_COUNT = 15; // YouTubeハッシュタグの推奨数（5.7対応）
  
  // 入力フォームのstate管理（5.4対応）
  const [videoTheme, setVideoTheme] = useState(""); // 動画のテーマ・内容
  const [keywords, setKeywords] = useState(""); // 主要キーワード
  const [targetAudience, setTargetAudience] = useState(""); // ターゲット層
  const [videoMood, setVideoMood] = useState(""); // 動画の雰囲気
  
  const { handleAsyncError } = useErrorHandler();

  // 自動保存用のタイマーref（5.4対応）
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true); // 初回読み込みフラグ

  // 入力内容の保存（5.4対応）
  const saveInputDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const draftData = {
        videoTheme,
        keywords,
        targetAudience,
        videoMood,
        timestamp: Date.now(),
      };
      localStorage.setItem(INPUT_STORAGE_KEY, JSON.stringify(draftData));
    } catch (err) {
      console.error('入力内容保存失敗', err);
    }
  }, [videoTheme, keywords, targetAudience, videoMood]);

  // 入力内容の読み込み（初回マウント時）（5.4対応）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(INPUT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          // 古いデータ（7日以上前）は削除
          const daysSinceSave = (Date.now() - (parsed.timestamp || 0)) / (1000 * 60 * 60 * 24);
          if (daysSinceSave < 7) {
            if (parsed.videoTheme) setVideoTheme(parsed.videoTheme);
            if (parsed.keywords) setKeywords(parsed.keywords);
            if (parsed.targetAudience) setTargetAudience(parsed.targetAudience);
            if (parsed.videoMood) setVideoMood(parsed.videoMood);
          } else {
            // 古いデータを削除
            localStorage.removeItem(INPUT_STORAGE_KEY);
          }
        }
      }
      isInitialLoadRef.current = false;
    } catch (err) {
      console.error('入力内容読み込み失敗', err);
      isInitialLoadRef.current = false;
    }
  }, []); // 初回のみ実行

  // 自動保存（入力値変更時、debounce付き）（5.4対応）
  useEffect(() => {
    // 初回読み込み時は自動保存をスキップ
    if (isInitialLoadRef.current) return;
    
    // 既存のタイマーをクリア
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // 新しいタイマーをセット（1秒後に保存）
    autoSaveTimerRef.current = setTimeout(() => {
      saveInputDraft();
    }, AUTO_SAVE_DELAY);
    
    // クリーンアップ
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [videoTheme, keywords, targetAudience, videoMood, saveInputDraft]);

  // 履歴の読み込み（初回マウント時）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      console.error('履歴読み込み失敗', err);
    }
  }, []);

  // 履歴の保存
  const saveHistory = useCallback((newHistory: GenerationHistory) => {
    if (typeof window === 'undefined') return;
    
    try {
      setHistory(prev => {
        const updated = [newHistory, ...prev].slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error('履歴保存失敗', err);
    }
  }, []);

  // 履歴の削除
  const deleteHistory = useCallback((historyId: string) => {
    setHistory(prev => {
      const updated = prev.filter(h => h.id !== historyId);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
        } catch (err) {
          console.error('履歴削除失敗', err);
        }
      }
      return updated;
    });
    toast.success('履歴を削除しました');
  }, []);

  // 履歴の全削除
  const clearAllHistory = useCallback(() => {
    if (confirm('すべての履歴を削除しますか？')) {
      setHistory([]);
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(HISTORY_STORAGE_KEY);
        } catch (err) {
          console.error('履歴全削除失敗', err);
        }
      }
      toast.success('すべての履歴を削除しました');
    }
  }, []);

  // 履歴からの読み込み
  const loadFromHistory = useCallback((historyItem: GenerationHistory) => {
    setAiTitles(historyItem.titles);
    setAiDescription(historyItem.description);
    setFinalDescription(historyItem.description);
    if (historyItem.titles.length > 0) {
      setFinalTitle(historyItem.titles[0].text);
    }
    
    // 入力フォームも復元
    setVideoTheme(historyItem.inputData.videoTheme);
    setKeywords(historyItem.inputData.keywords);
    setTargetAudience(historyItem.inputData.targetAudience);
    setVideoMood(historyItem.inputData.videoMood);
    
    // 左サイドバーを入力タブに切り替え
    setLeftPanelTab('input');
    
    toast.success('履歴から読み込みました');
  }, []);

  // T-04: フロントエンド内でのUIロジック実装
  const handleGenerateClick = useCallback(async () => {
    // 入力フォームのバリデーション（最低限のチェック）
    if (!videoTheme.trim()) {
      toast.error('入力エラー', {
        description: '動画のテーマ・内容を入力してください'
      });
      return;
    }

    setIsLoading(true);
    
    // 非同期処理をエラーハンドリングでラップ
    await handleAsyncError(async () => {
      // ここに生成ロジックを呼び出す処理が入る（今回はモック）
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const generatedTitleTexts = [
        "【初見】超絶高難易度ゲームに挑戦！絶叫必至の展開が...",
        "【実況】新作ゲームを完全攻略！隠し要素も全部見つけた",
        "【コラボ】人気VTuberと一緒にゲーム！予想外の展開に..."
      ];
      
      // 既存のお気に入り状態を読み込み
      const FAVORITES_STORAGE_KEY = 'title-generator-favorites';
      const savedFavorites = (() => {
        if (typeof window === 'undefined') return new Set<string>();
        try {
          const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
          return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
        } catch {
          return new Set<string>();
        }
      })();
      
      // タイトル案をオブジェクト配列に変換
      const newTitles: TitleOption[] = generatedTitleTexts.map((text, index) => ({
        id: `title-${Date.now()}-${index}`,
        text,
        isFavorite: savedFavorites.has(text),
      }));
      
      // お気に入りを先頭に、その後にソート
      const sortedTitles = [
        ...newTitles.filter(t => t.isFavorite),
        ...newTitles.filter(t => !t.isFavorite),
      ];
      
      const generatedDescription = `【動画の概要】
この動画では、${videoTheme}について詳しく解説しています。

【タイムスタンプ】
00:00 オープニング
02:30 本編開始
15:45 まとめ

【関連動画】
・前回の動画: [リンク]
・次回予告: [リンク]

【ハッシュタグ】
${hashtags.length > 0 ? hashtags.map(tag => `#${tag}`).join(' ') : '#VTuber #ゲーム実況 #新作ゲーム #実況 #エンタメ'}

【SNS】
Twitter: @your_twitter
Instagram: @your_instagram`;

      // ハッシュタグが未設定の場合はデフォルトを設定（5.7対応）
      if (hashtags.length === 0) {
        const defaultHashtags = ['VTuber', 'ゲーム実況', '新作ゲーム', '実況', 'エンタメ'];
        setHashtags(defaultHashtags);
      }

      setAiTitles(sortedTitles);
      setAiDescription(generatedDescription);
      // 最初のタイトル案を自動選択
      if (sortedTitles.length > 0) {
        setFinalTitle(sortedTitles[0].text);
      }
      setFinalDescription(generatedDescription);
      
      // 履歴に保存（5.3対応）
      const historyEntry: GenerationHistory = {
        id: `history-${Date.now()}`,
        timestamp: Date.now(),
        titles: sortedTitles,
        description: generatedDescription,
        inputData: {
          videoTheme,
          keywords,
          targetAudience,
          videoMood,
        },
      };
      saveHistory(historyEntry);
      
      // 生成成功時は入力内容の一時保存をクリア（5.4対応）
      // 履歴に保存されたので、一時保存は不要
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(INPUT_STORAGE_KEY);
        } catch (err) {
          console.error('一時保存クリア失敗', err);
        }
      }
      
      if (!isDesktop) {
        setActiveTab("results"); // モバイルでは結果タブに切り替える
      }
    }, "生成中にエラーが発生しました");
    
    setIsLoading(false);
  }, [videoTheme, keywords, targetAudience, videoMood, handleAsyncError, isDesktop, saveHistory]);

  const handleTitleSelect = useCallback((title: string) => {
    setFinalTitle(title);
  }, []);

  const handleCopy = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(type);
      setTimeout(() => setCopiedItem(null), 2000);
      toast.success('コピーしました');
    } catch (err) {
      logger.error('コピー失敗', err, 'TitleGenerator');
      toast.error('コピーに失敗しました');
    }
  }, []);

  // お気に入り状態を切り替え
  const handleToggleFavorite = useCallback((titleId: string, titleText: string) => {
    const FAVORITES_STORAGE_KEY = 'title-generator-favorites';
    
    setAiTitles(prev => {
      // 現在の状態を確認
      const currentTitle = prev.find(t => t.id === titleId);
      const willBeFavorite = !currentTitle?.isFavorite;
      
      const updated = prev.map(title => 
        title.id === titleId 
          ? { ...title, isFavorite: !title.isFavorite }
          : title
      );
      
      // お気に入りを先頭にソート
      const sorted = [
        ...updated.filter(t => t.isFavorite),
        ...updated.filter(t => !t.isFavorite),
      ];
      
      // ローカルストレージに保存
      if (typeof window !== 'undefined') {
        try {
          const favorites = new Set<string>();
          sorted.forEach(t => {
            if (t.isFavorite) {
              favorites.add(t.text);
            }
          });
          localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favorites)));
        } catch (err) {
          logger.error('お気に入り保存失敗', err, 'TitleGenerator');
        }
      }
      
      // トースト通知
      toast.success(willBeFavorite ? 'お気に入りに追加しました' : 'お気に入りを解除しました');
      
      return sorted;
    });
  }, []);

  // タイトル分析用のユーティリティ関数（5.6対応）
  const analyzeTitle = useCallback((title: string, inputKeywords: string) => {
    const charCount = title.length;
    const keywordList = inputKeywords.split(/[,、，]/).map(k => k.trim()).filter(k => k.length > 0);
    
    // キーワード含有率の計算
    let keywordMatches = 0;
    keywordList.forEach(keyword => {
      if (title.toLowerCase().includes(keyword.toLowerCase())) {
        keywordMatches++;
      }
    });
    const keywordCoverage = keywordList.length > 0 
      ? Math.round((keywordMatches / keywordList.length) * 100) 
      : 0;
    
    // 特徴タグの検出
    const features: string[] = [];
    if (title.includes('【') && title.includes('】')) {
      features.push('構造化');
    }
    if (title.includes('！') || title.includes('!')) {
      features.push('キャッチー');
    }
    if (title.includes('？') || title.includes('?')) {
      features.push('疑問形');
    }
    if (keywordCoverage >= 50) {
      features.push('キーワード豊富');
    }
    if (charCount <= YOUTUBE_TITLE_RECOMMENDED_LENGTH && charCount >= 30) {
      features.push('最適長');
    }
    if (charCount > YOUTUBE_TITLE_RECOMMENDED_LENGTH) {
      features.push('長文');
    }
    if (charCount < 30) {
      features.push('短文');
    }
    
    // 評価スコアの計算（0-100点）
    let score = 0;
    // 文字数スコア（30-60文字が最適: 40点満点）
    if (charCount >= 30 && charCount <= YOUTUBE_TITLE_RECOMMENDED_LENGTH) {
      score += 40;
    } else if (charCount > YOUTUBE_TITLE_RECOMMENDED_LENGTH && charCount <= 70) {
      score += 30; // 少し長いが許容範囲
    } else if (charCount > 70) {
      score += 10; // 長すぎる
    } else if (charCount >= 20 && charCount < 30) {
      score += 25; // やや短い
    } else {
      score += 10; // 短すぎる
    }
    
    // キーワード含有率スコア（30点満点）
    score += Math.round((keywordCoverage / 100) * 30);
    
    // 特徴タグスコア（30点満点）
    let featureScore = 0;
    if (features.includes('構造化')) featureScore += 10;
    if (features.includes('キャッチー')) featureScore += 10;
    if (features.includes('最適長')) featureScore += 10;
    score += Math.min(featureScore, 30);
    
    // クリック率予測スコア（簡易版、scoreをベースに計算）
    const clickRateScore = Math.round(score * 0.8); // 簡易的な計算
    
    return {
      charCount,
      keywordCoverage,
      features,
      score: Math.min(score, 100),
      clickRateScore,
      isOverRecommended: charCount > YOUTUBE_TITLE_RECOMMENDED_LENGTH,
    };
  }, []);

  // ハッシュタグ管理用のユーティリティ関数（5.7対応）
  const extractHashtagsFromDescription = useCallback((description: string): string[] => {
    const hashtagSection = description.match(/【ハッシュタグ】\s*\n([\s\S]*?)(?=\n【|$)/);
    if (!hashtagSection) return [];
    
    const hashtagLine = hashtagSection[1].trim();
    const matches = hashtagLine.match(/#([\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)/g);
    if (!matches) return [];
    
    return matches.map(tag => tag.replace('#', ''));
  }, []);

  const updateDescriptionHashtags = useCallback((newHashtags: string[]) => {
    const hashtagString = newHashtags.length > 0 
      ? newHashtags.map(tag => `#${tag}`).join(' ') 
      : '#VTuber #ゲーム実況 #新作ゲーム #実況 #エンタメ';
    
    // 概要欄の【ハッシュタグ】セクションを更新
    setAiDescription(prev => {
      if (prev.includes('【ハッシュタグ】')) {
        return prev.replace(
          /【ハッシュタグ】\s*\n([\s\S]*?)(?=\n【|$)/,
          `【ハッシュタグ】\n${hashtagString}`
        );
      } else {
        // 【ハッシュタグ】セクションが存在しない場合は追加
        return prev + (prev.endsWith('\n') ? '' : '\n') + `\n【ハッシュタグ】\n${hashtagString}`;
      }
    });
    
    // finalDescriptionも更新
    setFinalDescription(prev => {
      if (prev.includes('【ハッシュタグ】')) {
        return prev.replace(
          /【ハッシュタグ】\s*\n([\s\S]*?)(?=\n【|$)/,
          `【ハッシュタグ】\n${hashtagString}`
        );
      } else {
        return prev + (prev.endsWith('\n') ? '' : '\n') + `\n【ハッシュタグ】\n${hashtagString}`;
      }
    });
  }, []);

  // ハッシュタグの追加
  const handleAddHashtag = useCallback((tag: string) => {
    const trimmedTag = tag.trim().replace(/^#/, ''); // #を削除
    if (!trimmedTag || hashtags.includes(trimmedTag)) return;
    
    const newHashtags = [...hashtags, trimmedTag];
    setHashtags(newHashtags);
    updateDescriptionHashtags(newHashtags);
    setNewHashtagInput("");
  }, [hashtags, updateDescriptionHashtags]);

  // ハッシュタグの削除
  const handleRemoveHashtag = useCallback((tag: string) => {
    const newHashtags = hashtags.filter(t => t !== tag);
    setHashtags(newHashtags);
    updateDescriptionHashtags(newHashtags);
  }, [hashtags, updateDescriptionHashtags]);

  // ハッシュタグのお気に入り保存
  const handleSaveHashtagToFavorites = useCallback((tag: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(HASHTAG_FAVORITES_STORAGE_KEY);
      const favorites = stored ? JSON.parse(stored) : [];
      if (!favorites.includes(tag)) {
        const updated = [...favorites, tag];
        localStorage.setItem(HASHTAG_FAVORITES_STORAGE_KEY, JSON.stringify(updated));
        toast.success('ハッシュタグをお気に入りに追加しました');
      }
    } catch (err) {
      console.error('ハッシュタグお気に入り保存失敗', err);
    }
  }, []);

  // ハッシュタグのお気に入り読み込み
  const loadHashtagFavorites = useCallback(() => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(HASHTAG_FAVORITES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('ハッシュタグお気に入り読み込み失敗', err);
      return [];
    }
  }, []);

  // ハッシュタグ候補の自動提案（簡易版）
  const suggestHashtags = useCallback((keywords: string, videoTheme: string) => {
    const suggestions: string[] = [];
    
    // キーワードから生成
    const keywordList = keywords.split(/[,、，]/).map(k => k.trim()).filter(k => k.length > 0);
    keywordList.forEach(keyword => {
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
  }, []);

  // 概要欄からハッシュタグを抽出（初回読み込み時）
  useEffect(() => {
    if (aiDescription) {
      const extracted = extractHashtagsFromDescription(aiDescription);
      if (extracted.length > 0) {
        setHashtags(extracted);
      }
    }
  }, [aiDescription, extractHashtagsFromDescription]);

  // ドラッグ&ドロップの並び替え
  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) {
      return;
    }

    setAiTitles(prev => {
      const reordered = Array.from(prev);
      const [removed] = reordered.splice(sourceIndex, 1);
      reordered.splice(destinationIndex, 0, removed);
      
      // お気に入りは先頭に固定（再ソート）
      const favorites = reordered.filter(t => t.isFavorite);
      const nonFavorites = reordered.filter(t => !t.isFavorite);
      return [...favorites, ...nonFavorites];
    });
  }, []);

  const controlPanelContent = (
    <div className="flex flex-col h-full p-6 space-y-4 relative">
      <Tabs value={leftPanelTab} onValueChange={setLeftPanelTab} className="flex-1 flex flex-col min-w-0">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="input">入力</TabsTrigger>
          <TabsTrigger value="history">
            履歴
            {history.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {history.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="input" className="flex-1 space-y-4 overflow-auto mt-0">
          {/* T-02: コントロールパネルのUI作成 */}
          <Card>
            <CardHeader>
              <CardTitle>動画情報入力</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 動画のテーマ・内容は全幅 */}
              <div>
                <Label htmlFor="video-theme">動画のテーマ・内容</Label>
                <Textarea
                  id="video-theme"
                  placeholder="動画の台本や要約などを入力..."
                  value={videoTheme}
                  onChange={(e) => setVideoTheme(e.target.value)}
                  rows={4}
                  className="resize-y"
                />
              </div>
              
              {/* 2カラムレイアウト（5.1対応） */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="keywords">主要キーワード</Label>
                  <Input 
                    id="keywords" 
                    placeholder="例: ゲーム名, キャラクター名, 感想"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="target-audience">ターゲット層</Label>
                  <Input 
                    id="target-audience" 
                    placeholder="例: 10代男性, VTuberファン"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="video-mood">動画の雰囲気</Label>
                <Input 
                  id="video-mood" 
                  placeholder="例: 面白い, 感動, 解説"
                  value={videoMood}
                  onChange={(e) => setVideoMood(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          <Button size="lg" className="w-full" onClick={handleGenerateClick} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                生成中...
              </>
            ) : (
              '生成する'
            )}
          </Button>
        </TabsContent>
        
        <TabsContent value="history" className="flex-1 space-y-4 overflow-auto mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>生成履歴</span>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllHistory}
                  className="text-red-400 hover:text-red-300"
                  aria-label="すべての履歴を削除"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>生成履歴がありません</p>
                <p className="text-xs mt-2">タイトルと概要欄を生成すると、ここに履歴が表示されます</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {history.map((item) => {
                  const dateStr = new Date(item.timestamp).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const relativeTime = (() => {
                    const diff = Date.now() - item.timestamp;
                    const minutes = Math.floor(diff / 60000);
                    const hours = Math.floor(diff / 3600000);
                    const days = Math.floor(diff / 86400000);
                    if (minutes < 1) return 'たった今';
                    if (minutes < 60) return `${minutes}分前`;
                    if (hours < 24) return `${hours}時間前`;
                    if (days < 7) return `${days}日前`;
                    return dateStr;
                  })();
                  
                  return (
                    <Card
                      key={item.id}
                      className={cn(
                        "cursor-pointer hover:border-[#20B2AA] transition-all group relative overflow-visible"
                      )}
                      onClick={() => loadFromHistory(item)}
                    >
                      {/* 左側のボーダー（独立した要素として配置） */}
                      <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-[#20B2AA] transition-colors rounded-l-xl",
                        "-ml-2" // カードの外側に少しはみ出させる
                      )} />
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {/* 最初のタイトル案をプレビュー */}
                            {item.titles.length > 0 && (
                              <p className="text-sm font-medium truncate mb-1">
                                {item.titles[0].text}
                              </p>
                            )}
                            
                            {/* 入力情報の簡易表示 */}
                            {item.inputData.videoTheme && (
                              <p className="text-xs text-muted-foreground truncate mb-1">
                                {item.inputData.videoTheme.substring(0, 50)}
                                {item.inputData.videoTheme.length > 50 ? '...' : ''}
                              </p>
                            )}
                            
                            {/* タイムスタンプ */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{relativeTime}</span>
                              <span className="text-[#808080]">・</span>
                              <span>{item.titles.length}件のタイトル案</span>
                            </div>
                          </div>
                          
                          {/* 削除ボタン */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteHistory(item.id);
                            }}
                            aria-label="履歴を削除"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>
    </div>
  );

  const resultsDisplayContent = (
    <div className="flex flex-col h-full p-6 space-y-4 relative">
      <h2 className="text-2xl font-semibold">生成結果</h2>
      <Separator />
      <div className="flex-grow space-y-4 overflow-auto">
        {/* T-03: 結果表示エリアのUI作成 */}
        <Card>
          <CardHeader>
            <CardTitle>最終編集エリア</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="final-title">最終タイトル</Label>
              <div className="flex space-x-2">
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    id="final-title"
                    placeholder="AIが生成したタイトル案"
                    value={finalTitle}
                    onChange={(e) => setFinalTitle(e.target.value)}
                  />
                )}
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(finalTitle)} disabled={!finalTitle}>コピー</Button>
              </div>
            </div>
            <div>
              <Label htmlFor="final-description">
                最終概要欄
                <span className={cn(
                  "ml-2 text-xs font-normal",
                  finalDescription.length > YOUTUBE_DESCRIPTION_LIMIT 
                    ? "text-red-400" 
                    : finalDescription.length > YOUTUBE_DESCRIPTION_LIMIT * 0.9 
                    ? "text-yellow-400" 
                    : "text-muted-foreground"
                )}>
                  ({finalDescription.length} / {YOUTUBE_DESCRIPTION_LIMIT})
                </span>
              </Label>
              <div className="flex space-x-2">
                {isLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <Textarea
                    id="final-description"
                    placeholder="AIが生成した概要欄"
                    value={finalDescription}
                    onChange={(e) => setFinalDescription(e.target.value)}
                    rows={8}
                    className="resize-y"
                  />
                )}
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText(finalDescription);
                  toast.success('概要欄をコピーしました');
                }} disabled={!finalDescription}>コピー</Button>
              </div>
            </div>
            
            {/* ハッシュタグ管理エリア（5.7対応） */}
            <div>
              <Label className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  ハッシュタグ
                </span>
                <span className={cn(
                  "text-xs font-normal",
                  hashtags.length > YOUTUBE_HASHTAG_RECOMMENDED_COUNT
                    ? "text-yellow-400"
                    : hashtags.length >= 10 && hashtags.length <= YOUTUBE_HASHTAG_RECOMMENDED_COUNT
                    ? "text-green-400"
                    : "text-muted-foreground"
                )}>
                  {hashtags.length} / {YOUTUBE_HASHTAG_RECOMMENDED_COUNT}（推奨: 10-15個）
                </span>
              </Label>
              
              {/* ハッシュタグ一覧 */}
              <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px] bg-muted/30 mb-2">
                {hashtags.length === 0 ? (
                  <div className="text-sm text-muted-foreground italic w-full text-center py-2">
                    ハッシュタグがありません
                  </div>
                ) : (
                  hashtags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1.5 px-2 py-1 text-sm group/hashtag"
                    >
                      <Hash className="h-3 w-3" />
                      {tag}
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 opacity-0 group-hover/hashtag:opacity-100 hover:bg-[#20B2AA]/20 hover:text-[#20B2AA] rounded-full transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveHashtagToFavorites(tag);
                          }}
                          aria-label={`${tag}をお気に入りに追加`}
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                          onClick={() => handleRemoveHashtag(tag)}
                          aria-label={`${tag}を削除`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </Badge>
                  ))
                )}
              </div>
              
              {/* ハッシュタグ追加・管理 */}
              <div className="space-y-2">
                {/* 新規ハッシュタグ入力 */}
                <div className="flex gap-2">
                  <Input
                    placeholder="ハッシュタグを入力（#は不要）"
                    value={newHashtagInput}
                    onChange={(e) => setNewHashtagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newHashtagInput.trim()) {
                        handleAddHashtag(newHashtagInput);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newHashtagInput.trim()) {
                        handleAddHashtag(newHashtagInput);
                      }
                    }}
                    disabled={!newHashtagInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* 候補提案とお気に入り */}
                <div className="flex gap-2 flex-wrap">
                  {/* 候補提案ボタン */}
                  {(() => {
                    const suggestions = suggestHashtags(keywords, videoTheme);
                    const availableSuggestions = suggestions.filter(s => !hashtags.includes(s));
                    return availableSuggestions.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">候補:</span>
                        {availableSuggestions.slice(0, 5).map((suggestion) => (
                          <Button
                            key={suggestion}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleAddHashtag(suggestion)}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    );
                  })()}
                  
                  {/* お気に入りハッシュタグ */}
                  {(() => {
                    const favorites = loadHashtagFavorites();
                    const availableFavorites = (favorites as string[]).filter((f: string) => !hashtags.includes(f));
                    return availableFavorites.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">お気に入り:</span>
                        {availableFavorites.slice(0, 5).map((favorite) => (
                          <Button
                            key={favorite}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleAddHashtag(favorite)}
                          >
                            <Star className="h-3 w-3 mr-1 fill-[#20B2AA] text-[#20B2AA]" />
                            {favorite}
                          </Button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                
                {/* プリセット */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">プリセット:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      const preset = ['VTuber', 'ゲーム実況', '実況', 'エンタメ'];
                      setHashtags(preset);
                      updateDescriptionHashtags(preset);
                    }}
                  >
                    ゲーム実況
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      const preset = ['VTuber', '歌枠', '歌ってみた', 'エンタメ'];
                      setHashtags(preset);
                      updateDescriptionHashtags(preset);
                    }}
                  >
                    歌枠
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      const preset = ['VTuber', 'コラボ', 'コラボ配信', 'エンタメ'];
                      setHashtags(preset);
                      updateDescriptionHashtags(preset);
                    }}
                  >
                    コラボ
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <h3 className="text-xl font-semibold">AI提案エリア</h3>
        {isLoading ? (
          <div className="space-y-4">
            <div className="w-full h-full bg-[#2D2D2D] rounded-md flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
              <Loader2 className="w-16 h-16 text-[#A0A0A0] mb-4 animate-spin" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-[#E0E0E0]">タイトルと概要欄を生成中...</h3>
              <p className="text-[#A0A0A0] mt-2">AIが最適なタイトルと概要欄を考えています。しばらくお待ちください。</p>
            </div>
            {/* ローディング中のスケルトン */}
            <div className="space-y-4" role="status" aria-label="タイトルと概要欄生成中">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>タイトル案</span>
                  {aiTitles.length > 0 && (
                    <span className="text-xs text-muted-foreground font-normal">
                      {aiTitles.filter(t => t.isFavorite).length > 0 && (
                        <Badge variant="outline" className="ml-2">
                          {aiTitles.filter(t => t.isFavorite).length}件お気に入り
                        </Badge>
                      )}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiTitles.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    タイトル案がありません
                  </div>
                ) : (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="title-options">
                      {(provided) => (
                        <div 
                          {...provided.droppableProps} 
                          ref={provided.innerRef} 
                          className="space-y-2"
                        >
                          {aiTitles.map((titleOption, index) => (
                            <Draggable 
                              key={titleOption.id} 
                              draggableId={titleOption.id} 
                              index={index}
                              isDragDisabled={titleOption.isFavorite} // お気に入りは固定
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={cn(
                                    "flex items-center gap-2 p-3 border rounded-md transition-all",
                                    titleOption.isFavorite 
                                      ? "bg-[#2D2D2D] border-[#20B2AA]/50" 
                                      : "hover:bg-accent/50",
                                    snapshot.isDragging && "shadow-lg opacity-90 bg-[#3A3A3A]",
                                    titleOption.isFavorite && "border-l-4 border-l-[#20B2AA]"
                                  )}
                                >
                                  {/* ドラッグハンドル */}
                                  {!titleOption.isFavorite && (
                                    <div
                                      {...provided.dragHandleProps}
                                      className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                                      aria-label="ドラッグして並び替え"
                                    >
                                      <GripVertical className="h-4 w-4" />
                                    </div>
                                  )}
                                  
                                  {/* お気に入りボタン */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                      "flex-shrink-0 h-8 w-8 p-0",
                                      titleOption.isFavorite && "text-[#20B2AA]"
                                    )}
                                    onClick={() => handleToggleFavorite(titleOption.id, titleOption.text)}
                                    aria-label={titleOption.isFavorite ? "お気に入りを解除" : "お気に入りに追加"}
                                  >
                                    <Star 
                                      className={cn(
                                        "h-4 w-4",
                                        titleOption.isFavorite ? "fill-[#20B2AA] text-[#20B2AA]" : ""
                                      )} 
                                    />
                                  </Button>
                                  
                                  {/* タイトルと分析情報 */}
                                  <div className="flex-1 min-w-0">
                                    {/* タイトルテキスト */}
                                    <span className={cn(
                                      "block text-sm mb-2",
                                      titleOption.isFavorite && "font-medium"
                                    )}>
                                      {titleOption.text}
                                    </span>
                                    
                                    {/* 分析情報（5.6対応） */}
                                    {(() => {
                                      const analysis = analyzeTitle(titleOption.text, keywords);
                                      return (
                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                          {/* 文字数表示 */}
                                          <div className="flex items-center gap-1">
                                            <span className={cn(
                                              "font-medium",
                                              analysis.isOverRecommended 
                                                ? "text-yellow-400" 
                                                : analysis.charCount >= 30 && analysis.charCount <= YOUTUBE_TITLE_RECOMMENDED_LENGTH
                                                ? "text-green-400"
                                                : "text-muted-foreground"
                                            )}>
                                              {analysis.charCount}文字
                                            </span>
                                            {analysis.isOverRecommended && (
                                              <AlertCircle className="h-3 w-3 text-yellow-400" />
                                            )}
                                            {analysis.charCount >= 30 && analysis.charCount <= YOUTUBE_TITLE_RECOMMENDED_LENGTH && (
                                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-green-400/50 text-green-400">
                                                推奨
                                              </Badge>
                                            )}
                                          </div>
                                          
                                          {/* キーワード含有率 */}
                                          {keywords.trim() && (
                                            <div className="flex items-center gap-1">
                                              <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                              <span className="text-muted-foreground">
                                                キーワード: {analysis.keywordCoverage}%
                                              </span>
                                              {analysis.keywordCoverage >= 50 && (
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-blue-400/50 text-blue-400">
                                                  高
                                                </Badge>
                                              )}
                                            </div>
                                          )}
                                          
                                          {/* 特徴タグ */}
                                          {analysis.features.length > 0 && (
                                            <div className="flex items-center gap-1 flex-wrap">
                                              {analysis.features.map((feature, idx) => (
                                                <Badge 
                                                  key={idx}
                                                  variant="secondary" 
                                                  className="text-[10px] px-1.5 py-0 h-4"
                                                >
                                                  {feature}
                                                </Badge>
                                              ))}
                                            </div>
                                          )}
                                          
                                          {/* 評価スコア */}
                                          <div className="flex items-center gap-1 ml-auto">
                                            <span className="text-muted-foreground">スコア:</span>
                                            <span className={cn(
                                              "font-semibold",
                                              analysis.score >= 80 
                                                ? "text-green-400"
                                                : analysis.score >= 60
                                                ? "text-yellow-400"
                                                : "text-red-400"
                                            )}>
                                              {analysis.score}
                                            </span>
                                            <span className="text-muted-foreground text-[10px]">/100</span>
                                            {/* 星評価 */}
                                            <div className="flex gap-0.5 ml-1">
                                              {[...Array(5)].map((_, i) => (
                                                <Star
                                                  key={i}
                                                  className={cn(
                                                    "h-2.5 w-2.5",
                                                    i < Math.round(analysis.score / 20)
                                                      ? "fill-yellow-400 text-yellow-400"
                                                      : "text-muted-foreground/30"
                                                  )}
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  
                                  {/* アクションボタン */}
                                  <div className="flex gap-2 flex-shrink-0">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleTitleSelect(titleOption.text)}
                                      aria-label={`タイトル案${index + 1}を選択`}
                                    >
                                      選択
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCopy(titleOption.text, titleOption.id)}
                                      aria-label={`タイトル案${index + 1}をコピー`}
                                    >
                                      {copiedItem === titleOption.id ? (
                                        <Check className="h-4 w-4 text-[#20B2AA]" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>概要欄</span>
                  <Tabs value={descriptionViewMode} onValueChange={(v) => setDescriptionViewMode(v as "edit" | "preview")} className="w-auto">
                    <TabsList className="h-8">
                      <TabsTrigger value="edit" className="text-xs px-3">
                        <Edit2 className="h-3 w-3 mr-1.5" />
                        編集
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="text-xs px-3">
                        <Eye className="h-3 w-3 mr-1.5" />
                        プレビュー
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={descriptionViewMode} onValueChange={(v) => setDescriptionViewMode(v as "edit" | "preview")}>
                  <TabsContent value="edit" className="space-y-2 mt-0">
                    {/* 文字数カウンター（5.5対応） */}
                    <div className="flex justify-end items-center gap-2 text-xs">
                      <span className={cn(
                        aiDescription.length > YOUTUBE_DESCRIPTION_LIMIT 
                          ? "text-red-400 font-semibold" 
                          : aiDescription.length > YOUTUBE_DESCRIPTION_LIMIT * 0.9 
                          ? "text-yellow-400" 
                          : "text-muted-foreground"
                      )}>
                        {aiDescription.length} / {YOUTUBE_DESCRIPTION_LIMIT}
                      </span>
                      {aiDescription.length > YOUTUBE_DESCRIPTION_LIMIT && (
                        <Badge variant="destructive" className="text-xs">制限超過</Badge>
                      )}
                    </div>
                    
                    {/* 編集可能なテキストエリア（5.5対応） */}
                    <Textarea
                      value={aiDescription}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setAiDescription(newValue);
                        // 同時にfinalDescriptionにも反映
                        setFinalDescription(newValue);
                      }}
                      placeholder="AIが生成した概要欄（編集可能）"
                      rows={12}
                      className="resize-y font-mono text-sm"
                    />
                  </TabsContent>
                  
                  <TabsContent value="preview" className="mt-0">
                    {/* リアルタイムプレビュー（YouTube概要欄風）（5.5対応） */}
                    <div className="border rounded-lg p-4 bg-[#0F0F0F] min-h-[200px]">
                      {aiDescription ? (
                        <div className="text-sm text-white whitespace-pre-wrap font-sans leading-relaxed">
                          {aiDescription.split('\n').map((line, index) => {
                            // セクション検出（【】で囲まれた見出し）
                            const sectionMatch = line.match(/^【(.+?)】/);
                            if (sectionMatch) {
                              const sectionName = sectionMatch[1];
                              return (
                                <div key={index} className="mb-3">
                                  <div className="text-[#20B2AA] font-semibold mb-1">
                                    【{sectionName}】
                                  </div>
                                  <div className="text-gray-300 ml-2">
                                    {line.replace(/^【.+?】/, '').trim() || '\u00A0'}
                                  </div>
                                </div>
                              );
                            }
                            
                            // ハッシュタグ検出
                            if (line.includes('#') || line.trim().startsWith('#')) {
                              return (
                                <div key={index} className="mb-2 text-[#3EA6FF]">
                                  {line}
                                </div>
                              );
                            }
                            
                            // タイムスタンプ検出（00:00形式）
                            if (line.match(/^\d{1,2}:\d{2}/)) {
                              return (
                                <div key={index} className="mb-1 text-[#3EA6FF] font-medium">
                                  {line}
                                </div>
                              );
                            }
                            
                            // 通常のテキスト
                            return (
                              <div key={index} className="mb-1 text-gray-300">
                                {line || '\u00A0'}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm italic">
                          概要欄がありません
                        </div>
                      )}
                    </div>
                    
                    {/* 文字数カウンター（プレビューでも表示） */}
                    <div className="flex justify-end items-center gap-2 text-xs mt-2">
                      <span className={cn(
                        aiDescription.length > YOUTUBE_DESCRIPTION_LIMIT 
                          ? "text-red-400 font-semibold" 
                          : aiDescription.length > YOUTUBE_DESCRIPTION_LIMIT * 0.9 
                          ? "text-yellow-400" 
                          : "text-muted-foreground"
                      )}>
                        {aiDescription.length} / {YOUTUBE_DESCRIPTION_LIMIT}
                      </span>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col lg:flex-row lg:h-screen">
      {isDesktop ? (
        <>
          {/* 左側: 入力フォーム（50%） */}
          <aside className="w-full lg:w-1/2 border-r border-[#4A4A4A] bg-[#1A1A1A] overflow-y-auto">
            {controlPanelContent}
          </aside>

          {/* 右側: 生成結果（50%） */}
          <main className="w-full lg:w-1/2 p-4 bg-[#1A1A1A] overflow-y-auto">
            {resultsDisplayContent}
          </main>
        </>
      ) : (
        <div className="border-b bg-background p-4">
          <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">設定</TabsTrigger>
              <TabsTrigger value="results">結果</TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="flex-grow overflow-auto">
              {controlPanelContent}
            </TabsContent>
            <TabsContent value="results" className="flex-grow overflow-auto">
              {resultsDisplayContent}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}