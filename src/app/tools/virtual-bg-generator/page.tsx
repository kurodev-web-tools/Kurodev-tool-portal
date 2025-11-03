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
  Trash2
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
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
  
  // 履歴関連の状態
  const [history, setHistory] = useState<any[]>([]);
  
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

      // プレースホルダー画像を生成
      const mockImages = Array.from({ length: parseInt(imageCount) }, (_, i) => 
        `https://picsum.photos/800/600?random=${Date.now() + i}`
      );
      
      setGeneratedImages(mockImages);
      setSelectedImage(mockImages[0]);
      
      // 履歴に追加（自動保存）（7.1.6）
      addToHistory({ url: mockImages[0], prompt });
      
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
  }, [prompt, imageCount, handleAsyncError, isDesktop]);

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

  const handleDownload = async (imageUrl: string) => {
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
  };

  // 検索機能のハンドラー
  const handleSearch = async () => {
    setIsSearching(true);
    await handleAsyncError(async () => {
      // モック検索処理
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // モック検索結果を生成
      const mockResults = Array.from({ length: 12 }, (_, i) => ({
        id: `search-${i}`,
        url: `https://picsum.photos/400/300?random=${Date.now() + i}`,
        title: `検索結果 ${i + 1}`,
        category: categories[i % categories.length].value,
        color: ['red', 'blue', 'green', 'purple', 'orange'][i % 5],
        resolution: '1920x1080',
        license: 'free',
        downloads: Math.floor(Math.random() * 1000),
      }));
      
      setSearchResults(mockResults);
      setTotalPages(Math.ceil(mockResults.length / 8));
      setCurrentPage(1);
    }, "検索中にエラーが発生しました");
    setIsSearching(false);
  };

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

  // 検索結果の画像選択
  const handleSelectSearchImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setGeneratedImages([imageUrl]);
    if (!isDesktop) {
      setActiveTab("preview");
    }
  };

  // ページネーション
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 履歴に追加
  const addToHistory = (imageData: any) => {
    const historyItem = {
      id: Date.now().toString(),
      imageUrl: imageData.url || imageData,
      prompt: prompt,
      timestamp: new Date().toISOString(),
      type: 'generated'
    };
    setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // 最新10件まで保持
  };

  // デスクトップ用のコントロールパネル
  const desktopControlPanelContent = (
    <div className="flex flex-col h-full space-y-4">
      <Separator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">生成</TabsTrigger>
          <TabsTrigger value="search">検索</TabsTrigger>
          <TabsTrigger value="history">履歴</TabsTrigger>
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
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
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

            {/* ソート */}
            <div>
              <Label className="text-sm text-muted-foreground">並び順</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="並び順を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">関連度順</SelectItem>
                  <SelectItem value="newest">新着順</SelectItem>
                  <SelectItem value="popular">人気順</SelectItem>
                  <SelectItem value="downloads">ダウンロード数順</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 検索結果エリア */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>検索結果</Label>
                <Badge variant="secondary">{searchResults.length}件</Badge>
              </div>
              
              {/* 検索結果グリッド */}
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults
                    .slice((currentPage - 1) * 8, currentPage * 8)
                    .map((result, i) => (
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
                            />
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                            <div className="absolute bottom-1 left-1 right-1">
                              <Badge variant="secondary" className="text-xs">
                                {result.downloads} DL
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : (
                  <div className="col-span-2 text-center text-muted-foreground py-8">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>検索キーワードを入力して検索してください</p>
                  </div>
                )}
              </div>

              {/* ページネーション */}
              {searchResults.length > 8 && (
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
                    {currentPage}
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
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="flex-grow space-y-4 mt-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>生成履歴</Label>
              <Badge variant="secondary">{history.length}件</Badge>
            </div>
            
            {history.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {history.map((item) => (
                  <Card 
                    key={item.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedImage(item.imageUrl);
                      setGeneratedImages([item.imageUrl]);
                      if (!isDesktop) {
                        setActiveTab("preview");
                      }
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex space-x-3">
                        <div className="w-16 h-12 relative overflow-hidden rounded">
                          <img
                            src={item.imageUrl}
                            alt="履歴画像"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.prompt || "プロンプトなし"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {item.type === 'generated' ? 'AI生成' : '検索'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
          <div className="text-center text-muted-foreground py-8">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>生成履歴がここに表示されます</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  // モバイル用の生成タブ内容（7.1.1対応）
  const mobileGenerateContent = (
    <div className="flex flex-col h-full space-y-4 p-4">
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
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
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
    <div className="flex flex-col h-full space-y-4 p-4">
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

        {/* 検索結果エリア */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>検索結果</Label>
            <Badge variant="secondary">{searchResults.length}件</Badge>
          </div>
          
          {/* 検索結果グリッド */}
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults
                .slice((currentPage - 1) * 8, currentPage * 8)
                .map((result, i) => (
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
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                        <div className="absolute bottom-1 left-1 right-1">
                          <Badge variant="secondary" className="text-xs">
                            {result.downloads} DL
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="col-span-2 text-center text-muted-foreground py-8">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>検索キーワードを入力して検索してください</p>
              </div>
            )}
          </div>

          {/* ページネーション */}
          {searchResults.length > 8 && (
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
                {currentPage}
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
        </div>
      </div>
    </div>
  );

  const previewContent = (
    <div className="h-full p-4 lg:p-6">
      {isLoading && generationStep ? (
        // 生成プロセスの可視化（7.1.6）
        <ProgressBar
          steps={bgGenerationSteps}
          currentStepId={generationStep}
          estimatedTimeRemaining={estimatedTimeRemaining}
          onCancel={handleCancelGeneration}
        />
      ) : generatedImages.length > 0 ? (
        <div className="h-full flex flex-col">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 space-y-2 lg:space-y-0">
            <h3 className="text-lg lg:text-xl font-semibold">生成された背景</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                <Settings className="mr-2 h-4 w-4" />
                編集
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => selectedImage && handleDownload(selectedImage)}
                className="flex-1 lg:flex-none"
              >
                <Download className="mr-2 h-4 w-4" />
                ダウンロード
              </Button>
            </div>
          </div>
          
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4">
            {generatedImages.map((imageUrl, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all ${
                  selectedImage === imageUrl ? 'ring-2 ring-primary' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedImage(imageUrl)}
              >
                <CardContent className="p-0">
                  <div className="aspect-video relative overflow-hidden rounded-lg">
                    <img
                      src={imageUrl}
                      alt={`Generated background ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(imageUrl);
                        }}
                        className="h-8 w-8 p-0"
                        aria-label={favoriteImages.includes(imageUrl) ? "お気に入りから削除" : "お気に入りに追加"}
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            favoriteImages.includes(imageUrl) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-[#A0A0A0]'
                          }`} 
                        />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(imageUrl);
                        }}
                        className="h-8 w-8 p-0"
                        aria-label="画像をダウンロード"
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4" role="status" aria-label="バーチャル背景生成中">
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
    <div className="h-full flex flex-col lg:flex-row lg:h-screen">
      {isDesktop ? (
        <>
          <main className="flex-grow p-4 w-full lg:w-auto">
                {previewContent}
          </main>
          {!isRightPanelOpen && (
            <SidebarToggle
              onOpen={() => setIsRightPanelOpen(true)}
              isDesktop={isDesktop}
              tabs={[
                { id: "generate", label: "生成", icon: <Sparkles className="h-4 w-4" /> },
                { id: "search", label: "検索", icon: <Search className="h-4 w-4" /> },
                { id: "history", label: "履歴", icon: <History className="h-4 w-4" /> }
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
    </div>
  );
}
