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
import { Lightbulb, Construction, Loader2, FileText, Gamepad2, Music, MessageCircle, Users, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useSidebar } from '@/hooks/use-sidebar';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sidebar, SidebarToggle } from '@/components/layouts/Sidebar';
import { logger } from '@/lib/logger';

type IdeaCategory = 'gaming' | 'singing' | 'talk' | 'collaboration' | 'event' | 'other';
type IdeaDifficulty = 'easy' | 'medium' | 'hard';

interface Idea {
  id: number;
  title: string;
  description: string;
  points: string[];
  category: IdeaCategory;
  estimatedDuration: number; // 予想配信時間（分）
  difficulty?: IdeaDifficulty;
  thumbnail?: string; // サムネイル画像URL（オプション）
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

interface Script {
  ideaId: number;
  content: string;
  introduction: string;
  body: string;
  conclusion: string;
}

export default function ScriptGeneratorPage() {
  const [generatedIdeas, setGeneratedIdeas] = useState<Idea[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null);
  const [currentScript, setCurrentScript] = useState<Script | null>(null);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
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

  const handleGenerate = useCallback(async () => {
    setIsGeneratingIdeas(true);
    await handleAsyncError(async () => {
      // モック処理
      await new Promise(resolve => setTimeout(resolve, 1000));
    setGeneratedIdeas(dummyIdeas);
    setSelectedIdeaId(null);
    }, "企画案生成中にエラーが発生しました");
    setIsGeneratingIdeas(false);
  }, [handleAsyncError]);

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

  const handleGenerateScript = useCallback(async (idea: Idea) => {
    setIsGeneratingScript(true);
    await handleAsyncError(async () => {
      // モック処理
      await new Promise(resolve => setTimeout(resolve, 1500));
      const script: Script = {
        ideaId: idea.id,
        content: `【${idea.title}】\n\n${dummyScript.introduction}\n\n${idea.description}\n\n${dummyScript.body}\n\n${dummyScript.conclusion}`,
        introduction: dummyScript.introduction,
        body: dummyScript.body,
        conclusion: dummyScript.conclusion,
      };
      setCurrentScript(script);
      setSelectedIdeaId(idea.id);
      logger.debug('台本生成完了', { ideaTitle: idea.title, scriptLength: script.content.length }, 'ScriptGenerator');
    }, "台本生成中にエラーが発生しました");
    setIsGeneratingScript(false);
  }, [handleAsyncError]);

  const renderControlPanel = useCallback(() => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="keywords-mobile">キーワード</Label>
        <Input id="keywords-mobile" placeholder="例: ゲーム実況、マリオカート" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="direction-mobile">企画の方向性</Label>
        <Select>
          <SelectTrigger id="direction-mobile">
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
    </div>
  ), [isGeneratingIdeas, handleGenerate]);

  // モバイル用のサイドバーコンテンツ（ペルソナと履歴のみ）
  const mobileSidebarContent = useMemo(() => (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="persona">ペルソナ</TabsTrigger>
        <TabsTrigger value="history">履歴</TabsTrigger>
      </TabsList>
      <TabsContent value="persona" className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="persona-select-mobile">使用するペルソナ</Label>
          <Select>
            <SelectTrigger id="persona-select-mobile">
              <SelectValue placeholder="ペルソナを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">デフォルト</SelectItem>
              <SelectItem value="energetic">エネルギッシュ</SelectItem>
              <SelectItem value="calm">落ち着いた</SelectItem>
              <SelectItem value="funny">面白い</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="persona-desc-mobile">ペルソナの特徴</Label>
          <Textarea 
            id="persona-desc-mobile"
            placeholder="ペルソナの特徴や話し方を記述..."
            className="min-h-[100px]"
          />
        </div>
      </TabsContent>
      <TabsContent value="history" className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label>生成履歴</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <p className="text-sm text-muted-foreground">生成履歴がここに表示されます</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  ), [selectedTab]);

