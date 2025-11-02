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
import { Lightbulb, Construction, Loader2, FileText, Gamepad2, Music, MessageCircle, Users, Calendar, Clock, Search, Filter, X, Star, GripVertical, History, Trash2, Printer, FileDown, Undo2, Redo2, Save, RotateCcw, BookOpen, Layout, Plus, Edit2, Play, Pause, Volume2, Gauge, Check, Share2, Copy, Download, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useSidebar } from '@/hooks/use-sidebar';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sidebar, SidebarToggle } from '@/components/layouts/Sidebar';
import { logger } from '@/lib/logger';
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";

type IdeaCategory = 'gaming' | 'singing' | 'talk' | 'collaboration' | 'event' | 'other';
type IdeaDifficulty = 'easy' | 'medium' | 'hard';

// 生成ステップの型定義（6.9）
interface GenerationStep {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

type GenerationType = 'ideas' | 'script';

// 生成設定の型定義（6.10）
interface GenerationSettings {
  keywords: string;
  direction: string;
  duration: number; // 配信時間（分）
  speakingStyle: string[]; // 話し方のスタイル（複数選択可）
  includeElements: string[]; // 含める要素（複数選択可）
  customPrompt: string; // カスタムプロンプト
}

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

// ペルソナ管理の型定義（6.12）
interface Persona {
  id: string;
  name: string;
  description: string; // ペルソナの特徴や話し方
  speakingStyle?: string[]; // 話し方のスタイル（オプション）
  traits?: string[]; // キャラクターの特徴（オプション）
  createdAt: number;
  updatedAt: number;
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

// 台本テンプレートのセクション定義（6.8）
interface ScriptSection {
  id: string;
  label: string;
  placeholder: string;
  required: boolean;
  order: number;
  color: string; // 色分け用（blue, green, purple, yellow, orange, pink）
}

// 台本テンプレートのデータ構造（6.8）
interface ScriptTemplate {
  id: string;
  name: string;
  description: string;
  category: IdeaCategory;
  sections: ScriptSection[];
  isCustom?: boolean; // カスタムテンプレートかどうか
}

// デフォルトテンプレート定義（6.8）
const defaultTemplates: ScriptTemplate[] = [
  {
    id: 'standard',
    name: '標準形式',
    description: '導入・本題・結論の3部構成',
    category: 'other',
    sections: [
      { id: 'introduction', label: '導入', placeholder: '導入部分を入力...', required: true, order: 1, color: 'blue' },
      { id: 'body', label: '本題', placeholder: '本題部分を入力...', required: true, order: 2, color: 'green' },
      { id: 'conclusion', label: '結論', placeholder: '結論部分を入力...', required: true, order: 3, color: 'purple' },
    ]
  },
  {
    id: 'gaming',
    name: 'ゲーム実況形式',
    description: 'ゲーム実況向けのテンプレート',
    category: 'gaming',
    sections: [
      { id: 'intro', label: '挨拶・ゲーム紹介', placeholder: '挨拶とゲーム紹介...', required: true, order: 1, color: 'blue' },
      { id: 'setup', label: '準備・ルール説明', placeholder: '準備やルール説明...', required: false, order: 2, color: 'yellow' },
      { id: 'play', label: 'ゲームプレイ', placeholder: 'ゲームプレイの内容...', required: true, order: 3, color: 'green' },
      { id: 'highlight', label: '見どころ', placeholder: '見どころやポイント...', required: false, order: 4, color: 'orange' },
      { id: 'ending', label: '終了挨拶', placeholder: '終了挨拶...', required: true, order: 5, color: 'purple' },
    ]
  },
  {
    id: 'singing',
    name: '歌枠形式',
    description: '歌枠配信用のテンプレート',
    category: 'singing',
    sections: [
      { id: 'intro', label: '挨拶', placeholder: '挨拶...', required: true, order: 1, color: 'blue' },
      { id: 'setlist', label: 'セットリスト紹介', placeholder: 'セットリスト...', required: false, order: 2, color: 'pink' },
      { id: 'performance', label: '歌唱', placeholder: '歌唱内容...', required: true, order: 3, color: 'green' },
      { id: 'thanks', label: 'お礼・次回予告', placeholder: 'お礼と次回予告...', required: true, order: 4, color: 'purple' },
    ]
  },
  {
    id: 'talk',
    name: '雑談形式',
    description: '雑談配信用のテンプレート',
    category: 'talk',
    sections: [
      { id: 'intro', label: '挨拶・今日のテーマ', placeholder: '挨拶と今日のテーマ...', required: true, order: 1, color: 'blue' },
      { id: 'topic1', label: '話題1', placeholder: '話題1の内容...', required: false, order: 2, color: 'green' },
      { id: 'topic2', label: '話題2', placeholder: '話題2の内容...', required: false, order: 3, color: 'yellow' },
      { id: 'interaction', label: '視聴者との交流', placeholder: '視聴者との交流内容...', required: false, order: 4, color: 'orange' },
      { id: 'ending', label: '終了挨拶', placeholder: '終了挨拶...', required: true, order: 5, color: 'purple' },
    ]
  },
];

interface Script {
  ideaId: number;
  content: string;
  introduction: string;
  body: string;
  conclusion: string;
  templateId?: string; // 使用したテンプレートID（6.8）
  sections?: Record<string, string>; // 動的セクション（6.8）
}

// アンドゥ・リドゥ用の履歴管理（利用者提案）
interface ScriptHistoryItem {
  introduction: string;
  body: string;
  conclusion: string;
  timestamp: number;
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

// 保存済み台本のデータ構造（6.7, 6.14）
interface SavedScript {
  id: string;
  scriptId: number; // currentScript.ideaIdと対応
  title: string; // 企画案のタイトル
  introduction: string;
  body: string;
  conclusion: string;
  createdAt: number; // 作成タイムスタンプ
  updatedAt: number; // 更新タイムスタンプ
  version: number; // バージョン番号（同一scriptIdの複数バージョン対応）
  versionName?: string; // バージョン名（オプション）（6.14）
  templateId?: string; // テンプレートID（6.8）
  sections?: Record<string, string>; // 動的セクション（6.8）
}

// 生成ステップ定義（6.9）
const ideaGenerationSteps: GenerationStep[] = [
  { id: 'analyze', label: 'キーワード分析中...' },
  { id: 'brainstorm', label: 'アイデア発想中...' },
  { id: 'organize', label: '企画案を整理中...' },
  { id: 'complete', label: '完成！' },
];

const scriptGenerationSteps: GenerationStep[] = [
  { id: 'analyze', label: '企画案を分析中...' },
  { id: 'structure', label: '台本構造を作成中...' },
  { id: 'generate', label: 'セクションを生成中...' },
  { id: 'adjust', label: '最終調整中...' },
  { id: 'complete', label: '完成！' },
];

// プログレスバーコンポーネント（6.9）
interface ProgressBarProps {
  steps: GenerationStep[];
  currentStepId: string | null;
  type: GenerationType;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStepId, type }) => {
  const currentIndex = currentStepId ? steps.findIndex(s => s.id === currentStepId) : -1;
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;
  
  return (
    <div className="w-full space-y-6">
      {/* メインのローディング表示 */}
      <div className="w-full h-full bg-[#2D2D2D] rounded-md flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
        <Loader2 className="w-16 h-16 text-primary mb-6 animate-spin" aria-hidden="true" />
        <h3 className="text-xl font-semibold text-[#E0E0E0] mb-2">
          {type === 'ideas' ? '企画案を生成中...' : '台本を生成中...'}
        </h3>
        
        {/* プログレスバー */}
        <div className="w-full max-w-md mt-6">
          <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-[#A0A0A0] mt-2 text-center">
            {currentIndex >= 0 && currentIndex < steps.length ? steps[currentIndex].label : '準備中...'}
          </p>
        </div>
        
        {/* ステップ表示 */}
        <div className="w-full max-w-2xl mt-8">
          <div className="flex items-center justify-between relative">
            {/* 接続線 */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-[#4A4A4A] -z-10" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 ease-out -z-10"
              style={{ width: `${progress}%` }}
            />
            
            {/* ステップアイコン */}
            {steps.map((step, index) => {
              const isActive = currentIndex >= index;
              const isCurrent = currentIndex === index;
              
              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      isCurrent
                        ? "bg-primary border-primary scale-110 shadow-lg shadow-primary/50"
                        : isActive
                        ? "bg-primary/20 border-primary"
                        : "bg-[#1A1A1A] border-[#4A4A4A]"
                    )}
                  >
                    {isCurrent ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : isActive ? (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-[#4A4A4A]" />
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-xs mt-2 text-center max-w-[100px] transition-colors duration-300",
                      isCurrent
                        ? "text-primary font-semibold"
                        : isActive
                        ? "text-[#E0E0E0]"
                        : "text-[#4A4A4A]"
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ScriptGeneratorPage() {
  const [generatedIdeas, setGeneratedIdeas] = useState<Idea[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null);
  const [currentScript, setCurrentScript] = useState<Script | null>(null);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  
  // 生成プロセスの可視化（6.9）
  const [ideaGenerationStep, setIdeaGenerationStep] = useState<string | null>(null);
  const [scriptGenerationStep, setScriptGenerationStep] = useState<string | null>(null);
  
  // 生成設定の状態管理（6.10）
  const [generationSettings, setGenerationSettings] = useState<GenerationSettings>({
    keywords: '',
    direction: '',
    duration: 60, // デフォルト60分
    speakingStyle: [],
    includeElements: [],
    customPrompt: '',
  });
  
  // 台本プレビューの状態管理（6.11）
  const [previewMode, setPreviewMode] = useState<'edit' | 'reading' | 'timeline'>('edit');
  const [readingSpeed, setReadingSpeed] = useState(1.0); // 読み上げ速度（0.5〜2.0倍速）
  const [currentReadingIndex, setCurrentReadingIndex] = useState<number | null>(null);
  const [isReading, setIsReading] = useState(false);
  
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
  const SAVED_SCRIPTS_STORAGE_KEY = 'script-generator-saved-scripts'; // 6.7
  const CUSTOM_TEMPLATES_STORAGE_KEY = 'script-generator-custom-templates'; // 6.8
  const PERSONAS_STORAGE_KEY = 'script-generator-personas'; // 6.12
  const DEFAULT_PERSONA_STORAGE_KEY = 'script-generator-default-persona'; // 6.12
  const MAX_HISTORY_ITEMS = 50; // 最大履歴件数
  const MAX_SAVED_SCRIPTS = 50; // 最大保存件数（6.7）
  const MAX_PERSONAS = 50; // 最大ペルソナ数（6.12）
  
  // 生成履歴の状態管理
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');
  const [historyFilterCategory, setHistoryFilterCategory] = useState<IdeaCategory | 'all'>('all');
  
  // 台本エディターの状態管理（6.6）
  const [scriptHistory, setScriptHistory] = useState<ScriptHistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isEditingScript, setIsEditingScript] = useState(false);
  const MAX_SCRIPT_HISTORY_LENGTH = 50; // 最大履歴数
  
  // 保存済み台本の状態管理（6.7）
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'editing' | 'saving'>('saved'); // 保存状態
  const AUTO_SAVE_INTERVAL = 30000; // 自動保存間隔（30秒）
  
  // 台本テンプレートの状態管理（6.8）
  const [customTemplates, setCustomTemplates] = useState<ScriptTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('standard'); // 選択中のテンプレートID
  
  // ペルソナ管理の状態管理（6.12）
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [defaultPersonaId, setDefaultPersonaId] = useState<string | null>(null);
  const [isPersonaDialogOpen, setIsPersonaDialogOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [personaFormData, setPersonaFormData] = useState({
    name: '',
    description: '',
    speakingStyle: [] as string[],
    traits: [] as string[],
  });
  
  // 台本複製の状態管理（6.14）
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [duplicateVersionName, setDuplicateVersionName] = useState('');
  
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

  // 保存済み台本の読み込み（初回マウント時）（6.7）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(SAVED_SCRIPTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedScripts(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      console.error('保存済み台本読み込み失敗', err);
    }
  }, []);

  // カスタムテンプレートの読み込み（初回マウント時）（6.8）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(CUSTOM_TEMPLATES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCustomTemplates(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      console.error('カスタムテンプレート読み込み失敗', err);
    }
  }, []);

  // ペルソナデータの読み込み（初回マウント時）（6.12）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(PERSONAS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPersonas(Array.isArray(parsed) ? parsed : []);
      }
      
      const defaultId = localStorage.getItem(DEFAULT_PERSONA_STORAGE_KEY);
      if (defaultId) {
        setDefaultPersonaId(defaultId);
        setSelectedPersonaId(defaultId);
      }
    } catch (err) {
      console.error('ペルソナ読み込み失敗', err);
    }
  }, []);

