"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Copy, Check, Star, GripVertical, History, Trash2, Clock, Edit2, Eye, TrendingUp, AlertCircle, Hash, X, Plus, Sparkles, FileCode, Save, RefreshCw, Wand2, MoreVertical } from "lucide-react";
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
import { usePersistentState } from "@/hooks/usePersistentState";
import { generateTitleIdeas } from "@/services/aiClient";
import type { TitleGenerationRequest } from "@/types/ai";
import type { GenerationHistoryEntry, TitleOption } from "@/types/title-generator";
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
  const [history, setHistory] = usePersistentState<GenerationHistoryEntry[]>(
    'history',
    () => [],
    {
      namespace: 'title-generator',
      version: 1,
      onError: (error) => logger.error('タイトル生成履歴の復元に失敗しました', error, 'TitleGenerator'),
    },
  );
  const [hashtags, setHashtags] = useState<string[]>([]); // ハッシュタグリスト（5.7対応）
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
  const MAX_HISTORY_ITEMS = 50; // 最大履歴件数
  const AUTO_SAVE_DELAY = 1000; // 自動保存の遅延時間（ミリ秒）
  const YOUTUBE_DESCRIPTION_LIMIT = 5000; // YouTube概要欄の文字数制限（5.5対応）
  const YOUTUBE_TITLE_RECOMMENDED_LENGTH = 60; // YouTubeタイトルの推奨文字数（5.6対応）
  const YOUTUBE_HASHTAG_RECOMMENDED_COUNT = 15; // YouTubeハッシュタグの推奨数（5.7対応）
  const DEFAULT_HASHTAGS = ['VTuber', 'ゲーム実況', '新作ゲーム', '実況', 'エンタメ'];
  
  // 入力フォームのバリデーション制限（5.9対応）
  const VIDEO_THEME_MIN_LENGTH = 10; // 動画のテーマ・内容の最小文字数
  const VIDEO_THEME_MAX_LENGTH = 500; // 動画のテーマ・内容の最大文字数
  const KEYWORDS_MAX_LENGTH = 100; // 主要キーワードの最大文字数
  const TARGET_AUDIENCE_MAX_LENGTH = 100; // ターゲット層の最大文字数
  const VIDEO_MOOD_MAX_LENGTH = 100; // 動画の雰囲気の最大文字数
  
  // 入力フォームのstate管理（5.4対応）
  const [videoTheme, setVideoTheme] = useState(""); // 動画のテーマ・内容
  const [keywords, setKeywords] = useState(""); // 主要キーワード
  const [targetAudience, setTargetAudience] = useState(""); // ターゲット層
  const [videoMood, setVideoMood] = useState(""); // 動画の雰囲気
  
  // バリデーション状態の管理（5.9対応）
  interface ValidationError {
    message: string;
    suggestion?: string;
  }
  
  const [validationErrors, setValidationErrors] = useState<{
    videoTheme?: ValidationError;
    keywords?: ValidationError;
    targetAudience?: ValidationError;
    videoMood?: ValidationError;
  }>({});
  
  const { handleAsyncError } = useErrorHandler();

  // 自動保存用のタイマーref（5.4対応）
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true); // 初回読み込みフラグ
  const clearAutoSaveTimer = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);

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

  useEffect(() => {
    return () => {
      clearAutoSaveTimer();
    };
  }, [clearAutoSaveTimer]);

  // 履歴の保存
  const saveHistory = useCallback((newEntry: GenerationHistoryEntry) => {
    setHistory(prev => {
      const needsPrune = prev.length >= MAX_HISTORY_ITEMS;
      const updated = [newEntry, ...prev].slice(0, MAX_HISTORY_ITEMS);
      if (needsPrune) {
        toast.info(`履歴は${MAX_HISTORY_ITEMS}件までです。古いデータを自動的に削除しました。`);
      }
      return updated;
    });
  }, [setHistory]);

  // 履歴の削除
  const deleteHistory = useCallback((historyId: string) => {
    setHistory(prev => {
      const updated = prev.filter(h => h.id !== historyId);
      return updated;
    });
    toast.success('履歴を削除しました');
  }, [setHistory]);

  // 履歴の全削除
  const clearAllHistory = useCallback(() => {
    if (confirm('すべての履歴を削除しますか？')) {
      setHistory([]);
      toast.success('すべての履歴を削除しました');
    }
  }, [setHistory]);

  // 履歴からの読み込み
  const loadFromHistory = useCallback((historyItem: GenerationHistoryEntry) => {
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

  // テンプレートを適用（5.8対応）
  const applyTemplate = useCallback((templateId: string) => {
    const template = allTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    const generated = generateDescriptionFromTemplate(template);
    setAiDescription(generated);
    setFinalDescription(generated);
    setSelectedTemplateId(templateId);
    
    // ハッシュタグを抽出して設定
    const extracted = extractHashtagsFromDescription(generated);
    if (extracted.length > 0) {
      setHashtags(extracted);
    }
    
    toast.success(`「${template.name}」テンプレートを適用しました`);
  }, [allTemplates, generateDescriptionFromTemplate]);

  // バリデーション関数（5.9対応）
  const validateVideoTheme = useCallback((value: string): ValidationError | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return {
        message: '動画のテーマ・内容は必須です',
        suggestion: '動画の内容や台本の要約を10文字以上入力してください'
      };
    }
    if (trimmed.length < VIDEO_THEME_MIN_LENGTH) {
      return {
        message: `${VIDEO_THEME_MIN_LENGTH}文字以上入力してください`,
        suggestion: 'もう少し具体的な内容を記入すると、より良いタイトルが生成されます'
      };
    }
    if (trimmed.length > VIDEO_THEME_MAX_LENGTH) {
      return {
        message: `${VIDEO_THEME_MAX_LENGTH}文字以内で入力してください`,
        suggestion: '重要なポイントをまとめて入力してください'
      };
    }
    return null;
  }, []);

  const validateKeywords = useCallback((value: string): ValidationError | null => {
    const trimmed = value.trim();
    if (trimmed.length > KEYWORDS_MAX_LENGTH) {
      return {
        message: `${KEYWORDS_MAX_LENGTH}文字以内で入力してください`,
        suggestion: 'カンマ区切りで主要なキーワードのみを入力してください'
      };
    }
    return null;
  }, []);

  const validateTargetAudience = useCallback((value: string): ValidationError | null => {
    const trimmed = value.trim();
    if (trimmed.length > TARGET_AUDIENCE_MAX_LENGTH) {
      return {
        message: `${TARGET_AUDIENCE_MAX_LENGTH}文字以内で入力してください`,
        suggestion: '簡潔にターゲット層を入力してください（例: 10代男性、VTuberファン）'
      };
    }
    return null;
  }, []);

  const validateVideoMood = useCallback((value: string): ValidationError | null => {
    const trimmed = value.trim();
    if (trimmed.length > VIDEO_MOOD_MAX_LENGTH) {
      return {
        message: `${VIDEO_MOOD_MAX_LENGTH}文字以内で入力してください`,
        suggestion: '簡潔に雰囲気を入力してください（例: 面白い、感動、解説）'
      };
    }
    return null;
  }, []);

  // リアルタイムバリデーション（5.9対応）
  const validateField = useCallback((field: 'videoTheme' | 'keywords' | 'targetAudience' | 'videoMood', value: string) => {
    let error: ValidationError | null = null;
    
    switch (field) {
      case 'videoTheme':
        error = validateVideoTheme(value);
        break;
      case 'keywords':
        error = validateKeywords(value);
        break;
      case 'targetAudience':
        error = validateTargetAudience(value);
        break;
      case 'videoMood':
        error = validateVideoMood(value);
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error || undefined
    }));
  }, [validateVideoTheme, validateKeywords, validateTargetAudience, validateVideoMood]);

  // ハッシュタグ管理用のユーティリティ関数（5.7対応）- テンプレート適用前に定義
  const extractHashtagsFromDescription = useCallback((description: string): string[] => {
    const hashtagSection = description.match(/【ハッシュタグ】\s*\n([\s\S]*?)(?=\n【|$)/);
    if (!hashtagSection) return [];
    
    const hashtagLine = hashtagSection[1].trim();
    const matches = hashtagLine.match(/#([\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)/g);
    if (!matches) return [];
    
    return matches.map(tag => tag.replace('#', ''));
  }, []);

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
        setHashtags(extracted);
      }
      
      toast.success('概要欄を再生成しました');
    } catch (err) {
      logger.error('概要欄再生成失敗', err, 'TitleGenerator');
      toast.error('概要欄の再生成に失敗しました');
    } finally {
      setIsRegeneratingDescription(false);
    }
  }, [videoTheme, generateDescription, extractHashtagsFromDescription]);

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
    // 入力フォームのバリデーション（5.9対応: 全フィールドを検証）
    const videoThemeError = validateVideoTheme(videoTheme);
    
    if (videoThemeError) {
      setValidationErrors({ videoTheme: videoThemeError });
      toast.error('入力エラー', {
        description: videoThemeError.message
      });
      return;
    }
    
    // その他のフィールドも検証（エラーがあっても生成は可能）
    const keywordsError = validateKeywords(keywords);
    const targetAudienceError = validateTargetAudience(targetAudience);
    const videoMoodError = validateVideoMood(videoMood);
    
    setValidationErrors({
      keywords: keywordsError || undefined,
      targetAudience: targetAudienceError || undefined,
      videoMood: videoMoodError || undefined,
    });
    
    // 警告がある場合は表示（生成は続行）
    const hasWarnings = keywordsError || targetAudienceError || videoMoodError;
    if (hasWarnings) {
      toast.warning('一部の入力に問題がありますが、生成を続行します', {
        duration: 3000
      });
    }

    setIsLoading(true);
    
    // 非同期処理をエラーハンドリングでラップ
    await handleAsyncError(async () => {
      // タイトルと概要欄の両方を生成（共通関数を使用）
      const { titles: sortedTitles, recommendedHashtags } = await generateTitles();

      const nextHashtags =
        hashtags.length > 0
          ? hashtags
          : recommendedHashtags.length > 0
            ? recommendedHashtags
            : DEFAULT_HASHTAGS;

      if (hashtags.length === 0) {
        setHashtags(nextHashtags);
      }

      const generatedDescription = generateDescription(nextHashtags);

      setAiTitles(sortedTitles);
      setAiDescription(generatedDescription);
      // 最初のタイトル案を自動選択
      if (sortedTitles.length > 0) {
        setFinalTitle(sortedTitles[0].text);
      }
      setFinalDescription(generatedDescription);
      
      // 履歴に保存（5.3対応）
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
    <div className="flex flex-col h-full p-4 sm:p-6 space-y-4 relative">
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
        
        <TabsContent value="input" className="flex-1 space-y-4 md:overflow-auto mt-0">
          {/* T-02: コントロールパネルのUI作成 */}
          <Card>
            <CardHeader>
              <CardTitle>動画情報入力</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 動画のテーマ・内容は全幅（5.9対応: バリデーション強化） */}
              <div>
                <Label htmlFor="video-theme" className="flex items-center gap-2">
                  <span>動画のテーマ・内容</span>
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">必須</Badge>
                </Label>
                <Textarea
                  id="video-theme"
                  placeholder="例: 新作RPGゲームを初見プレイ。序盤のキャラクター作成から、最初のボス戦までの流れを実況します。"
                  value={videoTheme}
                  onChange={(e) => {
                    setVideoTheme(e.target.value);
                    validateField('videoTheme', e.target.value);
                  }}
                  onBlur={() => validateField('videoTheme', videoTheme)}
                  rows={4}
                  className={cn(
                    "resize-y",
                    validationErrors.videoTheme && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-1 gap-1 md:gap-0">
                  <div className="flex-1">
                    {validationErrors.videoTheme && (
                      <div className="space-y-1">
                        <p className="text-xs text-red-500">{validationErrors.videoTheme.message}</p>
                        {validationErrors.videoTheme.suggestion && (
                          <p className="text-xs text-muted-foreground">{validationErrors.videoTheme.suggestion}</p>
                        )}
                      </div>
                    )}
                    {!validationErrors.videoTheme && (
                      <p className="text-xs text-muted-foreground">
                        {VIDEO_THEME_MIN_LENGTH}〜{VIDEO_THEME_MAX_LENGTH}文字推奨。動画の内容や台本の要約を具体的に入力してください。
                      </p>
                    )}
                  </div>
                  <span className={cn(
                    "text-xs md:ml-2",
                    videoTheme.length < VIDEO_THEME_MIN_LENGTH 
                      ? "text-red-500" 
                      : videoTheme.length > VIDEO_THEME_MAX_LENGTH 
                        ? "text-red-500" 
                        : "text-muted-foreground"
                  )}>
                    {videoTheme.length}/{VIDEO_THEME_MAX_LENGTH}
                  </span>
                </div>
              </div>
              
              {/* 2カラムレイアウト（5.1対応、5.9対応: バリデーション強化） */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="keywords">主要キーワード</Label>
                  <Input 
                    id="keywords" 
                    placeholder="例: ゲーム名, キャラクター名, 感想"
                    value={keywords}
                    onChange={(e) => {
                      setKeywords(e.target.value);
                      validateField('keywords', e.target.value);
                    }}
                    onBlur={() => validateField('keywords', keywords)}
                    className={cn(
                      validationErrors.keywords && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-1 gap-1 md:gap-0">
                    <div className="flex-1">
                      {validationErrors.keywords && (
                        <div className="space-y-1">
                          <p className="text-xs text-red-500">{validationErrors.keywords.message}</p>
                          {validationErrors.keywords.suggestion && (
                            <p className="text-xs text-muted-foreground">{validationErrors.keywords.suggestion}</p>
                          )}
                        </div>
                      )}
                      {!validationErrors.keywords && (
                        <p className="text-xs text-muted-foreground">
                          カンマ区切りで入力。タイトル生成に使用されます。
                        </p>
                      )}
                    </div>
                    <span className={cn(
                      "text-xs md:ml-2",
                      keywords.length > KEYWORDS_MAX_LENGTH 
                        ? "text-red-500" 
                        : "text-muted-foreground"
                    )}>
                      {keywords.length}/{KEYWORDS_MAX_LENGTH}
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="target-audience">ターゲット層</Label>
                  <Input 
                    id="target-audience" 
                    placeholder="例: 10代男性, VTuberファン"
                    value={targetAudience}
                    onChange={(e) => {
                      setTargetAudience(e.target.value);
                      validateField('targetAudience', e.target.value);
                    }}
                    onBlur={() => validateField('targetAudience', targetAudience)}
                    className={cn(
                      validationErrors.targetAudience && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-1 gap-1 md:gap-0">
                    <div className="flex-1">
                      {validationErrors.targetAudience && (
                        <div className="space-y-1">
                          <p className="text-xs text-red-500">{validationErrors.targetAudience.message}</p>
                          {validationErrors.targetAudience.suggestion && (
                            <p className="text-xs text-muted-foreground">{validationErrors.targetAudience.suggestion}</p>
                          )}
                        </div>
                      )}
                      {!validationErrors.targetAudience && (
                        <p className="text-xs text-muted-foreground">
                          任意。視聴者の属性を入力。
                        </p>
                      )}
                    </div>
                    <span className={cn(
                      "text-xs md:ml-2",
                      targetAudience.length > TARGET_AUDIENCE_MAX_LENGTH 
                        ? "text-red-500" 
                        : "text-muted-foreground"
                    )}>
                      {targetAudience.length}/{TARGET_AUDIENCE_MAX_LENGTH}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="video-mood">動画の雰囲気</Label>
                <Input 
                  id="video-mood" 
                  placeholder="例: 面白い, 感動, 解説"
                  value={videoMood}
                  onChange={(e) => {
                    setVideoMood(e.target.value);
                    validateField('videoMood', e.target.value);
                  }}
                  onBlur={() => validateField('videoMood', videoMood)}
                  className={cn(
                    validationErrors.videoMood && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-1 gap-1 md:gap-0">
                  <div className="flex-1">
                    {validationErrors.videoMood && (
                      <div className="space-y-1">
                        <p className="text-xs text-red-500">{validationErrors.videoMood.message}</p>
                        {validationErrors.videoMood.suggestion && (
                          <p className="text-xs text-muted-foreground">{validationErrors.videoMood.suggestion}</p>
                        )}
                      </div>
                    )}
                    {!validationErrors.videoMood && (
                      <p className="text-xs text-muted-foreground">
                        任意。動画の雰囲気やトーンを入力。
                      </p>
                    )}
                  </div>
                  <span className={cn(
                    "text-xs md:ml-2",
                    videoMood.length > VIDEO_MOOD_MAX_LENGTH 
                      ? "text-red-500" 
                      : "text-muted-foreground"
                  )}>
                    {videoMood.length}/{VIDEO_MOOD_MAX_LENGTH}
                  </span>
                </div>
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
        
        <TabsContent value="history" className="flex-1 space-y-4 md:overflow-auto mt-0">
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
              <div className="space-y-2 md:max-h-[calc(100vh-300px)] md:overflow-y-auto">
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
    <div className="flex flex-col h-full p-4 sm:p-6 space-y-4 relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mb-4">
        <h2 className="text-2xl font-semibold">生成結果</h2>
        {/* 再生成ボタンセクション（5.10対応） */}
        {aiTitles.length > 0 || aiDescription ? (
          <div className="flex flex-col sm:flex-row gap-2">
            {aiTitles.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateTitlesOnly}
                disabled={isRegeneratingTitles || isLoading}
              >
                {isRegeneratingTitles ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    再生成中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    タイトルのみ再生成
                  </>
                )}
              </Button>
            )}
            {aiDescription && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateDescriptionOnly}
                disabled={isRegeneratingDescription || isLoading}
              >
                {isRegeneratingDescription ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    再生成中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    概要欄のみ再生成
                  </>
                )}
              </Button>
            )}
          </div>
        ) : null}
      </div>
      <Separator />
      <div className="flex-grow space-y-4 md:overflow-auto">
        {/* T-03: 結果表示エリアのUI作成 */}
        <Card>
          <CardHeader>
            <CardTitle>最終編集エリア</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="final-title">最終タイトル</Label>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    id="final-title"
                    placeholder="AIが生成したタイトル案"
                    value={finalTitle}
                    onChange={(e) => setFinalTitle(e.target.value)}
                    className="flex-1"
                  />
                )}
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(finalTitle)} disabled={!finalTitle} className="w-full md:w-auto">コピー</Button>
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
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                {isLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <Textarea
                    id="final-description"
                    placeholder="AIが生成した概要欄"
                    value={finalDescription}
                    onChange={(e) => setFinalDescription(e.target.value)}
                    rows={8}
                    className="resize-y flex-1"
                  />
                )}
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText(finalDescription);
                  toast.success('概要欄をコピーしました');
                }} disabled={!finalDescription} className="w-full md:w-auto">コピー</Button>
              </div>
            </div>
            
            {/* 概要欄テンプレート選択（5.8対応） */}
            <div>
              <Label className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  概要欄テンプレート
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowTemplatePreview(!showTemplatePreview)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  {showTemplatePreview ? 'プレビューを閉じる' : 'プレビュー'}
                </Button>
              </Label>
              
              <div className="flex gap-2 mb-2">
                <Select value={selectedTemplateId} onValueChange={applyTemplate}>
                  <SelectTrigger className="flex-1 truncate">
                    <SelectValue>
                      {(() => {
                        const selectedTemplate = allTemplates.find(t => t.id === selectedTemplateId) || presetTemplates[0];
                        if (!selectedTemplate) {
                          return <span>テンプレートを選択</span>;
                        }
                        return (
                          <>
                            <span className="md:hidden">{selectedTemplate.name}</span>
                            <span className="hidden md:inline truncate">
                              {selectedTemplate.name}
                              {selectedTemplate.description && (
                                <span className="text-muted-foreground ml-1">
                                  ({selectedTemplate.description})
                                </span>
                              )}
                            </span>
                          </>
                        );
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      プリセット
                    </div>
                    {presetTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">{template.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                    {customTemplates.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                          カスタム
                        </div>
                        {customTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-xs text-muted-foreground">{template.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>カスタムテンプレートを作成</DialogTitle>
                      <DialogDescription>
                        新しい概要欄テンプレートを作成します
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="template-name">テンプレート名</Label>
                        <Input
                          id="template-name"
                          placeholder="例: ゲーム実況用（カスタム）"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="template-description">説明</Label>
                        <Input
                          id="template-description"
                          placeholder="このテンプレートの説明"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>セクション構成</Label>
                        <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                          <p>現在のテンプレート機能では、プリセットテンプレートの選択と適用が可能です。</p>
                          <p>カスタムテンプレートの作成機能は次回実装予定です。</p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* テンプレートプレビュー（5.8対応） */}
              {showTemplatePreview && (() => {
                const template = allTemplates.find(t => t.id === selectedTemplateId) || presetTemplates[0];
                return (
                  <Card className="mb-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">テンプレート構造: {template.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-xs text-muted-foreground mb-2">
                        {template.description}
                      </div>
                      {template.sections
                        .filter(s => s.enabled)
                        .sort((a, b) => a.order - b.order)
                        .map((section, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs p-2 bg-muted/30 rounded">
                            <Badge variant="outline" className="text-[10px]">
                              {idx + 1}
                            </Badge>
                            <span className="font-medium">
                              {section.title || section.type === 'summary' ? '動画の概要' : section.type}
                            </span>
                            <span className="text-muted-foreground ml-auto">
                              {section.type}
                            </span>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                );
              })()}
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
                            className="text-xs h-9 md:h-7"
                            onClick={() => handleAddHashtag(suggestion)}
                          >
                            <Sparkles className="h-3 w-3 md:h-3 mr-1" />
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
                            className="text-xs h-9 md:h-7"
                            onClick={() => handleAddHashtag(favorite)}
                          >
                            <Star className="h-3 w-3 md:h-3 mr-1 fill-[#20B2AA] text-[#20B2AA]" />
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
                                  {/* ドラッグハンドル（デスクトップのみ表示） */}
                                  {!titleOption.isFavorite && (
                                    <div
                                      {...provided.dragHandleProps}
                                      className="hidden md:flex flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
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
                                          {/* モバイル: 主要情報のみ表示 */}
                                          <div className="flex items-center gap-2 md:hidden">
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
                                            </div>
                                            {/* 評価スコア */}
                                            <div className="flex items-center gap-1">
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
                                            </div>
                                          </div>

                                          {/* デスクトップ: すべての情報を表示 */}
                                          <div className="hidden md:flex md:flex-wrap md:items-center md:gap-2">
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
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  
                                  {/* アクションボタン（5.10対応: 個別再生成ボタンを追加） */}
                                  <div className="flex gap-2 flex-shrink-0">
                                    {/* 主要ボタン（モバイル・デスクトップ共通） */}
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
                                    {/* デスクトップ: すべてのボタンを表示 */}
                                    {/* 個別タイトル案の再生成（5.10対応） */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRegenerateSingleTitle(titleOption.id, titleOption.text);
                                      }}
                                      disabled={regeneratingTitleId === titleOption.id}
                                      aria-label={`タイトル案${index + 1}を再生成`}
                                      title="このタイトル案を再生成"
                                      className="hidden md:flex"
                                    >
                                      {regeneratingTitleId === titleOption.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <RefreshCw className="h-4 w-4" />
                                      )}
                                    </Button>
                                    {/* この案をもとに別パターンを生成（5.10対応） */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleGenerateVariantFromTitle(titleOption.text);
                                      }}
                                      disabled={isRegeneratingTitles}
                                      aria-label={`タイトル案${index + 1}をもとに別パターンを生成`}
                                      title="この案をもとに別パターンを生成"
                                      className="hidden md:flex"
                                    >
                                      {isRegeneratingTitles ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Wand2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                    {/* モバイル: ドロップダウンメニューで追加オプションを表示 */}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="md:hidden"
                                          aria-label="その他のオプション"
                                        >
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="bg-[#2D2D2D] border-[#4A4A4A] shadow-lg">
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRegenerateSingleTitle(titleOption.id, titleOption.text);
                                          }}
                                          disabled={regeneratingTitleId === titleOption.id}
                                        >
                                          {regeneratingTitleId === titleOption.id ? (
                                            <>
                                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                              再生成中...
                                            </>
                                          ) : (
                                            <>
                                              <RefreshCw className="mr-2 h-4 w-4" />
                                              このタイトル案を再生成
                                            </>
                                          )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleGenerateVariantFromTitle(titleOption.text);
                                          }}
                                          disabled={isRegeneratingTitles}
                                        >
                                          {isRegeneratingTitles ? (
                                            <>
                                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                              生成中...
                                            </>
                                          ) : (
                                            <>
                                              <Wand2 className="mr-2 h-4 w-4" />
                                              別パターンを生成
                                            </>
                                          )}
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
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