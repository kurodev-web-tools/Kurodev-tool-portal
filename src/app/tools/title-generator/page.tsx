"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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
import { Skeleton } from "@/components/ui/skeleton";
export default function TitleGeneratorPage() {
  const { isDesktop } = useSidebar({
    defaultOpen: true,
    desktopDefaultOpen: true,
  });
  const [activeTab, setActiveTab] = useState("settings"); // モバイル用タブの状態
  const [isLoading, setIsLoading] = useState(false); // ローディング状態
  const [finalTitle, setFinalTitle] = useState(""); // 最終タイトル
  const [finalDescription, setFinalDescription] = useState(""); // 最終概要欄
  const [aiTitles, setAiTitles] = useState<string[]>([]); // AI提案タイトル案
  const [aiDescription, setAiDescription] = useState(""); // AI提案概要欄
  const [copiedItem, setCopiedItem] = useState<string | null>(null); // コピー状態
  
  // 入力フォームのstate管理（5.4対応）
  const [videoTheme, setVideoTheme] = useState(""); // 動画のテーマ・内容
  const [keywords, setKeywords] = useState(""); // 主要キーワード
  const [targetAudience, setTargetAudience] = useState(""); // ターゲット層
  const [videoMood, setVideoMood] = useState(""); // 動画の雰囲気
  
  const { handleAsyncError } = useErrorHandler();

  // T-04: フロントエンド内でのUIロジック実装
  const handleGenerateClick = useCallback(async () => {
    // 入力フォームのバリデーション（最低限のチェック）
    if (!videoTheme.trim()) {
      toast.error('入力エラー', {
        description: '動画のテーマ・内容を入力してください'
      });
      return;
    }

    setIsLoading(true);
    
    // 非同期処理をエラーハンドリングでラップ
    await handleAsyncError(async () => {
      // ここに生成ロジックを呼び出す処理が入る（今回はモック）
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const generatedTitles = [
        "【初見】超絶高難易度ゲームに挑戦！絶叫必至の展開が...",
        "【実況】新作ゲームを完全攻略！隠し要素も全部見つけた",
        "【コラボ】人気VTuberと一緒にゲーム！予想外の展開に..."
      ];
      const generatedDescription = `【動画の概要】
この動画では、${videoTheme}について詳しく解説しています。

【タイムスタンプ】
00:00 オープニング
02:30 本編開始
15:45 まとめ

【関連動画】
・前回の動画: [リンク]
・次回予告: [リンク]

【ハッシュタグ】
#VTuber #ゲーム実況 #新作ゲーム #実況 #エンタメ

【SNS】
Twitter: @your_twitter
Instagram: @your_instagram`;

      setAiTitles(generatedTitles);
      setAiDescription(generatedDescription);
      // 最初のタイトル案を自動選択
      if (generatedTitles.length > 0) {
        setFinalTitle(generatedTitles[0]);
      }
      setFinalDescription(generatedDescription);
      
      if (!isDesktop) {
        setActiveTab("results"); // モバイルでは結果タブに切り替える
      }
    }, "生成中にエラーが発生しました");
    
    setIsLoading(false);
  }, [videoTheme, handleAsyncError, isDesktop]);

  const handleTitleSelect = useCallback((title: string) => {
    setFinalTitle(title);
  }, []);

  const handleCopy = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(type);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      logger.error('コピー失敗', err, 'TitleGenerator');
    }
  }, []);

  const controlPanelContent = (
    <div className="flex flex-col h-full p-6 space-y-4 relative">
      <Separator />
      <div className="flex-grow space-y-4 overflow-auto">
        {/* T-02: コントロールパネルのUI作成 */}
        <Card>
          <CardHeader>
            <CardTitle>動画情報入力</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 動画のテーマ・内容は全幅 */}
            <div>
              <Label htmlFor="video-theme">動画のテーマ・内容</Label>
              <Textarea
                id="video-theme"
                placeholder="動画の台本や要約などを入力..."
                value={videoTheme}
                onChange={(e) => setVideoTheme(e.target.value)}
                rows={4}
                className="resize-y"
              />
            </div>
            
            {/* 2カラムレイアウト（5.1対応） */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="keywords">主要キーワード</Label>
                <Input 
                  id="keywords" 
                  placeholder="例: ゲーム名, キャラクター名, 感想"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="target-audience">ターゲット層</Label>
                <Input 
                  id="target-audience" 
                  placeholder="例: 10代男性, VTuberファン"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="video-mood">動画の雰囲気</Label>
              <Input 
                id="video-mood" 
                placeholder="例: 面白い, 感動, 解説"
                value={videoMood}
                onChange={(e) => setVideoMood(e.target.value)}
              />
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
                <CardTitle>タイトル案</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiTitles.map((title, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors">
                    <span className="flex-1 text-sm">{title}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTitleSelect(title)}
                        aria-label={`タイトル案${index + 1}を選択`}
                      >
                        選択
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(title, `title-${index}`)}
                        aria-label={`タイトル案${index + 1}をコピー`}
                      >
                        {copiedItem === `title-${index}` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
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
          {/* 左側: 入力フォーム（50%） */}
          <aside className="w-full lg:w-1/2 border-r border-[#4A4A4A] bg-[#1A1A1A] overflow-y-auto">
            {controlPanelContent}
          </aside>

          {/* 右側: 生成結果（50%） */}
          <main className="w-full lg:w-1/2 p-4 bg-[#1A1A1A] overflow-y-auto">
            {resultsDisplayContent}
          </main>
        </>
      ) : (
        <div className="border-b bg-background p-4">
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
        </div>
      )}
    </div>
  );
}