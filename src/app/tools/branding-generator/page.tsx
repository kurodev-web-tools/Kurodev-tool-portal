"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSidebar } from "@/hooks/use-sidebar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Sidebar, SidebarToggle } from "@/components/layouts/Sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useBrandingForm } from "./hooks/useBrandingForm";
import { useBrandingWorkflow } from "./hooks/useBrandingWorkflow";
import { useBrandingAnalysis } from "./hooks/useBrandingAnalysis";
import { ActivityStatusSelector } from "./components/ActivityStatusSelector";
import { StepIndicator } from "./components/StepIndicator";
import { InputForm } from "./components/InputForm";
import { AnalysisResultsDisplay } from "./components/AnalysisResultsDisplay";
import { ConceptProposalDisplay } from "./components/ConceptProposalDisplay";
import { ColorPaletteDisplay } from "./components/ColorPaletteDisplay";

export default function BrandingGeneratorPage() {
  const { isOpen: isRightPanelOpen, setIsOpen: setIsRightPanelOpen, isDesktop } = useSidebar({
    defaultOpen: true,
    desktopDefaultOpen: true,
  });

  // カスタムフックを使用
  const {
    activityStatus,
    setActivityStatus,
    description,
    setDescription,
    persona,
    setPersona,
    genre,
    setGenre,
    avatar,
    setAvatar,
    getFormValues,
    validateForm,
    resetForm,
    resetAll,
  } = useBrandingForm();

  const {
    currentStep,
    activeTab,
    setActiveTab,
    goToStep,
    nextStep,
    resetWorkflow,
  } = useBrandingWorkflow();

  const {
    isAnalyzing,
    analysisResults,
    concepts,
    selectedConceptId,
    colorPalettes,
    selectedPaletteId,
    startAnalysis,
    selectConceptAndGeneratePalettes,
    selectPalette,
    resetAnalysis,
  } = useBrandingAnalysis();

  // ローカル状態（ダイアログなど）
  const [isEditingPalette, setIsEditingPalette] = useState(false);
  const [editingPaletteId, setEditingPaletteId] = useState<string | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveProposalName, setSaveProposalName] = useState("");

  // 分析開始
  const handleAnalyzeClick = useCallback(async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      toast.error('入力エラー', {
        description: validation.error,
      });
      return;
    }

    const formValues = getFormValues();
    nextStep('analyzing', isDesktop);

    await startAnalysis(activityStatus!, formValues, (results, conceptsData) => {
      nextStep('analysis-results', isDesktop);
    });
  }, [activityStatus, validateForm, getFormValues, nextStep, startAnalysis, isDesktop]);

  // コンセプト提案を生成
  const handleGenerateConcepts = useCallback(async () => {
    nextStep('concept-proposal', isDesktop);
  }, [nextStep, isDesktop]);

  // コンセプトを選択してカラーパレットを生成
  const handleSelectConcept = useCallback(
    async (conceptId: string) => {
      await selectConceptAndGeneratePalettes(conceptId, () => {
        nextStep('color-palette', isDesktop);
      });
    },
    [selectConceptAndGeneratePalettes, nextStep, isDesktop],
  );

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

  // リセット関数（最初からやり直す）
  const handleReset = useCallback(() => {
    resetAnalysis();
    resetForm();
    resetWorkflow(isDesktop);
    resetAll();
    setIsEditingPalette(false);
    setEditingPaletteId(null);
    setIsSaveDialogOpen(false);
    setSaveProposalName('');
    toast.info('最初からやり直します', {
      description: 'すべての入力と結果がリセットされました',
    });
  }, [resetAnalysis, resetForm, resetWorkflow, resetAll, isDesktop]);

  // フォーム変更ハンドラー
  const handleFormChange = useCallback(
    (field: 'description' | 'persona' | 'genre' | 'avatar', value: string) => {
      switch (field) {
        case 'description':
          setDescription(value);
          break;
        case 'persona':
          setPersona(value);
          break;
        case 'genre':
          setGenre(value);
          break;
        case 'avatar':
          setAvatar(value);
          break;
      }
    },
    [setDescription, setPersona, setGenre, setAvatar],
  );

  // T-02: 活動状況選択画面
  if (!activityStatus) {
    return <ActivityStatusSelector onSelect={setActivityStatus} />;
  }

  // コントロールパネルコンテンツ
  const controlPanelContent = (
    <InputForm
      activityStatus={activityStatus}
      formValues={getFormValues()}
      onFormChange={handleFormChange}
      onAnalyze={handleAnalyzeClick}
      isAnalyzing={isAnalyzing}
      currentStep={currentStep}
    />
  );

  // 結果表示コンテンツ
  const resultsDisplayContent = (
    <div className="flex flex-col h-full relative">
      {/* ステップインジケーター（固定） */}
      {currentStep !== 'input' && (
        <div className="sticky top-0 z-10 bg-[#1A1A1A] border-b border-[#4A4A4A] p-4 sm:p-6 pb-4">
          <StepIndicator currentStep={currentStep} onStepClick={(step) => goToStep(step, isDesktop)} />
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#2D2D2D] hover:text-[#E0E0E0] hover:border-[#6A6A6A]"
            >
              <X className="mr-2 h-4 w-4" />
              最初からやり直す
            </Button>
          </div>
        </div>
      )}

      <div className="flex-grow space-y-4 md:overflow-auto p-4 sm:p-6 pr-2 sm:pr-6">
        {/* 分析中 */}
        {currentStep === 'analyzing' && (
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
        {currentStep === 'analysis-results' && analysisResults && (
          <AnalysisResultsDisplay
            analysisResults={analysisResults}
            onBack={() => goToStep('input', isDesktop)}
            onGenerateConcepts={handleGenerateConcepts}
            isGenerating={isAnalyzing}
          />
        )}

        {/* コンセプト提案 */}
        {currentStep === 'concept-proposal' && concepts.length > 0 && (
          <ConceptProposalDisplay
            concepts={concepts}
            selectedConceptId={selectedConceptId}
            onSelectConcept={handleSelectConcept}
            onBack={() => goToStep('analysis-results', isDesktop)}
            isAnalyzing={isAnalyzing}
          />
        )}

        {/* カラーパレット提案 */}
        {currentStep === 'color-palette' && colorPalettes.length > 0 && (
          <ColorPaletteDisplay
            colorPalettes={colorPalettes}
            selectedPaletteId={selectedPaletteId}
            selectedConcept={concepts.find((c) => c.id === selectedConceptId) || null}
            onSelectPalette={selectPalette}
            onEditPalette={handleEditPalette}
            onBack={() => goToStep('concept-proposal', isDesktop)}
            onSave={() => setIsSaveDialogOpen(true)}
          />
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
    <div className="h-full flex flex-col md:flex-row md:h-screen">
      {/* デスクトップ・タブレット表示（横並び） */}
      <div className="hidden md:flex md:flex-row w-full h-full">
        <main className="flex-grow p-4 w-full overflow-y-auto">
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
      </div>

      {/* モバイル表示（タブ切り替え） */}
      {!isDesktop && (
        <div className="w-full h-[calc(100vh-4.1rem)] flex flex-col overflow-y-auto md:hidden">
          <div className="bg-background flex-shrink-0">
            <Tabs defaultValue="settings" value={activeTab} onValueChange={(value) => setActiveTab(value as 'settings' | 'results')} className="w-full flex flex-col">
              <div className="px-2 pt-2 pb-0">
                <TabsList className="grid w-full grid-cols-2 border-b border-[#4A4A4A] rounded-none bg-transparent p-0 h-auto">
                  <TabsTrigger 
                    value="settings"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-[#0070F3] data-[state=active]:text-[#0070F3] data-[state=inactive]:text-[#A0A0A0] px-2 py-2 relative"
                  >
                    設定
                  </TabsTrigger>
                  <TabsTrigger 
                    value="results"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-[#0070F3] data-[state=active]:text-[#0070F3] data-[state=inactive]:text-[#A0A0A0] px-2 py-2 relative"
                  >
                    結果
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </div>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'settings' | 'results')} className="w-full flex-1 flex flex-col">
          <TabsContent value="settings" className="flex-grow mt-0">
            {controlPanelContent}
          </TabsContent>
          <TabsContent value="results" className="flex-grow mt-0">
            {resultsDisplayContent}
          </TabsContent>
          </Tabs>
        </div>
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