  // URLパラメータから企画案を読み込み（6.13）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const ideaParam = urlParams.get('idea');
    
    if (ideaParam) {
      try {
        const decodedData = decodeURIComponent(atob(ideaParam));
        const ideaData = JSON.parse(decodedData);
        
        // 企画案として表示
        const importedIdea: Idea = {
          id: Date.now(),
          title: ideaData.title || '共有された企画案',
          description: ideaData.description || '',
          points: ideaData.points || [],
          category: ideaData.category || 'other',
          estimatedDuration: ideaData.estimatedDuration || 60,
          difficulty: ideaData.difficulty,
        };
        
        setGeneratedIdeas(prev => [importedIdea, ...prev]);
        setSelectedIdeaId(importedIdea.id);
        toast.success('共有された企画案を読み込みました');
        
        // URLからパラメータを削除
        window.history.replaceState({}, '', window.location.pathname);
      } catch (err) {
        console.error('企画案読み込み失敗', err);
        toast.error('共有URLの読み込みに失敗しました');
      }
    }
  }, []);

  // 全テンプレート（デフォルト + カスタム）を取得（6.8）
  const allTemplates = useMemo(() => {
    return [...defaultTemplates, ...customTemplates];
  }, [customTemplates]);

  // 選択中のテンプレートを取得（6.8）
  const selectedTemplate = useMemo(() => {
    return allTemplates.find(t => t.id === selectedTemplateId) || defaultTemplates[0];
  }, [allTemplates, selectedTemplateId]);

  // セクション色のマッピング（6.8）
  const sectionColorMap: Record<string, { border: string; bg: string }> = {
    blue: { border: 'border-blue-500/50', bg: 'bg-blue-500/5' },
    green: { border: 'border-green-500/50', bg: 'bg-green-500/5' },
    purple: { border: 'border-purple-500/50', bg: 'bg-purple-500/5' },
    yellow: { border: 'border-yellow-500/50', bg: 'bg-yellow-500/5' },
    orange: { border: 'border-orange-500/50', bg: 'bg-orange-500/5' },
    pink: { border: 'border-pink-500/50', bg: 'bg-pink-500/5' },
  };

  // 現在の台本で使用中のテンプレートを取得（6.8）
  const currentTemplate = useMemo(() => {
    if (!currentScript?.templateId) {
      // テンプレート未指定の場合は標準形式を使用（互換性のため）
      return defaultTemplates[0];
    }
    return allTemplates.find(t => t.id === currentScript.templateId) || defaultTemplates[0];
  }, [currentScript, allTemplates]);

  // セクションの値を取得（互換性のため）（6.8）
  const getSectionValue = useCallback((sectionId: string): string => {
    if (!currentScript) return '';
    
    // 動的セクションから取得を試みる
    if (currentScript.sections && currentScript.sections[sectionId]) {
      return currentScript.sections[sectionId];
    }
    
    // 標準セクションの互換性マッピング
    if (sectionId === 'introduction' || sectionId === 'intro') {
      return currentScript.introduction || '';
    } else if (sectionId === 'body' || sectionId === 'play' || sectionId === 'performance') {
      return currentScript.body || '';
    } else if (sectionId === 'conclusion' || sectionId === 'ending' || sectionId === 'thanks') {
      return currentScript.conclusion || '';
    }
    
    return '';
  }, [currentScript]);

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

  // ペルソナの保存（localStorage）（6.12）
  const savePersonas = useCallback((newPersonas: Persona[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PERSONAS_STORAGE_KEY, JSON.stringify(newPersonas));
    } catch (err) {
      console.error('ペルソナ保存失敗', err);
      toast.error('ペルソナの保存に失敗しました');
    }
  }, []);

  // デフォルトペルソナの保存（6.12）
  const saveDefaultPersona = useCallback((personaId: string | null) => {
    if (typeof window === 'undefined') return;
    try {
      if (personaId) {
        localStorage.setItem(DEFAULT_PERSONA_STORAGE_KEY, personaId);
      } else {
        localStorage.removeItem(DEFAULT_PERSONA_STORAGE_KEY);
      }
    } catch (err) {
      console.error('デフォルトペルソナ保存失敗', err);
    }
  }, []);

  // ペルソナフォームのリセット（6.12）
  const resetPersonaForm = useCallback(() => {
    setPersonaFormData({
      name: '',
      description: '',
      speakingStyle: [],
      traits: [],
    });
    setEditingPersona(null);
  }, []);

  // ペルソナの作成（6.12）
  const createPersona = useCallback(() => {
    const newPersona: Persona = {
      id: `persona-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: personaFormData.name.trim(),
      description: personaFormData.description.trim(),
      speakingStyle: personaFormData.speakingStyle,
      traits: personaFormData.traits,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (!newPersona.name) {
      toast.error('ペルソナ名を入力してください');
      return;
    }

    if (personas.length >= MAX_PERSONAS) {
      toast.error(`ペルソナは最大${MAX_PERSONAS}件まで作成できます`);
      return;
    }

    const updated = [...personas, newPersona];
    setPersonas(updated);
    savePersonas(updated);
    
    // 最初のペルソナを自動的にデフォルトと選択に設定
    if (personas.length === 0) {
      setDefaultPersonaId(newPersona.id);
      setSelectedPersonaId(newPersona.id);
      saveDefaultPersona(newPersona.id);
    }
    
    toast.success('ペルソナを作成しました');
    setIsPersonaDialogOpen(false);
    resetPersonaForm();
  }, [personas, personaFormData, savePersonas, saveDefaultPersona, resetPersonaForm]);

  // ペルソナの更新（6.12）
  const updatePersona = useCallback((persona: Persona) => {
    const updated = personas.map(p => 
      p.id === persona.id 
        ? { ...persona, updatedAt: Date.now() }
        : p
    );
    setPersonas(updated);
    savePersonas(updated);
    toast.success('ペルソナを更新しました');
    setIsPersonaDialogOpen(false);
    resetPersonaForm();
  }, [personas, savePersonas, resetPersonaForm]);

  // ペルソナの削除（6.12）
  const deletePersona = useCallback((id: string) => {
    const persona = personas.find(p => p.id === id);
    if (!persona) return;

    if (defaultPersonaId === id) {
      toast.error('デフォルトに設定されているペルソナは削除できません。先に他のペルソナをデフォルトに設定してください。');
      return;
    }

    if (!confirm(`「${persona.name}」を削除しますか？`)) {
      return;
    }

    const updated = personas.filter(p => p.id !== id);
    setPersonas(updated);
    savePersonas(updated);
    
    if (selectedPersonaId === id) {
      setSelectedPersonaId(defaultPersonaId || (updated.length > 0 ? updated[0].id : null));
    }
    
    toast.success('ペルソナを削除しました');
  }, [personas, defaultPersonaId, selectedPersonaId, savePersonas]);

  // デフォルトペルソナの設定（6.12）
  const setDefaultPersona = useCallback((id: string) => {
    setDefaultPersonaId(id);
    saveDefaultPersona(id);
    toast.success('デフォルトペルソナを設定しました');
  }, [saveDefaultPersona]);

  // 編集開始（6.12）
  const handleEditPersona = useCallback((persona: Persona) => {
    setEditingPersona(persona);
    setPersonaFormData({
      name: persona.name,
      description: persona.description,
      speakingStyle: persona.speakingStyle || [],
      traits: persona.traits || [],
    });
    setIsPersonaDialogOpen(true);
  }, []);

  // 新規作成開始（6.12）
  const handleCreatePersona = useCallback(() => {
    resetPersonaForm();
    setIsPersonaDialogOpen(true);
  }, [resetPersonaForm]);

  // ダイアログ保存処理（6.12）
  const handleSavePersona = useCallback(() => {
    if (editingPersona) {
      const updated: Persona = {
        ...editingPersona,
        name: personaFormData.name.trim(),
        description: personaFormData.description.trim(),
        speakingStyle: personaFormData.speakingStyle,
        traits: personaFormData.traits,
        updatedAt: Date.now(),
      };
      if (!updated.name) {
        toast.error('ペルソナ名を入力してください');
        return;
      }
      updatePersona(updated);
    } else {
      createPersona();
    }
  }, [editingPersona, personaFormData, updatePersona, createPersona]);

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

  // 企画案をテキスト形式に変換（6.13）
  const formatIdeaAsText = useCallback((idea: Idea): string => {
    const categoryLabel = categoryConfig[idea.category].label;
    const difficultyLabel = idea.difficulty === 'easy' ? '初級' : idea.difficulty === 'medium' ? '中級' : idea.difficulty === 'hard' ? '上級' : '';
    
    return `【企画案】${idea.title}

${idea.description}

■ カテゴリ: ${categoryLabel}
${difficultyLabel ? `■ 難易度: ${difficultyLabel}\n` : ''}■ 予想配信時間: ${idea.estimatedDuration}分

■ おすすめポイント:
${idea.points.map((point, index) => `  ${index + 1}. ${point}`).join('\n')}

生成日時: ${new Date().toLocaleString('ja-JP')}
`;
  }, []);

  // 企画案をコピー（6.13）
  const handleCopyIdea = useCallback(async (idea: Idea) => {
    try {
      const text = formatIdeaAsText(idea);
      await navigator.clipboard.writeText(text);
      toast.success('クリップボードにコピーしました');
    } catch (err) {
      logger.error('コピー失敗', err, 'ScriptGenerator');
      toast.error('コピーに失敗しました');
    }
  }, [formatIdeaAsText]);

  // 企画案をテキストファイルとしてエクスポート（6.13）
  const handleExportIdeaAsText = useCallback((idea: Idea) => {
    try {
      const text = formatIdeaAsText(idea);
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `企画案_${idea.title.replace(/[^\w\s]/g, '_')}_${new Date().getTime()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('テキストファイルとしてエクスポートしました');
    } catch (err) {
      logger.error('エクスポート失敗', err, 'ScriptGenerator');
      toast.error('エクスポートに失敗しました');
    }
  }, [formatIdeaAsText]);

  // 企画案をURL共有（6.13）
  const handleShareIdeaUrl = useCallback(async (idea: Idea) => {
    try {
      // 企画案データをbase64エンコード
      const ideaData = JSON.stringify({
        title: idea.title,
        description: idea.description,
        points: idea.points,
        category: idea.category,
        estimatedDuration: idea.estimatedDuration,
        difficulty: idea.difficulty,
      });
      
      const encodedData = btoa(encodeURIComponent(ideaData));
      const shareUrl = `${window.location.origin}${window.location.pathname}?idea=${encodedData}`;
      
      await navigator.clipboard.writeText(shareUrl);
      toast.success('共有URLをクリップボードにコピーしました');
    } catch (err) {
      logger.error('URL共有失敗', err, 'ScriptGenerator');
      toast.error('URL共有に失敗しました');
    }
  }, []);

  // 企画案をPDFとしてエクスポート（6.13）
  const handleExportIdeaAsPDF = useCallback(async (idea: Idea) => {
    try {
      // PDF生成用のHTMLを作成
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${idea.title}</title>
  <style>
    body {
      font-family: 'Noto Sans JP', sans-serif;
      padding: 40px;
      color: #333;
      line-height: 1.6;
    }
    h1 {
      font-size: 24px;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #555;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      background: #f0f0f0;
      border-radius: 4px;
      margin-right: 8px;
      font-size: 12px;
    }
    ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ccc;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>【企画案】${idea.title}</h1>
  
  <div class="section">
    <p>${idea.description}</p>
  </div>
  
  <div class="section">
    <span class="badge">${categoryConfig[idea.category].label}</span>
    ${idea.difficulty ? `<span class="badge">${idea.difficulty === 'easy' ? '初級' : idea.difficulty === 'medium' ? '中級' : '上級'}</span>` : ''}
    <span class="badge">${idea.estimatedDuration}分</span>
  </div>
  
  <div class="section">
    <div class="section-title">おすすめポイント</div>
    <ul>
      ${idea.points.map(point => `<li>${point}</li>`).join('')}
    </ul>
  </div>
  
  <div class="footer">
    生成日時: ${new Date().toLocaleString('ja-JP')}
  </div>
</body>
</html>
      `;

      // 新しいウィンドウでPDF印刷ダイアログを開く
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            toast.success('PDFとして保存できます（印刷ダイアログから「PDFに保存」を選択）');
          }, 250);
        };
      } else {
        toast.error('ポップアップがブロックされています');
      }
    } catch (err) {
      logger.error('PDFエクスポート失敗', err, 'ScriptGenerator');
      toast.error('PDFエクスポートに失敗しました');
    }
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
    setIdeaGenerationStep(ideaGenerationSteps[0].id); // 最初のステップを設定
    
    await handleAsyncError(async () => {
      // ステップ1: キーワード分析中
      await new Promise(resolve => setTimeout(resolve, 300));
      setIdeaGenerationStep(ideaGenerationSteps[1].id);
      
      // ステップ2: アイデア発想中
      await new Promise(resolve => setTimeout(resolve, 300));
      setIdeaGenerationStep(ideaGenerationSteps[2].id);
      
      // ステップ3: 企画案を整理中
      await new Promise(resolve => setTimeout(resolve, 400));
      setIdeaGenerationStep(ideaGenerationSteps[3].id);
      
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
      
      // 完成ステップを少し表示してから終了
      await new Promise(resolve => setTimeout(resolve, 200));
    }, "企画案生成中にエラーが発生しました");
    
    setIsGeneratingIdeas(false);
    setIdeaGenerationStep(null);
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

  // 履歴に追加（アンドゥ・リドゥ用）
  const addToScriptHistory = useCallback((script: Script) => {
    const historyItem: ScriptHistoryItem = {
      introduction: script.introduction,
      body: script.body,
      conclusion: script.conclusion,
      timestamp: Date.now(),
    };
    
    setScriptHistory(prev => {
      // 現在の履歴インデックス以降を削除（新しい履歴を追加するため）
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(historyItem);
      // 最大履歴数を超えた場合は古いものを削除
      if (newHistory.length > MAX_SCRIPT_HISTORY_LENGTH) {
        return newHistory.slice(-MAX_SCRIPT_HISTORY_LENGTH);
      }
      return newHistory;
    });
    setHistoryIndex(prev => {
      const newIndex = prev + 1;
      return newIndex >= MAX_SCRIPT_HISTORY_LENGTH - 1 ? MAX_SCRIPT_HISTORY_LENGTH - 1 : newIndex;
    });
  }, [historyIndex]);

  // アンドゥ（利用者提案）
  const handleUndo = useCallback(() => {
    if (historyIndex > 0 && currentScript) {
      const prevItem = scriptHistory[historyIndex - 1];
      const updatedScript: Script = {
        ...currentScript,
        introduction: prevItem.introduction,
        body: prevItem.body,
        conclusion: prevItem.conclusion,
      };
      setCurrentScript(updatedScript);
      setHistoryIndex(prev => prev - 1);
      setIsEditingScript(true);
    }
  }, [scriptHistory, historyIndex, currentScript]);

  // リドゥ（利用者提案）
  const handleRedo = useCallback(() => {
    if (historyIndex < scriptHistory.length - 1 && currentScript) {
      const nextItem = scriptHistory[historyIndex + 1];
      const updatedScript: Script = {
        ...currentScript,
        introduction: nextItem.introduction,
        body: nextItem.body,
        conclusion: nextItem.conclusion,
      };
      setCurrentScript(updatedScript);
      setHistoryIndex(prev => prev + 1);
      setIsEditingScript(true);
    }
  }, [scriptHistory, historyIndex, currentScript]);

  // セクション編集ハンドラー（6.8対応：動的セクションに対応）
  const handleSectionChange = useCallback((sectionId: string, value: string) => {
    if (!currentScript) return;
    
    // 標準形式との互換性を保つ
    const updatedScript: Script = {
      ...currentScript,
      // 標準セクションの場合は既存フィールドを更新
      ...(sectionId === 'introduction' && { introduction: value }),
      ...(sectionId === 'body' && { body: value }),
      ...(sectionId === 'conclusion' && { conclusion: value }),
      // 動的セクションの場合
      sections: currentScript.sections ? {
        ...currentScript.sections,
        [sectionId]: value,
      } : {
        introduction: currentScript.introduction,
        body: currentScript.body,
        conclusion: currentScript.conclusion,
        [sectionId]: value,
      },
    };
    
    setCurrentScript(updatedScript);
    setIsEditingScript(true);
    setSaveStatus('editing'); // 編集状態に変更（6.7）
  }, [currentScript]);

  // 台本の保存機能（6.7）
  const saveScript = useCallback((isAutoSave: boolean = false) => {
    if (!currentScript || typeof window === 'undefined') {
      console.log('保存失敗: currentScriptがnullまたはwindowがundefined');
      return;
    }
    
    const selectedIdea = generatedIdeas.find(idea => idea.id === currentScript.ideaId);
    if (!selectedIdea) {
      console.log('保存失敗: selectedIdeaが見つかりません', {
        scriptId: currentScript.ideaId,
        generatedIdeasCount: generatedIdeas.length,
        generatedIds: generatedIdeas.map(i => i.id)
      });
      // selectedIdeaが見つからない場合でも、currentScriptから保存する
      // （generatedIdeasが空でも保存できるように）
      const fallbackTitle = `台本 ${currentScript.ideaId}`;
      
      setSaveStatus('saving');
      
      try {
        const existingScripts = savedScripts.filter(s => s.scriptId === currentScript.ideaId);
        const maxVersion = existingScripts.length > 0 
          ? Math.max(...existingScripts.map(s => s.version))
          : 0;
        
        const newVersion = existingScripts.length > 0 && !isAutoSave
          ? maxVersion + 1
          : (existingScripts.length > 0 ? maxVersion : 1);
        
        const savedScript: SavedScript = {
          id: `saved-${currentScript.ideaId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          scriptId: currentScript.ideaId,
          title: fallbackTitle,
          introduction: currentScript.introduction,
          body: currentScript.body,
          conclusion: currentScript.conclusion,
          createdAt: existingScripts.length > 0 ? existingScripts[0].createdAt : Date.now(),
          updatedAt: Date.now(),
          version: newVersion,
        };

        setSavedScripts(prev => {
          let updated: SavedScript[];
          if (isAutoSave && existingScripts.length > 0) {
            updated = prev.map(s => 
              s.scriptId === currentScript.ideaId && s.version === maxVersion
                ? savedScript
                : s
            );
          } else {
            updated = [savedScript, ...prev].slice(0, MAX_SAVED_SCRIPTS);
          }
          
          localStorage.setItem(SAVED_SCRIPTS_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        
        setSaveStatus('saved');
        setIsEditingScript(false);
        
        if (!isAutoSave) {
          toast.success('台本を保存しました');
        }
      } catch (err) {
        console.error('台本保存失敗', err);
        setSaveStatus('editing');
        toast.error('保存に失敗しました');
      }
      return;
    }

    setSaveStatus('saving');
    
    try {
      // 同一scriptIdの既存保存を検索
      const existingScripts = savedScripts.filter(s => s.scriptId === currentScript.ideaId);
      const maxVersion = existingScripts.length > 0 
        ? Math.max(...existingScripts.map(s => s.version))
        : 0;
      
      // 既存の保存がある場合はバージョンを増やす（複数バージョン対応）
      const newVersion = existingScripts.length > 0 && !isAutoSave
        ? maxVersion + 1
        : (existingScripts.length > 0 ? maxVersion : 1);
      
      const savedScript: SavedScript = {
        id: `saved-${currentScript.ideaId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        scriptId: currentScript.ideaId,
        title: selectedIdea.title,
        introduction: currentScript.introduction,
        body: currentScript.body,
        conclusion: currentScript.conclusion,
        createdAt: existingScripts.length > 0 ? existingScripts[0].createdAt : Date.now(),
        updatedAt: Date.now(),
        version: newVersion,
      };

      setSavedScripts(prev => {
        // 自動保存の場合は既存を更新、手動保存の場合は新規追加
        let updated: SavedScript[];
        if (isAutoSave && existingScripts.length > 0) {
          // 自動保存: 最新バージョンを更新
          updated = prev.map(s => 
            s.scriptId === currentScript.ideaId && s.version === maxVersion
              ? savedScript
              : s
          );
        } else {
          // 手動保存: 新規追加
          updated = [savedScript, ...prev].slice(0, MAX_SAVED_SCRIPTS);
        }
        
        localStorage.setItem(SAVED_SCRIPTS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      
      setSaveStatus('saved');
      setIsEditingScript(false);
      
      if (!isAutoSave) {
        toast.success('台本を保存しました');
      }
    } catch (err) {
      console.error('台本保存失敗', err);
      setSaveStatus('editing');
      toast.error('保存に失敗しました');
    }
    }, [currentScript, generatedIdeas, savedScripts]);

  // 自動保存の実装（6.7）
  useEffect(() => {
    if (!currentScript || saveStatus !== 'editing' || isEditingScript === false) return;

    const autoSaveTimer = setTimeout(() => {
      saveScript(true); // 自動保存
    }, AUTO_SAVE_INTERVAL);

    return () => {
      clearTimeout(autoSaveTimer);
    };
  }, [currentScript, saveStatus, isEditingScript, saveScript]);

  // 台本の複製機能（6.14）
  const handleDuplicateScript = useCallback(() => {
    if (!currentScript) {
      toast.error('複製する台本がありません');
      return;
    }
    
    setIsDuplicateDialogOpen(true);
  }, [currentScript]);

  // 複製を確定（6.14）
  const confirmDuplicateScript = useCallback(() => {
    if (!currentScript || typeof window === 'undefined') {
      toast.error('複製する台本がありません');
      return;
    }
    
    const selectedIdea = generatedIdeas.find(idea => idea.id === currentScript.ideaId);
    if (!selectedIdea) {
      // フォールバック: selectedIdeaが見つからない場合でも複製可能
      const fallbackTitle = `台本 ${currentScript.ideaId}`;
      
      const existingScripts = savedScripts.filter(s => s.scriptId === currentScript.ideaId);
      const maxVersion = existingScripts.length > 0 
        ? Math.max(...existingScripts.map(s => s.version))
        : 0;
      
      const duplicatedScript: SavedScript = {
        id: `saved-${currentScript.ideaId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        scriptId: currentScript.ideaId,
        title: fallbackTitle,
        introduction: currentScript.introduction || '',
        body: currentScript.body || '',
        conclusion: currentScript.conclusion || '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: maxVersion + 1,
        versionName: duplicateVersionName.trim() || undefined,
        templateId: currentScript.templateId,
        sections: currentScript.sections,
      };
      
      const updated = [duplicatedScript, ...savedScripts].slice(0, MAX_SAVED_SCRIPTS);
      setSavedScripts(updated);
      try {
        localStorage.setItem(SAVED_SCRIPTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('台本保存失敗', err);
        toast.error('台本の保存に失敗しました');
      }
      
      toast.success('台本を複製しました');
      setIsDuplicateDialogOpen(false);
      setDuplicateVersionName('');
      return;
    }
    
    // 同一scriptIdの既存保存を検索
    const existingScripts = savedScripts.filter(s => s.scriptId === currentScript.ideaId);
    const maxVersion = existingScripts.length > 0 
      ? Math.max(...existingScripts.map(s => s.version))
      : 0;
    
    const duplicatedScript: SavedScript = {
      id: `saved-${currentScript.ideaId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      scriptId: currentScript.ideaId,
      title: selectedIdea.title,
      introduction: currentScript.introduction || '',
      body: currentScript.body || '',
      conclusion: currentScript.conclusion || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: maxVersion + 1,
      versionName: duplicateVersionName.trim() || undefined,
      templateId: currentScript.templateId,
      sections: currentScript.sections,
    };
    
    const updated = [duplicatedScript, ...savedScripts].slice(0, MAX_SAVED_SCRIPTS);
    setSavedScripts(updated);
    try {
      localStorage.setItem(SAVED_SCRIPTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('台本保存失敗', err);
      toast.error('台本の保存に失敗しました');
      return;
    }
    
    toast.success('台本を複製しました');
    setIsDuplicateDialogOpen(false);
    setDuplicateVersionName('');
  }, [currentScript, generatedIdeas, savedScripts, duplicateVersionName]);

  // 保存済み台本の読み込み（6.7）
  const loadSavedScript = useCallback((savedScript: SavedScript) => {
    const script: Script = {
      ideaId: savedScript.scriptId,
      content: `${savedScript.introduction}\n\n${savedScript.body}\n\n${savedScript.conclusion}`,
      introduction: savedScript.introduction,
      body: savedScript.body,
      conclusion: savedScript.conclusion,
      templateId: savedScript.templateId,
      sections: savedScript.sections,
    };
    
    setCurrentScript(script);
    setSelectedIdeaId(savedScript.scriptId);
    setSaveStatus('saved');
    setIsEditingScript(false);
    
    // 履歴に追加
    const historyItem: ScriptHistoryItem = {
      introduction: script.introduction,
      body: script.body,
      conclusion: script.conclusion,
      timestamp: Date.now(),
    };
    setScriptHistory([historyItem]);
    setHistoryIndex(0);
    
    toast.success('保存済み台本を読み込みました');
  }, []);

  // 保存済み台本の削除（6.7）
  const deleteSavedScript = useCallback((scriptId: string) => {
    setSavedScripts(prev => {
      const updated = prev.filter(s => s.id !== scriptId);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(SAVED_SCRIPTS_STORAGE_KEY, JSON.stringify(updated));
        } catch (err) {
          console.error('保存済み台本削除失敗', err);
        }
      }
      return updated;
    });
    toast.success('保存済み台本を削除しました');
  }, []);

  // 保存済み台本をscriptIdでグループ化（6.14）
  const groupedSavedScripts = useMemo(() => {
    const groups = new Map<number, SavedScript[]>();
    savedScripts.forEach(script => {
      const versions = groups.get(script.scriptId) || [];
      versions.push(script);
      groups.set(script.scriptId, versions);
    });
    
    return Array.from(groups.entries()).map(([scriptId, versions]) => ({
      scriptId,
      versions: versions.sort((a, b) => b.version - a.version), // 新しいバージョンから順
      latestVersion: versions[0], // 最新バージョン
    }));
  }, [savedScripts]);

  // 時間をMM:SS形式にフォーマット（6.11）
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  // 文字数・行数・予想時間の計算（利用者提案 + 6.8対応：動的セクション）
  const calculateScriptStats = useMemo(() => {
    if (!currentScript) return null;
    
    // 行数を正確に計算する関数（行番号表示と一致させる）
    // 行番号表示では split('\n').map() を使用しているため、split('\n').length と一致する
    const calculateLines = (text: string): number => {
      // 空文字列の場合、split('\n')は['']を返すのでlengthは1（Textareaでは1行として表示される）
      // それ以外はsplit('\n')の結果の配列の長さが行数
      return text.split('\n').length;
    };
    
    // 動的セクションに対応（6.8）
    let totalText = '';
    if (currentScript.templateId && currentScript.sections) {
      // テンプレートベースの場合、全セクションを結合
      Object.values(currentScript.sections).forEach(sectionText => {
        totalText += sectionText;
      });
    } else {
      // 標準形式の場合、既存のフィールドを使用（互換性）
      totalText = currentScript.introduction + currentScript.body + currentScript.conclusion;
    }
    
    const totalChars = totalText.length;
    const totalLines = calculateLines(totalText);
    
    // 予想時間の計算
    // - 日本語の一般的な読み上げ速度: 約300文字/分（ゆっくり）
    // - VTuberの配信を考慮し、話す速度や間を考慮: 約250文字/分（標準的な読み上げ速度）
    // - 実際の配信では台本をそのまま読むわけではないため、余裕を持たせて計算
    const charsPerMinute = 250; // 1分あたり250文字（標準的な読み上げ速度）
    const estimatedMinutes = Math.max(1, Math.ceil(totalChars / charsPerMinute));
    
    // 標準形式との互換性を保つため、既存フィールドも計算（6.8）
    return {
      introduction: {
        chars: currentScript.introduction?.length || 0,
        lines: calculateLines(currentScript.introduction || ''),
      },
      body: {
        chars: currentScript.body?.length || 0,
        lines: calculateLines(currentScript.body || ''),
      },
      conclusion: {
        chars: currentScript.conclusion?.length || 0,
        lines: calculateLines(currentScript.conclusion || ''),
      },
      total: {
        chars: totalChars,
        lines: totalLines,
        estimatedMinutes,
      },
    };
  }, [currentScript]);
  
  // タイムライン表示用の時間計算（6.11）
  const calculateTimeline = useMemo(() => {
    if (!currentScript || !calculateScriptStats) return null;
    
    const charsPerMinute = 250; // 1分あたり250文字
    let cumulativeSeconds = 0;
    
    const sections = currentTemplate.sections.sort((a, b) => a.order - b.order);
    const timeline = sections.map((section) => {
      const sectionValue = getSectionValue(section.id);
      const sectionChars = sectionValue.length;
      const sectionSeconds = Math.max(Math.ceil((sectionChars / charsPerMinute) * 60), 1);
      
      const startTime = cumulativeSeconds;
      const endTime = cumulativeSeconds + sectionSeconds;
      cumulativeSeconds = endTime;
      
      return {
        section,
        startTime,
        endTime,
        duration: sectionSeconds,
        chars: sectionChars,
      };
    });
    
    return {
      sections: timeline,
      totalSeconds: cumulativeSeconds,
      totalMinutes: Math.ceil(cumulativeSeconds / 60),
    };
  }, [currentScript, currentTemplate, calculateScriptStats, getSectionValue]);

  // テンプレート適用関数（6.8）
  const applyTemplate = useCallback((template: ScriptTemplate) => {
    if (!currentScript) return;
    
    const sections: Record<string, string> = {};
    // 既存のセクションをマッピング（互換性のため）
    const sectionMapping: Record<string, string> = {
      'introduction': currentScript.introduction || '',
      'body': currentScript.body || '',
      'conclusion': currentScript.conclusion || '',
    };
    
    // テンプレートのセクションに基づいて初期化
    template.sections.forEach(section => {
      sections[section.id] = sectionMapping[section.id] || '';
    });
    
    const script: Script = {
      ...currentScript,
      templateId: template.id,
      sections,
    };
    
    setCurrentScript(script);
    setIsEditingScript(false);
    setSaveStatus('saved');
    
    toast.success(`「${template.name}」テンプレートを適用しました`);
  }, [currentScript]);

  const handleGenerateScript = useCallback(async (idea: Idea) => {
    setIsGeneratingScript(true);
    setScriptGenerationStep(scriptGenerationSteps[0].id); // 最初のステップを設定
    
    await handleAsyncError(async () => {
      // ステップ1: 企画案を分析中
      await new Promise(resolve => setTimeout(resolve, 300));
      setScriptGenerationStep(scriptGenerationSteps[1].id);
      
      // ステップ2: 台本構造を作成中
      await new Promise(resolve => setTimeout(resolve, 400));
      setScriptGenerationStep(scriptGenerationSteps[2].id);
      
      // ステップ3: セクションを生成中
      await new Promise(resolve => setTimeout(resolve, 400));
      setScriptGenerationStep(scriptGenerationSteps[3].id);
      
      // ステップ4: 最終調整中
      await new Promise(resolve => setTimeout(resolve, 400));
      setScriptGenerationStep(scriptGenerationSteps[4].id);
      
      // 選択されたテンプレートに基づいて台本を生成（6.8）
      const template = selectedTemplate;
      const sections: Record<string, string> = {};
      
      // テンプレートのセクションに基づいてダミーテキストを生成
      template.sections.forEach(section => {
        if (section.id === 'introduction' || section.id === 'intro') {
          sections[section.id] = dummyScript.introduction;
        } else if (section.id === 'body' || section.id === 'play' || section.id === 'performance') {
          sections[section.id] = dummyScript.body;
        } else if (section.id === 'conclusion' || section.id === 'ending' || section.id === 'thanks') {
          sections[section.id] = dummyScript.conclusion;
        } else {
          sections[section.id] = `（${section.label}の内容）`;
        }
      });
      
      // 標準形式との互換性を保つため、既存フィールドも設定
      const introduction = sections['introduction'] || sections['intro'] || '';
      const body = sections['body'] || sections['play'] || sections['performance'] || '';
      const conclusion = sections['conclusion'] || sections['ending'] || sections['thanks'] || '';
      
      const contentParts = template.sections
        .sort((a, b) => a.order - b.order)
        .map(section => `【${section.label}】\n${sections[section.id] || ''}`)
        .join('\n\n');
      
      const script: Script = {
        ideaId: idea.id,
        content: `【${idea.title}】\n\n${contentParts}`,
        introduction,
        body,
        conclusion,
        templateId: template.id,
        sections,
      };
      
      setCurrentScript(script);
      setSelectedIdeaId(idea.id);
      
      // 初期履歴を追加（6.6）
      const historyItem: ScriptHistoryItem = {
        introduction: script.introduction,
        body: script.body,
        conclusion: script.conclusion,
        timestamp: Date.now(),
      };
      setScriptHistory([historyItem]);
      setHistoryIndex(0);
      setIsEditingScript(false);
      setSaveStatus('saved'); // 初期状態は保存済み（6.7）
      
      logger.debug('台本生成完了', { ideaTitle: idea.title, scriptLength: script.content.length, templateId: template.id }, 'ScriptGenerator');
      
      // 完成ステップを少し表示してから終了
      await new Promise(resolve => setTimeout(resolve, 200));
    }, "台本生成中にエラーが発生しました");
    
    setIsGeneratingScript(false);
    setScriptGenerationStep(null);
  }, [handleAsyncError, selectedTemplate]);

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
      {/* 生成設定（アコーディオン形式）（6.10） */}
      <Accordion type="multiple" defaultValue={["basic"]} className="w-full">
        {/* 基本設定 */}
        <AccordionItem value="basic" className="border-[#4A4A4A]">
          <AccordionTrigger className="text-[#E0E0E0] hover:no-underline">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span>基本設定</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="keywords-mobile">キーワード</Label>
              <Input
                id="keywords-mobile"
                placeholder="例: ゲーム実況、マリオカート"
                value={generationSettings.keywords}
                onChange={(e) => setGenerationSettings(prev => ({ ...prev, keywords: e.target.value }))}
                className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#4A4A4A]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direction-mobile">企画の方向性</Label>
              <Select
                value={generationSettings.direction}
                onValueChange={(value) => setGenerationSettings(prev => ({ ...prev, direction: value }))}
              >
                <SelectTrigger id="direction-mobile" className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0]">
                  <SelectValue placeholder="方向性を選択" />
                </SelectTrigger>
                <SelectContent className="bg-[#2D2D2D] border-[#4A4A4A]">
                  <SelectItem value="funny">面白い系</SelectItem>
                  <SelectItem value="moving">感動系</SelectItem>
                  <SelectItem value="educational">解説・学習系</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>現在のトレンド</Label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A]">#VTuberの夏休み</Badge>
                <Badge variant="outline" className="cursor-pointer border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A]">#ゲーム実況</Badge>
                <Badge variant="outline" className="cursor-pointer border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A]">#新作ゲーム</Badge>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 配信設定 */}
        <AccordionItem value="streaming" className="border-[#4A4A4A]">
          <AccordionTrigger className="text-[#E0E0E0] hover:no-underline">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>配信設定</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="duration-mobile">配信時間</Label>
                <span className="text-sm text-[#A0A0A0]">{generationSettings.duration}分</span>
              </div>
              <Slider
                id="duration-mobile"
                min={30}
                max={180}
                step={30}
                value={[generationSettings.duration]}
                onValueChange={(value) => setGenerationSettings(prev => ({ ...prev, duration: value[0] }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[#4A4A4A]">
                <span>30分</span>
                <span>180分</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>話し方のスタイル</Label>
              <div className="space-y-2">
                {[
                  { id: 'casual', label: 'カジュアル' },
                  { id: 'formal', label: 'フォーマル' },
                  { id: 'energetic', label: 'エネルギッシュ' },
                  { id: 'calm', label: '落ち着いた' },
                  { id: 'technical', label: 'テクニカル' },
                  { id: 'entertaining', label: 'エンタメ' },
                ].map((style) => (
                  <div key={style.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`style-mobile-${style.id}`}
                      checked={generationSettings.speakingStyle.includes(style.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setGenerationSettings(prev => ({
                            ...prev,
                            speakingStyle: [...prev.speakingStyle, style.id]
                          }));
                        } else {
                          setGenerationSettings(prev => ({
                            ...prev,
                            speakingStyle: prev.speakingStyle.filter(s => s !== style.id)
                          }));
                        }
                      }}
                    />
                    <Label
                      htmlFor={`style-mobile-${style.id}`}
                      className="text-sm text-[#E0E0E0] cursor-pointer"
                    >
                      {style.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 詳細設定 */}
        <AccordionItem value="advanced" className="border-[#4A4A4A]">
          <AccordionTrigger className="text-[#E0E0E0] hover:no-underline">
            <div className="flex items-center gap-2">
              <Construction className="h-4 w-4" />
              <span>詳細設定</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>含める要素の選択</Label>
              <div className="space-y-2">
                {[
                  { id: 'gaming', label: 'ゲーム要素', icon: Gamepad2 },
                  { id: 'music', label: '音楽要素', icon: Music },
                  { id: 'collaboration', label: 'コラボ要素', icon: Users },
                  { id: 'event', label: 'イベント要素', icon: Calendar },
                  { id: 'other', label: 'その他', icon: Lightbulb },
                ].map((element) => {
                  const ElementIcon = element.icon;
                  return (
                    <div key={element.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`element-mobile-${element.id}`}
                        checked={generationSettings.includeElements.includes(element.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setGenerationSettings(prev => ({
                              ...prev,
                              includeElements: [...prev.includeElements, element.id]
                            }));
                          } else {
                            setGenerationSettings(prev => ({
                              ...prev,
                              includeElements: prev.includeElements.filter(e => e !== element.id)
                            }));
                          }
                        }}
                      />
                      <Label
                        htmlFor={`element-mobile-${element.id}`}
                        className="text-sm text-[#E0E0E0] cursor-pointer flex items-center gap-2"
                      >
                        <ElementIcon className="h-4 w-4" />
                        {element.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customPrompt-mobile">カスタムプロンプト</Label>
              <Textarea
                id="customPrompt-mobile"
                placeholder="追加で指定したい要件があれば入力してください"
                value={generationSettings.customPrompt}
                onChange={(e) => setGenerationSettings(prev => ({ ...prev, customPrompt: e.target.value }))}
                className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#4A4A4A] min-h-[100px]"
              />
              <p className="text-xs text-[#4A4A4A]">
                生成時に考慮してほしい追加の要件や指示を入力できます
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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
        
        {/* 台本テンプレート選択（6.8） */}
        <div className="space-y-2 pt-4 border-t border-[#4A4A4A]">
          <Label className="text-sm flex items-center gap-2 text-[#E0E0E0]">
            <Layout className="h-4 w-4" />
            台本テンプレート
          </Label>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {allTemplates.map((template) => {
              const category = categoryConfig[template.category];
              const CategoryIcon = category.icon;
              const isSelected = selectedTemplateId === template.id;
              
              return (
                <Card
                  key={template.id}
                  className={cn(
                    "cursor-pointer transition-all border-2",
                    isSelected 
                      ? "border-primary bg-[#2D2D2D] shadow-md" 
                      : "border-[#4A4A4A] bg-[#2D2D2D] hover:border-[#4A4A4A]/80",
                    template.isCustom && "border-dashed"
                  )}
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <CategoryIcon className="h-4 w-4 text-[#A0A0A0]" />
                        <CardTitle className="text-sm font-semibold text-[#E0E0E0]">
                          {template.name}
                        </CardTitle>
                        {template.isCustom && (
                          <Badge variant="outline" className="text-xs bg-[#1A1A1A] text-[#A0A0A0] border-[#4A4A4A]">
                            カスタム
                          </Badge>
                        )}
                      </div>
                      {isSelected && (
                        <Badge className="bg-primary text-white text-xs">
                          選択中
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs text-[#A0A0A0] line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1">
                      {template.sections.slice(0, 3).map((section) => (
                        <Badge 
                          key={section.id}
                          variant="outline"
                          className="text-xs bg-[#1A1A1A] text-[#A0A0A0] border-[#4A4A4A]"
                        >
                          {section.label}
                        </Badge>
                      ))}
                      {template.sections.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-[#1A1A1A] text-[#A0A0A0] border-[#4A4A4A]">
                          +{template.sections.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A]"
            onClick={() => {
              // カスタムテンプレート作成ダイアログを開く（後で実装）
              toast.info('カスタムテンプレート作成機能は準備中です');
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            カスタムテンプレートを作成
          </Button>
        </div>
      </div>
    ), [isGeneratingIdeas, handleGenerate, allTemplates, selectedTemplateId, categoryConfig]);

  // モバイル用のサイドバーコンテンツ（ペルソナ、履歴、保存済み）
  const mobileSidebarContent = useMemo(() => (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="persona">ペルソナ</TabsTrigger>
        <TabsTrigger value="history">履歴</TabsTrigger>
        <TabsTrigger value="saved">保存済み</TabsTrigger>
      </TabsList>
      <TabsContent value="persona" className="mt-4 space-y-4">
        {/* ペルソナ選択 */}
        <div className="space-y-2">
          <Label htmlFor="persona-select-mobile">使用するペルソナ</Label>
          <Select 
            value={selectedPersonaId || undefined} 
            onValueChange={(value) => setSelectedPersonaId(value || null)}
          >
            <SelectTrigger id="persona-select-mobile">
              <SelectValue placeholder="ペルソナを選択" />
            </SelectTrigger>
            <SelectContent>
              {personas.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-[#A0A0A0]">ペルソナがありません</div>
              ) : (
                personas.map((persona) => (
                  <SelectItem key={persona.id} value={persona.id}>
                    {persona.name}
                    {defaultPersonaId === persona.id && ' (デフォルト)'}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* ペルソナ一覧 */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {personas.length === 0 ? (
            <div className="text-center py-8 text-[#A0A0A0]">
              <Construction className="h-8 w-8 mx-auto mb-2" />
              <p>まだペルソナがありません</p>
              <p className="text-sm mt-1">新しいペルソナを作成してください</p>
            </div>
          ) : (
            personas.map((persona) => (
              <Card 
                key={persona.id}
                className={cn(
                  "bg-[#2D2D2D] border-[#4A4A4A] hover:border-[#4A4A4A]/80 transition-all",
                  selectedPersonaId === persona.id && "border-blue-500/50 bg-blue-500/5"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Construction className="h-4 w-4 text-[#A0A0A0]" />
                        <CardTitle className="text-sm font-semibold text-[#E0E0E0]">
                          {persona.name}
                        </CardTitle>
                        {defaultPersonaId === persona.id && (
                          <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                            <Star className="h-3 w-3 mr-1" />
                            デフォルト
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-[#A0A0A0] line-clamp-2">
                        {persona.description}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="gap-2 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPersonaId(persona.id)}
                    className="flex-1 border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0]"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    選択
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPersona(persona)}
                    className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0]"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  {defaultPersonaId !== persona.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDefaultPersona(persona.id)}
                      className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                      title="デフォルトに設定"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePersona(persona.id)}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    disabled={defaultPersonaId === persona.id}
                    title={defaultPersonaId === persona.id ? "デフォルトペルソナは削除できません" : "削除"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* 新規作成ボタン */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleCreatePersona}
        >
          <Plus className="h-4 w-4 mr-2" />
          新しいペルソナを作成
        </Button>
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
      <TabsContent value="saved" className="mt-4 space-y-4">
        {/* 保存済み台本一覧（6.7, 6.14：バージョン履歴タイムライン表示） */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {savedScripts.length === 0 ? (
            <div className="text-center py-8 text-[#A0A0A0]">
              <BookOpen className="h-8 w-8 mx-auto mb-2" />
              <p>まだ保存済み台本がありません</p>
              <p className="text-sm mt-1">台本を編集して保存すると、ここに表示されます</p>
            </div>
          ) : (
            groupedSavedScripts.map((group) => (
              <Card 
                key={group.scriptId}
                className="bg-[#2D2D2D] border-[#4A4A4A] hover:border-[#4A4A4A]/80 transition-all"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-[#A0A0A0]" />
                        <CardTitle className="text-sm font-semibold text-[#E0E0E0]">
                          {group.latestVersion.title}
                        </CardTitle>
                        {group.versions.length > 1 && (
                          <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                            <GitBranch className="h-3 w-3 mr-1" />
                            {group.versions.length}バージョン
                          </Badge>
                        )}
                      </div>
                      
                      {/* タイムスタンプ表示（最新バージョン） */}
                      <div className="flex items-center gap-1 text-xs text-[#A0A0A0] mb-2">
                        <Clock className="h-3 w-3" />
                        最新更新: {new Date(group.latestVersion.updatedAt).toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      
                      {/* プレビュー（最新バージョン） */}
                      <div className="text-xs text-[#A0A0A0] line-clamp-2 mb-3">
                        {group.latestVersion.introduction.substring(0, 50)}...
                      </div>

                      {/* バージョン履歴タイムライン（6.14） */}
                      {group.versions.length > 1 && (
                        <div className="mt-3 pt-3 border-t border-[#4A4A4A]">
                          <Label className="text-xs text-[#A0A0A0] mb-2 block">バージョン履歴</Label>
                          <div className="space-y-2 pl-4 border-l-2 border-blue-500/30">
                            {group.versions.map((version, index) => (
                              <div key={version.id} className="relative">
                                <div className={cn(
                                  "absolute -left-[9px] top-2 w-2 h-2 rounded-full",
                                  index === 0 ? "bg-blue-500" : "bg-[#4A4A4A]"
                                )} />
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-[#E0E0E0]">
                                        v{version.version}
                                      </span>
                                      {version.versionName && (
                                        <Badge variant="outline" className="text-xs bg-[#1A1A1A] text-[#A0A0A0] border-[#4A4A4A]">
                                          {version.versionName}
                                        </Badge>
                                      )}
                                      {index === 0 && (
                                        <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                                          最新
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-xs text-[#A0A0A0]">
                                      {new Date(version.updatedAt).toLocaleString('ja-JP', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => loadSavedScript(version)}
                                    className="h-7 px-2 text-xs text-[#A0A0A0] hover:text-[#E0E0E0] hover:bg-[#4A4A4A]"
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    読み込む
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="gap-2 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSavedScript(group.latestVersion)}
                    className="flex-1 border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0]"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    最新版を読み込む
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('この台本のすべてのバージョンを削除しますか？')) {
                        group.versions.forEach(v => deleteSavedScript(v.id));
                      }
                    }}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  ), [selectedTab, history, filteredHistory, historySearchQuery, historyFilterCategory, loadFromHistory, deleteHistory, clearAllHistory, savedScripts, groupedSavedScripts, loadSavedScript, deleteSavedScript, personas, selectedPersonaId, defaultPersonaId, handleEditPersona, setSelectedPersonaId, setDefaultPersona, deletePersona, handleCreatePersona]);

  const sidebarContent = useMemo(() => (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="generate">生成</TabsTrigger>
        <TabsTrigger value="persona">ペルソナ</TabsTrigger>
        <TabsTrigger value="history">履歴</TabsTrigger>
        <TabsTrigger value="saved">保存済み</TabsTrigger>
      </TabsList>
      <TabsContent value="generate" className="mt-4 space-y-4">
        {/* 生成設定（アコーディオン形式）（6.10） */}
        <Accordion type="multiple" defaultValue={["basic"]} className="w-full">
          {/* 基本設定 */}
          <AccordionItem value="basic" className="border-[#4A4A4A]">
            <AccordionTrigger className="text-[#E0E0E0] hover:no-underline">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                <span>基本設定</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">キーワード</Label>
                <Input
                  id="keywords"
                  placeholder="例: ゲーム実況、マリオカート"
                  value={generationSettings.keywords}
                  onChange={(e) => setGenerationSettings(prev => ({ ...prev, keywords: e.target.value }))}
                  className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#4A4A4A]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direction">企画の方向性</Label>
                <Select
                  value={generationSettings.direction}
                  onValueChange={(value) => setGenerationSettings(prev => ({ ...prev, direction: value }))}
                >
                  <SelectTrigger id="direction" className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0]">
                    <SelectValue placeholder="方向性を選択" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2D2D2D] border-[#4A4A4A]">
                    <SelectItem value="funny">面白い系</SelectItem>
                    <SelectItem value="moving">感動系</SelectItem>
                    <SelectItem value="educational">解説・学習系</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>現在のトレンド</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A]">#VTuberの夏休み</Badge>
                  <Badge variant="outline" className="cursor-pointer border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A]">#ゲーム実況</Badge>
                  <Badge variant="outline" className="cursor-pointer border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A]">#新作ゲーム</Badge>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 配信設定 */}
          <AccordionItem value="streaming" className="border-[#4A4A4A]">
            <AccordionTrigger className="text-[#E0E0E0] hover:no-underline">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>配信設定</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="duration">配信時間</Label>
                  <span className="text-sm text-[#A0A0A0]">{generationSettings.duration}分</span>
                </div>
                <Slider
                  id="duration"
                  min={30}
                  max={180}
                  step={30}
                  value={[generationSettings.duration]}
                  onValueChange={(value) => setGenerationSettings(prev => ({ ...prev, duration: value[0] }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-[#4A4A4A]">
                  <span>30分</span>
                  <span>180分</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>話し方のスタイル</Label>
                <div className="space-y-2">
                  {[
                    { id: 'casual', label: 'カジュアル' },
                    { id: 'formal', label: 'フォーマル' },
                    { id: 'energetic', label: 'エネルギッシュ' },
                    { id: 'calm', label: '落ち着いた' },
                    { id: 'technical', label: 'テクニカル' },
                    { id: 'entertaining', label: 'エンタメ' },
                  ].map((style) => (
                    <div key={style.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`style-${style.id}`}
                        checked={generationSettings.speakingStyle.includes(style.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setGenerationSettings(prev => ({
                              ...prev,
                              speakingStyle: [...prev.speakingStyle, style.id]
                            }));
                          } else {
                            setGenerationSettings(prev => ({
                              ...prev,
                              speakingStyle: prev.speakingStyle.filter(s => s !== style.id)
                            }));
                          }
                        }}
                      />
                      <Label
                        htmlFor={`style-${style.id}`}
                        className="text-sm text-[#E0E0E0] cursor-pointer"
                      >
                        {style.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 詳細設定 */}
          <AccordionItem value="advanced" className="border-[#4A4A4A]">
            <AccordionTrigger className="text-[#E0E0E0] hover:no-underline">
              <div className="flex items-center gap-2">
                <Construction className="h-4 w-4" />
                <span>詳細設定</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>含める要素の選択</Label>
                <div className="space-y-2">
                  {[
                    { id: 'gaming', label: 'ゲーム要素', icon: Gamepad2 },
                    { id: 'music', label: '音楽要素', icon: Music },
                    { id: 'collaboration', label: 'コラボ要素', icon: Users },
                    { id: 'event', label: 'イベント要素', icon: Calendar },
                    { id: 'other', label: 'その他', icon: Lightbulb },
                  ].map((element) => {
                    const ElementIcon = element.icon;
                    return (
                      <div key={element.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`element-${element.id}`}
                          checked={generationSettings.includeElements.includes(element.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setGenerationSettings(prev => ({
                                ...prev,
                                includeElements: [...prev.includeElements, element.id]
                              }));
                            } else {
                              setGenerationSettings(prev => ({
                                ...prev,
                                includeElements: prev.includeElements.filter(e => e !== element.id)
                              }));
                            }
                          }}
                        />
                        <Label
                          htmlFor={`element-${element.id}`}
                          className="text-sm text-[#E0E0E0] cursor-pointer flex items-center gap-2"
                        >
                          <ElementIcon className="h-4 w-4" />
                          {element.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customPrompt">カスタムプロンプト</Label>
                <Textarea
                  id="customPrompt"
                  placeholder="追加で指定したい要件があれば入力してください"
                  value={generationSettings.customPrompt}
                  onChange={(e) => setGenerationSettings(prev => ({ ...prev, customPrompt: e.target.value }))}
                  className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#4A4A4A] min-h-[100px]"
                />
                <p className="text-xs text-[#4A4A4A]">
                  生成時に考慮してほしい追加の要件や指示を入力できます
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
        
        {/* 台本テンプレート選択（6.8） */}
        <div className="space-y-2 pt-4 border-t border-[#4A4A4A]">
          <Label className="text-sm flex items-center gap-2 text-[#E0E0E0]">
            <Layout className="h-4 w-4" />
            台本テンプレート
          </Label>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {allTemplates.map((template) => {
              const category = categoryConfig[template.category];
              const CategoryIcon = category.icon;
              const isSelected = selectedTemplateId === template.id;
              
              return (
                <Card
                  key={template.id}
                  className={cn(
                    "cursor-pointer transition-all border-2",
                    isSelected 
                      ? "border-primary bg-[#2D2D2D] shadow-md" 
                      : "border-[#4A4A4A] bg-[#2D2D2D] hover:border-[#4A4A4A]/80",
                    template.isCustom && "border-dashed"
                  )}
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <CategoryIcon className="h-4 w-4 text-[#A0A0A0]" />
                        <CardTitle className="text-sm font-semibold text-[#E0E0E0]">
                          {template.name}
                        </CardTitle>
                        {template.isCustom && (
                          <Badge variant="outline" className="text-xs bg-[#1A1A1A] text-[#A0A0A0] border-[#4A4A4A]">
                            カスタム
                          </Badge>
                        )}
                      </div>
                      {isSelected && (
                        <Badge className="bg-primary text-white text-xs">
                          選択中
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs text-[#A0A0A0] line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1">
                      {template.sections.slice(0, 3).map((section) => (
                        <Badge 
                          key={section.id}
                          variant="outline"
                          className="text-xs bg-[#1A1A1A] text-[#A0A0A0] border-[#4A4A4A]"
                        >
                          {section.label}
                        </Badge>
                      ))}
                      {template.sections.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-[#1A1A1A] text-[#A0A0A0] border-[#4A4A4A]">
                          +{template.sections.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A]"
            onClick={() => {
              // カスタムテンプレート作成ダイアログを開く（後で実装）
              toast.info('カスタムテンプレート作成機能は準備中です');
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            カスタムテンプレートを作成
          </Button>
        </div>
      </TabsContent>
      <TabsContent value="persona" className="mt-4 space-y-4">
        {/* ペルソナ選択 */}
        <div className="space-y-2">
          <Label htmlFor="persona-select">使用するペルソナ</Label>
          <Select 
            value={selectedPersonaId || undefined} 
            onValueChange={(value) => setSelectedPersonaId(value || null)}
          >
            <SelectTrigger id="persona-select">
              <SelectValue placeholder="ペルソナを選択" />
            </SelectTrigger>
            <SelectContent>
              {personas.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-[#A0A0A0]">ペルソナがありません</div>
              ) : (
                personas.map((persona) => (
                  <SelectItem key={persona.id} value={persona.id}>
                    {persona.name}
                    {defaultPersonaId === persona.id && ' (デフォルト)'}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* ペルソナ一覧 */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {personas.length === 0 ? (
            <div className="text-center py-8 text-[#A0A0A0]">
              <Construction className="h-8 w-8 mx-auto mb-2" />
              <p>まだペルソナがありません</p>
              <p className="text-sm mt-1">新しいペルソナを作成してください</p>
            </div>
          ) : (
            personas.map((persona) => (
              <Card 
                key={persona.id}
                className={cn(
                  "bg-[#2D2D2D] border-[#4A4A4A] hover:border-[#4A4A4A]/80 transition-all",
                  selectedPersonaId === persona.id && "border-blue-500/50 bg-blue-500/5"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Construction className="h-4 w-4 text-[#A0A0A0]" />
                        <CardTitle className="text-sm font-semibold text-[#E0E0E0]">
                          {persona.name}
                        </CardTitle>
                        {defaultPersonaId === persona.id && (
                          <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                            <Star className="h-3 w-3 mr-1" />
                            デフォルト
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-[#A0A0A0] line-clamp-2">
                        {persona.description}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="gap-2 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPersonaId(persona.id)}
                    className="flex-1 border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0]"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    選択
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPersona(persona)}
                    className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0]"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  {defaultPersonaId !== persona.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDefaultPersona(persona.id)}
                      className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                      title="デフォルトに設定"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePersona(persona.id)}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    disabled={defaultPersonaId === persona.id}
                    title={defaultPersonaId === persona.id ? "デフォルトペルソナは削除できません" : "削除"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* 新規作成ボタン */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleCreatePersona}
        >
          <Plus className="h-4 w-4 mr-2" />
          新しいペルソナを作成
        </Button>
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
      <TabsContent value="saved" className="mt-4 space-y-4">
        {/* 保存済み台本一覧（6.7, 6.14：バージョン履歴タイムライン表示） */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {savedScripts.length === 0 ? (
            <div className="text-center py-8 text-[#A0A0A0]">
              <BookOpen className="h-8 w-8 mx-auto mb-2" />
              <p>まだ保存済み台本がありません</p>
              <p className="text-sm mt-1">台本を編集して保存すると、ここに表示されます</p>
            </div>
          ) : (
            groupedSavedScripts.map((group) => (
              <Card 
                key={group.scriptId}
                className="bg-[#2D2D2D] border-[#4A4A4A] hover:border-[#4A4A4A]/80 transition-all"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-[#A0A0A0]" />
                        <CardTitle className="text-sm font-semibold text-[#E0E0E0]">
                          {group.latestVersion.title}
                        </CardTitle>
                        {group.versions.length > 1 && (
                          <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                            <GitBranch className="h-3 w-3 mr-1" />
                            {group.versions.length}バージョン
                          </Badge>
                        )}
                      </div>
                      
                      {/* タイムスタンプ表示（最新バージョン） */}
                      <div className="flex items-center gap-1 text-xs text-[#A0A0A0] mb-2">
                        <Clock className="h-3 w-3" />
                        最新更新: {new Date(group.latestVersion.updatedAt).toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      
                      {/* プレビュー（最新バージョン） */}
                      <div className="text-xs text-[#A0A0A0] line-clamp-2 mb-3">
                        {group.latestVersion.introduction.substring(0, 50)}...
                      </div>

                      {/* バージョン履歴タイムライン（6.14） */}
                      {group.versions.length > 1 && (
                        <div className="mt-3 pt-3 border-t border-[#4A4A4A]">
                          <Label className="text-xs text-[#A0A0A0] mb-2 block">バージョン履歴</Label>
                          <div className="space-y-2 pl-4 border-l-2 border-blue-500/30">
                            {group.versions.map((version, index) => (
                              <div key={version.id} className="relative">
                                <div className={cn(
                                  "absolute -left-[9px] top-2 w-2 h-2 rounded-full",
                                  index === 0 ? "bg-blue-500" : "bg-[#4A4A4A]"
                                )} />
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-[#E0E0E0]">
                                        v{version.version}
                                      </span>
                                      {version.versionName && (
                                        <Badge variant="outline" className="text-xs bg-[#1A1A1A] text-[#A0A0A0] border-[#4A4A4A]">
                                          {version.versionName}
                                        </Badge>
                                      )}
                                      {index === 0 && (
                                        <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                                          最新
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-xs text-[#A0A0A0]">
                                      {new Date(version.updatedAt).toLocaleString('ja-JP', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => loadSavedScript(version)}
                                    className="h-7 px-2 text-xs text-[#A0A0A0] hover:text-[#E0E0E0] hover:bg-[#4A4A4A]"
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    読み込む
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="gap-2 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSavedScript(group.latestVersion)}
                    className="flex-1 border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0]"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    最新版を読み込む
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('この台本のすべてのバージョンを削除しますか？')) {
                        group.versions.forEach(v => deleteSavedScript(v.id));
                      }
                    }}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  ), [selectedTab, handleGenerate, isGeneratingIdeas, savedScripts, groupedSavedScripts, loadSavedScript, deleteSavedScript, allTemplates, selectedTemplateId, categoryConfig, personas, selectedPersonaId, defaultPersonaId, handleEditPersona, setSelectedPersonaId, setDefaultPersona, deletePersona, handleCreatePersona]);

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
          <ProgressBar
            steps={ideaGenerationSteps}
            currentStepId={ideaGenerationStep}
            type="ideas"
          />
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
                              
                              {/* 共有・エクスポートメニュー（6.13） */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-8 w-8 text-[#A0A0A0] hover:text-[#E0E0E0] hover:bg-[#4A4A4A]"
                                    aria-label="共有・エクスポート"
                                  >
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                  align="end" 
                                  className="bg-[#2D2D2D] border-[#4A4A4A] min-w-[180px]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyIdea(idea);
                                    }}
                                    className="text-[#E0E0E0] hover:bg-[#4A4A4A] cursor-pointer"
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    コピー
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShareIdeaUrl(idea);
                                    }}
                                    className="text-[#E0E0E0] hover:bg-[#4A4A4A] cursor-pointer"
                                  >
                                    <Share2 className="h-4 w-4 mr-2" />
                                    URL共有
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-[#4A4A4A]" />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleExportIdeaAsText(idea);
                                    }}
                                    className="text-[#E0E0E0] hover:bg-[#4A4A4A] cursor-pointer"
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    テキストエクスポート
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleExportIdeaAsPDF(idea);
                                    }}
                                    className="text-[#E0E0E0] hover:bg-[#4A4A4A] cursor-pointer"
                                  >
                                    <FileDown className="h-4 w-4 mr-2" />
                                    PDFエクスポート
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              
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
          {isGeneratingScript ? (
            <div className="h-full flex items-center justify-center">
              <ProgressBar
                steps={scriptGenerationSteps}
                currentStepId={scriptGenerationStep}
                type="script"
              />
            </div>
          ) : currentScript && selectedIdeaId === currentScript.ideaId ? (
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
              <CardContent className="space-y-4">
                {/* 表示モード切り替えタブ（6.11） */}
                <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as 'edit' | 'reading' | 'timeline')}>
                  <TabsList className="grid w-full grid-cols-3 bg-[#1A1A1A] border border-[#4A4A4A]">
                    <TabsTrigger value="edit" className="data-[state=active]:bg-[#2D2D2D] data-[state=active]:text-[#E0E0E0]">
                      <Edit2 className="h-4 w-4 mr-1" />
                      編集
                    </TabsTrigger>
                    <TabsTrigger value="reading" className="data-[state=active]:bg-[#2D2D2D] data-[state=active]:text-[#E0E0E0]">
                      <Volume2 className="h-4 w-4 mr-1" />
                      読み上げ
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="data-[state=active]:bg-[#2D2D2D] data-[state=active]:text-[#E0E0E0]">
                      <Gauge className="h-4 w-4 mr-1" />
                      タイムライン
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* 編集モード */}
                  <TabsContent value="edit" className="mt-4 space-y-4">
                    {/* ツールバー（デザイナー提案） - 2行レイアウト */}
                    <div className="space-y-2 pb-2 border-b border-[#4A4A4A]">
                      {/* 1行目: ボタン群 */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleUndo}
                          disabled={historyIndex <= 0}
                          className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0] disabled:opacity-50 disabled:cursor-not-allowed"
                          title="アンドゥ"
                        >
                          <Undo2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRedo}
                          disabled={historyIndex >= scriptHistory.length - 1}
                          className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0] disabled:opacity-50 disabled:cursor-not-allowed"
                          title="リドゥ"
                        >
                          <Redo2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (currentScript) {
                              addToScriptHistory(currentScript);
                              saveScript(false); // 手動保存（6.7）
                            }
                          }}
                          disabled={!isEditingScript || saveStatus === 'saving'}
                          className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0] disabled:opacity-50 disabled:cursor-not-allowed"
                          title="保存"
                        >
                          {saveStatus === 'saving' ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              保存中...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-1" />
                              保存
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDuplicateScript}
                          disabled={!currentScript}
                          className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0] disabled:opacity-50 disabled:cursor-not-allowed"
                          title="複製（6.14）"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          複製
                        </Button>
                      </div>
                      
                      {/* 2行目: 統計情報と保存状態 */}
                      <div className="flex items-center justify-between gap-4">
                        {calculateScriptStats && (
                          <div className="flex items-center gap-4 text-xs text-[#A0A0A0]">
                            <span>文字数: {calculateScriptStats.total.chars}</span>
                            <span>行数: {calculateScriptStats.total.lines}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              予想時間: {calculateScriptStats.total.estimatedMinutes}分
                            </span>
                          </div>
                        )}
                        {/* 保存状態バッジ（6.7） */}
                        {currentScript && (
                          <div>
                            {saveStatus === 'saved' && (
                              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/50">
                                保存済み
                              </Badge>
                            )}
                            {saveStatus === 'editing' && (
                              <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/50">
                                編集中
                              </Badge>
                            )}
                            {saveStatus === 'saving' && (
                              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/50">
                                保存中...
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                {/* 動的セクション表示（テンプレートベース）（6.8） */}
                {currentTemplate.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section) => {
                    const sectionValue = getSectionValue(section.id);
                    const colorClasses = sectionColorMap[section.color] || sectionColorMap.blue;
                    const lineCount = sectionValue.split('\n').length;
                    
                    return (
                      <div key={section.id} className={`border-l-4 ${colorClasses.border} ${colorClasses.bg} p-4 rounded`}>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-bold text-[#E0E0E0]">【{section.label}】</h5>
                          <span className="text-xs text-[#A0A0A0]">
                            {sectionValue.length}文字 / {lineCount}行
                          </span>
                        </div>
                        <div className="relative">
                          {/* 行番号表示（デザイナー提案） */}
                          <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#2D2D2D] border-r border-[#4A4A4A] text-xs text-[#666] font-mono flex flex-col items-end pr-2 py-2 overflow-hidden">
                            {sectionValue.split('\n').map((_, index) => (
                              <div key={index} className="leading-6 whitespace-nowrap">
                                {index + 1}
                              </div>
                            ))}
                          </div>
                          <Textarea
                            value={sectionValue}
                            onChange={(e) => handleSectionChange(section.id, e.target.value)}
                            className="pl-10 font-mono text-sm text-[#E0E0E0] bg-[#1A1A1A] border-[#4A4A4A] resize-none min-h-[120px]"
                            placeholder={section.placeholder}
                          />
                        </div>
                      </div>
                    );
                  })}
                  </TabsContent>
                  
                  {/* 読み上げモード（6.11） */}
                  <TabsContent value="reading" className="mt-4 space-y-4">
                    {/* 読み上げ速度調整 */}
                    <div className="space-y-3 pb-4 border-b border-[#4A4A4A]">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 text-[#E0E0E0]">
                          <Volume2 className="h-4 w-4" />
                          読み上げ速度
                        </Label>
                        <span className="text-sm text-[#A0A0A0]">{readingSpeed.toFixed(1)}倍速</span>
                      </div>
                      <Slider
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        value={[readingSpeed]}
                        onValueChange={(value) => setReadingSpeed(value[0])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-[#4A4A4A]">
                        <span>0.5倍</span>
                        <span>1.0倍</span>
                        <span>2.0倍</span>
                      </div>
                    </div>
                    
                    {/* 読み上げコントロール */}
                    <div className="flex items-center gap-2 pb-4 border-b border-[#4A4A4A]">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsReading(!isReading)}
                        className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0]"
                      >
                        {isReading ? (
                          <>
                            <Pause className="h-4 w-4 mr-1" />
                            停止
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            読み上げ開始
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* 読み上げ表示（大きめフォント） */}
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                      {currentTemplate.sections
                        .sort((a, b) => a.order - b.order)
                        .map((section, sectionIndex) => {
                          const sectionValue = getSectionValue(section.id);
                          const colorClasses = sectionColorMap[section.color] || sectionColorMap.blue;
                          const lines = sectionValue.split('\n');
                          
                          return (
                            <div key={section.id} className={`border-l-4 ${colorClasses.border} ${colorClasses.bg} p-4 rounded`}>
                              <h5 className="font-bold text-lg text-[#E0E0E0] mb-3">【{section.label}】</h5>
                              <div className="space-y-2">
                                {lines.map((line, lineIndex) => {
                                  const globalLineIndex = currentTemplate.sections
                                    .slice(0, sectionIndex)
                                    .reduce((acc, s) => acc + getSectionValue(s.id).split('\n').length, 0) + lineIndex;
                                  const isCurrentLine = currentReadingIndex === globalLineIndex;
                                  
                                  return (
                                    <div
                                      key={lineIndex}
                                      className={cn(
                                        "text-lg leading-relaxed p-2 rounded transition-all",
                                        isCurrentLine
                                          ? "bg-primary/20 border-2 border-primary text-[#E0E0E0] font-semibold"
                                          : "text-[#A0A0A0]"
                                      )}
                                    >
                                      {line || '\u00A0'}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </TabsContent>
                  
                  {/* タイムライン表示（6.11） */}
                  <TabsContent value="timeline" className="mt-4 space-y-4">
                    {calculateTimeline ? (
                      <>
                        {/* 全体時間表示 */}
                        <div className="p-4 bg-[#2D2D2D] rounded-lg border border-[#4A4A4A]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-primary" />
                              <span className="text-lg font-semibold text-[#E0E0E0]">総時間</span>
                            </div>
                            <span className="text-2xl font-bold text-primary">
                              {formatTime(calculateTimeline.totalSeconds)}
                            </span>
                          </div>
                        </div>
                        
                        {/* セクションタイムライン */}
                        <div className="space-y-3">
                          {calculateTimeline.sections.map((timelineItem, index) => {
                            const colorClasses = sectionColorMap[timelineItem.section.color] || sectionColorMap.blue;
                            const percentage = (timelineItem.duration / calculateTimeline.totalSeconds) * 100;
                            
                            // セクションカラーに応じたドットの色を設定
                            const dotColorMap: Record<string, string> = {
                              blue: 'bg-blue-500',
                              green: 'bg-green-500',
                              purple: 'bg-purple-500',
                              yellow: 'bg-yellow-500',
                              orange: 'bg-orange-500',
                              pink: 'bg-pink-500',
                            };
                            const dotColor = dotColorMap[timelineItem.section.color] || 'bg-blue-500';
                            
                            return (
                              <div key={timelineItem.section.id} className="border border-[#4A4A4A] rounded-lg p-4 bg-[#2D2D2D]">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${dotColor}`} />
                                    <h5 className="font-semibold text-[#E0E0E0]">【{timelineItem.section.label}】</h5>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-[#A0A0A0]">
                                    <span>{formatTime(timelineItem.startTime)}</span>
                                    <span className="text-primary">→</span>
                                    <span>{formatTime(timelineItem.endTime)}</span>
                                  </div>
                                </div>
                                
                                {/* タイムラインバー */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs text-[#4A4A4A]">
                                    <span>開始: {formatTime(timelineItem.startTime)}</span>
                                    <span className="text-primary font-semibold">継続時間: {formatTime(timelineItem.duration)}</span>
                                    <span>終了: {formatTime(timelineItem.endTime)}</span>
                                  </div>
                                  <div className="w-full h-3 bg-[#1A1A1A] rounded-full overflow-hidden">
                                    <div
                                      className={cn("h-full transition-all", dotColor)}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <div className="text-xs text-[#A0A0A0]">
                                    {timelineItem.chars}文字 / 累積: {formatTime(timelineItem.endTime)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-[#A0A0A0] py-8">
                        タイムラインを計算中...
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
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
      {!isDesktop && (
        <>
          {isGeneratingScript ? (
            <div className="p-4 border-t border-[#4A4A4A] lg:hidden bg-[#1A1A1A]">
              <ProgressBar
                steps={scriptGenerationSteps}
                currentStepId={scriptGenerationStep}
                type="script"
              />
            </div>
          ) : currentScript && selectedIdeaId === currentScript.ideaId && (
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
            <CardContent className="space-y-4">
              {/* 表示モード切り替えタブ（6.11） */}
              <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as 'edit' | 'reading' | 'timeline')}>
                <TabsList className="grid w-full grid-cols-3 bg-[#1A1A1A] border border-[#4A4A4A]">
                  <TabsTrigger value="edit" className="data-[state=active]:bg-[#2D2D2D] data-[state=active]:text-[#E0E0E0]">
                    <Edit2 className="h-4 w-4 mr-1" />
                    編集
                  </TabsTrigger>
                  <TabsTrigger value="reading" className="data-[state=active]:bg-[#2D2D2D] data-[state=active]:text-[#E0E0E0]">
                    <Volume2 className="h-4 w-4 mr-1" />
                    読み上げ
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="data-[state=active]:bg-[#2D2D2D] data-[state=active]:text-[#E0E0E0]">
                    <Gauge className="h-4 w-4 mr-1" />
                    タイムライン
                  </TabsTrigger>
                </TabsList>
                
                {/* 編集モード */}
                <TabsContent value="edit" className="mt-4 space-y-4">
                  {/* ツールバー（デザイナー提案） - 2行レイアウト */}
                  <div className="space-y-2 pb-2 border-b border-[#4A4A4A]">
                    {/* 1行目: ボタン群 */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                        className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0] disabled:opacity-50 disabled:cursor-not-allowed"
                        title="アンドゥ"
                      >
                        <Undo2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRedo}
                        disabled={historyIndex >= scriptHistory.length - 1}
                        className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0] disabled:opacity-50 disabled:cursor-not-allowed"
                        title="リドゥ"
                      >
                        <Redo2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (currentScript) {
                            addToScriptHistory(currentScript);
                            saveScript(false); // 手動保存（6.7）
                          }
                        }}
                        disabled={!isEditingScript || saveStatus === 'saving'}
                        className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0] disabled:opacity-50 disabled:cursor-not-allowed"
                        title="保存"
                      >
                        {saveStatus === 'saving' ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            保存中...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            保存
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDuplicateScript}
                        disabled={!currentScript}
                        className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0] disabled:opacity-50 disabled:cursor-not-allowed"
                        title="複製（6.14）"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        複製
                      </Button>
                    </div>
                    
                    {/* 2行目: 統計情報と保存状態 */}
                    <div className="flex items-center justify-between gap-4">
                      {calculateScriptStats && (
                        <div className="flex items-center gap-4 text-xs text-[#A0A0A0]">
                          <span>文字数: {calculateScriptStats.total.chars}</span>
                          <span>行数: {calculateScriptStats.total.lines}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            予想時間: {calculateScriptStats.total.estimatedMinutes}分
                          </span>
                        </div>
                      )}
                      {/* 保存状態バッジ（6.7） */}
                      {currentScript && (
                        <div>
                          {saveStatus === 'saved' && (
                            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/50">
                              保存済み
                            </Badge>
                          )}
                          {saveStatus === 'editing' && (
                            <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/50">
                              編集中
                            </Badge>
                          )}
                          {saveStatus === 'saving' && (
                            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/50">
                              保存中...
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

              {/* 動的セクション表示（テンプレートベース）（6.8） */}
              {currentTemplate.sections
                .sort((a, b) => a.order - b.order)
                .map((section) => {
                  const sectionValue = getSectionValue(section.id);
                  const colorClasses = sectionColorMap[section.color] || sectionColorMap.blue;
                  const lineCount = sectionValue.split('\n').length;
                  
                  return (
                    <div key={section.id} className={`border-l-4 ${colorClasses.border} ${colorClasses.bg} p-4 rounded`}>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold text-[#E0E0E0]">【{section.label}】</h5>
                        <span className="text-xs text-[#A0A0A0]">
                          {sectionValue.length}文字 / {lineCount}行
                        </span>
                      </div>
                      <div className="relative">
                        {/* 行番号表示（デザイナー提案） */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#2D2D2D] border-r border-[#4A4A4A] text-xs text-[#666] font-mono flex flex-col items-end pr-2 py-2 overflow-hidden">
                          {sectionValue.split('\n').map((_, index) => (
                            <div key={index} className="leading-6 whitespace-nowrap">
                              {index + 1}
                            </div>
                          ))}
                        </div>
                        <Textarea
                          value={sectionValue}
                          onChange={(e) => handleSectionChange(section.id, e.target.value)}
                          className="pl-10 font-mono text-sm text-[#E0E0E0] bg-[#1A1A1A] border-[#4A4A4A] resize-none min-h-[120px]"
                          placeholder={section.placeholder}
                        />
                      </div>
                    </div>
                  );
                })}
                </TabsContent>
                
                {/* 読み上げモード（6.11） */}
                <TabsContent value="reading" className="mt-4 space-y-4">
                  {/* 読み上げ速度調整 */}
                  <div className="space-y-3 pb-4 border-b border-[#4A4A4A]">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-[#E0E0E0]">
                        <Volume2 className="h-4 w-4" />
                        読み上げ速度
                      </Label>
                      <span className="text-sm text-[#A0A0A0]">{readingSpeed.toFixed(1)}倍速</span>
                    </div>
                    <Slider
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      value={[readingSpeed]}
                      onValueChange={(value) => setReadingSpeed(value[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-[#4A4A4A]">
                      <span>0.5倍</span>
                      <span>1.0倍</span>
                      <span>2.0倍</span>
                    </div>
                  </div>
                  
                  {/* 読み上げコントロール */}
                  <div className="flex items-center gap-2 pb-4 border-b border-[#4A4A4A]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsReading(!isReading)}
                      className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0]"
                    >
                      {isReading ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          停止
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          読み上げ開始
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* 読み上げ表示（大きめフォント） */}
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {currentTemplate.sections
                      .sort((a, b) => a.order - b.order)
                      .map((section, sectionIndex) => {
                        const sectionValue = getSectionValue(section.id);
                        const colorClasses = sectionColorMap[section.color] || sectionColorMap.blue;
                        const lines = sectionValue.split('\n');
                        
                        return (
                          <div key={section.id} className={`border-l-4 ${colorClasses.border} ${colorClasses.bg} p-4 rounded`}>
                            <h5 className="font-bold text-lg text-[#E0E0E0] mb-3">【{section.label}】</h5>
                            <div className="space-y-2">
                              {lines.map((line, lineIndex) => {
                                const globalLineIndex = currentTemplate.sections
                                  .slice(0, sectionIndex)
                                  .reduce((acc, s) => acc + getSectionValue(s.id).split('\n').length, 0) + lineIndex;
                                const isCurrentLine = currentReadingIndex === globalLineIndex;
                                
                                return (
                                  <div
                                    key={lineIndex}
                                    className={cn(
                                      "text-lg leading-relaxed p-2 rounded transition-all",
                                      isCurrentLine
                                        ? "bg-primary/20 border-2 border-primary text-[#E0E0E0] font-semibold"
                                        : "text-[#A0A0A0]"
                                    )}
                                  >
                                    {line || '\u00A0'}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </TabsContent>
                
                {/* タイムライン表示（6.11） */}
                <TabsContent value="timeline" className="mt-4 space-y-4">
                  {calculateTimeline ? (
                    <>
                      {/* 全体時間表示 */}
                      <div className="p-4 bg-[#2D2D2D] rounded-lg border border-[#4A4A4A]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <span className="text-lg font-semibold text-[#E0E0E0]">総時間</span>
                          </div>
                          <span className="text-2xl font-bold text-primary">
                            {formatTime(calculateTimeline.totalSeconds)}
                          </span>
                        </div>
                      </div>
                      
                      {/* セクションタイムライン */}
                      <div className="space-y-3">
                        {calculateTimeline.sections.map((timelineItem, index) => {
                          const colorClasses = sectionColorMap[timelineItem.section.color] || sectionColorMap.blue;
                          const percentage = (timelineItem.duration / calculateTimeline.totalSeconds) * 100;
                          
                          // セクションカラーに応じたドットの色を設定
                          const dotColorMap: Record<string, string> = {
                            blue: 'bg-blue-500',
                            green: 'bg-green-500',
                            purple: 'bg-purple-500',
                            yellow: 'bg-yellow-500',
                            orange: 'bg-orange-500',
                            pink: 'bg-pink-500',
                          };
                          const dotColor = dotColorMap[timelineItem.section.color] || 'bg-blue-500';
                          
                          return (
                            <div key={timelineItem.section.id} className="border border-[#4A4A4A] rounded-lg p-4 bg-[#2D2D2D]">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${dotColor}`} />
                                  <h5 className="font-semibold text-[#E0E0E0]">【{timelineItem.section.label}】</h5>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-[#A0A0A0]">
                                  <span>{formatTime(timelineItem.startTime)}</span>
                                  <span className="text-primary">→</span>
                                  <span>{formatTime(timelineItem.endTime)}</span>
                                </div>
                              </div>
                              
                              {/* タイムラインバー */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs text-[#4A4A4A]">
                                  <span>開始: {formatTime(timelineItem.startTime)}</span>
                                  <span className="text-primary font-semibold">継続時間: {formatTime(timelineItem.duration)}</span>
                                  <span>終了: {formatTime(timelineItem.endTime)}</span>
                                </div>
                                <div className="w-full h-3 bg-[#1A1A1A] rounded-full overflow-hidden">
                                  <div
                                    className={cn("h-full transition-all", colorClasses.bg.replace('/5', ''))}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <div className="text-xs text-[#A0A0A0]">
                                  {timelineItem.chars}文字 / 累積: {formatTime(timelineItem.endTime)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-[#A0A0A0] py-8">
                      タイムラインを計算中...
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
          )}
        </>
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
            { id: "history", label: "履歴", icon: <FileText className="h-4 w-4" /> },
            { id: "saved", label: "保存済み", icon: <BookOpen className="h-4 w-4" /> }
          ]}
          onTabClick={setSelectedTab}
        />
      )}

      {/* ペルソナ編集ダイアログ（6.12） */}
      <Dialog open={isPersonaDialogOpen} onOpenChange={(open) => {
        setIsPersonaDialogOpen(open);
        if (!open) {
          resetPersonaForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPersona ? 'ペルソナを編集' : '新しいペルソナを作成'}
            </DialogTitle>
            <DialogDescription>
              ペルソナの情報を入力してください。AIがこの情報を元に企画案や台本を生成します。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="persona-name">ペルソナ名 *</Label>
              <Input
                id="persona-name"
                value={personaFormData.name}
                onChange={(e) => setPersonaFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="例: 元気なゲーマー女子"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="persona-description">ペルソナの特徴・話し方 *</Label>
              <Textarea
                id="persona-description"
                value={personaFormData.description}
                onChange={(e) => setPersonaFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="例: いつも元気で明るく、ゲームが大好き。視聴者と積極的にコミュニケーションを取るスタイル。"
                className="min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <Label>話し方のスタイル（オプション）</Label>
              <div className="flex flex-wrap gap-2">
                {['カジュアル', 'フォーマル', 'エネルギッシュ', '落ち着いた', 'テクニカル', 'エンターテイニング'].map((style) => (
                  <Badge
                    key={style}
                    variant={personaFormData.speakingStyle.includes(style) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setPersonaFormData(prev => ({
                        ...prev,
                        speakingStyle: prev.speakingStyle.includes(style)
                          ? prev.speakingStyle.filter(s => s !== style)
                          : [...prev.speakingStyle, style]
                      }));
                    }}
                  >
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>キャラクターの特徴（オプション）</Label>
              <div className="flex flex-wrap gap-2">
                {['ゲーマー', '歌好き', '雑談好き', 'コラボ好き', 'イベント参加', 'その他'].map((trait) => (
                  <Badge
                    key={trait}
                    variant={personaFormData.traits.includes(trait) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setPersonaFormData(prev => ({
                        ...prev,
                        traits: prev.traits.includes(trait)
                          ? prev.traits.filter(t => t !== trait)
                          : [...prev.traits, trait]
                      }));
                    }}
                  >
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsPersonaDialogOpen(false);
              resetPersonaForm();
            }}>
              キャンセル
            </Button>
            <Button onClick={handleSavePersona} disabled={!personaFormData.name.trim()}>
              {editingPersona ? '更新' : '作成'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 台本複製ダイアログ（6.14） */}
      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent className="bg-[#2D2D2D] border-[#4A4A4A]">
          <DialogHeader>
            <DialogTitle className="text-[#E0E0E0]">台本を複製</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              新しいバージョンとして台本を複製します。バージョン名を入力してください（任意）。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="version-name" className="text-[#E0E0E0]">バージョン名（任意）</Label>
              <Input
                id="version-name"
                value={duplicateVersionName}
                onChange={(e) => setDuplicateVersionName(e.target.value)}
                placeholder="例: 短縮版、改善版、最終版"
                className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDuplicateDialogOpen(false);
                setDuplicateVersionName('');
              }}
              className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A]"
            >
              キャンセル
            </Button>
            <Button 
              onClick={confirmDuplicateScript}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              複製
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
