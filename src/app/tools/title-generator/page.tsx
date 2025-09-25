"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { validateTitle, validateDescription } from "@/lib/validation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar, SidebarToggle } from "@/components/layouts/Sidebar";

export default function TitleGeneratorPage() {
  const { isOpen: isRightPanelOpen, setIsOpen: setIsRightPanelOpen, isDesktop } = useSidebar({
    defaultOpen: true,
    desktopDefaultOpen: true,
  });
  const [activeTab, setActiveTab] = useState("settings"); // モバイル用タブの状態
  const [isLoading, setIsLoading] = useState(false); // ローディング状態
  const [finalTitle, setFinalTitle] = useState(""); // 最終タイトル
  const [finalDescription, setFinalDescription] = useState(""); // 最終概要欄
  const [aiTitles, setAiTitles] = useState<string[]>([]); // AI提案タイトル案
  const [aiDescription, setAiDescription] = useState(""); // AI提案概要欄
  const { handleAsyncError } = useErrorHandler();

  // T-04: フロントエンド内でのUIロジック実装
  const handleGenerateClick = async () => {
    // バリデーション
    const titleError = validateTitle(finalTitle);
    const descriptionError = validateDescription(finalDescription);
    
    if (titleError || descriptionError) {
      // エラーメッセージを表示（実際の実装では適切なエラー表示を行う）
      console.error('バリデーションエラー:', titleError || descriptionError);
      return;
    }

    setIsLoading(true);
    
    // 非同期処理をエラーハンドリングでラップ
    await handleAsyncError(async () => {
      // ここに生成ロジックを呼び出す処理が入る（今回はモック）
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const generatedTitles = [
        "AIが生成したタイトル案1",
        "AIが生成したタイトル案2",
        "AIが生成したタイトル案3",
      ];
      const generatedDescription = "AIが生成した概要欄の元データがここに表示されます。ハッシュタグや関連リンクなども含まれます。";

      setAiTitles(generatedTitles);
      setAiDescription(generatedDescription);
      setFinalDescription(generatedDescription);
      
      if (!isDesktop) {
        setActiveTab("results"); // モバイルでは結果タブに切り替える
      }
    }, "生成中にエラーが発生しました");
    
    setIsLoading(false);
  };

  const handleTitleSelect = (title: string) => {
    setFinalTitle(title);
  };

  const controlPanelContent = (
    <div className="flex flex-col h-full p-6 space-y-4 relative">
      {isDesktop && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10"
          onClick={() => setIsRightPanelOpen(false)}
        >
          ×
        </Button>
      )}
      <h2 className="text-2xl font-semibold">コントロールパネル</h2>
      <Separator />
      <div className="flex-grow space-y-4 overflow-auto">
        {/* T-02: コントロールパネルのUI作成 */}
        <Card>
          <CardHeader>
            <CardTitle>動画情報入力</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="video-theme">動画のテーマ・内容</Label>
              <Textarea
                id="video-theme"
                placeholder="動画の台本や要約などを入力..."
              />
            </div>
            <div>
              <Label htmlFor="keywords">主要キーワード</Label>
              <Input id="keywords" placeholder="例: ゲーム名, キャラクター名, 感想" />
            </div>
            <div>
              <Label htmlFor="target-audience">ターゲット層</Label>
              <Input id="target-audience" placeholder="例: 10代男性, VTuberファン" />
            </div>
            <div>
              <Label htmlFor="video-mood">動画の雰囲気</Label>
              <Input id="video-mood" placeholder="例: 面白い, 感動, 解説" />
            </div>
          </CardContent>
        </Card>
        <Button size="lg" className="w-full" onClick={handleGenerateClick} disabled={isLoading}>
          {isLoading ? "生成中..." : "生成する"}
        </Button>
      </div>
    </div>
  );

  const resultsDisplayContent = (
    <div className="flex flex-col h-full p-6 space-y-4 relative">
      <h2 className="text-2xl font-semibold">生成結果</h2>
      <Separator />
      <div className="flex-grow space-y-4 overflow-auto">
        {/* T-03: 結果表示エリアのUI作成 */}
        <Card>
          <CardHeader>
            <CardTitle>最終編集エリア</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="final-title">最終タイトル</Label>
              <div className="flex space-x-2">
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    id="final-title"
                    placeholder="AIが生成したタイトル案"
                    value={finalTitle}
                    onChange={(e) => setFinalTitle(e.target.value)}
                  />
                )}
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(finalTitle)} disabled={!finalTitle}>コピー</Button>
              </div>
            </div>
            <div>
              <Label htmlFor="final-description">最終概要欄</Label>
              <div className="flex space-x-2">
                {isLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <Textarea
                    id="final-description"
                    placeholder="AIが生成した概要欄"
                    value={finalDescription}
                    onChange={(e) => setFinalDescription(e.target.value)}
                  />
                )}
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(finalDescription)} disabled={!finalDescription}>コピー</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <h3 className="text-xl font-semibold">AI提案エリア</h3>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>タイトル案</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiTitles.map((title, index) => (
                  <p
                    key={index}
                    className="cursor-pointer hover:text-primary"
                    onClick={() => handleTitleSelect(title)}
                  >
                    ・{title}
                  </p>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>概要欄</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea readOnly value={aiDescription} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col lg:flex-row lg:h-screen">
      {isDesktop ? (
        <>
          <main className="flex-grow p-4 w-full lg:w-auto">
            {resultsDisplayContent}
          </main>

          {/* サイドバーが閉じている場合の開くボタン */}
          <SidebarToggle 
            onOpen={() => setIsRightPanelOpen(true)}
            isDesktop={isDesktop}
          />

          {/* サイドバー */}
          <Sidebar
            isOpen={isRightPanelOpen}
            onClose={() => setIsRightPanelOpen(false)}
            title="コントロールパネル"
            isDesktop={isDesktop}
          >
            {controlPanelContent}
          </Sidebar>
        </>
      ) : (
        <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">設定</TabsTrigger>
            <TabsTrigger value="results">結果</TabsTrigger>
          </TabsList>
          <TabsContent value="settings" className="flex-grow overflow-auto">
            {controlPanelContent}
          </TabsContent>
          <TabsContent value="results" className="flex-grow overflow-auto">
            {resultsDisplayContent}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}