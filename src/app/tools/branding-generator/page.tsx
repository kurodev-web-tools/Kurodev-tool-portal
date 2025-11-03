"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Palette, Target, Users, Check, ChevronRight, ChevronLeft, Save, Edit, Copy as CopyIcon, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/hooks/use-sidebar";
import { useErrorHandler } from "@/hooks/use-error-handler";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Sidebar, SidebarToggle } from "@/components/layouts/Sidebar";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

type ActivityStatus = "active" | "pre-activity";

// ワークフローのステップ定義
type WorkflowStep = "input" | "analyzing" | "analysis-results" | "concept-proposal" | "color-palette" | "save";

interface Concept {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  recommendedActivities: string[];
}

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  description: string;
}

export default function BrandingGeneratorPage() {
  const [activityStatus, setActivityStatus] = useState<ActivityStatus | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("input");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [colorPalettes, setColorPalettes] = useState<ColorPalette[]>([]);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(null);
  const [isEditingPalette, setIsEditingPalette] = useState(false);
  const [editingPaletteId, setEditingPaletteId] = useState<string | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveProposalName, setSaveProposalName] = useState("");
  
  // 入力フォームの状態管理
  const [description, setDescription] = useState("");
  const [persona, setPersona] = useState("");
  const [genre, setGenre] = useState("");
  const [avatar, setAvatar] = useState("");
  
  const { isOpen: isRightPanelOpen, setIsOpen: setIsRightPanelOpen, isDesktop } = useSidebar({
    defaultOpen: true,
    desktopDefaultOpen: true,
  });
  const [activeTab, setActiveTab] = useState("settings");
  const { handleAsyncError } = useErrorHandler();

  // 分析開始
  const handleAnalyzeClick = useCallback(async () => {
    if (!activityStatus) {
      const errorMsg = '活動状況を選択してください';
      logger.error('バリデーションエラー', { error: errorMsg }, 'BrandingGenerator');
      toast.error('入力エラー', {
        description: errorMsg
      });
      return;
    }

    // 入力値のバリデーション
    if (activityStatus === "active" && !description.trim()) {
      toast.error('入力エラー', {
        description: '自己紹介・活動内容を入力してください'
      });
      return;
    }
    
    if (activityStatus === "pre-activity" && (!persona.trim() || !genre.trim())) {
      toast.error('入力エラー', {
        description: '目指すVTuber像と活動ジャンルを入力してください'
      });
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep("analyzing");
    
    if (!isDesktop) {
      setActiveTab("results");
    }

    await handleAsyncError(async () => {
      // モック処理: 分析中
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // モックの分析結果
      setAnalysisResults({
        brandPersonality: "親しみやすく、エネルギッシュ",
        targetAudience: "10-20代のゲーム好きな若者",
        keyMessages: ["楽しい", "親しみやすい", "信頼できる", "面白い"],
        strengths: ["トーク力", "企画力", "リアクション"]
      });
      
      // モックのコンセプト提案
      setConcepts([
        {
          id: "concept-1",
          name: "癒し系ゲーマー",
          description: "穏やかな声と丁寧なプレイスタイルで、視聴者に癒やしを提供するコンセプトです。",
          keywords: ["丁寧", "落ち着き", "ゲーム", "癒し"],
          recommendedActivities: ["ゲーム実況", "カジュアルゲーム", "雑談配信"]
        },
        {
          id: "concept-2",
          name: "知的な解説系",
          description: "物事を深く分析し、視聴者に新しい発見を提供するコンセプトです。",
          keywords: ["解説", "分析", "専門知識", "学習"],
          recommendedActivities: ["攻略解説", "技術解説", "ニュース解説"]
        },
        {
          id: "concept-3",
          name: "元気いっぱいエンターテイナー",
          description: "明るくエネルギッシュな配信で、視聴者を楽しませるコンセプトです。",
          keywords: ["明るい", "エネルギッシュ", "エンタメ", "楽しさ"],
          recommendedActivities: ["ゲーム実況", "歌枠", "企画配信"]
        }
      ]);
      
      setCurrentStep("analysis-results");
    }, "分析中にエラーが発生しました");
    
    setIsAnalyzing(false);
  }, [activityStatus, description, persona, genre, handleAsyncError, isDesktop]);

  // コンセプト提案を生成
  const handleGenerateConcepts = useCallback(async () => {
    setIsAnalyzing(true);
    await handleAsyncError(async () => {
      // モック処理
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep("concept-proposal");
    }, "コンセプト提案の生成に失敗しました");
    setIsAnalyzing(false);
  }, [handleAsyncError]);

  // コンセプトを選択
  const handleSelectConcept = useCallback(async (conceptId: string) => {
    setSelectedConceptId(conceptId);
    setIsAnalyzing(true);
    
    await handleAsyncError(async () => {
      // モック処理: カラーパレット生成
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const selectedConcept = concepts.find(c => c.id === conceptId);
      // 選択したコンセプトに基づいてカラーパレットを生成
      const palettes: ColorPalette[] = [
        {
          id: "palette-1",
          name: "メインパレット",
          colors: conceptId === "concept-1" 
            ? ["#9CAF88", "#B8E6B8", "#D4EDDA", "#C4E1A4", "#A8D8A8"]
            : conceptId === "concept-2"
            ? ["#4A90E2", "#6B9BD2", "#8FB4D3", "#A8C8E0", "#C4D9ED"]
            : ["#FF6B6B", "#FF8E8E", "#FFB3B3", "#FFD4D4", "#FFE6E6"],
          description: selectedConcept ? `${selectedConcept.name}に合ったカラーパレットです` : "推奨カラーパレット"
        },
        {
          id: "palette-2",
          name: "アクセントパレット",
          colors: conceptId === "concept-1"
            ? ["#C8A882", "#E6D4B8", "#F0E6D2", "#F5EBD8", "#FAF5ED"]
            : conceptId === "concept-2"
            ? ["#2C5F8D", "#4A7BA7", "#6B96C1", "#8FB4D3", "#B4D2E6"]
            : ["#FFD93D", "#FFE55C", "#FFF27A", "#FFF899", "#FFFFB8"],
          description: "アクセントカラーとして使用できるパレットです"
        },
        {
          id: "palette-3",
          name: "モノトーンパレット",
          colors: ["#1A1A1A", "#4A4A4A", "#808080", "#B0B0B0", "#E0E0E0"],
          description: "シンプルで洗練されたモノトーンパレットです"
        }
      ];
      
      setColorPalettes(palettes);
      setCurrentStep("color-palette");
    }, "カラーパレットの生成に失敗しました");
    
    setIsAnalyzing(false);
  }, [concepts, handleAsyncError]);

  // カラーパレットを選択
  const handleSelectPalette = useCallback((paletteId: string) => {
    setSelectedPaletteId(paletteId);
  }, []);

  // カラーパレットを編集
  const handleEditPalette = useCallback((paletteId: string) => {
    setEditingPaletteId(paletteId);
    setIsEditingPalette(true);
  }, []);

  // 提案を保存
  const handleSaveProposal = useCallback(() => {
    if (!saveProposalName.trim()) {
      toast.error('保存エラー', {
        description: '提案名を入力してください'
      });
      return;
    }
    
    // 将来的にはAPIに保存
    toast.success('提案を保存しました', {
      description: `${saveProposalName}として保存されました`
    });
    
    setIsSaveDialogOpen(false);
    setSaveProposalName("");
  }, [saveProposalName]);

  // ステップインジケーターコンポーネント
  const StepIndicator = ({ currentStep: step }: { currentStep: WorkflowStep }) => {
    const steps = [
      { id: "input", label: "入力", icon: Users },
      { id: "analyzing", label: "分析中", icon: Loader2 },
      { id: "analysis-results", label: "分析結果", icon: Target },
      { id: "concept-proposal", label: "コンセプト", icon: Palette },
      { id: "color-palette", label: "カラーパレット", icon: Palette },
      { id: "save", label: "保存", icon: Save },
    ];
    
    const currentIndex = steps.findIndex(s => s.id === step);
    
    return (
      <div className="w-full mb-6">
        <div className="flex items-center justify-between relative">
          {/* 接続線 */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-[#4A4A4A] -z-10" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-[#0070F3] transition-all duration-500 ease-out -z-10"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
          
          {/* ステップアイコン */}
          {steps.map((stepItem, index) => {
            const isActive = currentIndex >= index;
            const isCurrent = currentIndex === index;
            const Icon = stepItem.icon;
            
            return (
              <div key={stepItem.id} className="flex flex-col items-center relative z-10 flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isCurrent
                      ? "bg-[#0070F3] border-[#0070F3] scale-110 shadow-lg shadow-[#0070F3]/50"
                      : isActive
                      ? "bg-[#0070F3]/20 border-[#0070F3]"
                      : "bg-[#1A1A1A] border-[#4A4A4A]"
                  )}
                >
                  {isCurrent && stepItem.id === "analyzing" ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : isActive ? (
                    <Check className="w-5 h-5 text-[#0070F3]" />
                  ) : (
                    <Icon className="w-5 h-5 text-[#808080]" />
                  )}
                </div>
                <p
                  className={cn(
                    "text-xs mt-2 text-center max-w-20",
                    isCurrent
                      ? "text-[#0070F3] font-semibold"
                      : isActive
                      ? "text-[#A0A0A0]"
                      : "text-[#808080]"
                  )}
                >
                  {stepItem.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // T-02: 活動状況選択画面
  if (!activityStatus) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 p-8">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-[#E0E0E0] mb-4">あなたの現在の活動状況は？</h1>
          <p className="text-[#A0A0A0] mb-8">
            AIがあなたに最適なブランディングコンセプトを提案するために、活動状況を教えてください
          </p>
        </div>
        <div className="flex flex-col space-y-4 w-full max-w-md">
          <Button
            size="lg"
            onClick={() => setActivityStatus("active")}
            variant="outline"
            className="h-16 text-lg font-semibold border-[#4A4A4A] text-[#E0E0E0] hover:bg-[#2D2D2D] hover:border-[#6A6A6A]"
          >
            既に活動している / 準備中
          </Button>
          <Button
            size="lg"
            onClick={() => setActivityStatus("pre-activity")}
            variant="outline"
            className="h-16 text-lg font-semibold border-[#4A4A4A] text-[#E0E0E0] hover:bg-[#2D2D2D] hover:border-[#6A6A6A]"
          >
            これから活動を始める（準備前）
          </Button>
        </div>
      </div>
    );
  }

  // コントロールパネルコンテンツ
  const controlPanelContent = (
    <div className="flex flex-col h-full p-6 space-y-4 relative">
      <Separator />
      <div className="flex-grow space-y-4 overflow-auto">
        {activityStatus === "active" && (
          <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
            <CardHeader>
              <CardTitle className="text-[#E0E0E0]">既に活動している / 準備中</CardTitle>
              <CardDescription className="text-[#A0A0A0]">
                アカウントを連携するか、手動で情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full bg-[#0070F3] hover:bg-[#0051CC] text-white"
                onClick={() => toast.info('この機能は今後実装予定です', {
                  description: 'YouTubeアカウント連携機能は開発中です',
                })}
              >
                YouTubeアカウントを連携
              </Button>
              <Button 
                variant="outline"
                className="w-full border-[#4A4A4A] text-[#E0E0E0] hover:bg-[#2D2D2D] hover:border-[#6A6A6A]"
                onClick={() => toast.info('この機能は今後実装予定です', {
                  description: 'Xアカウント連携機能は開発中です',
                })}
              >
                Xアカウントを連携
              </Button>
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                  自己紹介・活動内容 <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="キャラクター設定、活動内容、目標などを入力..."
                  className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#6A6A6A] min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        )}
        {activityStatus === "pre-activity" && (
          <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
            <CardHeader>
              <CardTitle className="text-[#E0E0E0]">これから活動を始める（準備前）</CardTitle>
              <CardDescription className="text-[#A0A0A0]">
                目指すVTuber像や活動内容を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="persona" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                  目指すVTuber像（性格・イメージ） <span className="text-red-400">*</span>
                </Label>
                <Textarea 
                  id="persona" 
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  placeholder="例: 明るく元気、クールでミステリアス..." 
                  className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#6A6A6A] min-h-[80px]"
                />
              </div>
              <div>
                <Label htmlFor="genre" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                  活動ジャンル（予定） <span className="text-red-400">*</span>
                </Label>
                <Input 
                  id="genre" 
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="例: ゲーム実況、歌、雑談" 
                  className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#6A6A6A]"
                />
              </div>
              <div>
                <Label htmlFor="avatar" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                  立ち絵のイメージ（任意）
                </Label>
                <Textarea 
                  id="avatar" 
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="例: 銀髪、青い目、近未来的な衣装..." 
                  className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#6A6A6A] min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        )}
        {currentStep === "input" && (
          <Button 
            size="lg" 
            className="w-full bg-[#0070F3] hover:bg-[#0051CC] text-white" 
            onClick={handleAnalyzeClick} 
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                分析を開始する
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  // 結果表示コンテンツ
  const resultsDisplayContent = (
    <div className="flex flex-col h-full p-6 space-y-4 relative">
      {/* ステップインジケーター */}
      {currentStep !== "input" && <StepIndicator currentStep={currentStep} />}
      
      <div className="flex-grow space-y-4 overflow-auto">
        {/* 分析中 */}
        {currentStep === "analyzing" && (
          <div className="space-y-4">
            <div className="w-full h-full bg-[#2D2D2D] rounded-lg flex flex-col items-center justify-center text-center p-8 min-h-[400px] border border-[#4A4A4A]">
              <Loader2 className="w-16 h-16 text-[#0070F3] mb-4 animate-spin" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-[#E0E0E0] mb-2">ブランディングを分析中...</h3>
              <p className="text-[#A0A0A0] mt-2">
                AIがあなたの個性や強みを分析しています。しばらくお待ちください。
              </p>
            </div>
            {/* ローディング中のスケルトン */}
            <div className="space-y-4" role="status" aria-label="ブランディング分析中">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-[#4A4A4A] bg-[#2D2D2D]">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 bg-[#1A1A1A]" />
                    <Skeleton className="h-4 w-full bg-[#1A1A1A]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-2/3 mb-2 bg-[#1A1A1A]" />
                    <Skeleton className="h-4 w-1/2 bg-[#1A1A1A]" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 分析結果表示 */}
        {currentStep === "analysis-results" && analysisResults && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-semibold text-[#E0E0E0]">分析結果</h2>
              <Button
                onClick={handleGenerateConcepts}
                className="bg-[#0070F3] hover:bg-[#0051CC] text-white"
              >
                コンセプトを提案する
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#E0E0E0]">
                  <Target className="h-5 w-5" />
                  ブランドパーソナリティ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium text-[#E0E0E0]">{analysisResults.brandPersonality}</p>
              </CardContent>
            </Card>
            
            <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#E0E0E0]">
                  <Users className="h-5 w-5" />
                  ターゲットオーディエンス
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium text-[#E0E0E0]">{analysisResults.targetAudience}</p>
              </CardContent>
            </Card>
            
            <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
              <CardHeader>
                <CardTitle className="text-[#E0E0E0]">強み・特徴</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysisResults.strengths?.map((strength: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0]">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
              <CardHeader>
                <CardTitle className="text-[#E0E0E0]">キーメッセージ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysisResults.keyMessages?.map((message: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="bg-[#0070F3]/10 border-[#0070F3]/50 text-[#0070F3]"
                    >
                      {message}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* コンセプト提案 */}
        {currentStep === "concept-proposal" && concepts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-semibold text-[#E0E0E0]">コンセプト提案</h2>
              <p className="text-sm text-[#A0A0A0]">好きなコンセプトを選択してください</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {concepts.map((concept) => (
                <Card
                  key={concept.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 border-[#4A4A4A] bg-[#2D2D2D]",
                    selectedConceptId === concept.id
                      ? "border-[#0070F3] ring-2 ring-[#0070F3]/50 bg-[#0070F3]/10"
                      : "hover:border-[#6A6A6A] hover:bg-[#1A1A1A]"
                  )}
                  onClick={() => handleSelectConcept(concept.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-[#E0E0E0] flex-1">{concept.name}</CardTitle>
                      {selectedConceptId === concept.id && (
                        <Badge className="bg-[#0070F3] text-white">
                          選択中
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-[#A0A0A0]">
                      {concept.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-[#A0A0A0] mb-1">キーワード</p>
                      <div className="flex flex-wrap gap-1">
                        {concept.keywords.map((keyword, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0]"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#A0A0A0] mb-1">推奨活動</p>
                      <ul className="text-xs text-[#A0A0A0] space-y-1">
                        {concept.recommendedActivities.map((activity, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <span className="text-[#0070F3]">•</span>
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {selectedConceptId && !isAnalyzing && (
              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => handleSelectConcept(selectedConceptId)}
                  className="bg-[#0070F3] hover:bg-[#0051CC] text-white"
                >
                  カラーパレットを生成する
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* カラーパレット提案 */}
        {currentStep === "color-palette" && colorPalettes.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-semibold text-[#E0E0E0]">カラーパレット提案</h2>
              <p className="text-sm text-[#A0A0A0]">
                {selectedConceptId && concepts.find(c => c.id === selectedConceptId)?.name}に基づく提案
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {colorPalettes.map((palette) => (
                <Card
                  key={palette.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 border-[#4A4A4A] bg-[#2D2D2D]",
                    selectedPaletteId === palette.id
                      ? "border-[#0070F3] ring-2 ring-[#0070F3]/50 bg-[#0070F3]/10"
                      : "hover:border-[#6A6A6A] hover:bg-[#1A1A1A]"
                  )}
                  onClick={() => handleSelectPalette(palette.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-[#E0E0E0]">{palette.name}</CardTitle>
                      <div className="flex gap-2">
                        {selectedPaletteId === palette.id && (
                          <Badge className="bg-[#0070F3] text-white text-xs">
                            選択中
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#A0A0A0] hover:text-[#E0E0E0] hover:bg-[#4A4A4A]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPalette(palette.id);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-[#A0A0A0]">
                      {palette.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      {palette.colors.map((color, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center gap-1"
                        >
                          <div
                            className="w-16 h-16 rounded-lg border-2 border-[#4A4A4A] shadow-md"
                            style={{ backgroundColor: color }}
                            aria-label={`カラー ${index + 1}: ${color}`}
                          />
                          <span className="text-xs text-[#A0A0A0] font-mono">{color}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {selectedPaletteId && (
              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => setIsSaveDialogOpen(true)}
                  className="bg-[#0070F3] hover:bg-[#0051CC] text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  提案を保存する
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 初期状態（分析結果がない場合） */}
        {currentStep === "input" && !analysisResults && (
          <div className="space-y-4">
            <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
              <CardHeader>
                <CardTitle className="text-[#E0E0E0]">個性・強みのサマリー</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  左側のパネルから情報を入力し、「分析を開始する」ボタンをクリックしてください。
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col lg:flex-row lg:h-screen">
      {isDesktop ? (
        <>
          <main className="flex-grow p-4 w-full lg:w-auto overflow-y-auto">
            {resultsDisplayContent}
          </main>

          {/* サイドバーが閉じている場合の開くボタン */}
          {!isRightPanelOpen && (
            <SidebarToggle 
              onOpen={() => setIsRightPanelOpen(true)}
              isDesktop={isDesktop}
            />
          )}

          {/* サイドバー */}
          <Sidebar
            isOpen={isRightPanelOpen}
            onClose={() => setIsRightPanelOpen(false)}
            title=""
            isDesktop={isDesktop}
          >
            {controlPanelContent}
          </Sidebar>
        </>
      ) : (
        <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-[#2D2D2D] border-[#4A4A4A]">
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-[#0070F3] data-[state=active]:text-white data-[state=inactive]:text-[#A0A0A0]"
            >
              設定
            </TabsTrigger>
            <TabsTrigger 
              value="results"
              className="data-[state=active]:bg-[#0070F3] data-[state=active]:text-white data-[state=inactive]:text-[#A0A0A0]"
            >
              結果
            </TabsTrigger>
          </TabsList>
          <TabsContent value="settings" className="flex-grow overflow-auto">
            {controlPanelContent}
          </TabsContent>
          <TabsContent value="results" className="flex-grow overflow-auto">
            {resultsDisplayContent}
          </TabsContent>
        </Tabs>
      )}

      {/* カラーパレット編集ダイアログ（プレースホルダー） */}
      <Dialog open={isEditingPalette} onOpenChange={setIsEditingPalette}>
        <DialogContent className="bg-[#2D2D2D] border-[#4A4A4A] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#E0E0E0]">カラーパレットを編集</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              この機能は今後実装予定です。カラーパレットの編集機能は開発中です。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-[#A0A0A0] text-sm">
              将来的には、ここでカラーパレットの各色を編集できるようになります。
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditingPalette(false)}
              className="border-[#4A4A4A] text-[#E0E0E0] hover:bg-[#2D2D2D] hover:border-[#6A6A6A]"
            >
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 保存ダイアログ */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="bg-[#2D2D2D] border-[#4A4A4A]">
          <DialogHeader>
            <DialogTitle className="text-[#E0E0E0]">提案を保存</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              この提案に名前を付けて保存してください
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="proposal-name" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
              提案名 <span className="text-red-400">*</span>
            </Label>
            <Input
              id="proposal-name"
              value={saveProposalName}
              onChange={(e) => setSaveProposalName(e.target.value)}
              placeholder="例: 私のブランディング案1"
              className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#6A6A6A]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaveDialogOpen(false)}
              className="border-[#4A4A4A] text-[#E0E0E0] hover:bg-[#2D2D2D] hover:border-[#6A6A6A]"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSaveProposal}
              className="bg-[#0070F3] hover:bg-[#0051CC] text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              保存する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
