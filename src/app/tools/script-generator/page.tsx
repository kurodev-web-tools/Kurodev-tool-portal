'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Construction, Loader2, FileText, Gamepad2, Music, MessageCircle, Users, Calendar, Clock, Search, Filter, X, Star, GripVertical, History, Trash2, Printer, FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useSidebar } from '@/hooks/use-sidebar';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sidebar, SidebarToggle } from '@/components/layouts/Sidebar';
import { logger } from '@/lib/logger';
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";

type IdeaCategory = 'gaming' | 'singing' | 'talk' | 'collaboration' | 'event' | 'other';
type IdeaDifficulty = 'easy' | 'medium' | 'hard';

interface Idea {
  id: number;
  title: string;
  description: string;
  points: string[];
  category: IdeaCategory;
  estimatedDuration: number; // 予想配信時間（分）
  difficulty?: IdeaDifficulty;
  thumbnail?: string; // サムネイル画像URL（オプション）
  isFavorite?: boolean; // お気に入りフラグ
  order?: number; // 並び替え順序
}

// カテゴリごとの色分けとアイコン定義
const categoryConfig: Record<IdeaCategory, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  borderColor: string;
  badgeColor: string;
  bgColor: string;
}> = {
  gaming: {
    label: 'ゲーム',
    icon: Gamepad2,
    gradient: 'from-blue-600/20 via-blue-500/10 to-purple-600/20',
    borderColor: 'border-blue-500/50',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    bgColor: 'bg-blue-500/10',
  },
  singing: {
    label: '歌枠',
    icon: Music,
    gradient: 'from-pink-600/20 via-pink-500/10 to-rose-600/20',
    borderColor: 'border-pink-500/50',
    badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    bgColor: 'bg-pink-500/10',
  },
  talk: {
    label: '雑談',
    icon: MessageCircle,
    gradient: 'from-green-600/20 via-green-500/10 to-emerald-600/20',
    borderColor: 'border-green-500/50',
    badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    bgColor: 'bg-green-500/10',
  },
  collaboration: {
    label: 'コラボ',
    icon: Users,
    gradient: 'from-orange-600/20 via-orange-500/10 to-amber-600/20',
    borderColor: 'border-orange-500/50',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    bgColor: 'bg-orange-500/10',
  },
  event: {
    label: 'イベント',
    icon: Calendar,
    gradient: 'from-purple-600/20 via-purple-500/10 to-violet-600/20',
    borderColor: 'border-purple-500/50',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    bgColor: 'bg-purple-500/10',
  },
  other: {
    label: 'その他',
    icon: Lightbulb,
    gradient: 'from-gray-600/20 via-gray-500/10 to-slate-600/20',
    borderColor: 'border-gray-500/50',
    badgeColor: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    bgColor: 'bg-gray-500/10',
  },
};

const dummyIdeas: Idea[] = [
  {
    id: 1,
    title: '超絶高難易度ゲームに初見で挑戦！',
    description: '視聴者から寄せられた「絶対にクリアできない」と噂のゲームに、何の予備知識もなく挑戦します。絶叫と感動のドラマが生まれること間違いなし！',
    points: ['リアクション芸が光る', '視聴者との一体感が生まれる', '切り抜き動画映えする'],
    category: 'gaming',
    estimatedDuration: 120,
    difficulty: 'hard',
  },
  {
    id: 2,
    title: '視聴者参加型！みんなで決める歌枠セットリスト',
    description: '配信中にアンケート機能を使って、次に歌う曲を視聴者に決めてもらうインタラクティブな歌枠。定番曲から意外な曲まで、何が飛び出すか分からない！',
    points: ['ファンサービス満点', 'コメントが盛り上がる', 'アーカイブの再生数も期待できる'],
    category: 'singing',
    estimatedDuration: 90,
    difficulty: 'easy',
  },
  {
    id: 3,
    title: '完全オリジナル！自作ゲームお披露目会',
    description: '数ヶ月かけて制作した自作ゲームを、ファンと一緒についにプレイ！開発秘話や裏話を交えながら、感動のエンディングを目指す。',
    points: ['クリエイターとしての一面を見せられる', '独自性が高い', '記念配信に最適'],
    category: 'gaming',
    estimatedDuration: 180,
    difficulty: 'medium',
  },
];

const dummyScript = {
  introduction: '皆さん、こんにちは！〇〇です！今日の配信は、なんと…！',
  body: '（ここでゲームプレイや企画の本編）\nいやー、これは難しい！でも、みんなの応援があるから頑張れる！',
  conclusion: 'というわけで、今日の配信はここまで！たくさんのコメント、スパチャありがとう！次回もまた見てね！おつ〇〇～！',
};

interface Script {
  ideaId: number;
  content: string;
  introduction: string;
  body: string;
  conclusion: string;
}

// 生成履歴のデータ構造
interface GenerationHistory {
  id: string;
  timestamp: number; // Date.now()
  ideas: Idea[]; // 生成された企画案の配列
  keywords?: string; // 使用したキーワード
  direction?: string; // 企画の方向性
  createdAt: string; // ISO形式の日時文字列（表示用）
}

