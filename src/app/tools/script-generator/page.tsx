'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Construction } from 'lucide-react';
import { useSidebar } from '@/hooks/use-sidebar';
import { useErrorHandler } from '@/hooks/use-error-handler';
// validateRequired and cn are imported but not used in this simplified version
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sidebar, SidebarToggle } from '@/components/layouts/Sidebar';

interface Idea {
  id: number;
  title: string;
  description: string;
  points: string[];
}

const dummyIdeas: Idea[] = [
  {
    id: 1,
    title: '超絶高難易度ゲームに初見で挑戦！',
    description: '視聴者から寄せられた「絶対にクリアできない」と噂のゲームに、何の予備知識もなく挑戦します。絶叫と感動のドラマが生まれること間違いなし！',
    points: ['リアクション芸が光る', '視聴者との一体感が生まれる', '切り抜き動画映えする'],
  },
  {
    id: 2,
    title: '視聴者参加型！みんなで決める歌枠セットリスト',
    description: '配信中にアンケート機能を使って、次に歌う曲を視聴者に決めてもらうインタラクティブな歌枠。定番曲から意外な曲まで、何が飛び出すか分からない！',
    points: ['ファンサービス満点', 'コメントが盛り上がる', 'アーカイブの再生数も期待できる'],
  },
  {
    id: 3,
    title: '完全オリジナル！自作ゲームお披露目会',
    description: '数ヶ月かけて制作した自作ゲームを、ファンと一緒についにプレイ！開発秘話や裏話を交えながら、感動のエンディングを目指す。',
    points: ['クリエイターとしての一面を見せられる', '独自性が高い', '記念配信に最適'],
  },
];

const dummyScript = {
  introduction: '皆さん、こんにちは！〇〇です！今日の配信は、なんと…！',
  body: '（ここでゲームプレイや企画の本編）\nいやー、これは難しい！でも、みんなの応援があるから頑張れる！',
  conclusion: 'というわけで、今日の配信はここまで！たくさんのコメント、スパチャありがとう！次回もまた見てね！おつ〇〇～！',
};

export default function ScriptGeneratorPage() {
  const [generatedIdeas, setGeneratedIdeas] = useState<Idea[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null);
  const { isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen, isDesktop } = useSidebar({
    defaultOpen: false,
    desktopDefaultOpen: true,
  });
  const [selectedTab, setSelectedTab] = useState("generate");
  const { handleAsyncError } = useErrorHandler();

  const handleGenerate = async () => {
    await handleAsyncError(async () => {
      // モック処理
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGeneratedIdeas(dummyIdeas);
      setSelectedIdeaId(null);
    }, "企画案生成中にエラーが発生しました");
  };

  const handleCardClick = (id: number) => {
    setSelectedIdeaId(prevId => prevId === id ? null : id);
  };

  const renderControlPanel = () => (
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
        <Button className="w-full" onClick={handleGenerate}>企画案を生成する</Button>
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
        <Button variant="secondary" className="w-full">ペルソナを管理する</Button>
      </TabsContent>
      <TabsContent value="history" className="mt-4 space-y-2">
        <p className="text-sm text-muted-foreground">過去に生成した企画案:</p>
        <div className="border rounded-md p-2 hover:bg-accent cursor-pointer">
          <p className="font-semibold">超絶高難易度ゲームに初見で挑戦！</p>
        </div>
        <div className="border rounded-md p-2 hover:bg-accent cursor-pointer">
          <p className="font-semibold">視聴者参加型！みんなで決める歌枠セットリスト</p>
        </div>
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="relative flex flex-col lg:flex-row lg:h-[calc(100vh-4.1rem)]">
      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">プレビューエリア</h2>
        {generatedIdeas.length === 0 ? (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-800 rounded-md flex flex-col items-center justify-center text-center p-8 min-h-[600px]">
            <Lightbulb className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">企画案を生成しよう！</h3>
            <p className="text-gray-500 mt-2">サイドパネルからキーワードや企画の方向性を入力して、「企画案を生成する」ボタンを押してください。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {generatedIdeas.map((idea) => (
              <React.Fragment key={idea.id}>
                <Card 
                  className="cursor-pointer hover:border-primary transition-all"
                  onClick={() => handleCardClick(idea.id)}
                >
                  <CardHeader>
                    <CardTitle>{idea.title}</CardTitle>
                    <CardDescription>{idea.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold text-sm mb-2">おすすめポイント</h4>
                    <div className="flex flex-wrap gap-2">
                      {idea.points.map((point: string, index: number) => (
                        <Badge key={index} variant="secondary">{point}</Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button variant="outline">この企画を調整</Button>
                    <Button>台本を生成する</Button>
                  </CardFooter>
                </Card>
                {selectedIdeaId === idea.id && (
                  <Card className="bg-gray-50 dark:bg-gray-900">
                    <CardHeader>
                      <CardTitle className="text-lg">台本骨子</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm whitespace-pre-wrap">
                      <div>
                        <h5 className="font-bold mb-1">【導入】</h5>
                        <p className="text-muted-foreground">{dummyScript.introduction}</p>
                      </div>
                      <div>
                        <h5 className="font-bold mb-1">【本題】</h5>
                        <p className="text-muted-foreground">{dummyScript.body}</p>
                      </div>
                      <div>
                        <h5 className="font-bold mb-1">【結論】</h5>
                        <p className="text-muted-foreground">{dummyScript.conclusion}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </main>

      {/* Mobile Controls */}
      <div className="p-4 border-t lg:hidden">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="controls">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Construction className="h-5 w-5" />
                <span>コントロールパネル</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              {renderControlPanel()}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Overlay for mobile sidebar */}
      {!isDesktop && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title="コントロールパネル"
        isDesktop={isDesktop}
        className={!isDesktop ? 'hidden' : ''}
      >
        {renderControlPanel()}
      </Sidebar>

      {/* Sidebar Toggle Button for Desktop */}
      <SidebarToggle 
        onOpen={() => setIsSidebarOpen(true)}
        isDesktop={isDesktop}
      />
    </div>
  );
}
