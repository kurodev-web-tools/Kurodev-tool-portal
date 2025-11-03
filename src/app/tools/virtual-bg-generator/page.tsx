"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Check, Heart, Download as DownloadIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { logger } from "@/lib/logger";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useSidebar } from "@/hooks/use-sidebar";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { validatePrompt } from "@/lib/validation";
import { Sidebar, SidebarToggle } from "@/components/layouts/Sidebar";
import { 
  Sparkles, 
  Download, 
  Search, 
  History, 
  Image as ImageIcon,
  Settings,
  Palette,
  Monitor,
  Save,
  BookOpen,
  X,
  Trash2,
  Grid3x3,
  List,
  Maximize2,
  ArrowUpDown,
  Filter,
  FileText,
  Download as DownloadIcon2,
  RotateCcw,
  Calendar,
  ImagePlus,
  Search as SearchIcon,
  Folder,
  FolderPlus,
  Tag,
  Tags,
  Plus,
  Edit2,
  FolderOpen,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";

// 生成ステップの型定義（7.1.6）
interface GenerationStep {
  id: string;
  label: string;
  estimatedSeconds?: number; // 推定所要時間（秒）
}

// 生成ステップ定義（7.1.6）
const bgGenerationSteps: GenerationStep[] = [
  { id: 'analyze', label: 'プロンプトを分析中...', estimatedSeconds: 3 },
  { id: 'prepare', label: '生成パラメータを設定中...', estimatedSeconds: 2 },
  { id: 'generate', label: '画像を生成中...', estimatedSeconds: 10 },
  { id: 'process', label: '画像を処理中...', estimatedSeconds: 3 },
  { id: 'complete', label: '完成！', estimatedSeconds: 0 },
];

// プログレスバーコンポーネント（7.1.6）
interface ProgressBarProps {
  steps: GenerationStep[];
  currentStepId: string | null;
  estimatedTimeRemaining?: number; // 残り推定時間（秒）
  onCancel?: () => void; // キャンセル関数
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStepId, estimatedTimeRemaining, onCancel }) => {
  const currentIndex = currentStepId ? steps.findIndex(s => s.id === currentStepId) : -1;
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;
  
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.ceil(seconds)}秒`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.ceil(seconds % 60);
    return `${mins}分${secs}秒`;
  };
  
  return (
    <div className="w-full space-y-6">
      <div className="w-full h-full bg-[#2D2D2D] rounded-md flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
        <Loader2 className="w-16 h-16 text-primary mb-6 animate-spin" aria-hidden="true" />
        <h3 className="text-xl font-semibold text-[#E0E0E0] mb-2">
          背景を生成中...
        </h3>
        
        {/* プログレスバー */}
        <div className="w-full max-w-md mt-6">
          <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-[#A0A0A0] text-center flex-1">
              {currentIndex >= 0 && currentIndex < steps.length ? steps[currentIndex].label : '準備中...'}
            </p>
            {estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0 && (
              <p className="text-sm text-[#A0A0A0] ml-4">
                残り約{formatTime(estimatedTimeRemaining)}
              </p>
            )}
          </div>
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
                <div key={step.id} className="flex flex-col items-center relative z-10 flex-1">
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

        {/* キャンセルボタン（7.1.6） */}
        {onCancel && currentIndex >= 0 && currentIndex < steps.length - 1 && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="mt-6 border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <X className="h-4 w-4 mr-2" />
            生成をキャンセル
          </Button>
        )}
      </div>
    </div>
  );
};

export default function VirtualBackgroundGeneratorPage() {
  const { isOpen: isRightPanelOpen, setIsOpen: setIsRightPanelOpen, isDesktop } = useSidebar({
    defaultOpen: true,
    desktopDefaultOpen: true,
  });
  const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState<string | null>(null); // 生成ステップ（7.1.6）
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number>(0); // 残り推定時間（7.1.6）
  const isCancelledRef = useRef(false); // キャンセルフラグ（7.1.6 - useRefで管理）
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState(""); // ネガティブプロンプト（7.1.1）
  const [category, setCategory] = useState("");
  const [style, setStyle] = useState("");
  const [resolution, setResolution] = useState("");
  const [imageCount, setImageCount] = useState("1");
  const [selectedColor, setSelectedColor] = useState<string>(""); // カラーパレット（7.1.1）
  
  // 生成画像のデータ構造（7.1.2）
  interface GeneratedImage {
    id: string;
    url: string;
    prompt: string;
    negativePrompt?: string;
    category?: string;
    style?: string;
    resolution?: string;
    color?: string;
    createdAt: number;
    downloadCount?: number; // ダウンロード回数（7.1.2）
  }
  
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // 表示設定（7.1.2）
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // グリッド/リスト表示
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'favorite' | 'download'>('newest'); // 並び替え
  const [expandedImageId, setExpandedImageId] = useState<string | null>(null); // 拡大表示中の画像ID（7.1.2）
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set()); // バッチ選択用（7.1.2）
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [favoriteImages, setFavoriteImages] = useState<string[]>([]);
  
  // よく使うプロンプトの保存（7.1.1）
  const [savedPrompts, setSavedPrompts] = useState<Array<{ id: string; prompt: string; negativePrompt?: string; createdAt: number }>>([]);
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const SAVED_PROMPTS_STORAGE_KEY = 'virtual-bg-saved-prompts';
  const MAX_SAVED_PROMPTS = 20;
  
  // 検索関連の状態
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedResolution, setSelectedResolution] = useState("");
  const [selectedLicense, setSelectedLicense] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  
  // 検索機能の強化（7.1.3）
  const [searchThumbnailSize, setSearchThumbnailSize] = useState<'small' | 'medium' | 'large'>('medium'); // サムネイルサイズ
  const [searchSortOrder, setSearchSortOrder] = useState<'relevance' | 'popular' | 'newest' | 'oldest'>('relevance'); // 検索結果のソート順
  const [useInfiniteScroll, setUseInfiniteScroll] = useState(true); // 無限スクロールを使用するか
  const [savedSearchConditions, setSavedSearchConditions] = useState<Array<{
    id: string;
    name: string;
    keyword?: string;
    categories?: string[];
    colors?: string[];
    resolution?: string;
    license?: string;
    createdAt: number;
  }>>([]); // 保存済み検索条件（7.1.3）
  const SAVED_SEARCH_CONDITIONS_STORAGE_KEY = 'virtual-bg-saved-search-conditions';
  const searchObserverRef = useRef<IntersectionObserver | null>(null); // 無限スクロール用（7.1.3）
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null); // 無限スクロール用（7.1.3）
  
  // 履歴関連の状態（7.1.4）
  interface HistoryItem {
    id: string;
    imageUrl: string;
    prompt?: string;
    negativePrompt?: string;
    category?: string;
    style?: string;
    resolution?: string;
    color?: string;
    timestamp: string;
    type: 'generated' | 'search';
    searchKeyword?: string; // 検索履歴の場合
    searchParams?: {
      categories?: string[];
      colors?: string[];
      resolution?: string;
      license?: string;
    }; // 検索パラメータ
  }
  
  const HISTORY_STORAGE_KEY = 'virtual-bg-history';
  const DEFAULT_MAX_HISTORY = 100; // デフォルトの履歴保存数上限
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'generated' | 'search'>('all'); // 履歴フィルター（7.1.4）
  const [historySearchKeyword, setHistorySearchKeyword] = useState(''); // 履歴検索キーワード（7.1.4）
  const [maxHistoryCount, setMaxHistoryCount] = useState(DEFAULT_MAX_HISTORY); // 履歴保存数上限（7.1.4）
  
  // コレクション・整理機能（7.1.7）
  interface Collection {
    id: string;
    name: string;
    description?: string;
    imageIds: string[]; // GeneratedImageのID配列
    tags?: string[]; // コレクションタグ
    createdAt: number;
    updatedAt: number;
  }
  
  interface ImageTag {
    id: string;
    label: string;
    color?: string;
  }
  
  const COLLECTIONS_STORAGE_KEY = 'virtual-bg-collections';
  const IMAGE_TAGS_STORAGE_KEY = 'virtual-bg-image-tags';
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [imageTags, setImageTags] = useState<Map<string, string[]>>(new Map()); // imageId -> tagIds[]
  const [allTags, setAllTags] = useState<ImageTag[]>([]); // 全タグ一覧
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  
  const { handleAsyncError } = useErrorHandler();

  const categories = [
    { value: "fantasy", label: "ファンタジー", icon: "🧙‍♀️" },
    { value: "sci-fi", label: "SF", icon: "🚀" },
    { value: "daily", label: "日常", icon: "🏠" },
    { value: "nature", label: "自然", icon: "🌿" },
    { value: "urban", label: "都市", icon: "🏙️" },
    { value: "space", label: "宇宙", icon: "🌌" },
  ];

  const styles = [
    { value: "anime", label: "アニメ風" },
    { value: "oil-painting", label: "油絵風" },
    { value: "watercolor", label: "水彩画風" },
    { value: "realistic", label: "リアル" },
    { value: "cartoon", label: "カートゥーン風" },
    { value: "minimalist", label: "ミニマル" },
  ];

  const resolutions = [
    { value: "1920x1080", label: "1920x1080 (16:9)", aspectRatio: "16:9" },
    { value: "3840x2160", label: "3840x2160 (4K)", aspectRatio: "16:9" },
    { value: "1080x1920", label: "1080x1920 (9:16)", aspectRatio: "9:16" },
    { value: "2560x1440", label: "2560x1440 (16:9)", aspectRatio: "16:9" },
    { value: "1280x720", label: "1280x720 (16:9)", aspectRatio: "16:9" },
  ];

  const imageCounts = [
    { value: "1", label: "1枚" },
    { value: "2", label: "2枚" },
    { value: "4", label: "4枚" },
    { value: "8", label: "8枚" },
  ];

  // カラーパレット（7.1.1）
  const colorPalette = [
    { value: "", label: "指定なし", color: "bg-gray-500" },
    { value: "red", label: "赤", color: "bg-red-500" },
    { value: "orange", label: "オレンジ", color: "bg-orange-500" },
    { value: "yellow", label: "黄", color: "bg-yellow-500" },
    { value: "green", label: "緑", color: "bg-green-500" },
    { value: "blue", label: "青", color: "bg-blue-500" },
    { value: "purple", label: "紫", color: "bg-purple-500" },
    { value: "pink", label: "ピンク", color: "bg-pink-500" },
    { value: "brown", label: "茶", color: "bg-amber-700" },
    { value: "black", label: "黒", color: "bg-gray-900" },
    { value: "white", label: "白", color: "bg-gray-100" },
  ];

  // プロンプトテンプレート（7.1.1）
  const promptTemplates = useMemo(() => ({
    fantasy: [
      "魔法の森、妖精が舞い踊る神秘的な場所",
      "中世の城、石造りの壮麗な建築物",
      "空に浮かぶ島、雲海の上に広がる異世界",
    ],
    "sci-fi": [
      "サイバーパンク都市の夜景、ネオンライトが輝く未来都市",
      "宇宙ステーション、星々を見下ろす軌道上の施設",
      "ロボット工場、機械が稼働する未来的な施設",
    ],
    daily: [
      "コーヒーショップ、温かみのある日常の空間",
      "図書館、本棚が並ぶ静かな読書空間",
      "リビングルーム、くつろぎの家庭空間",
    ],
    nature: [
      "山頂からの眺め、雲海に浮かぶ山々",
      "森の中の小道、陽光が差し込む緑豊かな道",
      "海辺の夕日、オレンジに染まる水平線",
    ],
    urban: [
      "大都市の摩天楼、高層ビルが林立する街",
      "商店街の夜景、看板が輝く賑やかな通り",
      "公園のベンチ、都会の中の憩いの場所",
    ],
    space: [
      "銀河系の中心、星雲が渦巻く宇宙空間",
      "惑星の表面、異世界の風景が広がる大地",
      "星間空間、無数の星が輝く深宇宙",
    ],
  }), []);

  // よく使うプロンプトの読み込み（7.1.1）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SAVED_PROMPTS_STORAGE_KEY);
        if (saved) {
          setSavedPrompts(JSON.parse(saved));
        }
      } catch (err) {
        console.error('保存済みプロンプトの読み込み失敗', err);
      }
    }
  }, []);

  // よく使うプロンプトの保存（7.1.1）
  const handleSavePrompt = useCallback(() => {
    if (!prompt.trim()) {
      toast.error('プロンプトが空です');
      return;
    }

    setIsSavingPrompt(true);
    const newPrompt = {
      id: Date.now().toString(),
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      createdAt: Date.now(),
    };

    const updated = [newPrompt, ...savedPrompts].slice(0, MAX_SAVED_PROMPTS);
    setSavedPrompts(updated);
    
    try {
      localStorage.setItem(SAVED_PROMPTS_STORAGE_KEY, JSON.stringify(updated));
      toast.success('プロンプトを保存しました');
    } catch (err) {
      console.error('プロンプト保存失敗', err);
      toast.error('プロンプトの保存に失敗しました');
    }
    setIsSavingPrompt(false);
  }, [prompt, negativePrompt, savedPrompts]);

  // 保存済みプロンプトの読み込み（7.1.1）
  const handleLoadSavedPrompt = useCallback((savedPrompt: { prompt: string; negativePrompt?: string }) => {
    setPrompt(savedPrompt.prompt);
    setNegativePrompt(savedPrompt.negativePrompt || '');
    toast.success('プロンプトを読み込みました');
  }, []);

  // 保存済みプロンプトの削除（7.1.1）
  const handleDeleteSavedPrompt = useCallback((id: string) => {
    const updated = savedPrompts.filter(p => p.id !== id);
    setSavedPrompts(updated);
    try {
      localStorage.setItem(SAVED_PROMPTS_STORAGE_KEY, JSON.stringify(updated));
      toast.success('プロンプトを削除しました');
    } catch (err) {
      console.error('プロンプト削除失敗', err);
    }
  }, [savedPrompts]);

  // テンプレートの適用（7.1.1）
  const handleApplyTemplate = useCallback((templatePrompt: string) => {
    setPrompt(templatePrompt);
    toast.success('テンプレートを適用しました');
  }, []);

  // 生成キャンセル処理（7.1.6）
  const handleCancelGeneration = useCallback(() => {
    isCancelledRef.current = true;
    setIsLoading(false);
    setGenerationStep(null);
    setEstimatedTimeRemaining(0);
    toast.info('生成をキャンセルしました');
  }, []);

  // 自動タグ付け（生成パラメータから）（7.1.7）
  const handleAutoTagImage = useCallback((imageId: string, img: GeneratedImage) => {
    const autoTags: string[] = [];
    
    if (img.category) {
      autoTags.push(`category:${img.category}`);
    }
    if (img.style) {
      autoTags.push(`style:${img.style}`);
    }
    if (img.color) {
      autoTags.push(`color:${img.color}`);
    }
    if (img.resolution) {
      autoTags.push(`resolution:${img.resolution}`);
    }
    
    if (autoTags.length > 0) {
      setImageTags(prev => {
        const next = new Map(prev);
        const existingTags = next.get(imageId) || [];
        const newTags = [...new Set([...existingTags, ...autoTags])];
        next.set(imageId, newTags);
        return next;
      });
      
      // 全タグ一覧を更新
      setAllTags(prev => {
        const tagMap = new Map(prev.map(t => [t.id, t]));
        autoTags.forEach(tagId => {
          if (!tagMap.has(tagId)) {
            tagMap.set(tagId, { id: tagId, label: tagId, color: undefined });
          }
        });
        return Array.from(tagMap.values());
      });
      
      toast.success(`${autoTags.length}個のタグを自動追加しました`);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    const promptError = validatePrompt(prompt);
    if (promptError) {
      logger.error('バリデーションエラー', { error: promptError }, 'VirtualBgGenerator');
      toast.error('プロンプトの検証エラー', {
        description: promptError
      });
      return;
    }

    setIsLoading(true);
    isCancelledRef.current = false;
    setGenerationStep(null);
    setEstimatedTimeRemaining(0);

    await handleAsyncError(async () => {
      // 各ステップを順次実行（7.1.6）
      for (let i = 0; i < bgGenerationSteps.length; i++) {
        if (isCancelledRef.current) {
          return; // キャンセルされた場合は処理を中断
        }

        const step = bgGenerationSteps[i];
        setGenerationStep(step.id);

        // 残り推定時間を計算（7.1.6）
        const remainingSteps = bgGenerationSteps.slice(i);
        const totalRemaining = remainingSteps.reduce((sum, s) => sum + (s.estimatedSeconds || 0), 0);
        setEstimatedTimeRemaining(totalRemaining);

        // ステップごとの処理時間をシミュレート
        const stepDuration = (step.estimatedSeconds || 1) * 1000;
        const startTime = Date.now();
        
        // 残り時間のカウントダウン（7.1.6）
        const countdownInterval = setInterval(() => {
          if (isCancelledRef.current) {
            clearInterval(countdownInterval);
            return;
          }
          const elapsed = (Date.now() - startTime) / 1000;
          const remaining = Math.max(0, (step.estimatedSeconds || 1) - elapsed + 
            remainingSteps.slice(1).reduce((sum, s) => sum + (s.estimatedSeconds || 0), 0));
          setEstimatedTimeRemaining(remaining);
        }, 100);

        await new Promise(resolve => setTimeout(resolve, stepDuration));
        clearInterval(countdownInterval);

        if (isCancelledRef.current) {
          return;
        }
      }

      if (isCancelledRef.current) {
        return;
      }

      // プレースホルダー画像を生成（7.1.2: GeneratedImage型に拡張）
      const newImages: GeneratedImage[] = Array.from({ length: parseInt(imageCount) }, (_, i) => ({
        id: `img-${Date.now()}-${i}`,
        url: `https://picsum.photos/800/600?random=${Date.now() + i}`,
        prompt: prompt || '',
        negativePrompt: negativePrompt || undefined,
        category: category || undefined,
        style: style || undefined,
        resolution: resolution || undefined,
        color: selectedColor || undefined,
        createdAt: Date.now(),
        downloadCount: 0,
      }));
      
      setGeneratedImages(prev => [...prev, ...newImages]);
      setSelectedImage(newImages[0]?.url || null);
      
      // 履歴に追加（自動保存）（7.1.6）
      newImages.forEach(img => {
        addToHistory({
          url: img.url,
          prompt: img.prompt,
          negativePrompt: img.negativePrompt,
          category: img.category,
          style: img.style,
          resolution: img.resolution,
          color: img.color,
        }, 'generated');
      });
      
      // 自動タグ付け（7.1.7）
      newImages.forEach(img => {
        handleAutoTagImage(img.id, img);
      });
      
      // 生成完了通知（7.1.6）
      toast.success(`${imageCount}枚の背景を生成しました`, {
        description: '生成が完了しました',
      });

      if (!isDesktop) {
        setActiveTab("preview");
      }

      // ステップをリセット
      setGenerationStep(null);
      setEstimatedTimeRemaining(0);
    }, "背景生成中にエラーが発生しました");
    
    setIsLoading(false);
    isCancelledRef.current = false; // リセット
  }, [prompt, imageCount, handleAsyncError, isDesktop, handleAutoTagImage]);

  const handleCopyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      logger.error('コピー失敗', err, 'VirtualBgGenerator');
    }
  }, [prompt]);

  const handleToggleFavorite = useCallback((imageUrl: string) => {
    setFavoriteImages(prev => 
      prev.includes(imageUrl) 
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    );
  }, []);

  // 画像ダウンロード（7.1.2: GeneratedImage型対応、ダウンロード回数更新）
  const handleDownload = useCallback(async (imageUrl: string) => {
    try {
      // 画像をfetchしてBlobに変換
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Blob URLを作成
      const blobUrl = window.URL.createObjectURL(blob);
      
      // ダウンロード用のリンクを作成
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `virtual-background-${Date.now()}.jpg`;
      
      // リンクをクリックしてダウンロード
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Blob URLを解放
      window.URL.revokeObjectURL(blobUrl);
      
      // ダウンロード回数を更新（7.1.2）
      setGeneratedImages(prev => prev.map(img => 
        img.url === imageUrl 
          ? { ...img, downloadCount: (img.downloadCount || 0) + 1 }
          : img
      ));
    } catch (error) {
      logger.error('ダウンロードエラー', error, 'VirtualBgGenerator');
      // フォールバック: 元の方法でダウンロード
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `virtual-background-${Date.now()}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  // バッチダウンロード（7.1.2）
  const handleBatchDownload = useCallback(async () => {
    if (selectedImageIds.size === 0) return;
    
    const imagesToDownload = generatedImages.filter(img => selectedImageIds.has(img.id));
    
    for (const img of imagesToDownload) {
      await handleDownload(img.url);
      // 少し間隔を空ける（ブラウザの同時ダウンロード制限対策）
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    toast.success(`${imagesToDownload.length}枚の画像をダウンロードしました`);
    setSelectedImageIds(new Set()); // 選択をクリア
  }, [selectedImageIds, generatedImages, handleDownload]);

  // 並び替え済み画像リスト（7.1.2）
  const sortedImages = useMemo(() => {
    const sorted = [...generatedImages];
    
    switch (sortOrder) {
      case 'newest':
        return sorted.sort((a, b) => b.createdAt - a.createdAt);
      case 'oldest':
        return sorted.sort((a, b) => a.createdAt - b.createdAt);
      case 'favorite':
        return sorted.sort((a, b) => {
          const aIsFavorite = favoriteImages.includes(a.url);
          const bIsFavorite = favoriteImages.includes(b.url);
          if (aIsFavorite === bIsFavorite) return b.createdAt - a.createdAt;
          return aIsFavorite ? -1 : 1;
        });
      case 'download':
        return sorted.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
      default:
        return sorted;
    }
  }, [generatedImages, sortOrder, favoriteImages]);

  // 選択状態のトグル（7.1.2）
  const handleToggleImageSelection = useCallback((imageId: string) => {
    setSelectedImageIds(prev => {
      const next = new Set(prev);
      if (next.has(imageId)) {
        next.delete(imageId);
      } else {
        next.add(imageId);
      }
      return next;
    });
  }, []);

  // すべて選択/解除（7.1.2）
  const handleSelectAll = useCallback(() => {
    if (selectedImageIds.size === sortedImages.length) {
      setSelectedImageIds(new Set());
    } else {
      setSelectedImageIds(new Set(sortedImages.map(img => img.id)));
    }
  }, [selectedImageIds.size, sortedImages]);

  // 検索機能のハンドラー（7.1.3: 拡張）
  const handleSearch = async () => {
    setIsSearching(true);
    await handleAsyncError(async () => {
      // モック検索処理
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // モック検索結果を生成（より多くの結果を生成して無限スクロール対応）（7.1.3）
      const allMockResults = Array.from({ length: 50 }, (_, i) => ({
        id: `search-${Date.now()}-${i}`,
        url: `https://picsum.photos/400/300?random=${Date.now() + i}`,
        title: `検索結果 ${i + 1}`,
        category: categories[i % categories.length].value,
        color: ['red', 'blue', 'green', 'purple', 'orange'][i % 5],
        resolution: '1920x1080',
        license: 'free',
        downloads: Math.floor(Math.random() * 1000),
        createdAt: Date.now() - (i * 1000 * 60 * 60), // 時間差を付ける
        relevanceScore: Math.random(), // 関連度スコア
      }));
      
      // ソート（7.1.3）
      let sortedResults = [...allMockResults];
      switch (searchSortOrder) {
        case 'relevance':
          sortedResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
          break;
        case 'popular':
          sortedResults.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
          break;
        case 'newest':
          sortedResults.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          break;
        case 'oldest':
          sortedResults.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
          break;
      }
      
      // 検索結果を設定（無限スクロールの場合は常にリセット）
      setSearchResults(sortedResults);
      setCurrentPage(1);
      setTotalPages(Math.ceil(sortedResults.length / 8));
      
      // 検索履歴に追加（7.1.4）
      if (sortedResults.length > 0) {
        addToHistory({ url: sortedResults[0].url }, 'search');
      }
    }, "検索中にエラーが発生しました");
    setIsSearching(false);
  };

  // 保存済み検索条件の保存（7.1.3）
  const handleSaveSearchCondition = useCallback(() => {
    const name = window.prompt('検索条件の名前を入力してください:');
    if (!name || !name.trim()) return;
    
    const condition = {
      id: `search-condition-${Date.now()}`,
      name: name.trim(),
      keyword: searchKeyword || undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      colors: selectedColors.length > 0 ? selectedColors : undefined,
      resolution: selectedResolution || undefined,
      license: selectedLicense || undefined,
      createdAt: Date.now(),
    };
    
    setSavedSearchConditions(prev => [...prev, condition].slice(-10)); // 最新10件まで
    toast.success('検索条件を保存しました');
  }, [searchKeyword, selectedCategories, selectedColors, selectedResolution, selectedLicense]);

  // 保存済み検索条件の適用（7.1.3）
  const handleLoadSearchCondition = useCallback((condition: typeof savedSearchConditions[0]) => {
    setSearchKeyword(condition.keyword || '');
    setSelectedCategories(condition.categories || []);
    setSelectedColors(condition.colors || []);
    setSelectedResolution(condition.resolution || '');
    setSelectedLicense(condition.license || '');
    toast.success('検索条件を適用しました');
  }, []);

  // 保存済み検索条件の削除（7.1.3）
  const handleDeleteSearchCondition = useCallback((id: string) => {
    setSavedSearchConditions(prev => prev.filter(c => c.id !== id));
    toast.success('検索条件を削除しました');
  }, []);

  // 検索結果のエクスポート（7.1.3）
  const handleExportSearchResults = useCallback(() => {
    try {
      const urls = searchResults.map(r => r.url).join('\n');
      const blob = new Blob([urls], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `virtual-bg-search-results-${new Date().toISOString().split('T')[0]}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('検索結果をエクスポートしました');
    } catch (error) {
      logger.error('エクスポートエラー', error, 'VirtualBgGenerator');
      toast.error('エクスポートに失敗しました');
    }
  }, [searchResults]);

  // コレクション操作関数（7.1.7）
  const handleCreateCollection = useCallback(() => {
    setEditingCollection(null);
    setNewCollectionName('');
    setNewCollectionDescription('');
    setIsCollectionDialogOpen(true);
  }, []);

  const handleSaveCollection = useCallback(() => {
    if (!newCollectionName.trim()) {
      toast.error('コレクション名を入力してください');
      return;
    }

    if (editingCollection) {
      // 編集
      setCollections(prev => prev.map(col =>
        col.id === editingCollection.id
          ? {
              ...col,
              name: newCollectionName.trim(),
              description: newCollectionDescription.trim() || undefined,
              updatedAt: Date.now(),
            }
          : col
      ));
      toast.success('コレクションを更新しました');
    } else {
      // 新規作成
      const newCollection: Collection = {
        id: `collection-${Date.now()}`,
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim() || undefined,
        imageIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setCollections(prev => [...prev, newCollection]);
      toast.success('コレクションを作成しました');
    }
    setIsCollectionDialogOpen(false);
  }, [newCollectionName, newCollectionDescription, editingCollection]);

  const handleDeleteCollection = useCallback((collectionId: string) => {
    if (window.confirm('このコレクションを削除しますか？')) {
      setCollections(prev => prev.filter(col => col.id !== collectionId));
      if (selectedCollectionId === collectionId) {
        setSelectedCollectionId(null);
      }
      toast.success('コレクションを削除しました');
    }
  }, [selectedCollectionId]);

  const handleEditCollection = useCallback((collection: Collection) => {
    setEditingCollection(collection);
    setNewCollectionName(collection.name);
    setNewCollectionDescription(collection.description || '');
    setIsCollectionDialogOpen(true);
  }, []);

  // 画像をコレクションに追加（7.1.7）
  const handleAddImageToCollection = useCallback((imageId: string, collectionId: string) => {
    setCollections(prev => prev.map(col => {
      if (col.id === collectionId) {
        if (!col.imageIds.includes(imageId)) {
          return {
            ...col,
            imageIds: [...col.imageIds, imageId],
            updatedAt: Date.now(),
          };
        }
      }
      return col;
    }));
    toast.success('コレクションに追加しました');
  }, []);

  // 画像をコレクションから削除（7.1.7）
  const handleRemoveImageFromCollection = useCallback((imageId: string, collectionId: string) => {
    setCollections(prev => prev.map(col => {
      if (col.id === collectionId) {
        return {
          ...col,
          imageIds: col.imageIds.filter(id => id !== imageId),
          updatedAt: Date.now(),
        };
      }
      return col;
    }));
    toast.success('コレクションから削除しました');
  }, []);

  // 手動タグ追加（7.1.7）
  const handleAddTagToImage = useCallback((imageId: string, tagLabel: string) => {
    const tagId = tagLabel.trim().toLowerCase();
    if (!tagId) return;

    setImageTags(prev => {
      const next = new Map(prev);
      const existingTags = next.get(imageId) || [];
      if (!existingTags.includes(tagId)) {
        next.set(imageId, [...existingTags, tagId]);
      }
      return next;
    });

    // 全タグ一覧を更新
    setAllTags(prev => {
      if (!prev.find(t => t.id === tagId)) {
        return [...prev, { id: tagId, label: tagLabel.trim(), color: undefined }];
      }
      return prev;
    });

    toast.success('タグを追加しました');
  }, []);

  // タグ削除（7.1.7）
  const handleRemoveTagFromImage = useCallback((imageId: string, tagId: string) => {
    setImageTags(prev => {
      const next = new Map(prev);
      const existingTags = next.get(imageId) || [];
      next.set(imageId, existingTags.filter(id => id !== tagId));
      return next;
    });
    toast.success('タグを削除しました');
  }, []);

  // 選択中のコレクションの画像一覧（7.1.7）
  const collectionImages = useMemo(() => {
    if (!selectedCollectionId) return [];
    const collection = collections.find(col => col.id === selectedCollectionId);
    if (!collection) return [];
    return generatedImages.filter(img => collection.imageIds.includes(img.id));
  }, [selectedCollectionId, collections, generatedImages]);

  // コレクションのエクスポート（ZIP形式の準備）（7.1.7）
  const handleExportCollection = useCallback(async (collectionId: string) => {
    const collection = collections.find(col => col.id === collectionId);
    if (!collection) return;

    try {
      // URLリストをエクスポート（ZIP生成は複雑なため、まずはURLリスト）
      const collectionImages = generatedImages.filter(img => collection.imageIds.includes(img.id));
      const urls = collectionImages.map(img => img.url).join('\n');
      const metadata = {
        collectionName: collection.name,
        description: collection.description,
        imageCount: collectionImages.length,
        exportedAt: new Date().toISOString(),
        images: collectionImages.map(img => ({
          id: img.id,
          url: img.url,
          prompt: img.prompt,
          category: img.category,
          style: img.style,
          resolution: img.resolution,
        })),
      };

      const content = `コレクション: ${collection.name}\n` +
        `${collection.description ? `説明: ${collection.description}\n` : ''}` +
        `画像数: ${collectionImages.length}\n` +
        `エクスポート日時: ${new Date().toLocaleString('ja-JP')}\n\n` +
        `=== メタデータ ===\n${JSON.stringify(metadata, null, 2)}\n\n` +
        `=== URL一覧 ===\n${urls}`;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `collection-${collection.name}-${new Date().toISOString().split('T')[0]}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('コレクションをエクスポートしました');
    } catch (error) {
      logger.error('コレクションエクスポートエラー', error, 'VirtualBgGenerator');
      toast.error('エクスポートに失敗しました');
    }
  }, [collections, generatedImages]);

  // カテゴリフィルターの切り替え
  const toggleCategory = (categoryValue: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryValue) 
        ? prev.filter(c => c !== categoryValue)
        : [...prev, categoryValue]
    );
  };

  // 色フィルターの切り替え
  const toggleColor = (colorValue: string) => {
    setSelectedColors(prev => 
      prev.includes(colorValue) 
        ? prev.filter(c => c !== colorValue)
        : [...prev, colorValue]
    );
  };

  // 検索結果の画像選択（7.1.2: GeneratedImage型に変換）
  const handleSelectSearchImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    // GeneratedImage型に変換
    const newImage: GeneratedImage = {
      id: `search-${Date.now()}`,
      url: imageUrl,
      prompt: searchKeyword || '',
      createdAt: Date.now(),
      downloadCount: 0,
    };
    setGeneratedImages([newImage]);
    if (!isDesktop) {
      setActiveTab("preview");
    }
  };

  // ページネーション
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 無限スクロールの設定（7.1.3）
  useEffect(() => {
    if (!useInfiniteScroll || !loadMoreTriggerRef.current) {
      // Observerをクリーンアップ
      if (searchObserverRef.current && loadMoreTriggerRef.current) {
        searchObserverRef.current.unobserve(loadMoreTriggerRef.current);
        searchObserverRef.current = null;
      }
      return;
    }
    
    // Intersection Observerを設定
    searchObserverRef.current = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && !isSearching && searchResults.length > 0) {
          // 追加の検索結果を生成（無限スクロール用）
          setIsSearching(true);
          handleAsyncError(async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 追加のモック検索結果を生成
            const additionalResults = Array.from({ length: 10 }, (_, i) => ({
              id: `search-${Date.now()}-${searchResults.length + i}`,
              url: `https://picsum.photos/400/300?random=${Date.now() + searchResults.length + i}`,
              title: `検索結果 ${searchResults.length + i + 1}`,
              category: categories[(searchResults.length + i) % categories.length].value,
              color: ['red', 'blue', 'green', 'purple', 'orange'][(searchResults.length + i) % 5],
              resolution: '1920x1080',
              license: 'free',
              downloads: Math.floor(Math.random() * 1000),
              createdAt: Date.now() - ((searchResults.length + i) * 1000 * 60 * 60),
              relevanceScore: Math.random(),
            }));
            
            setSearchResults(prev => [...prev, ...additionalResults]);
            setIsSearching(false);
          }, "追加読み込み中にエラーが発生しました");
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadMoreTriggerRef.current) {
      searchObserverRef.current.observe(loadMoreTriggerRef.current);
    }
    
    return () => {
      if (searchObserverRef.current && loadMoreTriggerRef.current) {
        searchObserverRef.current.unobserve(loadMoreTriggerRef.current);
      }
    };
  }, [useInfiniteScroll, isSearching, searchResults.length, handleAsyncError, categories]);

  // ショートカットキー（7.1.8）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter: 生成
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isLoading && prompt.trim()) {
          handleGenerate();
        }
      }
      
      // Escape: ダイアログを閉じる
      if (e.key === 'Escape') {
        if (expandedImageId !== null) {
          setExpandedImageId(null);
        }
        if (isCollectionDialogOpen) {
          setIsCollectionDialogOpen(false);
        }
      }
      
      // Ctrl/Cmd + A: すべて選択（画像一覧が表示されている場合）
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && sortedImages.length > 0) {
        e.preventDefault();
        handleSelectAll();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, prompt, handleGenerate, expandedImageId, isCollectionDialogOpen, sortedImages.length, handleSelectAll]);

  // サムネイルサイズのスタイル（7.1.3）
  const thumbnailSizeClasses = useMemo(() => {
    switch (searchThumbnailSize) {
      case 'small':
        return 'grid-cols-3 gap-1.5';
      case 'medium':
        return 'grid-cols-2 gap-2';
      case 'large':
        return 'grid-cols-1 gap-3';
      default:
        return 'grid-cols-2 gap-2';
    }
  }, [searchThumbnailSize]);

  // コレクションとタグの読み込み（7.1.7）
  useEffect(() => {
    try {
      const storedCollections = localStorage.getItem(COLLECTIONS_STORAGE_KEY);
      if (storedCollections) {
        const parsed = JSON.parse(storedCollections);
        setCollections(parsed);
      }
      
      const storedTags = localStorage.getItem(IMAGE_TAGS_STORAGE_KEY);
      if (storedTags) {
        const parsed = JSON.parse(storedTags);
        // Map形式に変換
        const tagsMap = new Map<string, string[]>();
        Object.entries(parsed).forEach(([imageId, tagIds]) => {
          tagsMap.set(imageId, tagIds as string[]);
        });
        setImageTags(tagsMap);
        
        // 全タグ一覧を読み込み（画像タグから自動生成）
        const tagMap = new Map<string, ImageTag>();
        tagsMap.forEach((tagIds) => {
          tagIds.forEach((tagId) => {
            if (!tagMap.has(tagId)) {
              tagMap.set(tagId, { id: tagId, label: tagId, color: undefined });
            }
          });
        });
        setAllTags(Array.from(tagMap.values()));
      }
    } catch (error) {
      logger.error('コレクション・タグの読み込みエラー', error, 'VirtualBgGenerator');
    }
  }, []);

  // コレクションとタグの保存（7.1.7）
  useEffect(() => {
    try {
      localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
      
      // Map形式をオブジェクトに変換して保存
      const tagsObject: Record<string, string[]> = {};
      imageTags.forEach((tagIds, imageId) => {
        tagsObject[imageId] = tagIds;
      });
      localStorage.setItem(IMAGE_TAGS_STORAGE_KEY, JSON.stringify(tagsObject));
    } catch (error) {
      logger.error('コレクション・タグの保存エラー', error, 'VirtualBgGenerator');
    }
  }, [collections, imageTags]);

  // 保存済み検索条件の読み込み（7.1.3）
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVED_SEARCH_CONDITIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedSearchConditions(parsed);
      }
    } catch (error) {
      logger.error('保存済み検索条件の読み込みエラー', error, 'VirtualBgGenerator');
    }
  }, []);

  // 保存済み検索条件の保存（7.1.3）
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_SEARCH_CONDITIONS_STORAGE_KEY, JSON.stringify(savedSearchConditions));
    } catch (error) {
      logger.error('保存済み検索条件の保存エラー', error, 'VirtualBgGenerator');
    }
  }, [savedSearchConditions]);

  // 履歴の読み込み（7.1.4）
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (error) {
      logger.error('履歴の読み込みエラー', error, 'VirtualBgGenerator');
    }
  }, []);

  // 履歴の保存（7.1.4）
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      logger.error('履歴の保存エラー', error, 'VirtualBgGenerator');
    }
  }, [history]);

  // 履歴に追加（7.1.4: 拡張）
  const addToHistory = useCallback((imageData: any, type: 'generated' | 'search' = 'generated') => {
    // ユニークなIDを生成（タイムスタンプ + ランダム文字列）（7.1.4）
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const historyItem: HistoryItem = {
      id: uniqueId,
      imageUrl: imageData.url || imageData,
      prompt: imageData.prompt || prompt,
      negativePrompt: imageData.negativePrompt || negativePrompt,
      category: imageData.category || category || undefined,
      style: imageData.style || style || undefined,
      resolution: imageData.resolution || resolution || undefined,
      color: imageData.color || selectedColor || undefined,
      timestamp: new Date().toISOString(),
      type: type,
      searchKeyword: type === 'search' ? searchKeyword : undefined,
      searchParams: type === 'search' ? {
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        colors: selectedColors.length > 0 ? selectedColors : undefined,
        resolution: selectedResolution || undefined,
        license: selectedLicense || undefined,
      } : undefined,
    };
    setHistory(prev => {
      const newHistory = [historyItem, ...prev];
      // 上限を超えた場合は古いものから削除（7.1.4）
      return newHistory.slice(0, maxHistoryCount);
    });
  }, [prompt, negativePrompt, category, style, resolution, selectedColor, searchKeyword, selectedCategories, selectedColors, selectedResolution, selectedLicense, maxHistoryCount]);

  // 履歴の削除（7.1.4）
  const deleteHistoryItem = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    toast.success('履歴を削除しました');
  }, []);

  // 履歴の全削除（7.1.4）
  const clearHistory = useCallback(() => {
    if (confirm('すべての履歴を削除しますか？')) {
      setHistory([]);
      toast.success('すべての履歴を削除しました');
    }
  }, []);

  // 履歴の復元（7.1.4）
  const restoreHistoryItem = useCallback((item: HistoryItem) => {
    if (item.type === 'generated') {
      // 生成履歴の復元
      setPrompt(item.prompt || '');
      setNegativePrompt(item.negativePrompt || '');
      setCategory(item.category || '');
      setStyle(item.style || '');
      setResolution(item.resolution || '');
      setSelectedColor(item.color || '');
      setGeneratedImages([{
        id: `history-${item.id}`,
        url: item.imageUrl,
        prompt: item.prompt || '',
        negativePrompt: item.negativePrompt,
        category: item.category,
        style: item.style,
        resolution: item.resolution,
        color: item.color,
        createdAt: new Date(item.timestamp).getTime(),
        downloadCount: 0,
      }]);
      setSelectedImage(item.imageUrl);
      toast.success('履歴を復元しました');
    } else if (item.type === 'search') {
      // 検索履歴の復元
      setSearchKeyword(item.searchKeyword || '');
      setSelectedCategories(item.searchParams?.categories || []);
      setSelectedColors(item.searchParams?.colors || []);
      setSelectedResolution(item.searchParams?.resolution || '');
      setSelectedLicense(item.searchParams?.license || '');
      toast.success('検索条件を復元しました');
      // 検索を実行
      handleSearch();
    }
  }, [handleSearch]);

  // フィルター済み・検索済み履歴（7.1.4）
  const filteredHistory = useMemo(() => {
    let filtered = [...history];
    
    // タイプフィルター
    if (historyFilter !== 'all') {
      filtered = filtered.filter(item => item.type === historyFilter);
    }
    
    // キーワード検索
    if (historySearchKeyword.trim()) {
      const keyword = historySearchKeyword.toLowerCase();
      filtered = filtered.filter(item => 
        item.prompt?.toLowerCase().includes(keyword) ||
        item.searchKeyword?.toLowerCase().includes(keyword) ||
        item.category?.toLowerCase().includes(keyword) ||
        item.style?.toLowerCase().includes(keyword)
      );
    }
    
    return filtered;
  }, [history, historyFilter, historySearchKeyword]);

  // 履歴のエクスポート（CSV/JSON）（7.1.4）
  const exportHistory = useCallback((format: 'csv' | 'json') => {
    try {
      if (format === 'csv') {
        // CSV形式
        const headers = ['ID', 'タイプ', '画像URL', 'プロンプト', 'カテゴリ', 'スタイル', '解像度', '生成日時'];
        const rows = filteredHistory.map(item => [
          item.id,
          item.type === 'generated' ? '生成' : '検索',
          item.imageUrl,
          item.prompt || '',
          item.category || '',
          item.style || '',
          item.resolution || '',
          new Date(item.timestamp).toLocaleString('ja-JP'),
        ]);
        const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `virtual-bg-history-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        // JSON形式
        const jsonContent = JSON.stringify(filteredHistory, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `virtual-bg-history-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
      toast.success(`${format.toUpperCase()}形式でエクスポートしました`);
    } catch (error) {
      logger.error('エクスポートエラー', error, 'VirtualBgGenerator');
      toast.error('エクスポートに失敗しました');
    }
  }, [filteredHistory]);

  // デスクトップ用のコントロールパネル
  const desktopControlPanelContent = (
    <div className="flex flex-col h-full space-y-4">
      <Separator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">生成</TabsTrigger>
          <TabsTrigger value="search">検索</TabsTrigger>
          <TabsTrigger value="history">履歴</TabsTrigger>
          <TabsTrigger value="collections">コレクション</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="flex-grow space-y-4 mt-4">
          <Accordion type="multiple" defaultValue={["basic"]} className="w-full space-y-2">
            {/* 基本設定 */}
            <AccordionItem value="basic" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>基本設定</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                {/* プロンプトテンプレート（7.1.1） */}
                {category && promptTemplates[category as keyof typeof promptTemplates] && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">プロンプトテンプレート</Label>
                    <div className="space-y-1">
                      {promptTemplates[category as keyof typeof promptTemplates].map((template, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyTemplate(template)}
                          className="w-full justify-start text-left h-auto py-2 px-3 text-xs"
                        >
                          <BookOpen className="h-3 w-3 mr-2 flex-shrink-0" />
                          <span className="truncate">{template}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* よく使うプロンプト（7.1.1） */}
                {savedPrompts.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">保存済みプロンプト</Label>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {savedPrompts.slice(0, 5).map((saved) => (
                        <div key={saved.id} className="flex items-center gap-1 p-2 border rounded hover:bg-accent group">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLoadSavedPrompt(saved)}
                            className="flex-1 justify-start text-left h-auto p-0 text-xs"
                          >
                            <span className="truncate">{saved.prompt}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSavedPrompt(saved.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="prompt">テキストプロンプト</Label>
                  <div className="space-y-2">
                    <Textarea
                      id="prompt"
                      placeholder="サイバーパンク都市の夜景、ネオンライトが輝く未来都市..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-between items-center">
                      {prompt && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyPrompt}
                          aria-label="プロンプトをコピー"
                        >
                          {copiedPrompt ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              コピー済み
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              コピー
                            </>
                          )}
                        </Button>
                      )}
                      {prompt.trim() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSavePrompt}
                          disabled={isSavingPrompt}
                          className="ml-auto"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          保存
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>カテゴリ</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map((cat) => (
                      <Badge
                        key={cat.value}
                        variant={category === cat.value ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => setCategory(cat.value)}
                      >
                        {cat.icon} {cat.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="style">スタイル</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="スタイルを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {styles.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 詳細設定 */}
            <AccordionItem value="advanced" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>詳細設定</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                {/* ネガティブプロンプト（7.1.1） */}
                <div>
                  <Label htmlFor="negativePrompt">ネガティブプロンプト</Label>
                  <Textarea
                    id="negativePrompt"
                    placeholder="除外したい要素を入力（例: 人物、文字、ロゴ...）"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    生成時に除外したい要素を指定できます
                  </p>
                </div>

                {/* カラーパレット（7.1.1） */}
                <div>
                  <Label>主色（カラーパレット）</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colorPalette.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setSelectedColor(color.value)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all ${
                          selectedColor === color.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-accent"
                        }`}
                        title={color.label}
                      >
                        <div className={`w-4 h-4 rounded-full ${color.color} ${color.value === "white" ? "border border-gray-300" : ""}`} />
                        <span className="text-xs">{color.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* アスペクト比プレビュー（7.1.1） */}
                <div>
                  <Label htmlFor="resolution">解像度・アスペクト比</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger>
                      <SelectValue placeholder="解像度を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {resolutions.map((res) => (
                        <SelectItem key={res.value} value={res.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{res.label}</span>
                            {resolution === res.value && (
                              <Monitor className="h-3 w-3 ml-2" />
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {resolution && (
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <div className="text-xs text-muted-foreground mb-2">プレビュー</div>
                      <div
                        className={`mx-auto border-2 border-primary rounded ${
                          resolutions.find(r => r.value === resolution)?.aspectRatio === "9:16"
                            ? "w-12 h-20"
                            : "w-20 h-12"
                        }`}
                        style={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      />
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        {resolutions.find(r => r.value === resolution)?.aspectRatio || "16:9"}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="imageCount">生成枚数</Label>
                  <Select value={imageCount} onValueChange={setImageCount}>
                    <SelectTrigger>
                      <SelectValue placeholder="枚数を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {imageCounts.map((count) => (
                        <SelectItem key={count.value} value={count.value}>
                          {count.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                背景を生成
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="search" className="flex-grow space-y-4 mt-4">
          <div className="space-y-4">
            {/* 検索バー */}
            <div>
              <Label htmlFor="searchKeyword">キーワード検索</Label>
              <div className="flex space-x-2">
                <Input
                  id="searchKeyword"
                  placeholder="背景、都市、自然..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="flex-grow"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <Sparkles className="h-4 w-4 animate-spin" />
                  ) : (
                  <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* フィルター */}
            <div className="space-y-3">
              <Label>フィルター</Label>
              
              {/* カテゴリフィルター */}
              <div>
                <Label className="text-sm text-muted-foreground">カテゴリ</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {categories.map((cat) => (
                    <Badge
                      key={cat.value}
                      variant={selectedCategories.includes(cat.value) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => toggleCategory(cat.value)}
                    >
                      {cat.icon} {cat.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 色フィルター */}
              <div>
                <Label className="text-sm text-muted-foreground">色</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {[
                    { value: "red", label: "赤", color: "bg-red-500" },
                    { value: "blue", label: "青", color: "bg-blue-500" },
                    { value: "green", label: "緑", color: "bg-green-500" },
                    { value: "purple", label: "紫", color: "bg-purple-500" },
                    { value: "orange", label: "オレンジ", color: "bg-orange-500" },
                    { value: "black", label: "黒", color: "bg-black" },
                    { value: "white", label: "白", color: "bg-white border" },
                  ].map((color) => (
                    <Badge
                      key={color.value}
                      variant={selectedColors.includes(color.value) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/10 flex items-center gap-1"
                      onClick={() => toggleColor(color.value)}
                    >
                      <div className={`w-3 h-3 rounded-full ${color.color}`} />
                      {color.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 解像度フィルター */}
              <div>
                <Label className="text-sm text-muted-foreground">解像度</Label>
                <Select value={selectedResolution} onValueChange={setSelectedResolution}>
                  <SelectTrigger>
                    <SelectValue placeholder="解像度を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="4k">4K以上</SelectItem>
                    <SelectItem value="hd">HD以上</SelectItem>
                    <SelectItem value="sd">SD以上</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ライセンスフィルター */}
              <div>
                <Label className="text-sm text-muted-foreground">ライセンス</Label>
                <Select value={selectedLicense} onValueChange={setSelectedLicense}>
                  <SelectTrigger>
                    <SelectValue placeholder="ライセンスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="free">無料</SelectItem>
                    <SelectItem value="commercial">商用利用可</SelectItem>
                    <SelectItem value="attribution">帰属表示必要</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ソート（7.1.3: 検索結果のソート順と統合） */}
            <div>
              <Label className="text-sm text-muted-foreground">並び順</Label>
              <Select value={searchSortOrder} onValueChange={(value: typeof searchSortOrder) => {
                setSearchSortOrder(value);
                // ソート順変更時に再検索（7.1.3）
                if (searchResults.length > 0) {
                  handleSearch();
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="並び順を選択" />
                </SelectTrigger>
                <SelectContent className="bg-[#2D2D2D] border-[#4A4A4A]">
                  <SelectItem value="relevance">関連度順</SelectItem>
                  <SelectItem value="popular">人気順</SelectItem>
                  <SelectItem value="newest">新着順</SelectItem>
                  <SelectItem value="oldest">古い順</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 保存済み検索条件（7.1.3） */}
            {savedSearchConditions.length > 0 && (
              <div>
                <Label className="text-sm text-muted-foreground">保存済み検索条件</Label>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {savedSearchConditions.map((condition) => (
                    <div key={condition.id} className="flex items-center gap-1 p-2 border rounded hover:bg-accent group">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleLoadSearchCondition(condition);
                          handleSearch();
                        }}
                        className="flex-1 justify-start text-left h-auto p-0 text-xs"
                      >
                        <span className="truncate">{condition.name}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSearchCondition(condition.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 検索結果エリア（7.1.3: 強化） */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label>検索結果</Label>
                  <Badge variant="secondary">{searchResults.length}件</Badge>
                </div>
                <div className="flex gap-2">
                  {/* サムネイルサイズ調整（7.1.3） */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Grid3x3 className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#2D2D2D] border-[#4A4A4A]">
                      <DropdownMenuItem onClick={() => setSearchThumbnailSize('small')}>
                        {searchThumbnailSize === 'small' && '✓ '}小
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSearchThumbnailSize('medium')}>
                        {searchThumbnailSize === 'medium' && '✓ '}中
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSearchThumbnailSize('large')}>
                        {searchThumbnailSize === 'large' && '✓ '}大
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* 検索結果のエクスポート（7.1.3） */}
                  {searchResults.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportSearchResults}
                    >
                      <DownloadIcon2 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {/* 検索条件の保存（7.1.3） */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveSearchCondition}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* 検索結果グリッド（7.1.3: サムネイルサイズ対応、無限スクロール対応） */}
              <div className={`grid ${thumbnailSizeClasses} max-h-96 overflow-y-auto`}>
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map((result, i) => (
                      <Card 
                        key={result.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleSelectSearchImage(result.url)}
                      >
                        <CardContent className="p-0">
                          <div className="aspect-video relative overflow-hidden rounded-lg">
                            <img
                              src={result.url}
                              alt={result.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                            <div className="absolute bottom-1 left-1 right-1 flex gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {result.downloads} DL
                              </Badge>
                              {result.category && (
                                <Badge variant="outline" className="text-xs">
                                  {categories.find(c => c.value === result.category)?.label || result.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {/* 無限スクロール用トリガー（7.1.3） */}
                    {useInfiniteScroll && (
                      <div ref={loadMoreTriggerRef} className="col-span-full h-4 flex items-center justify-center">
                        {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="col-span-full text-center text-muted-foreground py-8">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>検索キーワードを入力して検索してください</p>
                  </div>
                )}
              </div>

              {/* ページネーション（無限スクロール無効時のみ表示）（7.1.3） */}
              {!useInfiniteScroll && searchResults.length > 8 && (
                <div className="flex justify-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    前へ
                  </Button>
                  <Button variant="outline" size="sm">
                    {currentPage} / {totalPages}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    次へ
                  </Button>
                </div>
              )}
              
              {/* 無限スクロールの切り替え（7.1.3） */}
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">無限スクロール</Label>
                <Switch
                  checked={useInfiniteScroll}
                  onCheckedChange={setUseInfiniteScroll}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="flex-grow space-y-4 mt-4 overflow-hidden flex flex-col">
          {/* 履歴ツールバー（7.1.4） */}
          <div className="space-y-3 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Label>履歴</Label>
                <Badge variant="secondary">{filteredHistory.length}件</Badge>
                {history.length !== filteredHistory.length && (
                  <Badge variant="outline" className="text-xs">
                    全{history.length}件
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" size="sm">
                      <DownloadIcon2 className="h-4 w-4 mr-2" />
                      エクスポート
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#2D2D2D] border-[#4A4A4A]">
                    <DropdownMenuItem onClick={() => exportHistory('csv')}>
                      <FileText className="h-4 w-4 mr-2" />
                      CSV形式
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportHistory('json')}>
                      <FileText className="h-4 w-4 mr-2" />
                      JSON形式
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {history.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearHistory}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    全削除
                  </Button>
                )}
              </div>
            </div>
            
            {/* フィルターと検索（7.1.4） */}
            <div className="flex gap-2">
              <div className="flex border rounded-md flex-1">
                <Button
                  variant={historyFilter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setHistoryFilter('all')}
                  className="rounded-r-none flex-1"
                >
                  すべて
                </Button>
                <Button
                  variant={historyFilter === 'generated' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setHistoryFilter('generated')}
                  className="rounded-none border-x"
                >
                  <ImagePlus className="h-3 w-3 mr-1" />
                  生成
                </Button>
                <Button
                  variant={historyFilter === 'search' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setHistoryFilter('search')}
                  className="rounded-l-none flex-1"
                >
                  <SearchIcon className="h-3 w-3 mr-1" />
                  検索
                </Button>
              </div>
            </div>
            
            {/* 履歴検索（7.1.4） */}
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="履歴を検索..."
                value={historySearchKeyword}
                onChange={(e) => setHistorySearchKeyword(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          {/* 履歴リスト（7.1.4: タイムライン表示） */}
          <div className="flex-grow overflow-y-auto space-y-3 pr-1">
            {filteredHistory.length > 0 ? (
              <div className="space-y-3">
                {filteredHistory.map((item, index) => {
                  const prevDate = index > 0 ? new Date(filteredHistory[index - 1].timestamp) : null;
                  const currentDate = new Date(item.timestamp);
                  const showDateSeparator = !prevDate || 
                    prevDate.toDateString() !== currentDate.toDateString();
                  
                  return (
                    <div key={item.id} className="space-y-2">
                      {/* 日付セパレーター（タイムライン表示）（7.1.4） */}
                      {showDateSeparator && (
                        <div className="flex items-center gap-2 py-1 sticky top-0 bg-[#1A1A1A] z-10">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">
                            {currentDate.toLocaleDateString('ja-JP', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      )}
                      
                      <Card 
                        className={cn(
                          "hover:shadow-md transition-all relative",
                          item.type === 'generated' ? 'border-l-4 border-l-primary' : 'border-l-4 border-l-blue-500'
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            {/* サムネイル（拡大表示）（7.1.4） */}
                            <div 
                              className="w-24 h-16 relative overflow-hidden rounded flex-shrink-0 cursor-pointer group"
                              onClick={(e) => {
                                e.stopPropagation();
                                const historyImage: GeneratedImage = {
                                  id: `history-${item.id}`,
                                  url: item.imageUrl,
                                  prompt: item.prompt || '',
                                  negativePrompt: item.negativePrompt,
                                  category: item.category,
                                  style: item.style,
                                  resolution: item.resolution,
                                  color: item.color,
                                  createdAt: new Date(item.timestamp).getTime(),
                                  downloadCount: 0,
                                };
                                setGeneratedImages([historyImage]);
                                setExpandedImageId(`history-${item.id}`);
                              }}
                            >
                              <img
                                src={item.imageUrl}
                                alt="履歴画像"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                loading="lazy"
                                decoding="async"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <Maximize2 className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                            
                            {/* 情報 */}
                            <div className="flex-grow min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-grow min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant={item.type === 'generated' ? 'default' : 'secondary'} className="text-xs">
                                      {item.type === 'generated' ? 'AI生成' : '検索'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {currentDate.toLocaleTimeString('ja-JP', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium truncate mb-1">
                                    {item.type === 'generated' 
                                      ? (item.prompt || "プロンプトなし")
                                      : (item.searchKeyword || "検索キーワードなし")
                                    }
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {item.category && (
                                      <Badge variant="outline" className="text-xs">
                                        {categories.find(c => c.value === item.category)?.label || item.category}
                                      </Badge>
                                    )}
                                    {item.style && (
                                      <Badge variant="outline" className="text-xs">
                                        {styles.find(s => s.value === item.style)?.label || item.style}
                                      </Badge>
                                    )}
                                    {item.resolution && (
                                      <Badge variant="outline" className="text-xs">
                                        {item.resolution}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                {/* アクションボタン（7.1.4） */}
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      restoreHistoryItem(item);
                                    }}
                                    title="復元"
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteHistoryItem(item.id);
                                    }}
                                    className="text-red-400 hover:text-red-300"
                                    title="削除"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  {historySearchKeyword || historyFilter !== 'all' 
                    ? '検索条件に一致する履歴が見つかりませんでした' 
                    : '履歴がここに表示されます'}
                </p>
              </div>
            )}
          </div>
          
          {/* 履歴保存数上限設定（7.1.4） */}
          {history.length > 0 && (
            <div className="flex-shrink-0 pt-2 border-t space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">履歴保存数上限</Label>
                <Input
                  type="number"
                  min="10"
                  max="1000"
                  value={maxHistoryCount}
                  onChange={(e) => {
                    const value = Math.max(10, Math.min(1000, parseInt(e.target.value) || DEFAULT_MAX_HISTORY));
                    setMaxHistoryCount(value);
                  }}
                  className="w-20 h-8 text-xs"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                現在 {history.length}件保存中（上限: {maxHistoryCount}件）
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="collections" className="flex-grow space-y-4 mt-4 overflow-hidden flex flex-col">
          {/* コレクション管理（7.1.7） */}
          <div className="space-y-3 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Label>コレクション</Label>
                <Badge variant="secondary">{collections.length}件</Badge>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={handleCreateCollection}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                新規作成
              </Button>
            </div>
          </div>
          
          {/* コレクション一覧（7.1.7） */}
          <div className="flex-grow overflow-y-auto space-y-2">
            {collections.length > 0 ? (
              collections.map((collection) => (
                <Card 
                  key={collection.id}
                  className={cn(
                    "hover:shadow-md transition-all cursor-pointer",
                    selectedCollectionId === collection.id && 'ring-2 ring-primary'
                  )}
                  onClick={() => setSelectedCollectionId(
                    selectedCollectionId === collection.id ? null : collection.id
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Folder className="h-4 w-4 text-primary" />
                          <h4 className="font-medium truncate">{collection.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {collection.imageIds.length}枚
                          </Badge>
                        </div>
                        {collection.description && (
                          <p className="text-xs text-muted-foreground truncate mb-1">
                            {collection.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>作成: {new Date(collection.createdAt).toLocaleDateString('ja-JP')}</span>
                          {collection.updatedAt !== collection.createdAt && (
                            <span>更新: {new Date(collection.updatedAt).toLocaleDateString('ja-JP')}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCollection(collection);
                          }}
                          title="編集"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportCollection(collection.id);
                          }}
                          title="エクスポート"
                        >
                          <DownloadIcon2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCollection(collection.id);
                          }}
                          className="text-red-400 hover:text-red-300"
                          title="削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>コレクションを作成して画像を整理できます</p>
              </div>
            )}
          </div>
          
          {/* 選択中のコレクションの画像一覧（7.1.7） */}
          {selectedCollectionId && collectionImages.length > 0 && (
            <div className="flex-shrink-0 pt-2 border-t space-y-2 max-h-64 overflow-y-auto">
              <Label className="text-xs text-muted-foreground">
                {collections.find(c => c.id === selectedCollectionId)?.name} の画像
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {collectionImages.map((img) => (
                  <div key={img.id} className="relative aspect-video rounded overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.id}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveImageFromCollection(img.id, selectedCollectionId)}
                      className="absolute top-1 right-1 sm:h-9 h-11 sm:w-9 w-11 bg-black/50 hover:bg-black/70 text-white"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  // モバイル用の生成タブ内容（7.1.1対応）
  const mobileGenerateContent = (
      <div className="flex flex-col h-full space-y-4 p-3 sm:p-4">
      <Separator />
      
      <Accordion type="multiple" defaultValue={["basic"]} className="w-full space-y-2">
        {/* 基本設定 */}
        <AccordionItem value="basic" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>基本設定</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {/* プロンプトテンプレート（7.1.1） */}
            {category && promptTemplates[category as keyof typeof promptTemplates] && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">プロンプトテンプレート</Label>
                <div className="space-y-1">
                  {promptTemplates[category as keyof typeof promptTemplates].map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyTemplate(template)}
                      className="w-full justify-start text-left h-auto py-2 px-3 text-xs"
                    >
                      <BookOpen className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="truncate">{template}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* よく使うプロンプト（7.1.1） */}
            {savedPrompts.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">保存済みプロンプト</Label>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {savedPrompts.slice(0, 3).map((saved) => (
                    <div key={saved.id} className="flex items-center gap-1 p-2 border rounded hover:bg-accent group">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLoadSavedPrompt(saved)}
                        className="flex-1 justify-start text-left h-auto p-0 text-xs"
                      >
                        <span className="truncate">{saved.prompt}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSavedPrompt(saved.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="prompt-mobile">テキストプロンプト</Label>
              <div className="space-y-2">
                <Textarea
                  id="prompt-mobile"
                  placeholder="サイバーパンク都市の夜景、ネオンライトが輝く未来都市..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-between items-center">
                  {prompt && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyPrompt}
                      aria-label="プロンプトをコピー"
                    >
                      {copiedPrompt ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          コピー済み
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          コピー
                        </>
                      )}
                    </Button>
                  )}
                  {prompt.trim() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSavePrompt}
                      disabled={isSavingPrompt}
                      className="ml-auto"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      保存
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label>カテゴリ</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((cat) => (
                  <Badge
                    key={cat.value}
                    variant={category === cat.value ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10 text-xs"
                    onClick={() => setCategory(cat.value)}
                  >
                    {cat.icon} {cat.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="style-mobile">スタイル</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="スタイル" />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 詳細設定 */}
        <AccordionItem value="advanced" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>詳細設定</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {/* ネガティブプロンプト（7.1.1） */}
            <div>
              <Label htmlFor="negativePrompt-mobile">ネガティブプロンプト</Label>
              <Textarea
                id="negativePrompt-mobile"
                placeholder="除外したい要素を入力..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="min-h-[60px] text-sm"
              />
            </div>

            {/* カラーパレット（7.1.1） */}
            <div>
              <Label>主色（カラーパレット）</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {colorPalette.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md border transition-all text-xs ${
                      selectedColor === color.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-accent"
                    }`}
                    title={color.label}
                  >
                    <div className={`w-3 h-3 rounded-full ${color.color} ${color.value === "white" ? "border border-gray-300" : ""}`} />
                    <span>{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="resolution-mobile">解像度</Label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger>
                  <SelectValue placeholder="解像度" />
                </SelectTrigger>
                <SelectContent>
                  {resolutions.map((res) => (
                    <SelectItem key={res.value} value={res.value}>
                      {res.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {resolution && (
                <div className="mt-2 p-2 bg-muted rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">プレビュー</div>
                  <div
                    className={`mx-auto border-2 border-primary rounded ${
                      resolutions.find(r => r.value === resolution)?.aspectRatio === "9:16"
                        ? "w-8 h-14"
                        : "w-14 h-8"
                    }`}
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="imageCount-mobile">生成枚数</Label>
              <Select value={imageCount} onValueChange={setImageCount}>
                <SelectTrigger>
                  <SelectValue placeholder="枚数" />
                </SelectTrigger>
                <SelectContent>
                  {imageCounts.map((count) => (
                    <SelectItem key={count.value} value={count.value}>
                      {count.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button 
        onClick={handleGenerate} 
        disabled={isLoading || !prompt.trim()}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            背景を生成
          </>
        )}
      </Button>
    </div>
  );

  // モバイル用の検索タブ内容
  const mobileSearchContent = (
      <div className="flex flex-col h-full space-y-4 p-3 sm:p-4">
      <Separator />
      
      <div className="space-y-4">
        {/* 検索バー */}
        <div>
          <Label htmlFor="searchKeyword-mobile">キーワード検索</Label>
          <div className="flex space-x-2">
            <Input
              id="searchKeyword-mobile"
              placeholder="背景、都市、自然..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="flex-grow"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* フィルター */}
        <div className="space-y-3">
          <Label>フィルター</Label>
          
          {/* カテゴリフィルター */}
          <div>
            <Label className="text-sm text-muted-foreground">カテゴリ</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {categories.map((cat) => (
                <Badge
                  key={cat.value}
                  variant={selectedCategories.includes(cat.value) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 text-xs"
                  onClick={() => toggleCategory(cat.value)}
                >
                  {cat.icon} {cat.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* 色フィルター */}
          <div>
            <Label className="text-sm text-muted-foreground">色</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {[
                { value: "red", label: "赤", color: "bg-red-500" },
                { value: "blue", label: "青", color: "bg-blue-500" },
                { value: "green", label: "緑", color: "bg-green-500" },
                { value: "purple", label: "紫", color: "bg-purple-500" },
                { value: "orange", label: "オレンジ", color: "bg-orange-500" },
                { value: "black", label: "黒", color: "bg-black" },
                { value: "white", label: "白", color: "bg-white border" },
              ].map((color) => (
                <Badge
                  key={color.value}
                  variant={selectedColors.includes(color.value) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 flex items-center gap-1 text-xs"
                  onClick={() => toggleColor(color.value)}
                >
                  <div className={`w-3 h-3 rounded-full ${color.color}`} />
                  {color.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* 検索結果エリア（7.1.3: 強化） */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Label>検索結果</Label>
              <Badge variant="secondary">{searchResults.length}件</Badge>
            </div>
            <div className="flex gap-2">
              {/* サムネイルサイズ調整（7.1.3） */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#2D2D2D] border-[#4A4A4A]">
                  <DropdownMenuItem onClick={() => setSearchThumbnailSize('small')}>
                    {searchThumbnailSize === 'small' && '✓ '}小
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchThumbnailSize('medium')}>
                    {searchThumbnailSize === 'medium' && '✓ '}中
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchThumbnailSize('large')}>
                    {searchThumbnailSize === 'large' && '✓ '}大
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* 検索結果のエクスポート（7.1.3） */}
              {searchResults.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportSearchResults}
                >
                  <DownloadIcon2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* 検索結果グリッド（7.1.3: サムネイルサイズ対応、無限スクロール対応） */}
          <div className={`grid ${thumbnailSizeClasses} max-h-96 overflow-y-auto`}>
            {searchResults.length > 0 ? (
              <>
                {searchResults.map((result, i) => (
                  <Card 
                    key={result.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSelectSearchImage(result.url)}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-video relative overflow-hidden rounded-lg">
                        <img
                          src={result.url}
                          alt={result.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                        <div className="absolute bottom-1 left-1 right-1 flex gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {result.downloads} DL
                          </Badge>
                          {result.category && (
                            <Badge variant="outline" className="text-xs">
                              {categories.find(c => c.value === result.category)?.label || result.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {/* 無限スクロール用トリガー（7.1.3） */}
                {useInfiniteScroll && (
                  <div ref={loadMoreTriggerRef} className="col-span-full h-4 flex items-center justify-center">
                    {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                )}
              </>
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-8">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>検索キーワードを入力して検索してください</p>
              </div>
            )}
          </div>

          {/* ページネーション（無限スクロール無効時のみ表示）（7.1.3） */}
          {!useInfiniteScroll && searchResults.length > 8 && (
            <div className="flex justify-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                前へ
              </Button>
              <Button variant="outline" size="sm">
                {currentPage} / {totalPages}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                次へ
              </Button>
            </div>
          )}
          
          {/* 無限スクロールの切り替え（7.1.3） */}
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">無限スクロール</Label>
            <Switch
              checked={useInfiniteScroll}
              onCheckedChange={setUseInfiniteScroll}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const previewContent = (
    <div className="h-full p-3 sm:p-4 lg:p-6">
      {isLoading && generationStep ? (
        // 生成プロセスの可視化（7.1.6）
        <ProgressBar
          steps={bgGenerationSteps}
          currentStepId={generationStep}
          estimatedTimeRemaining={estimatedTimeRemaining}
          onCancel={handleCancelGeneration}
        />
      ) : sortedImages.length > 0 ? (
        <div className="h-full flex flex-col">
          {/* ツールバー（7.1.2） */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-2 md:space-y-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold">生成された背景</h3>
              <Badge variant="secondary">{sortedImages.length}枚</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* 表示モード切り替え（7.1.2） */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              {/* 並び替え（7.1.2） */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    並び替え
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#2D2D2D] border-[#4A4A4A]">
                  <DropdownMenuLabel>並び替え</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortOrder('newest')}>
                    新しい順
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder('oldest')}>
                    古い順
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder('favorite')}>
                    お気に入り順
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder('download')}>
                    ダウンロード数順
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* バッチダウンロード（7.1.2） */}
              {selectedImageIds.size > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBatchDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {selectedImageIds.size}枚ダウンロード
                </Button>
              )}
              
              {/* すべて選択/解除（7.1.2） */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedImageIds.size === sortedImages.length ? '選択解除' : 'すべて選択'}
              </Button>
            </div>
          </div>
          
          {/* 画像一覧（7.1.2: グリッドビューとリストビュー） */}
          {viewMode === 'grid' ? (
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
              {sortedImages.map((img) => (
                <Card 
                  key={img.id} 
                  className={`cursor-pointer transition-all relative ${
                    selectedImage === img.url ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  } ${selectedImageIds.has(img.id) ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedImage(img.url)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-video relative overflow-hidden rounded-lg">
                      {/* 選択チェックボックス（7.1.2） */}
                      <div className="absolute top-2 left-2 z-10">
                        <Checkbox
                          checked={selectedImageIds.has(img.id)}
                          onCheckedChange={(checked) => {
                            handleToggleImageSelection(img.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white/90"
                        />
                      </div>
                      
                      <img
                        src={img.url}
                        alt={`Generated background ${img.id}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                      <div className="absolute top-2 right-2 flex gap-2">
                        {/* コレクションへの追加（7.1.7） */}
                        {collections.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="secondary"
                                size="icon"
                                onClick={(e) => e.stopPropagation()}
                                title="コレクションに追加"
                              >
                                <FolderPlus className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#2D2D2D] border-[#4A4A4A]" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuLabel>コレクションに追加</DropdownMenuLabel>
                              {collections.map((collection) => (
                                <DropdownMenuItem
                                  key={collection.id}
                                  onClick={() => {
                                    if (!collection.imageIds.includes(img.id)) {
                                      handleAddImageToCollection(img.id, collection.id);
                                    } else {
                                      toast.info('この画像は既にコレクションに含まれています');
                                    }
                                  }}
                                  disabled={collection.imageIds.includes(img.id)}
                                >
                                  <Folder className="h-4 w-4 mr-2" />
                                  {collection.name}
                                  {collection.imageIds.includes(img.id) && ' ✓'}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                handleCreateCollection();
                                // コレクション作成後、自動で追加する処理は後で実装
                              }}>
                                <FolderPlus className="h-4 w-4 mr-2" />
                                新しいコレクションを作成
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(img.url);
                          }}
                          aria-label={favoriteImages.includes(img.url) ? "お気に入りから削除" : "お気に入りに追加"}
                        >
                          <Heart 
                            className={`h-4 w-4 ${
                              favoriteImages.includes(img.url) 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-[#A0A0A0]'
                            }`} 
                          />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(img.url);
                          }}
                          aria-label="画像をダウンロード"
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedImageId(img.id);
                          }}
                          aria-label="拡大表示"
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {/* 生成パラメータ表示（7.1.2） */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <div className="flex flex-wrap gap-1 text-xs text-white">
                          {img.category && (
                            <Badge variant="secondary" className="text-xs">
                              {categories.find(c => c.value === img.category)?.label || img.category}
                            </Badge>
                          )}
                          {img.style && (
                            <Badge variant="secondary" className="text-xs">
                              {styles.find(s => s.value === img.style)?.label || img.style}
                            </Badge>
                          )}
                          {img.downloadCount && img.downloadCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              DL: {img.downloadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto space-y-3">
              {sortedImages.map((img) => (
                <Card 
                  key={img.id} 
                  className={`cursor-pointer transition-all ${
                    selectedImage === img.url ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  } ${selectedImageIds.has(img.id) ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedImage(img.url)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* チェックボックス（7.1.2） */}
                      <Checkbox
                        checked={selectedImageIds.has(img.id)}
                        onCheckedChange={(checked) => {
                          handleToggleImageSelection(img.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      {/* サムネイル */}
                      <div className="w-32 h-20 relative flex-shrink-0 rounded overflow-hidden">
                        <img
                          src={img.url}
                          alt={`Generated background ${img.id}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      
                      {/* 情報 */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-grow min-w-0">
                            <p className="text-sm font-medium truncate">{img.prompt || 'プロンプトなし'}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {img.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {categories.find(c => c.value === img.category)?.label || img.category}
                                </Badge>
                              )}
                              {img.style && (
                                <Badge variant="secondary" className="text-xs">
                                  {styles.find(s => s.value === img.style)?.label || img.style}
                                </Badge>
                              )}
                              {img.resolution && (
                                <Badge variant="outline" className="text-xs">
                                  {img.resolution}
                                </Badge>
                              )}
                              {img.downloadCount !== undefined && (
                                <Badge variant="outline" className="text-xs">
                                  ダウンロード: {img.downloadCount}回
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(img.createdAt).toLocaleString('ja-JP')}
                            </p>
                          </div>
                          
                          {/* アクションボタン */}
                          <div className="flex gap-2 flex-shrink-0">
                            {/* コレクションへの追加（7.1.7） */}
                            {collections.length > 0 && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-8 w-8 p-0"
                                    title="コレクションに追加"
                                  >
                                    <FolderPlus className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-[#2D2D2D] border-[#4A4A4A]" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenuLabel>コレクションに追加</DropdownMenuLabel>
                                  {collections.map((collection) => (
                                    <DropdownMenuItem
                                      key={collection.id}
                                      onClick={() => {
                                        if (!collection.imageIds.includes(img.id)) {
                                          handleAddImageToCollection(img.id, collection.id);
                                        } else {
                                          toast.info('この画像は既にコレクションに含まれています');
                                        }
                                      }}
                                      disabled={collection.imageIds.includes(img.id)}
                                    >
                                      <Folder className="h-4 w-4 mr-2" />
                                      {collection.name}
                                      {collection.imageIds.includes(img.id) && ' ✓'}
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleCreateCollection()}>
                                    <FolderPlus className="h-4 w-4 mr-2" />
                                    新しいコレクションを作成
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(img.url);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Heart 
                                className={`h-4 w-4 ${
                                  favoriteImages.includes(img.url) 
                                    ? 'fill-red-500 text-red-500' 
                                    : 'text-[#A0A0A0]'
                                }`} 
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(img.url);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <DownloadIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedImageId(img.id);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Maximize2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* 拡大プレビューダイアログ（7.1.2 / 7.1.4: 履歴からも表示可能） */}
          <Dialog open={expandedImageId !== null} onOpenChange={(open) => !open && setExpandedImageId(null)}>
            <DialogContent className="max-w-4xl w-full">
              <DialogHeader>
                <DialogTitle>画像プレビュー</DialogTitle>
              </DialogHeader>
              {expandedImageId && (() => {
                // sortedImagesまたはgeneratedImagesから検索（履歴からの拡大表示にも対応）（7.1.4）
                const img = sortedImages.find(i => i.id === expandedImageId) || 
                            generatedImages.find(i => i.id === expandedImageId);
                if (!img) return null;
                return (
                  <div className="space-y-4">
                    <div className="relative w-full aspect-video bg-[#1A1A1A] rounded-lg overflow-hidden">
                      <img
                        src={img.url}
                        alt="拡大表示"
                        className="w-full h-full object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    
                    {/* 生成パラメータ詳細（7.1.2） */}
                    <div className="space-y-2">
                      <DialogDescription className="text-sm font-semibold">生成パラメータ</DialogDescription>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">プロンプト:</span>
                          <p className="text-muted-foreground mt-1">{img.prompt || 'なし'}</p>
                        </div>
                        {img.negativePrompt && (
                          <div>
                            <span className="font-medium">ネガティブプロンプト:</span>
                            <p className="text-muted-foreground mt-1">{img.negativePrompt}</p>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {img.category && (
                            <div>
                              <span className="font-medium">カテゴリ:</span>
                              <Badge variant="secondary" className="ml-2">
                                {categories.find(c => c.value === img.category)?.label || img.category}
                              </Badge>
                            </div>
                          )}
                          {img.style && (
                            <div>
                              <span className="font-medium">スタイル:</span>
                              <Badge variant="secondary" className="ml-2">
                                {styles.find(s => s.value === img.style)?.label || img.style}
                              </Badge>
                            </div>
                          )}
                          {img.resolution && (
                            <div>
                              <span className="font-medium">解像度:</span>
                              <Badge variant="outline" className="ml-2">{img.resolution}</Badge>
                            </div>
                          )}
                          {img.color && (
                            <div>
                              <span className="font-medium">色:</span>
                              <Badge variant="outline" className="ml-2">{img.color}</Badge>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          生成日時: {new Date(img.createdAt).toLocaleString('ja-JP')}
                          {img.downloadCount !== undefined && (
                            <span className="ml-4">ダウンロード回数: {img.downloadCount}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => img && handleDownload(img.url)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        ダウンロード
                      </Button>
                      <Button onClick={() => setExpandedImageId(null)}>閉じる</Button>
                    </DialogFooter>
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center">
          {isLoading ? (
            <div className="text-center text-muted-foreground px-4">
              <div className="w-full h-full bg-[#2D2D2D] rounded-md flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
                <Loader2 className="w-16 h-16 text-[#A0A0A0] mb-4 animate-spin" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-[#E0E0E0]">バーチャル背景を生成中...</h3>
                <p className="text-[#A0A0A0] mt-2">AIがあなたにぴったりの背景画像を生成しています。しばらくお待ちください。</p>
              </div>
              {/* ローディング中のスケルトン */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" role="status" aria-label="バーチャル背景生成中">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="aspect-video w-full" />
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground px-4">
              <ImageIcon className="h-12 w-12 lg:h-16 lg:w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg lg:text-xl font-semibold mb-2">バーチャル背景を生成</h3>
              <p className="max-w-md text-sm lg:text-base">
                {isDesktop ? (
                  <>左側のコントロールパネルでプロンプトを入力し、「背景を生成」ボタンをクリックしてAIが背景画像を生成します。</>
                ) : (
                  <>「生成」タブでプロンプトを入力し、「背景を生成」ボタンをクリックしてAIが背景画像を生成します。</>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col md:flex-row md:h-screen">
      {isDesktop ? (
        <>
          <main className="flex-grow p-4 w-full md:w-auto">
                {previewContent}
          </main>
          {!isRightPanelOpen && (
            <SidebarToggle
              onOpen={() => setIsRightPanelOpen(true)}
              isDesktop={isDesktop}
              tabs={[
                { id: "generate", label: "生成", icon: <Sparkles className="h-4 w-4" /> },
                { id: "search", label: "検索", icon: <Search className="h-4 w-4" /> },
                { id: "history", label: "履歴", icon: <History className="h-4 w-4" /> },
                { id: "collections", label: "コレクション", icon: <Folder className="h-4 w-4" /> }
              ]}
              onTabClick={(tabId) => {
                setActiveTab(tabId);
              }}
            />
          )}
              <Sidebar
                isOpen={isRightPanelOpen}
                onClose={() => setIsRightPanelOpen(false)}
            title=""
                isDesktop={isDesktop}
              >
            {desktopControlPanelContent}
              </Sidebar>
        </>
      ) : (
        <div className="w-full h-full flex flex-col">
          {/* プレビューエリア */}
          <div className="flex-grow p-4">
            {previewContent}
          </div>
          
          {/* 生成・検索の切り替えボタン */}
          <div className="border-t p-4">
            <Tabs defaultValue="generate" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generate">生成</TabsTrigger>
                <TabsTrigger value="search">検索</TabsTrigger>
              </TabsList>
              <TabsContent value="generate" className="mt-4">
                {mobileGenerateContent}
              </TabsContent>
              <TabsContent value="search" className="mt-4">
                {mobileSearchContent}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
      
      {/* コレクション作成・編集ダイアログ（7.1.7） */}
      <Dialog open={isCollectionDialogOpen} onOpenChange={setIsCollectionDialogOpen}>
        <DialogContent className="bg-[#2D2D2D] border-[#4A4A4A]">
          <DialogHeader>
            <DialogTitle>
              {editingCollection ? 'コレクションを編集' : '新しいコレクションを作成'}
            </DialogTitle>
            <DialogDescription>
              {editingCollection 
                ? 'コレクションの名前と説明を変更できます'
                : '画像を整理するためのコレクションを作成します'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="collection-name">コレクション名 *</Label>
              <Input
                id="collection-name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="例: 配信用背景セット1"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="collection-description">説明（任意）</Label>
              <Textarea
                id="collection-description"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                placeholder="このコレクションについての説明を入力..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCollectionDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSaveCollection}
              disabled={!newCollectionName.trim()}
            >
              {editingCollection ? '更新' : '作成'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
