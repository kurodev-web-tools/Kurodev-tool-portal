"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Copy, Check, Star, GripVertical, Edit2, Eye, TrendingUp, AlertCircle, Hash, X, Plus, Sparkles, FileCode, Save, RefreshCw, Wand2, MoreVertical } from "lucide-react";
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
import { generateTitleIdeas } from "@/services/aiClient";
import type { TitleGenerationRequest } from "@/types/ai";
import { TagButtonGroup } from "@/components/shared/TagButtonGroup";
import { useTitleHistory } from "./hooks/useTitleHistory";
import { TitleHistoryList } from "./components/TitleHistoryList";
import { TitleInputForm } from "./components/TitleInputForm";
import { TitleResultsDisplay } from "./components/TitleResultsDisplay";
import { useTitleForm } from "./hooks/useTitleForm";
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
  const [isLoading, setIsLoading] = useState(false); // ローディング状態
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
  const [hashtags, setHashtags] = useState<string[]>([]); // ハッシュタグリスト（5.7対応）
  const setHashtagsSafely = useCallback((next: string[]) => {
    if (next.length === 0) return;
    setHashtags(prev => {
      if (prev.length === next.length && prev.every((tag, index) => tag === next[index])) {
        return prev;
      }
      return next;
    });
  }, []);
  const [newHashtagInput, setNewHashtagInput] = useState(""); // 新規ハッシュタグ入力（5.7対応）
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("default"); // 選択中のテンプレート（5.8対応）
  const [showTemplatePreview, setShowTemplatePreview] = useState(false); // テンプレートプレビュー表示（5.8対応）
  const [isRegeneratingTitles, setIsRegeneratingTitles] = useState(false); // タイトルのみ再生成中（5.10対応）
  const [isRegeneratingDescription, setIsRegeneratingDescription] = useState(false); // 概要欄のみ再生成中（5.10対応）
  const [regeneratingTitleId, setRegeneratingTitleId] = useState<string | null>(null); // 個別タイトル再生成中（5.10対応）
  
  // 概要欄テンプレートのデータ構造（5.8対応）
  interface TemplateSection {
    type: 'summary' | 'timestamp' | 'related' | 'hashtag' | 'sns' | 'setlist' | 'guest' | 'custom';
    title?: string;
    content: string;
    enabled: boolean;
    order: number;
  }
  
  interface DescriptionTemplate {
    id: string;
    name: string;
    description: string;
    sections: TemplateSection[];
    isCustom?: boolean;
  }
  
  // ローカルストレージキー
  const FAVORITES_STORAGE_KEY = 'title-generator-favorites';
  const INPUT_STORAGE_KEY = 'title-generator-input-draft'; // 入力内容の一時保存（5.4対応）
  const HASHTAG_FAVORITES_STORAGE_KEY = 'title-generator-hashtag-favorites'; // ハッシュタグのお気に入り（5.7対応）
  const DESCRIPTION_TEMPLATES_STORAGE_KEY = 'title-generator-description-templates'; // 概要欄テンプレート（5.8対応）
  const AUTO_SAVE_DELAY = 1000; // 自動保存の遅延時間（ミリ秒）
  const YOUTUBE_DESCRIPTION_LIMIT = 5000; // YouTube概要欄の文字数制限（5.5対応）
  const YOUTUBE_TITLE_RECOMMENDED_LENGTH = 60; // YouTubeタイトルの推奨文字数（5.6対応）
  const YOUTUBE_HASHTAG_RECOMMENDED_COUNT = 15; // YouTubeハッシュタグの推奨数（5.7対応）
  const DEFAULT_HASHTAGS = ['VTuber', 'ゲーム実況', '新作ゲーム', '実況', 'エンタメ'];
  
  const { handleAsyncError } = useErrorHandler();

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

  // プリセットテンプレート定義（5.8対応）
  const presetTemplates: DescriptionTemplate[] = [
    {
      id: 'default',
      name: 'デフォルト',
      description: '標準的な構成（概要、タイムスタンプ、関連動画、ハッシュタグ、SNS）',
      sections: [
        { type: 'summary', content: 'この動画では、{videoTheme}について詳しく解説しています。', enabled: true, order: 1 },
        { type: 'timestamp', title: 'タイムスタンプ', content: '00:00 オープニング\n02:30 本編開始\n15:45 まとめ', enabled: true, order: 2 },
        { type: 'related', title: '関連動画', content: '・前回の動画: [リンク]\n・次回予告: [リンク]', enabled: true, order: 3 },
        { type: 'hashtag', title: 'ハッシュタグ', content: '{hashtags}', enabled: true, order: 4 },
        { type: 'sns', title: 'SNS', content: 'Twitter: @your_twitter\nInstagram: @your_instagram', enabled: true, order: 5 },
      ],
    },
    {
      id: 'game-streaming',
      name: 'ゲーム実況用',
      description: 'ゲーム実況向けの構成（概要、タイムスタンプ、ハッシュタグ）',
      sections: [
        { type: 'summary', content: 'この動画では、{videoTheme}を実況プレイしています。', enabled: true, order: 1 },
        { type: 'timestamp', title: 'タイムスタンプ', content: '00:00 オープニング\n02:30 ゲーム開始\n20:00 ハイライト', enabled: true, order: 2 },
        { type: 'hashtag', title: 'ハッシュタグ', content: '{hashtags}', enabled: true, order: 3 },
        { type: 'sns', title: 'SNS', content: 'Twitter: @your_twitter', enabled: true, order: 4 },
      ],
    },
    {
      id: 'singing-stream',
      name: '歌枠用',
      description: '歌枠向けの構成（概要、セットリスト、ハッシュタグ）',
      sections: [
        { type: 'summary', content: 'この動画では、{videoTheme}を歌わせていただきました！', enabled: true, order: 1 },
        { type: 'setlist', title: 'セットリスト', content: '1. [曲名1]\n2. [曲名2]\n3. [曲名3]', enabled: true, order: 2 },
        { type: 'hashtag', title: 'ハッシュタグ', content: '{hashtags}', enabled: true, order: 3 },
        { type: 'sns', title: 'SNS', content: 'Twitter: @your_twitter', enabled: true, order: 4 },
      ],
    },
    {
      id: 'collaboration',
      name: 'コラボ用',
      description: 'コラボ配信向けの構成（概要、ゲスト情報、タイムスタンプ、ハッシュタグ）',
      sections: [
        { type: 'summary', content: 'この動画では、{videoTheme}をコラボ配信しました！', enabled: true, order: 1 },
        { type: 'guest', title: 'ゲスト', content: 'ゲスト: [ゲスト名]\nチャンネル: [チャンネルリンク]', enabled: true, order: 2 },
        { type: 'timestamp', title: 'タイムスタンプ', content: '00:00 オープニング\n05:00 本編開始', enabled: true, order: 3 },
        { type: 'hashtag', title: 'ハッシュタグ', content: '{hashtags}', enabled: true, order: 4 },
        { type: 'sns', title: 'SNS', content: 'Twitter: @your_twitter', enabled: true, order: 5 },
      ],
    },
    {
      id: 'simple',
      name: 'シンプル',
      description: 'シンプルな構成（概要、ハッシュタグのみ）',
      sections: [
        { type: 'summary', content: '{videoTheme}', enabled: true, order: 1 },
        { type: 'hashtag', title: 'ハッシュタグ', content: '{hashtags}', enabled: true, order: 2 },
      ],
    },
  ];

  // カスタムテンプレートの読み込み（5.8対応）
  const [customTemplates, setCustomTemplates] = useState<DescriptionTemplate[]>([]);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(DESCRIPTION_TEMPLATES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCustomTemplates(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      console.error('カスタムテンプレート読み込み失敗', err);
    }
  }, []);

  // テンプレート一覧（プリセット + カスタム）
  const allTemplates = useMemo(() => [...presetTemplates, ...customTemplates], [customTemplates]);

  // テンプレートから概要欄を生成（5.8対応）
  const generateDescriptionFromTemplate = useCallback((template: DescriptionTemplate) => {
    const sortedSections = [...template.sections]
      .filter(s => s.enabled)
      .sort((a, b) => a.order - b.order);
    
    let description = '';
    
    sortedSections.forEach((section, index) => {
      let sectionContent = section.content;
      
      // プレースホルダーの置換
      sectionContent = sectionContent.replace(/{videoTheme}/g, videoTheme || '[動画のテーマ]');
      sectionContent = sectionContent.replace(/{hashtags}/g, hashtags.length > 0 
        ? hashtags.map(tag => `#${tag}`).join(' ') 
        : '#VTuber #エンタメ');
      
      if (section.type === 'hashtag') {
        // ハッシュタグセクションは特別処理（ハッシュタグ管理と連携）
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
  }, [videoTheme, hashtags]);

  const extractHashtagsFromDescription = useCallback((description: string): string[] => {
    const hashtagSection = description.match(/【ハッシュタグ】\s*\n([\s\S]*?)(?=\n【|$)/);
    if (!hashtagSection) return [];

    const hashtagLine = hashtagSection[1].trim();
    const matches = hashtagLine.match(/#([\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)/g);
    if (!matches) return [];

    return matches.map(tag => tag.replace('#', ''));
  }, []);

  // テンプレートを適用（5.8対応）
  const applyTemplate = useCallback((templateId: string) => {
    if (templateId === selectedTemplateId) return;

    const template = allTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    const generated = generateDescriptionFromTemplate(template);
    setAiDescription(generated);
    setFinalDescription(generated);
    setSelectedTemplateId(templateId);
    
    const extracted = extractHashtagsFromDescription(generated);
    if (extracted.length > 0) {
      setHashtagsSafely(extracted);
    }
    
    toast.success(`「${template.name}」テンプレートを適用しました`);
  }, [allTemplates, extractHashtagsFromDescription, generateDescriptionFromTemplate, selectedTemplateId, setHashtagsSafely]);

  const getSavedFavoriteTitles = useCallback(() => {
    if (typeof window === 'undefined') {
      return new Set<string>();
    }
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  }, []);

  // タイトル生成用の共通関数
  const generateTitles = useCallback(
    async (baseTitle?: string): Promise<{ titles: TitleOption[]; recommendedHashtags: string[] }> => {
    const request: TitleGenerationRequest = {
      videoTheme,
      keywords,
      targetAudience,
      mood: videoMood,
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
        ...mapped.filter(title => title.isFavorite),
        ...mapped.filter(title => !title.isFavorite),
      ];

      return {
        titles: sorted,
        recommendedHashtags: response.recommendedHashtags,
      };
    },
    [videoTheme, keywords, targetAudience, videoMood, hashtags, getSavedFavoriteTitles],
  );

  // 概要欄生成用の共通関数（5.10対応）
  const generateDescription = useCallback((overrideHashtags?: string[]): string => {
    // 選択中のテンプレートから概要欄を生成（5.8対応）
    const selectedTemplate = allTemplates.find(t => t.id === selectedTemplateId) || presetTemplates[0];
    
    // ハッシュタグが未設定の場合はデフォルトを設定（5.7対応）
    const activeHashtags = overrideHashtags ?? hashtags;
    const currentHashtags = activeHashtags.length > 0 ? activeHashtags : DEFAULT_HASHTAGS;
    
    // テンプレートから概要欄を生成
    return generateDescriptionFromTemplate({
      ...selectedTemplate,
      sections: selectedTemplate.sections.map(s => 
        s.type === 'hashtag' 
          ? { ...s, content: currentHashtags.map(tag => `#${tag}`).join(' ') }
          : s
      ),
    });
  }, [allTemplates, selectedTemplateId, presetTemplates, hashtags, generateDescriptionFromTemplate]);

  // タイトルのみ再生成（5.10対応）
  const handleGenerateTitlesOnly = useCallback(async () => {
    if (!videoTheme.trim()) {
      toast.error('入力エラー', {
        description: '動画のテーマ・内容を入力してください'
      });
      return;
    }

    setIsRegeneratingTitles(true);
    
    try {
      const { titles } = await generateTitles();
      setAiTitles(titles);
      
      // 最初のタイトル案を自動選択
      if (titles.length > 0) {
        setFinalTitle(titles[0].text);
      }
      
      toast.success('タイトルを再生成しました');
    } catch (err) {
      logger.error('タイトル再生成失敗', err, 'TitleGenerator');
      toast.error('タイトルの再生成に失敗しました');
    } finally {
      setIsRegeneratingTitles(false);
    }
  }, [videoTheme, generateTitles]);

  // 概要欄のみ再生成（5.10対応）
  const handleGenerateDescriptionOnly = useCallback(async () => {
    if (!videoTheme.trim()) {
      toast.error('入力エラー', {
        description: '動画のテーマ・内容を入力してください'
      });
      return;
    }

    setIsRegeneratingDescription(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // ダミーの待機時間
      
      const newDescription = generateDescription();
      setAiDescription(newDescription);
      setFinalDescription(newDescription);
      
      // ハッシュタグを抽出して設定
      const extracted = extractHashtagsFromDescription(newDescription);
      if (extracted.length > 0) {
        setHashtagsSafely(extracted);
      }
      
      toast.success('概要欄を再生成しました');
    } catch (err) {
      logger.error('概要欄再生成失敗', err, 'TitleGenerator');
      toast.error('概要欄の再生成に失敗しました');
    } finally {
      setIsRegeneratingDescription(false);
    }
  }, [videoTheme, generateDescription, extractHashtagsFromDescription, setHashtagsSafely]);

  // 個別タイトル案の再生成（5.10対応）
  const handleRegenerateSingleTitle = useCallback(async (titleId: string, currentText: string) => {
    setRegeneratingTitleId(titleId);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // ダミーの待機時間
      
      // 個別タイトル生成（ダミーデータ）
      const variants = [
        currentText.replace('【初見】', '【実況】'),
        currentText.replace('挑戦', '攻略'),
        currentText + '【衝撃の結末】',
      ];
      const newText = variants[Math.floor(Math.random() * variants.length)];
      
      setAiTitles(prev => prev.map(title => 
        title.id === titleId 
          ? { ...title, text: newText }
          : title
      ));
      
      toast.success('タイトル案を再生成しました');
    } catch (err) {
      logger.error('個別タイトル再生成失敗', err, 'TitleGenerator');
      toast.error('タイトル案の再生成に失敗しました');
    } finally {
      setRegeneratingTitleId(null);
    }
  }, []);

  // タイトル案ベースで別パターンを生成（5.10対応）
  const handleGenerateVariantFromTitle = useCallback(async (baseTitleText: string) => {
    setIsRegeneratingTitles(true);
    
    try {
      const { titles: newTitles } = await generateTitles(baseTitleText);
      
      // 既存のタイトルに追加（お気に入りを維持）
      setAiTitles(prev => {
        const existingTexts = new Set(prev.map(t => t.text));
        const filteredNew = newTitles.filter(t => !existingTexts.has(t.text));
        return [
          ...prev.filter(t => t.isFavorite),
          ...filteredNew,
          ...prev.filter(t => !t.isFavorite && !existingTexts.has(t.text)),
        ];
      });
      
      toast.success('別パターンを生成しました');
    } catch (err) {
      logger.error('別パターン生成失敗', err, 'TitleGenerator');
      toast.error('別パターンの生成に失敗しました');
    } finally {
      setIsRegeneratingTitles(false);
    }
  }, [generateTitles]);

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
    
    const { videoTheme, keywords, targetAudience, videoMood } = getValues();

    setIsLoading(true);
    
    await handleAsyncError(async () => {
      const { titles: sortedTitles, recommendedHashtags } = await generateTitles();

      const nextHashtags =
        hashtags.length > 0
          ? hashtags
          : recommendedHashtags.length > 0
            ? recommendedHashtags
            : DEFAULT_HASHTAGS;

      if (hashtags.length === 0) {
        setHashtagsSafely(nextHashtags);
      }

      const generatedDescription = generateDescription(nextHashtags);

      setAiTitles(sortedTitles);
      setAiDescription(generatedDescription);
      if (sortedTitles.length > 0) {
        setFinalTitle(sortedTitles[0].text);
      }
      setFinalDescription(generatedDescription);
      
      const historyEntry: GenerationHistoryEntry = {
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
      addHistory(historyEntry);
      
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(INPUT_STORAGE_KEY);
        } catch (err) {
          console.error("一時保存クリア失敗", err);
        }
      }
      
      if (!isDesktop) {
        setActiveTab("results");
      }
    }, "生成中にエラーが発生しました");
    
    setIsLoading(false);
  }, [addHistory, generateDescription, generateTitles, getFieldState, getValues, handleAsyncError, hashtags.length, isDesktop, setHashtagsSafely, validateForm]);

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

  // ハッシュタグの更新処理（5.7対応）
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
    setHashtagsSafely(newHashtags);
    updateDescriptionHashtags(newHashtags);
    setNewHashtagInput("");
  }, [hashtags, setHashtagsSafely, updateDescriptionHashtags]);

  // ハッシュタグの削除
  const handleRemoveHashtag = useCallback((tag: string) => {
    const newHashtags = hashtags.filter(t => t !== tag);
    setHashtagsSafely(newHashtags);
    updateDescriptionHashtags(newHashtags);
  }, [hashtags, setHashtagsSafely, updateDescriptionHashtags]);

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
        setHashtagsSafely(extracted);
      }
    }
  }, [aiDescription, extractHashtagsFromDescription, setHashtagsSafely]);

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
      onAddHashtag={handleAddHashtag}
      onRemoveHashtag={handleRemoveHashtag}
      onSaveHashtagToFavorites={handleSaveHashtagToFavorites}
      onLoadHashtagFavorites={loadHashtagFavorites}
      onSuggestHashtags={suggestHashtags}
      onSetHashtags={setHashtagsSafely}
      onUpdateDescriptionHashtags={updateDescriptionHashtags}
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