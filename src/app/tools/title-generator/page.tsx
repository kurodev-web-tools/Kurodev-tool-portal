"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Copy, Check, Star, GripVertical, Edit2, Eye, TrendingUp, AlertCircle, Hash, X, Plus, Sparkles, FileCode, Save, RefreshCw, Wand2, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { DropResult } from "@hello-pangea/dnd";
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
import { logger } from "@/lib/logger";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTitleHistory } from "./hooks/useTitleHistory";
import { TitleHistoryList } from "./components/TitleHistoryList";
import { TitleInputForm } from "./components/TitleInputForm";
import { TitleResultsDisplay } from "./components/TitleResultsDisplay";
import { useTitleForm } from "./hooks/useTitleForm";
import { useTitleGeneration } from "./hooks/useTitleGeneration";
import { useHashtagManagement } from "./hooks/useHashtagManagement";
import { useDescriptionTemplate } from "./hooks/useDescriptionTemplate";
import { STORAGE_KEYS } from "./types/storage";
import type {
  TitleGenerationFormValues,
  GenerationHistoryEntry,
  TitleOption,
} from "@/types/title-generator";
export default function TitleGeneratorPage() {
  const { isDesktop } = useSidebar({
    defaultOpen: true,
    desktopDefaultOpen: true,
  });
  const [activeTab, setActiveTab] = useState("settings"); // モバイル用タブの状態
  const [leftPanelTab, setLeftPanelTab] = useState("input"); // 左サイドバーのタブ（入力/履歴）
  const [descriptionViewMode, setDescriptionViewMode] = useState<"edit" | "preview">("edit"); // 概要欄の表示モード（5.5対応）
  const [finalTitle, setFinalTitle] = useState(""); // 最終タイトル
  const [finalDescription, setFinalDescription] = useState(""); // 最終概要欄
  const [aiTitles, setAiTitles] = useState<TitleOption[]>([]); // AI提案タイトル案
  const [aiDescription, setAiDescription] = useState(""); // AI提案概要欄
  const [copiedItem, setCopiedItem] = useState<string | null>(null); // コピー状態
  const {
    history,
    addHistory,
    removeHistory,
    clearHistory,
    isHydrated: isHistoryHydrated,
  } = useTitleHistory();
  
  // フックを使用
  const {
    isLoading,
    isRegeneratingTitles,
    isRegeneratingDescription,
    regeneratingTitleId,
    generateTitles: generateTitlesHook,
    generateDescription: generateDescriptionHook,
    regenerateTitlesOnly,
    regenerateDescriptionOnly,
    regenerateSingleTitle,
    generateVariantFromTitle,
    generateAll,
  } = useTitleGeneration();
  
  const {
    hashtags,
    setHashtags: setHashtagsSafely,
    newHashtagInput,
    setNewHashtagInput,
    addHashtag: handleAddHashtag,
    removeHashtag: handleRemoveHashtag,
    saveHashtagToFavorites: handleSaveHashtagToFavorites,
    loadHashtagFavorites,
    suggestHashtags,
    extractHashtagsFromDescription,
    updateDescriptionHashtags: updateDescriptionHashtagsHook,
    initializeHashtagsFromDescription,
  } = useHashtagManagement();
  
  const {
    presetTemplates,
    customTemplates,
    allTemplates,
    selectedTemplateId,
    setSelectedTemplateId,
    selectedTemplate,
    showTemplatePreview,
    setShowTemplatePreview,
    applyTemplate: applyTemplateHook,
    addCustomTemplate,
    updateCustomTemplate,
    deleteCustomTemplate,
  } = useDescriptionTemplate();
  
  // 定数
  const YOUTUBE_DESCRIPTION_LIMIT = 5000; // YouTube概要欄の文字数制限（5.5対応）
  const YOUTUBE_TITLE_RECOMMENDED_LENGTH = 60; // YouTubeタイトルの推奨文字数（5.6対応）
  const YOUTUBE_HASHTAG_RECOMMENDED_COUNT = 15; // YouTubeハッシュタグの推奨数（5.7対応）
  const DEFAULT_HASHTAGS = ['VTuber', 'ゲーム実況', '新作ゲーム', '実況', 'エンタメ'];

  // フォーム状態管理フックを使用
  const {
    form,
    register,
    watch,
    getValues,
    reset,
    validateForm,
    loadFromHistory: loadFormFromHistory,
    getFieldState,
    isClient,
        videoTheme,
        keywords,
        targetAudience,
        videoMood,
    videoThemeError,
    keywordsError,
    targetAudienceError,
    videoMoodError,
  } = useTitleForm();

  // 履歴からの読み込み
  const loadFromHistory = useCallback((historyItem: GenerationHistoryEntry) => {
    setAiTitles(historyItem.titles);
    setAiDescription(historyItem.description);
    setFinalDescription(historyItem.description);
    if (historyItem.titles.length > 0) {
      setFinalTitle(historyItem.titles[0].text);
    }
    
    // 入力フォームも復元
    loadFormFromHistory(historyItem.inputData);
    
    // 左サイドバーを入力タブに切り替え
    setLeftPanelTab('input');
    
    toast.success('履歴から読み込みました');
  }, [loadFormFromHistory]);

  const handleRemoveHistory = useCallback(
    (id: string) => {
      removeHistory(id);
    },
    [removeHistory],
  );

  // テンプレート適用のラッパー関数
  const applyTemplate = useCallback((templateId: string) => {
    applyTemplateHook(
      templateId,
      videoTheme,
      hashtags,
      generateDescriptionHook,
      extractHashtagsFromDescription,
      (description: string) => {
        setAiDescription(description);
        setFinalDescription(description);
      },
      setHashtagsSafely,
    );
  }, [videoTheme, hashtags, generateDescriptionHook, extractHashtagsFromDescription, setHashtagsSafely, applyTemplateHook]);

  // タイトルのみ再生成（5.10対応）
  const handleGenerateTitlesOnly = useCallback(async () => {
    const formValues = getValues();
    await regenerateTitlesOnly(formValues, hashtags, (titles) => {
      setAiTitles(titles);
      if (titles.length > 0) {
        setFinalTitle(titles[0].text);
      }
    });
  }, [regenerateTitlesOnly, hashtags, getValues]);

  // 概要欄のみ再生成（5.10対応）
  const handleGenerateDescriptionOnly = useCallback(async () => {
    regenerateDescriptionOnly(selectedTemplate, videoTheme, hashtags, (description) => {
      setAiDescription(description);
      setFinalDescription(description);
      const extracted = extractHashtagsFromDescription(description);
      if (extracted.length > 0) {
        setHashtagsSafely(extracted);
      }
    });
  }, [regenerateDescriptionOnly, selectedTemplate, videoTheme, hashtags, extractHashtagsFromDescription, setHashtagsSafely]);

  // 個別タイトル案の再生成（5.10対応）
  const handleRegenerateSingleTitle = useCallback((titleId: string, currentText: string) => {
    regenerateSingleTitle(titleId, currentText, (id, newText) => {
      setAiTitles(prev => prev.map(title => 
        title.id === id 
          ? { ...title, text: newText }
          : title
      ));
    });
  }, [regenerateSingleTitle]);

  // タイトル案ベースで別パターンを生成（5.10対応）
  const handleGenerateVariantFromTitle = useCallback(async (baseTitleText: string) => {
    const formValues = getValues();
    await generateVariantFromTitle(baseTitleText, formValues, hashtags, aiTitles, (newTitles) => {
      setAiTitles(newTitles);
    });
  }, [generateVariantFromTitle, getValues, hashtags, aiTitles]);

  // T-04: フロントエンド内でのUIロジック実装
  const handleGenerateClick = useCallback(async () => {
    const isValid = await validateForm();
    if (!isValid) {
      const fields: (keyof TitleGenerationFormValues)[] = [
        "videoTheme",
        "keywords",
        "targetAudience",
        "videoMood",
      ];
      let message: string | undefined;
      for (const field of fields) {
        const fieldState = getFieldState(field);
        if (fieldState.error?.message) {
          message = fieldState.error.message as string;
          break;
        }
      }
      const [primary] = (message ?? "入力内容を確認してください").split("|");
      toast.error("入力エラー", {
        description: primary,
      });
      return;
    }
    
    const formValues = getValues();

    await generateAll(formValues, hashtags, selectedTemplate, DEFAULT_HASHTAGS, (result) => {
      const nextHashtags =
        hashtags.length > 0
          ? hashtags
          : result.recommendedHashtags.length > 0
            ? result.recommendedHashtags
            : DEFAULT_HASHTAGS;

      if (hashtags.length === 0) {
        setHashtagsSafely(nextHashtags);
      }

      setAiTitles(result.titles);
      setAiDescription(result.description);
      if (result.titles.length > 0) {
        setFinalTitle(result.titles[0].text);
      }
      setFinalDescription(result.description);
      
      const historyEntry: GenerationHistoryEntry = {
        id: `history-${Date.now()}`,
        timestamp: Date.now(),
        titles: result.titles,
        description: result.description,
        inputData: formValues,
      };
      addHistory(historyEntry);
      
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(STORAGE_KEYS.INPUT_DRAFT);
        } catch (err) {
          console.error("一時保存クリア失敗", err);
        }
      }
      
      if (!isDesktop) {
        setActiveTab("results");
      }
    });
  }, [addHistory, generateAll, getFieldState, getValues, hashtags, isDesktop, selectedTemplate, setHashtagsSafely, validateForm]);

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

  // 概要欄更新のラッパー関数（aiDescriptionとfinalDescriptionの両方を更新）
  const updateDescriptionHashtagsWrapper = useCallback((newHashtags: string[]) => {
    updateDescriptionHashtagsHook(newHashtags, aiDescription, setAiDescription);
    updateDescriptionHashtagsHook(newHashtags, finalDescription, setFinalDescription);
  }, [aiDescription, finalDescription, updateDescriptionHashtagsHook]);

  // ハッシュタグの追加（ラッパー）
  const handleAddHashtagWrapper = useCallback((tag: string) => {
    const trimmedTag = tag.trim().replace(/^#/, '');
    if (!trimmedTag || hashtags.includes(trimmedTag)) return;
    
    const newHashtags = [...hashtags, trimmedTag];
    handleAddHashtag(tag);
    updateDescriptionHashtagsWrapper(newHashtags);
  }, [hashtags, handleAddHashtag, updateDescriptionHashtagsWrapper]);

  // ハッシュタグの削除（ラッパー）
  const handleRemoveHashtagWrapper = useCallback((tag: string) => {
    const newHashtags = hashtags.filter(t => t !== tag);
    handleRemoveHashtag(tag);
    updateDescriptionHashtagsWrapper(newHashtags);
  }, [hashtags, handleRemoveHashtag, updateDescriptionHashtagsWrapper]);

  // 概要欄からハッシュタグを抽出（初回読み込み時）
  useEffect(() => {
    if (aiDescription) {
      initializeHashtagsFromDescription(aiDescription);
    }
  }, [aiDescription, initializeHashtagsFromDescription]);

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
    <div className="flex flex-col h-full p-4 sm:p-6 space-y-4 relative">
      <Tabs value={leftPanelTab} onValueChange={setLeftPanelTab} className="flex-1 flex flex-col min-w-0">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="input">入力</TabsTrigger>
          <TabsTrigger value="history">
            履歴
            {isHistoryHydrated && history.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {history.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="input" className="flex-1 space-y-4 md:overflow-auto mt-0">
          <TitleInputForm
            form={form}
            videoTheme={videoTheme}
            keywords={keywords}
            targetAudience={targetAudience}
            videoMood={videoMood}
            videoThemeError={videoThemeError}
            keywordsError={keywordsError}
            targetAudienceError={targetAudienceError}
            videoMoodError={videoMoodError}
            isLoading={isLoading}
            onGenerate={handleGenerateClick}
          />
        </TabsContent>
        
        <TabsContent value="history" className="flex-1 space-y-4 md:overflow-auto mt-0">
          <TitleHistoryList
            items={history}
            onSelect={loadFromHistory}
            onDelete={handleRemoveHistory}
            onClear={clearHistory}
            isHydrated={isHistoryHydrated}
          />
      </TabsContent>
      </Tabs>
    </div>
  );

  const resultsDisplayContent = (
    <TitleResultsDisplay
      isLoading={isLoading}
      isRegeneratingTitles={isRegeneratingTitles}
      isRegeneratingDescription={isRegeneratingDescription}
      onRegenerateTitles={handleGenerateTitlesOnly}
      onRegenerateDescription={handleGenerateDescriptionOnly}
      finalTitle={finalTitle}
      finalDescription={finalDescription}
      onFinalTitleChange={setFinalTitle}
      onFinalDescriptionChange={setFinalDescription}
      presetTemplates={presetTemplates}
      customTemplates={customTemplates}
      selectedTemplateId={selectedTemplateId}
      showTemplatePreview={showTemplatePreview}
      onSelectedTemplateIdChange={setSelectedTemplateId}
      onShowTemplatePreviewChange={setShowTemplatePreview}
      onApplyTemplate={applyTemplate}
      hashtags={hashtags}
      newHashtagInput={newHashtagInput}
      keywords={keywords}
      videoTheme={videoTheme}
      isClient={isClient}
      onNewHashtagInputChange={setNewHashtagInput}
      onAddHashtag={handleAddHashtagWrapper}
      onRemoveHashtag={handleRemoveHashtagWrapper}
      onSaveHashtagToFavorites={handleSaveHashtagToFavorites}
      onLoadHashtagFavorites={loadHashtagFavorites}
      onSuggestHashtags={suggestHashtags}
      onSetHashtags={setHashtagsSafely}
      onUpdateDescriptionHashtags={updateDescriptionHashtagsWrapper}
      aiTitles={aiTitles}
      aiDescription={aiDescription}
      descriptionViewMode={descriptionViewMode}
      onDescriptionViewModeChange={setDescriptionViewMode}
      onAiDescriptionChange={(value) => {
        setAiDescription(value);
        setFinalDescription(value);
      }}
      copiedItem={copiedItem}
      regeneratingTitleId={regeneratingTitleId}
      onDragEnd={onDragEnd}
      onToggleFavorite={handleToggleFavorite}
      onTitleSelect={handleTitleSelect}
      onCopy={handleCopy}
      onRegenerateSingleTitle={handleRegenerateSingleTitle}
      onGenerateVariant={handleGenerateVariantFromTitle}
    />
  );

  return (
    <div className="h-full flex flex-col md:flex-row md:h-screen">
      {/* デスクトップ・タブレット表示（横並び） */}
      <div className="hidden md:flex md:flex-row w-full h-full">
        {/* 左側: 入力フォーム */}
        <aside className="w-full md:w-72 lg:w-80 xl:w-96 border-r border-[#4A4A4A] bg-[#1A1A1A] overflow-y-auto">
          {controlPanelContent}
        </aside>

        {/* 右側: 生成結果 */}
        <main className="flex-1 p-3 sm:p-4 bg-[#1A1A1A] overflow-y-auto">
          {resultsDisplayContent}
        </main>
      </div>

      {/* モバイル表示（タブ切り替え） */}
      <div className="w-full h-[calc(100vh-4.1rem)] flex flex-col overflow-y-auto md:hidden">
        <div className="bg-background flex-shrink-0">
          <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
            <div className="px-2 pt-2 pb-0">
              <TabsList className="grid w-full grid-cols-2 border-b border-[#4A4A4A] rounded-none bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="settings"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-[#00D4FF] data-[state=active]:text-[#00D4FF] px-2 py-2 relative"
                >
                  設定
                </TabsTrigger>
                <TabsTrigger 
                  value="results"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-[#00D4FF] data-[state=active]:text-[#00D4FF] px-2 py-2 relative"
                >
                  結果
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
          <TabsContent value="settings" className="flex-1 mt-0">
            {controlPanelContent}
          </TabsContent>
          <TabsContent value="results" className="flex-1 mt-0">
            {resultsDisplayContent}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}