  const sidebarContent = useMemo(() => (
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
        <Button variant="outline" className="w-full">ペルソナを管理する</Button>
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
  ), [selectedTab, handleGenerate, isGeneratingIdeas]);

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
          <div className="space-y-4">
            <div className="w-full h-full bg-[#2D2D2D] rounded-md flex flex-col items-center justify-center text-center p-8 min-h-[600px]">
              <Loader2 className="w-16 h-16 text-[#A0A0A0] mb-4 animate-spin" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-[#E0E0E0]">企画案を生成中...</h3>
              <p className="text-[#A0A0A0] mt-2">AIがあなたにぴったりの企画案を考えています。しばらくお待ちください。</p>
            </div>
            {/* ローディング中のスケルトン */}
            <div className="space-y-4" role="status" aria-label="企画案を生成中">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : generatedIdeas.length === 0 ? (
          <div className="w-full h-full bg-[#2D2D2D] rounded-md flex flex-col items-center justify-center text-center p-8 min-h-[600px]">
            <Lightbulb className="w-16 h-16 text-[#A0A0A0] mb-4" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-[#E0E0E0]">企画案を生成しよう！</h3>
            <p className="text-[#A0A0A0] mt-2">サイドパネルからキーワードや企画の方向性を入力して、「企画案を生成する」ボタンを押してください。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {generatedIdeas.map((idea) => {
              const category = categoryConfig[idea.category];
              const CategoryIcon = category.icon;
              
              return (
                <React.Fragment key={idea.id}>
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all relative overflow-hidden",
                      "hover:border-primary hover:shadow-lg hover:shadow-primary/20",
                      selectedIdeaId === idea.id && "border-primary shadow-md",
                      // グラデーション背景
                      `bg-gradient-to-br ${category.gradient}`,
                      // カテゴリごとの左側ボーダー
                      `border-l-4 ${category.borderColor}`
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
                    <CardHeader className="pb-3">
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
                            <CardTitle className="text-lg font-semibold line-clamp-2 text-[#E0E0E0]">
                              {idea.title}
                            </CardTitle>
                            {/* 予想配信時間 */}
                            <Badge variant="outline" className="flex-shrink-0 border-[#4A4A4A] text-[#A0A0A0]">
                              <Clock className="h-3 w-3 mr-1" />
                              {idea.estimatedDuration}分
                            </Badge>
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
                </React.Fragment>
              );
            })}
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
          {currentScript && selectedIdeaId === currentScript.ideaId ? (
            <Card className="bg-[#2D2D2D]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-[#E0E0E0]">
                  <FileText className="h-5 w-5" />
                  台本プレビュー
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm whitespace-pre-wrap">
                <div>
                  <h5 className="font-bold mb-2 text-[#E0E0E0]">【導入】</h5>
                  <p className="text-[#A0A0A0] leading-relaxed">{currentScript.introduction}</p>
                </div>
                <div>
                  <h5 className="font-bold mb-2 text-[#E0E0E0]">【本題】</h5>
                  <p className="text-[#A0A0A0] leading-relaxed">{currentScript.body}</p>
                </div>
                <div>
                  <h5 className="font-bold mb-2 text-[#E0E0E0]">【結論】</h5>
                  <p className="text-[#A0A0A0] leading-relaxed">{currentScript.conclusion}</p>
                </div>
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
      {!isDesktop && currentScript && selectedIdeaId === currentScript.ideaId && (
        <div className="p-4 border-t border-[#4A4A4A] lg:hidden bg-[#1A1A1A]">
          <Card className="bg-[#2D2D2D]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#E0E0E0]">
                <FileText className="h-5 w-5" />
                台本プレビュー
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm whitespace-pre-wrap">
              <div>
                <h5 className="font-bold mb-2 text-[#E0E0E0]">【導入】</h5>
                <p className="text-[#A0A0A0] leading-relaxed">{currentScript.introduction}</p>
              </div>
              <div>
                <h5 className="font-bold mb-2 text-[#E0E0E0]">【本題】</h5>
                <p className="text-[#A0A0A0] leading-relaxed">{currentScript.body}</p>
              </div>
              <div>
                <h5 className="font-bold mb-2 text-[#E0E0E0]">【結論】</h5>
                <p className="text-[#A0A0A0] leading-relaxed">{currentScript.conclusion}</p>
              </div>
            </CardContent>
          </Card>
        </div>
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
            { id: "history", label: "履歴", icon: <FileText className="h-4 w-4" /> }
          ]}
          onTabClick={setSelectedTab}
        />
      )}
    </div>
  );
}