export default function ScriptGeneratorPage() {
  const [generatedIdeas, setGeneratedIdeas] = useState<Idea[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null);
  const [currentScript, setCurrentScript] = useState<Script | null>(null);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  
  // 検索・フィルターの状態管理
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<IdeaCategory[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<IdeaDifficulty | 'all'>('all');
  const [durationFilter, setDurationFilter] = useState<{ min?: number; max?: number }>({});
  
  // お気に入りと並び替えの状態管理
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [ideaViewMode, setIdeaViewMode] = useState<'all' | 'favorites' | 'recent'>('all');
  
  // ローカルストレージキー
  const IDEAS_ORDER_STORAGE_KEY = 'script-generator-ideas-order';
  const FAVORITES_STORAGE_KEY = 'script-generator-favorites';
  const HISTORY_STORAGE_KEY = 'script-generator-history';
  const MAX_HISTORY_ITEMS = 50; // 最大履歴件数
  
  // 生成履歴の状態管理
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');
  const [historyFilterCategory, setHistoryFilterCategory] = useState<IdeaCategory | 'all'>('all');
  
  const { isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen, isDesktop } = useSidebar({
    defaultOpen: false,
    desktopDefaultOpen: true,
  });
  const [selectedTab, setSelectedTab] = useState("persona");
  const { handleAsyncError } = useErrorHandler();

  // デバイスサイズに応じてデフォルトタブを設定
  useEffect(() => {
    setSelectedTab(isDesktop ? "generate" : "persona");
  }, [isDesktop]);

  // ローカルストレージからお気に入りと並び替え順序を読み込み
  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (savedFavorites) {
      try {
        const favoriteArray = JSON.parse(savedFavorites);
        setFavoriteIds(new Set(favoriteArray));
        
        // 既存の企画案にお気に入りフラグを設定
        setGeneratedIdeas(prev => prev.map(idea => ({
          ...idea,
          isFavorite: favoriteArray.includes(idea.id)
        })));
      } catch (e) {
        console.error('Failed to load favorites:', e);
      }
    }
    
    const savedOrder = localStorage.getItem(IDEAS_ORDER_STORAGE_KEY);
    if (savedOrder && generatedIdeas.length > 0) {
      try {
        const orderMap = JSON.parse(savedOrder);
        setGeneratedIdeas(prev => {
          const orderedIdeas = [...prev].sort((a, b) => {
            const orderA = orderMap[a.id] ?? a.id;
            const orderB = orderMap[b.id] ?? b.id;
            return orderA - orderB;
          });
          return orderedIdeas;
        });
      } catch (e) {
        console.error('Failed to load order:', e);
      }
    }
  }, []); // 初回のみ実行

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

  // 履歴の保存機能
  const saveHistory = useCallback((ideas: Idea[], keywords?: string, direction?: string) => {
    if (typeof window === 'undefined' || ideas.length === 0) return;
    
    try {
      const newHistory: GenerationHistory = {
        id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        ideas: ideas.map(idea => ({
          ...idea,
          // お気に入り状態は履歴には保存しない（現在の状態を維持）
        })),
        keywords,
        direction,
        createdAt: new Date().toISOString(),
      };
      
      setHistory(prev => {
        const updated = [newHistory, ...prev].slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error('履歴保存失敗', err);
    }
  }, []);

  // 履歴の削除機能
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
    }
  }, []);

  // 履歴から再生成機能
  const loadFromHistory = useCallback((historyItem: GenerationHistory) => {
    setGeneratedIdeas(historyItem.ideas.map(idea => ({
      ...idea,
      isFavorite: favoriteIds.has(idea.id) // 現在のお気に入り状態を維持
    })));
    setSelectedIdeaId(null);
    setCurrentScript(null);
    setIdeaViewMode('all');
    // 履歴タブを閉じて、メインエリアにフォーカス
    setSelectedTab(isDesktop ? "generate" : "persona");
  }, [favoriteIds, isDesktop]);

  // フィルタリングされた履歴
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      // 検索クエリ（キーワード、方向性、企画案タイトルで検索）
      if (historySearchQuery) {
        const query = historySearchQuery.toLowerCase();
        const matchesSearch = 
          (item.keywords && item.keywords.toLowerCase().includes(query)) ||
          (item.direction && item.direction.toLowerCase().includes(query)) ||
          item.ideas.some(idea => 
            idea.title.toLowerCase().includes(query) ||
            idea.description.toLowerCase().includes(query)
          );
        if (!matchesSearch) return false;
      }
      
      // カテゴリフィルター
      if (historyFilterCategory !== 'all') {
        const hasCategory = item.ideas.some(idea => idea.category === historyFilterCategory);
        if (!hasCategory) return false;
      }
      
      return true;
    });
  }, [history, historySearchQuery, historyFilterCategory]);

  // お気に入りの切り替え
  const toggleFavorite = useCallback((id: number) => {
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      
      // ローカルストレージに保存
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(newSet)));
      
      // 状態更新
      setGeneratedIdeas(prev => prev.map(idea => 
        idea.id === id ? { ...idea, isFavorite: newSet.has(id) } : idea
      ));
      
      return newSet;
    });
  }, []);

  // ドラッグ&ドロップのハンドラー
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    
    // 並び替えを反映（元の配列の順序を更新）
    setGeneratedIdeas(prev => {
      const updatedIdeas = [...prev];
      const sourceId = parseInt(result.draggableId);
      const sourceIndex = updatedIdeas.findIndex(i => i.id === sourceId);
      
      if (sourceIndex === -1) return prev;
      
      const [movedItem] = updatedIdeas.splice(sourceIndex, 1);
      updatedIdeas.splice(result.destination!.index, 0, movedItem);
      
      // 並び替え順序を保存
      const orderMap = updatedIdeas.reduce((acc, item, index) => {
        acc[item.id] = index;
        return acc;
      }, {} as Record<number, number>);
      
      localStorage.setItem(IDEAS_ORDER_STORAGE_KEY, JSON.stringify(orderMap));
      
      return updatedIdeas;
    });
  }, []);

  // フィルタリングロジック
  const filteredIdeas = useMemo(() => {
    let ideas = generatedIdeas.filter((idea) => {
      // 検索クエリ（タイトル・説明文・ポイントで検索）
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          idea.title.toLowerCase().includes(query) ||
          idea.description.toLowerCase().includes(query) ||
          idea.points.some(point => point.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      
      // カテゴリフィルター
      if (selectedCategories.length > 0 && !selectedCategories.includes(idea.category)) {
        return false;
      }
      
      // 難易度フィルター
      if (selectedDifficulty !== 'all' && idea.difficulty !== selectedDifficulty) {
        return false;
      }
      
      // 予想時間フィルター
      if (durationFilter.min !== undefined && idea.estimatedDuration < durationFilter.min) {
        return false;
      }
      if (durationFilter.max !== undefined && idea.estimatedDuration > durationFilter.max) {
        return false;
      }
      
      return true;
    });
    
    // お気に入りタブでフィルタリング
    if (ideaViewMode === 'favorites') {
      ideas = ideas.filter(idea => idea.isFavorite);
    }
    // recentは生成順（既にsortedIdeasの順序で表示）
    
    return ideas;
  }, [generatedIdeas, searchQuery, selectedCategories, selectedDifficulty, durationFilter, ideaViewMode]);

  const handleGenerate = useCallback(async () => {
    setIsGeneratingIdeas(true);
    await handleAsyncError(async () => {
      // モック処理
      await new Promise(resolve => setTimeout(resolve, 1000));
    const generated = dummyIdeas.map(idea => ({
      ...idea,
      isFavorite: favoriteIds.has(idea.id)
    }));
    setGeneratedIdeas(generated);
    setSelectedIdeaId(null);
    // フィルターをリセット
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedDifficulty('all');
    setDurationFilter({});
    setIdeaViewMode('all');
    
    // 履歴を保存（キーワードと方向性は実際の入力から取得）
    saveHistory(generated);
    }, "企画案生成中にエラーが発生しました");
    setIsGeneratingIdeas(false);
  }, [handleAsyncError, favoriteIds, saveHistory]);

  const handleCardClick = useCallback((id: number) => {
    setSelectedIdeaId(id);
    // 選択された企画案に対応する台本がある場合は表示
    if (currentScript && currentScript.ideaId === id) {
      // 既に台本が生成されている場合はそのまま表示
    } else {
      // 台本が生成されていない場合は、選択のみ行う
      setCurrentScript(null);
    }
  }, [currentScript]);

  const handleGenerateScript = useCallback(async (idea: Idea) => {
    setIsGeneratingScript(true);
    await handleAsyncError(async () => {
      // モック処理
      await new Promise(resolve => setTimeout(resolve, 1500));
      const script: Script = {
        ideaId: idea.id,
        content: `【${idea.title}】\n\n${dummyScript.introduction}\n\n${idea.description}\n\n${dummyScript.body}\n\n${dummyScript.conclusion}`,
        introduction: dummyScript.introduction,
        body: dummyScript.body,
        conclusion: dummyScript.conclusion,
      };
      setCurrentScript(script);
      setSelectedIdeaId(idea.id);
      logger.debug('台本生成完了', { ideaTitle: idea.title, scriptLength: script.content.length }, 'ScriptGenerator');
    }, "台本生成中にエラーが発生しました");
    setIsGeneratingScript(false);
  }, [handleAsyncError]);

  // 印刷処理（デザイナー提案 + 利用者提案）
  const handlePrint = useCallback(() => {
    if (!currentScript) return;
    
    // 選択されている企画案を取得
    const selectedIdea = generatedIdeas.find(idea => idea.id === selectedIdeaId);
    
    // 印刷用の新しいウィンドウを開く（印刷プレビュー用）
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('ポップアップがブロックされています。ポップアップを許可してください。');
      return;
    }

    // 印刷用HTMLを生成
    const printHTML = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>台本 - ${selectedIdea?.title || '企画案'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', 'Meiryo', 'Hiragino Kaku Gothic ProN', sans-serif;
      line-height: 1.8;
      color: #333;
      background: #fff;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .no-print {
        display: none;
      }
      
      @page {
        margin: 2cm;
        size: A4;
      }
      
      h1, h2, h3 {
        page-break-after: avoid;
      }
      
      .section {
        page-break-inside: avoid;
        margin-bottom: 30px;
      }
    }
    
    h1 {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #000;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }
    
    .metadata {
      margin-bottom: 30px;
      padding: 15px;
      background: #f5f5f5;
      border-left: 4px solid #4A90E2;
      font-size: 14px;
    }
    
    .metadata-item {
      margin-bottom: 8px;
    }
    
    .metadata-label {
      font-weight: bold;
      color: #666;
      display: inline-block;
      min-width: 100px;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #000;
      padding: 10px;
      background: #f9f9f9;
      border-left: 4px solid #4A90E2;
    }
    
    .section-content {
      font-size: 16px;
      line-height: 2;
      color: #333;
      white-space: pre-wrap;
      padding: 0 10px;
    }
    
    .section-content p {
      margin-bottom: 12px;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    
    @media print {
      .footer {
        position: fixed;
        bottom: 0;
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <h1>${selectedIdea?.title || '台本'}</h1>
  
  <div class="metadata">
    ${selectedIdea?.description ? `
      <div class="metadata-item">
        <span class="metadata-label">概要:</span>
        <span>${selectedIdea.description}</span>
      </div>
    ` : ''}
    ${selectedIdea?.estimatedDuration ? `
      <div class="metadata-item">
        <span class="metadata-label">予想時間:</span>
        <span>${selectedIdea.estimatedDuration}分</span>
      </div>
    ` : ''}
    ${selectedIdea?.category ? `
      <div class="metadata-item">
        <span class="metadata-label">カテゴリ:</span>
        <span>${categoryConfig[selectedIdea.category].label}</span>
      </div>
    ` : ''}
    <div class="metadata-item">
      <span class="metadata-label">作成日時:</span>
      <span>${new Date().toLocaleString('ja-JP')}</span>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">【導入】</div>
    <div class="section-content">${currentScript.introduction}</div>
  </div>
  
  <div class="section">
    <div class="section-title">【本題】</div>
    <div class="section-content">${currentScript.body}</div>
  </div>
  
  <div class="section">
    <div class="section-title">【結論】</div>
    <div class="section-content">${currentScript.conclusion}</div>
  </div>
  
  ${selectedIdea?.points && selectedIdea.points.length > 0 ? `
    <div class="section">
      <div class="section-title">【ポイント】</div>
      <div class="section-content">
        <ul style="list-style-position: inside; padding-left: 0;">
          ${selectedIdea.points.map((point: string) => `<li style="margin-bottom: 8px;">${point}</li>`).join('')}
        </ul>
      </div>
    </div>
  ` : ''}
  
  <div class="footer">
    <p>この台本は VTuberツールスイート で生成されました</p>
  </div>
</body>
</html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // 少し待ってから印刷ダイアログを開く（レンダリング完了を待つ）
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  }, [currentScript, selectedIdeaId, generatedIdeas]);

  // PDFエクスポート処理（利用者提案）
  const handleExportPDF = useCallback(() => {
    if (!currentScript) return;
    
    // ブラウザの印刷機能を使用（PDF保存を選択）
    handlePrint();
    toast.success('印刷ダイアログを開きました。PDFに保存する場合は「保存先」でPDFを選択してください。');
  }, [currentScript, handlePrint]);

  const renderControlPanel = useCallback(() => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="keywords-mobile">キーワード</Label>
        <Input id="keywords-mobile" placeholder="例: ゲーム実況、マリオカート" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="direction-mobile">企画の方向性</Label>
        <Select>
          <SelectTrigger id="direction-mobile">
            <SelectValue placeholder="方向性を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="funny">面白い系</SelectItem>
            <SelectItem value="moving">感動系</SelectItem>
            <SelectItem value="educational">解説・学習系</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>現在のトレンド</Label>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="cursor-pointer">#VTuberの夏休み</Badge>
          <Badge variant="outline" className="cursor-pointer">#ゲーム実況</Badge>
          <Badge variant="outline" className="cursor-pointer">#新作ゲーム</Badge>
        </div>
      </div>
      <Button className="w-full" onClick={handleGenerate} disabled={isGeneratingIdeas}>
        {isGeneratingIdeas ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            生成中...
          </>
        ) : (
          '企画案を生成する'
        )}
      </Button>
    </div>
  ), [isGeneratingIdeas, handleGenerate]);

  // モバイル用のサイドバーコンテンツ（ペルソナと履歴のみ）
  const mobileSidebarContent = useMemo(() => (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="persona">ペルソナ</TabsTrigger>
        <TabsTrigger value="history">履歴</TabsTrigger>
      </TabsList>
      <TabsContent value="persona" className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="persona-select-mobile">使用するペルソナ</Label>
          <Select>
            <SelectTrigger id="persona-select-mobile">
              <SelectValue placeholder="ペルソナを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">デフォルト</SelectItem>
              <SelectItem value="energetic">エネルギッシュ</SelectItem>
              <SelectItem value="calm">落ち着いた</SelectItem>
              <SelectItem value="funny">面白い</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="persona-desc-mobile">ペルソナの特徴</Label>
          <Textarea 
            id="persona-desc-mobile"
            placeholder="ペルソナの特徴や話し方を記述..."
            className="min-h-[100px]"
          />
        </div>
      </TabsContent>
      <TabsContent value="history" className="mt-4 space-y-4">
        {/* 履歴の検索・フィルター */}
        {history.length > 0 && (
          <div className="space-y-3 p-3 bg-[#2D2D2D] rounded-lg border border-[#4A4A4A]">
            <div className="space-y-2">
              <Label htmlFor="history-search-mobile" className="flex items-center gap-2 text-sm text-[#E0E0E0]">
                <Search className="h-4 w-4" />
                検索
              </Label>
              <Input
                id="history-search-mobile"
                placeholder="キーワード、方向性、タイトルで検索..."
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#4A4A4A]"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-[#A0A0A0]">カテゴリ</Label>
              <Select 
                value={historyFilterCategory} 
                onValueChange={(value) => setHistoryFilterCategory(value as IdeaCategory | 'all')}
              >
                <SelectTrigger className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {(Object.keys(categoryConfig) as IdeaCategory[]).map((category) => (
                    <SelectItem key={category} value={category}>
                      {categoryConfig[category].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(historySearchQuery || historyFilterCategory !== 'all') && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHistorySearchQuery('');
                    setHistoryFilterCategory('all');
                  }}
                  className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A]"
                >
                  <X className="h-4 w-4 mr-1" />
                  フィルターをクリア
                </Button>
              </div>
            )}
            
            <div className="text-xs text-[#A0A0A0]">
              {filteredHistory.length}件の履歴が見つかりました（全{history.length}件中）
            </div>
          </div>
        )}
        
        {/* 履歴一覧 */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center py-8 text-[#A0A0A0]">
              <History className="h-8 w-8 mx-auto mb-2" />
              <p>まだ履歴がありません</p>
              <p className="text-sm mt-1">企画案を生成すると、ここに履歴が表示されます</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-[#A0A0A0]">
              <Search className="h-8 w-8 mx-auto mb-2" />
              <p>検索条件に一致する履歴がありません</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <Card 
                key={item.id}
                className="bg-[#2D2D2D] border-[#4A4A4A] hover:border-[#4A4A4A]/80 transition-all cursor-pointer"
                onClick={() => loadFromHistory(item)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <History className="h-4 w-4 text-[#A0A0A0]" />
                        <CardTitle className="text-sm font-semibold text-[#E0E0E0]">
                          {item.ideas.length}件の企画案
                        </CardTitle>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.keywords && (
                          <Badge variant="outline" className="text-xs bg-[#1A1A1A] text-[#A0A0A0] border-[#4A4A4A]">
                            {item.keywords}
                          </Badge>
                        )}
                        {item.direction && (
                          <Badge variant="outline" className="text-xs bg-[#1A1A1A] text-[#A0A0A0] border-[#4A4A4A]">
                            {item.direction}
                          </Badge>
                        )}
                      </div>
                      
                      {/* タイムスタンプ表示（デザイナー提案） */}
                      <div className="flex items-center gap-1 text-xs text-[#A0A0A0]">
                        <Clock className="h-3 w-3" />
                        {new Date(item.timestamp).toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    
                    {/* 削除ボタン（デザイナー提案） */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteHistory(item.id);
                      }}
                      className="h-8 w-8 text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/10"
                      aria-label="履歴を削除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* 最初の3件の企画案タイトルをプレビュー表示 */}
                  <div className="space-y-1">
                    {item.ideas.slice(0, 3).map((idea) => (
                      <div key={idea.id} className="text-xs text-[#A0A0A0] line-clamp-1 flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          categoryConfig[idea.category].bgColor
                        )} />
                        {idea.title}
                      </div>
                    ))}
                    {item.ideas.length > 3 && (
                      <div className="text-xs text-[#4A4A4A]">
                        +{item.ideas.length - 3}件
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {/* 全削除ボタン */}
        {history.length > 0 && (
          <div className="flex justify-end pt-2 border-t border-[#4A4A4A]">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllHistory}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              すべての履歴を削除
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  ), [selectedTab, history, filteredHistory, historySearchQuery, historyFilterCategory, loadFromHistory, deleteHistory, clearAllHistory]);

  const sidebarContent = useMemo(() => (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="generate">生成</TabsTrigger>
        <TabsTrigger value="persona">ペルソナ</TabsTrigger>
        <TabsTrigger value="history">履歴</TabsTrigger>
      </TabsList>
      <TabsContent value="generate" className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="keywords">キーワード</Label>
          <Input id="keywords" placeholder="例: ゲーム実況、マリオカート" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="direction">企画の方向性</Label>
          <Select>
            <SelectTrigger id="direction">
              <SelectValue placeholder="方向性を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="funny">面白い系</SelectItem>
              <SelectItem value="moving">感動系</SelectItem>
              <SelectItem value="educational">解説・学習系</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>現在のトレンド</Label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer">#VTuberの夏休み</Badge>
            <Badge variant="outline" className="cursor-pointer">#ゲーム実況</Badge>
            <Badge variant="outline" className="cursor-pointer">#新作ゲーム</Badge>
          </div>
        </div>
        <Button className="w-full" onClick={handleGenerate} disabled={isGeneratingIdeas}>
          {isGeneratingIdeas ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              生成中...
            </>
          ) : (
            '企画案を生成する'
          )}
        </Button>
      </TabsContent>
      <TabsContent value="persona" className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="persona-select">使用するペルソナ</Label>
          <Select>
            <SelectTrigger id="persona-select">
              <SelectValue placeholder="ペルソナを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="persona-1">元気なゲーマー女子</SelectItem>
              <SelectItem value="persona-2">クールな解説お姉さん</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="w-full">ペルソナを管理する</Button>
      </TabsContent>
      <TabsContent value="history" className="mt-4 space-y-4">
        {/* 履歴の検索・フィルター */}
        {history.length > 0 && (
          <div className="space-y-3 p-3 bg-[#2D2D2D] rounded-lg border border-[#4A4A4A]">
            <div className="space-y-2">
              <Label htmlFor="history-search-desktop" className="flex items-center gap-2 text-sm text-[#E0E0E0]">
                <Search className="h-4 w-4" />
                検索
              </Label>
              <Input
                id="history-search-desktop"
                placeholder="キーワード、方向性、タイトルで検索..."
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#4A4A4A]"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-[#A0A0A0]">カテゴリ</Label>
              <Select 
                value={historyFilterCategory} 
                onValueChange={(value) => setHistoryFilterCategory(value as IdeaCategory | 'all')}
              >
                <SelectTrigger className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {(Object.keys(categoryConfig) as IdeaCategory[]).map((category) => (
                    <SelectItem key={category} value={category}>
                      {categoryConfig[category].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(historySearchQuery || historyFilterCategory !== 'all') && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHistorySearchQuery('');
                    setHistoryFilterCategory('all');
                  }}
                  className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A]"
                >
                  <X className="h-4 w-4 mr-1" />
                  フィルターをクリア
                </Button>
              </div>
            )}
            
            <div className="text-xs text-[#A0A0A0]">
              {filteredHistory.length}件の履歴が見つかりました（全{history.length}件中）
            </div>
          </div>
        )}
        
        {/* 履歴一覧 */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center py-8 text-[#A0A0A0]">
              <History className="h-8 w-8 mx-auto mb-2" />
              <p>まだ履歴がありません</p>
              <p className="text-sm mt-1">企画案を生成すると、ここに履歴が表示されます</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-[#A0A0A0]">
              <Search className="h-8 w-8 mx-auto mb-2" />
              <p>検索条件に一致する履歴がありません</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <Card 
                key={item.id}
                className="bg-[#2D2D2D] border-[#4A4A4A] hover:border-[#4A4A4A]/80 transition-all cursor-pointer"
                onClick={() => loadFromHistory(item)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <History className="h-4 w-4 text-[#A0A0A0]" />
                        <CardTitle className="text-sm font-semibold text-[#E0E0E0]">
                          {item.ideas.length}件の企画案
                        </CardTitle>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.keywords && (
                          <Badge variant="outline" className="text-xs bg-[#1A1A1A] text-[#A0A0A0] border-[#4A4A4A]">
                            {item.keywords}
                          </Badge>
                        )}
                        {item.direction && (
                          <Badge variant="outline" className="text-xs bg-[#1A1A1A] text-[#A0A0A0] border-[#4A4A4A]">
                            {item.direction}
                          </Badge>
                        )}
                      </div>
                      
                      {/* タイムスタンプ表示（デザイナー提案） */}
                      <div className="flex items-center gap-1 text-xs text-[#A0A0A0]">
                        <Clock className="h-3 w-3" />
                        {new Date(item.timestamp).toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    
                    {/* 削除ボタン（デザイナー提案） */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteHistory(item.id);
                      }}
                      className="h-8 w-8 text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/10"
                      aria-label="履歴を削除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* 最初の3件の企画案タイトルをプレビュー表示 */}
                  <div className="space-y-1">
                    {item.ideas.slice(0, 3).map((idea) => (
                      <div key={idea.id} className="text-xs text-[#A0A0A0] line-clamp-1 flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          categoryConfig[idea.category].bgColor
                        )} />
                        {idea.title}
                      </div>
                    ))}
                    {item.ideas.length > 3 && (
                      <div className="text-xs text-[#4A4A4A]">
                        +{item.ideas.length - 3}件
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {/* 全削除ボタン */}
        {history.length > 0 && (
          <div className="flex justify-end pt-2 border-t border-[#4A4A4A]">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllHistory}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              すべての履歴を削除
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  ), [selectedTab, handleGenerate, isGeneratingIdeas]);

  return (
    <div className="relative flex flex-col lg:flex-row lg:h-[calc(100vh-4.1rem)] lg:overflow-hidden">
      {/* 左サイドバー (25%) */}
      <aside className={`
        ${isDesktop ? (isSidebarOpen ? 'w-1/4' : 'w-0') : 'w-0'}
        ${isDesktop ? 'border-r border-[#4A4A4A]' : ''}
        transition-all duration-300
        overflow-hidden
        flex-shrink-0
        bg-[#1A1A1A]
        relative
      `}>
        {isDesktop && isSidebarOpen && (
          <div className="h-full overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#E0E0E0]">企画・台本サポート</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
                className="h-8 w-8"
                aria-label="サイドバーを閉じる"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#A0A0A0]"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </Button>
            </div>
            {sidebarContent}
          </div>
        )}
      </aside>

      {/* 中央: 企画案エリア (50%) */}
      <main className="flex-1 lg:w-1/2 p-4 overflow-y-auto lg:pt-4 pt-20 lg:border-r border-[#4A4A4A]">
        {isGeneratingIdeas ? (
          <div className="space-y-4">
            <div className="w-full h-full bg-[#2D2D2D] rounded-md flex flex-col items-center justify-center text-center p-8 min-h-[600px]">
              <Loader2 className="w-16 h-16 text-[#A0A0A0] mb-4 animate-spin" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-[#E0E0E0]">企画案を生成中...</h3>
              <p className="text-[#A0A0A0] mt-2">AIがあなたにぴったりの企画案を考えています。しばらくお待ちください。</p>
            </div>
            {/* ローディング中のスケルトン */}
            <div className="space-y-4" role="status" aria-label="企画案を生成中">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : generatedIdeas.length === 0 ? (
          <div className="w-full h-full bg-[#2D2D2D] rounded-md flex flex-col items-center justify-center text-center p-8 min-h-[600px]">
            <Lightbulb className="w-16 h-16 text-[#A0A0A0] mb-4" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-[#E0E0E0]">企画案を生成しよう！</h3>
            <p className="text-[#A0A0A0] mt-2">サイドパネルからキーワードや企画の方向性を入力して、「企画案を生成する」ボタンを押してください。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* お気に入りタブ */}
            {generatedIdeas.length > 0 && (
              <Tabs value={ideaViewMode} onValueChange={(value) => setIdeaViewMode(value as 'all' | 'favorites' | 'recent')} className="mb-4">
                <TabsList className="grid w-full grid-cols-3 bg-[#2D2D2D] border border-[#4A4A4A]">
                  <TabsTrigger value="all" className="data-[state=active]:bg-[#1A1A1A]">
                    すべて ({generatedIdeas.length})
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="data-[state=active]:bg-[#1A1A1A]">
                    お気に入り ({generatedIdeas.filter(i => i.isFavorite).length})
                  </TabsTrigger>
                  <TabsTrigger value="recent" className="data-[state=active]:bg-[#1A1A1A]">
                    最近生成
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            
            {/* 検索・フィルターUI */}
            {generatedIdeas.length > 0 && (
              <div className="mb-4 space-y-4 p-4 bg-[#2D2D2D] rounded-lg border border-[#4A4A4A]">
                {/* 検索バー */}
                <div className="space-y-2">
                  <Label htmlFor="idea-search" className="flex items-center gap-2 text-[#E0E0E0]">
                    <Search className="h-4 w-4" />
                    検索
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A0A0A0]" />
                    <Input
                      id="idea-search"
                      placeholder="タイトル、説明、ポイントで検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#4A4A4A]"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-[#4A4A4A]"
                        aria-label="検索をクリア"
                      >
                        <X className="h-4 w-4 text-[#A0A0A0]" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* フィルター */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-[#E0E0E0]">
                    <Filter className="h-4 w-4" />
                    フィルター
                  </Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* カテゴリフィルター */}
                    <div className="space-y-2">
                      <Label className="text-sm text-[#A0A0A0]">カテゴリ</Label>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(categoryConfig) as IdeaCategory[]).map((category) => {
                          const isSelected = selectedCategories.includes(category);
                          const config = categoryConfig[category];
                          const CategoryIcon = config.icon;
                          
                          return (
                            <Badge
                              key={category}
                              className={cn(
                                "cursor-pointer transition-all text-xs font-medium",
                                isSelected 
                                  ? config.badgeColor + " border-2 shadow-md" 
                                  : "bg-[#2D2D2D] text-[#A0A0A0] border-[#4A4A4A] hover:border-[#A0A0A0] hover:bg-[#1A1A1A]"
                              )}
                              onClick={() => {
                                setSelectedCategories(prev => 
                                  isSelected 
                                    ? prev.filter(c => c !== category)
                                    : [...prev, category]
                                );
                              }}
                            >
                              <CategoryIcon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* 難易度フィルター */}
                    <div className="space-y-2">
                      <Label className="text-sm text-[#A0A0A0]">難易度</Label>
                      <Select 
                        value={selectedDifficulty} 
                        onValueChange={(value) => setSelectedDifficulty(value as IdeaDifficulty | 'all')}
                      >
                        <SelectTrigger className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">すべて</SelectItem>
                          <SelectItem value="easy">初級</SelectItem>
                          <SelectItem value="medium">中級</SelectItem>
                          <SelectItem value="hard">上級</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* 予想時間フィルター */}
                    <div className="space-y-2">
                      <Label className="text-sm text-[#A0A0A0]">予想時間（分）</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="number"
                          placeholder="最小"
                          min="0"
                          value={durationFilter.min || ''}
                          onChange={(e) => setDurationFilter(prev => ({
                            ...prev,
                            min: e.target.value ? parseInt(e.target.value) : undefined
                          }))}
                          className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#4A4A4A]"
                        />
                        <span className="text-[#A0A0A0]">〜</span>
                        <Input
                          type="number"
                          placeholder="最大"
                          min="0"
                          value={durationFilter.max || ''}
                          onChange={(e) => setDurationFilter(prev => ({
                            ...prev,
                            max: e.target.value ? parseInt(e.target.value) : undefined
                          }))}
                          className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#4A4A4A]"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* フィルターリセットボタン */}
                  {(searchQuery || selectedCategories.length > 0 || selectedDifficulty !== 'all' || durationFilter.min !== undefined || durationFilter.max !== undefined) && (
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategories([]);
                          setSelectedDifficulty('all');
                          setDurationFilter({});
                        }}
                        className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A]"
                      >
                        <X className="h-4 w-4 mr-1" />
                        フィルターをクリア
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* 検索結果数表示 */}
                <div className="text-sm text-[#A0A0A0] pt-2 border-t border-[#4A4A4A]">
                  <span className="font-medium text-[#E0E0E0]">{filteredIdeas.length}</span>件の企画案が見つかりました
                  {filteredIdeas.length < generatedIdeas.length && (
                    <span className="ml-2">（全{generatedIdeas.length}件中）</span>
                  )}
                </div>
              </div>
            )}
            
            {/* フィルター結果が0件の場合 */}
            {generatedIdeas.length > 0 && filteredIdeas.length === 0 && (
              <div className="w-full bg-[#2D2D2D] rounded-md flex flex-col items-center justify-center text-center p-8 min-h-[400px] border border-[#4A4A4A]">
                <Search className="w-12 h-12 text-[#A0A0A0] mb-4" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-[#E0E0E0] mb-2">検索条件に一致する企画案がありません</h3>
                <p className="text-[#A0A0A0] mb-4">検索条件やフィルターを変更してお試しください。</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategories([]);
                    setSelectedDifficulty('all');
                    setDurationFilter({});
                  }}
                  className="border-[#4A4A4A]"
                >
                  <X className="h-4 w-4 mr-1" />
                  フィルターをクリア
                </Button>
              </div>
            )}
            
            {/* 企画案カード一覧 */}
            {filteredIdeas.length > 0 && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="ideas">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {filteredIdeas.map((idea, index) => {
              const category = categoryConfig[idea.category];
              const CategoryIcon = category.icon;
              
              return (
                <Draggable 
                  key={idea.id} 
                  draggableId={idea.id.toString()} 
                  index={index}
                  isDragDisabled={idea.isFavorite} // お気に入りは固定
                >
                  {(provided, snapshot) => (
                  <Card 
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn(
                      "cursor-pointer transition-all relative overflow-hidden",
                      "hover:border-primary hover:shadow-lg hover:shadow-primary/20",
                      selectedIdeaId === idea.id && "border-primary shadow-md",
                      snapshot.isDragging && "shadow-2xl opacity-90 bg-[#3A3A3A]",
                      idea.isFavorite && "border-l-4 border-l-yellow-500/80",
                      // グラデーション背景
                      `bg-gradient-to-br ${category.gradient}`,
                      // カテゴリごとの左側ボーダー（お気に入りでない場合のみ）
                      !idea.isFavorite && `border-l-4 ${category.borderColor}`
                    )}
                    onClick={() => handleCardClick(idea.id)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={selectedIdeaId === idea.id}
                    aria-label={`企画案: ${idea.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardClick(idea.id);
                      }
                    }}
                  >
                    {/* ドラッグハンドル */}
                    {!idea.isFavorite && (
                      <div 
                        {...provided.dragHandleProps}
                        className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-[#4A4A4A]/50 z-10 rounded-l-md transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GripVertical className="h-4 w-4 text-[#A0A0A0]" />
                      </div>
                    )}
                    
                    <CardHeader className={cn("pb-3", !idea.isFavorite && "pl-8")}>
                      <div className="flex items-start gap-3">
                        {/* カテゴリアイコン */}
                        <div className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center shadow-md flex-shrink-0",
                          category.bgColor,
                          "border border-[#4A4A4A]"
                        )}>
                          <CategoryIcon className="h-6 w-6 text-[#E0E0E0]" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <CardTitle className="text-lg font-semibold line-clamp-2 text-[#E0E0E0] flex-1">
                              {idea.title}
                            </CardTitle>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* お気に入りボタン */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(idea.id);
                                }}
                                className={cn(
                                  "h-8 w-8",
                                  idea.isFavorite 
                                    ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10" 
                                    : "text-[#A0A0A0] hover:text-yellow-400 hover:bg-yellow-500/10"
                                )}
                                aria-label={idea.isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
                              >
                                <Star className={cn(
                                  "h-4 w-4 transition-all",
                                  idea.isFavorite && "fill-current"
                                )} />
                              </Button>
                              
                              {/* 予想配信時間 */}
                              <Badge variant="outline" className="flex-shrink-0 border-[#4A4A4A] text-[#A0A0A0]">
                                <Clock className="h-3 w-3 mr-1" />
                                {idea.estimatedDuration}分
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {/* カテゴリバッジ */}
                            <Badge className={cn(
                              category.badgeColor,
                              "text-xs font-medium"
                            )}>
                              {category.label}
                            </Badge>
                            
                            {/* 難易度バッジ */}
                            {idea.difficulty && (
                              <Badge 
                                variant="outline"
                                className={cn(
                                  "text-xs font-medium border-[#4A4A4A]",
                                  idea.difficulty === 'easy' && 'text-green-400 border-green-500/50 bg-green-500/10',
                                  idea.difficulty === 'medium' && 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10',
                                  idea.difficulty === 'hard' && 'text-red-400 border-red-500/50 bg-red-500/10',
                                )}
                              >
                                {idea.difficulty === 'easy' ? '初級' : 
                                 idea.difficulty === 'medium' ? '中級' : '上級'}
                              </Badge>
                            )}
                          </div>
                          
                          <CardDescription className="line-clamp-2 text-[#A0A0A0]">
                            {idea.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <h4 className="font-semibold text-sm mb-2 text-[#E0E0E0]">おすすめポイント</h4>
                      <div className="flex flex-wrap gap-2">
                        {idea.points.map((point: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="text-xs bg-[#2D2D2D] text-[#A0A0A0] border-[#4A4A4A]"
                          >
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="gap-2">
                      <Button variant="outline" aria-label="この企画を調整" className="border-[#4A4A4A]">
                        この企画を調整
                      </Button>
                      <Button 
                        onClick={() => handleGenerateScript(idea)}
                        disabled={isGeneratingScript}
                        aria-label={`${idea.title}の台本を生成`}
                      >
                        {isGeneratingScript ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                            台本生成中...
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                            台本を生成する
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                  )}
                </Draggable>
              );
            })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        )}
      </main>

      {/* 右: 台本プレビューエリア (25%) - デスクトップのみ */}
      <aside className={`
        hidden lg:block
        w-1/4
        overflow-y-auto
        bg-[#1A1A1A]
        border-l border-[#4A4A4A]
        flex-shrink-0
      `}>
        <div className="p-4 h-full">
          {currentScript && selectedIdeaId === currentScript.ideaId ? (
            <Card className="bg-[#2D2D2D]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2 text-[#E0E0E0]">
                    <FileText className="h-5 w-5" />
                    台本プレビュー
                  </CardTitle>
                  
                  {/* 印刷・PDFエクスポートボタン（利用者提案） */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrint}
                      className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0]"
                      title="印刷"
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      印刷
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPDF}
                      className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0]"
                      title="PDFエクスポート"
                    >
                      <FileDown className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm whitespace-pre-wrap">
                <div>
                  <h5 className="font-bold mb-2 text-[#E0E0E0]">【導入】</h5>
                  <p className="text-[#A0A0A0] leading-relaxed">{currentScript.introduction}</p>
                </div>
                <div>
                  <h5 className="font-bold mb-2 text-[#E0E0E0]">【本題】</h5>
                  <p className="text-[#A0A0A0] leading-relaxed">{currentScript.body}</p>
                </div>
                <div>
                  <h5 className="font-bold mb-2 text-[#E0E0E0]">【結論】</h5>
                  <p className="text-[#A0A0A0] leading-relaxed">{currentScript.conclusion}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
              <FileText className="w-16 h-16 text-[#A0A0A0] mb-4" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-[#E0E0E0] mb-2">台本プレビュー</h3>
              <p className="text-[#A0A0A0]">
                企画案を選択して「台本を生成する」ボタンを押すと、ここに台本が表示されます。
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Controls - Always Visible */}
      <div className="p-4 border-t border-[#4A4A4A] lg:hidden">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Construction className="h-5 w-5" />
            <h3 className="text-lg font-semibold">企画案生成</h3>
          </div>
          {renderControlPanel()}
        </div>
      </div>

      {/* モバイル用台本プレビュー（企画案の下に表示） */}
      {!isDesktop && currentScript && selectedIdeaId === currentScript.ideaId && (
        <div className="p-4 border-t border-[#4A4A4A] lg:hidden bg-[#1A1A1A]">
          <Card className="bg-[#2D2D2D]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-[#E0E0E0]">
                  <FileText className="h-5 w-5" />
                  台本プレビュー
                </CardTitle>
                
                {/* 印刷・PDFエクスポートボタン（利用者提案） */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0]"
                    title="印刷"
                  >
                    <Printer className="h-4 w-4 mr-1" />
                    印刷
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0]"
                    title="PDFエクスポート"
                  >
                    <FileDown className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm whitespace-pre-wrap">
              <div>
                <h5 className="font-bold mb-2 text-[#E0E0E0]">【導入】</h5>
                <p className="text-[#A0A0A0] leading-relaxed">{currentScript.introduction}</p>
              </div>
              <div>
                <h5 className="font-bold mb-2 text-[#E0E0E0]">【本題】</h5>
                <p className="text-[#A0A0A0] leading-relaxed">{currentScript.body}</p>
              </div>
              <div>
                <h5 className="font-bold mb-2 text-[#E0E0E0]">【結論】</h5>
                <p className="text-[#A0A0A0] leading-relaxed">{currentScript.conclusion}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      {!isDesktop && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* モバイル用サイドバー */}
      {!isDesktop && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          title="企画・台本サポート"
          isDesktop={isDesktop}
        >
          {mobileSidebarContent}
        </Sidebar>
      )}

      {/* デスクトップ用サイドバートグルボタン */}
      {isDesktop && !isSidebarOpen && (
        <SidebarToggle 
          onOpen={() => setIsSidebarOpen(true)}
          isDesktop={isDesktop}
          tabs={[
            { id: "generate", label: "生成", icon: <Lightbulb className="h-4 w-4" /> },
            { id: "persona", label: "ペルソナ", icon: <Construction className="h-4 w-4" /> },
            { id: "history", label: "履歴", icon: <FileText className="h-4 w-4" /> }
          ]}
          onTabClick={setSelectedTab}
        />
      )}
    </div>
  );
}
