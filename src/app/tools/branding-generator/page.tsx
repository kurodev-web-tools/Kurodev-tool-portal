"use client";

import { useState } from "react";
// Resizable components are not used in this refactored version
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/hooks/use-sidebar";
import { useErrorHandler } from "@/hooks/use-error-handler";
// validateRequired is imported but not used in this simplified version
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Sidebar, SidebarToggle } from "@/components/layouts/Sidebar";

type ActivityStatus = "active" | "pre-activity";

export default function BrandingGeneratorPage() {
  const [activityStatus, setActivityStatus] = useState<ActivityStatus | null>(
    null
  );
  const { isOpen: isRightPanelOpen, setIsOpen: setIsRightPanelOpen, isDesktop } = useSidebar({
    defaultOpen: true,
    desktopDefaultOpen: true,
  });
  const [activeTab, setActiveTab] = useState("settings"); // モバイル用タブの状態
  const { handleAsyncError } = useErrorHandler();

  // 分析開始ボタンがクリックされたら、モバイルでは結果タブに切り替える
  const handleAnalyzeClick = async () => {
    // バリデーション（例：活動状況が選択されているか）
    if (!activityStatus) {
      console.error('活動状況を選択してください');
      return;
    }

    await handleAsyncError(async () => {
      // ここに分析ロジックを呼び出す処理が入る
      await new Promise(resolve => setTimeout(resolve, 1000)); // モック処理
      
      if (!isDesktop) {
        setActiveTab("results");
      }
    }, "分析中にエラーが発生しました");
  };

  // T-02: 活動状況選択画面
  if (!activityStatus) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <h1 className="text-3xl font-bold">あなたの現在の活動状況は？</h1>
        <div className="flex gap-4">
          <Button
            size="lg"
            onClick={() => setActivityStatus("active")}
            variant="outline"
          >
            既に活動している / 準備中
          </Button>
          <Button
            size="lg"
            onClick={() => setActivityStatus("pre-activity")}
            variant="outline"
          >
            これから活動を始める（準備前）
          </Button>
        </div>
      </div>
    );
  }

  // T-03 & T-04: メインの編集・表示画面
  const controlPanelContent = (
    <div className="flex flex-col h-full p-6 space-y-4 relative">
      {/* パネル開閉ボタンをコントロールパネル内に移動 */}
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
        {activityStatus === "active" && (
          <Card>
            <CardHeader>
              <CardTitle>既に活動している / 準備中</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">YouTubeアカウントを連携</Button>
              <Button className="w-full">Xアカウントを連携</Button>
              <div>
                <Label htmlFor="description">自己紹介・活動内容</Label>
                <Textarea
                  id="description"
                  placeholder="キャラクター設定、活動内容、目標などを入力..."
                />
              </div>
            </CardContent>
          </Card>
        )}
        {activityStatus === "pre-activity" && (
          <Card>
            <CardHeader>
              <CardTitle>これから活動を始める（準備前）</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="persona">目指すVTuber像（性格・イメージ）</Label>
                <Textarea id="persona" placeholder="例: 明るく元気、クールでミステリアス..." />
              </div>
              <div>
                <Label htmlFor="genre">活動ジャンル（予定）</Label>
                <Input id="genre" placeholder="例: ゲーム実況、歌、雑談" />
              </div>
              <div>
                <Label htmlFor="avatar">立ち絵のイメージ（任意）</Label>
                <Textarea id="avatar" placeholder="例: 銀髪、青い目、近未来的な衣装..." />
              </div>
            </CardContent>
          </Card>
        )}
        <Button size="lg" className="w-full" onClick={handleAnalyzeClick}>
          分析を開始する
        </Button>
      </div>
    </div>
  );

  const resultsDisplayContent = (
    <div className="flex flex-col h-full p-6 space-y-4 relative">
      <h2 className="text-2xl font-semibold">分析・提案結果</h2>
      <Separator />
      <div className="flex-grow space-y-4 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>個性・強みのサマリー</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              ここにAIが分析したあなたの個性や強みがキーワードやグラフで表示されます。
            </p>
          </CardContent>
        </Card>
        <h3 className="text-xl font-semibold">コンセプト提案</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:border-primary">
            <CardHeader>
              <CardTitle>癒し系ゲーマー</CardTitle>
              <CardDescription>キーワード: 丁寧, 落ち着き, ゲーム</CardDescription>
            </CardHeader>
            <CardContent>
              <p>穏やかな声と丁寧なプレイスタイルで、視聴者に癒やしを提供するコンセプトです。</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>知的な解説系</CardTitle>
              <CardDescription>キーワード: 解説, 分析, 専門知識</CardDescription>
            </CardHeader>
            <CardContent>
              <p>物事を深く分析し、視聴者に新しい発見を提供するコンセプトです。</p>
            </CardContent>
          </Card>
        </div>
        <h3 className="text-xl font-semibold">カラーパレット提案</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:border-primary">
            <CardHeader>
              <CardTitle>パステルポップ</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <div className="w-10 h-10 rounded-full bg-pink-300"></div>
              <div className="w-10 h-10 rounded-full bg-blue-300"></div>
              <div className="w-10 h-10 rounded-full bg-green-300"></div>
              <div className="w-10 h-10 rounded-full bg-yellow-300"></div>
              <div className="w-10 h-10 rounded-full bg-purple-300"></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>サイバークール</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <div className="w-10 h-10 rounded-full bg-cyan-400"></div>
              <div className="w-10 h-10 rounded-full bg-fuchsia-500"></div>
              <div className="w-10 h-10 rounded-full bg-slate-800"></div>
              <div className="w-10 h-10 rounded-full bg-white"></div>
              <div className="w-10 h-10 rounded-full bg-gray-400"></div>
            </CardContent>
          </Card>
        </div>
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