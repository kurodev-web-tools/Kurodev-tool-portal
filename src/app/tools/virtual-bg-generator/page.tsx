"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Check, Heart, Download as DownloadIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
  Monitor
} from "lucide-react";

export default function VirtualBackgroundGeneratorPage() {
  const { isOpen: isRightPanelOpen, setIsOpen: setIsRightPanelOpen, isDesktop } = useSidebar({
    defaultOpen: true,
    desktopDefaultOpen: true,
  });
  const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("");
  const [style, setStyle] = useState("");
  const [resolution, setResolution] = useState("");
  const [imageCount, setImageCount] = useState("1");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [favoriteImages, setFavoriteImages] = useState<string[]>([]);
  
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

  const handleGenerate = useCallback(async () => {
    const promptError = validatePrompt(prompt);
    if (promptError) {
      logger.error('バリデーションエラー', { error: promptError }, 'VirtualBgGenerator');
      // トーストでエラーを表示
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(promptError);
      }
      return;
    }

    setIsLoading(true);
    await handleAsyncError(async () => {
      // モック処理：実際のAI生成をシミュレート
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // プレースホルダー画像を生成
      const mockImages = Array.from({ length: parseInt(imageCount) }, (_, i) => 
        `https://picsum.photos/800/600?random=${Date.now() + i}`
      );
      
      setGeneratedImages(mockImages);
      setSelectedImage(mockImages[0]);
      
      // 履歴に追加
      addToHistory({ url: mockImages[0], prompt });
      
      if (!isDesktop) {
        setActiveTab("preview");
      }
    }, "背景生成中にエラーが発生しました");
    setIsLoading(false);
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
          <div className="space-y-4">
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
                {prompt && (
                  <div className="flex justify-end">
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
                  </div>
                )}
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

            <div>
              <Label htmlFor="resolution">解像度・アスペクト比</Label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger>
                  <SelectValue placeholder="解像度を選択" />
                </SelectTrigger>
                <SelectContent>
                  {resolutions.map((res) => (
                    <SelectItem key={res.value} value={res.value}>
                      {res.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

  // モバイル用の生成タブ内容
  const mobileGenerateContent = (
    <div className="flex flex-col h-full space-y-4 p-4">
      <Separator />
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="prompt-mobile">テキストプロンプト</Label>
          <Textarea
            id="prompt-mobile"
            placeholder="サイバーパンク都市の夜景、ネオンライトが輝く未来都市..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[80px]"
          />
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

        <div className="grid grid-cols-2 gap-3">
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
          </div>
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
      {generatedImages.length > 0 ? (
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
                              : 'text-gray-600'
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
              <div className="w-full h-full bg-gray-200 dark:bg-gray-800 rounded-md flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
                <Loader2 className="w-16 h-16 text-gray-400 mb-4 animate-spin" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">バーチャル背景を生成中...</h3>
                <p className="text-gray-500 mt-2">AIがあなたにぴったりの背景画像を生成しています。しばらくお待ちください。</p>
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
