'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  Play, 
  Download, 
  Star, 
  Eye, 
  RefreshCw, 
  Zap,
  Palette,
  Type,
  Layout,
  Target,
  Gauge
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  TemplateGeneratorFactory, 
  AutoGenerationConfig, 
  GenerationResult,
  DEFAULT_AUTO_GENERATION_CONFIG 
} from '../services/TemplateAutoGenerator';
import { ThumbnailTemplate } from './TemplateSelector';

interface AutoGenerationPanelProps {
  onTemplateGenerated: (template: ThumbnailTemplate) => void;
  onTemplatesGenerated: (templates: ThumbnailTemplate[]) => void;
}

export const AutoGenerationPanel: React.FC<AutoGenerationPanelProps> = ({
  onTemplateGenerated,
  onTemplatesGenerated,
}) => {
  const [config, setConfig] = useState<AutoGenerationConfig>(DEFAULT_AUTO_GENERATION_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTemplates, setGeneratedTemplates] = useState<GenerationResult[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<GenerationResult | null>(null);
  const [generationCount, setGenerationCount] = useState(1);

  // 設定更新
  const updateConfig = (updates: Partial<AutoGenerationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateTarget = (updates: Partial<AutoGenerationConfig['target']>) => {
    setConfig(prev => ({
      ...prev,
      target: { ...prev.target, ...updates }
    }));
  };

  const updateParameters = (updates: Partial<AutoGenerationConfig['parameters']>) => {
    setConfig(prev => ({
      ...prev,
      parameters: { ...prev.parameters, ...updates }
    }));
  };

  const updateConstraints = (updates: Partial<AutoGenerationConfig['constraints']>) => {
    setConfig(prev => ({
      ...prev,
      constraints: { ...prev.constraints, ...updates }
    }));
  };

  const updateQuality = (updates: Partial<AutoGenerationConfig['quality']>) => {
    setConfig(prev => ({
      ...prev,
      quality: { ...prev.quality, ...updates }
    }));
  };

  // テンプレート生成
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generator = TemplateGeneratorFactory.createGenerator('rule-based', config);
      const results: GenerationResult[] = [];

      for (let i = 0; i < generationCount; i++) {
        const result = await generator.generate();
        results.push(result);
      }

      setGeneratedTemplates(results);
      toast.success(`${generationCount}個のテンプレートを生成しました！`);
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('テンプレート生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  // テンプレート選択
  const handleSelectTemplate = (result: GenerationResult) => {
    setSelectedTemplate(result);
    onTemplateGenerated(result.template);
    toast.success('テンプレートを選択しました！');
  };

  // 全テンプレート追加
  const handleAddAllTemplates = () => {
    const templates = generatedTemplates.map(result => result.template);
    onTemplatesGenerated(templates);
    toast.success(`${templates.length}個のテンプレートを追加しました！`);
  };

  // 設定リセット
  const handleResetConfig = () => {
    setConfig(DEFAULT_AUTO_GENERATION_CONFIG);
    toast.success('設定をリセットしました');
  };

  // スコア表示用の色
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 whitespace-nowrap">
            <Sparkles className="h-6 w-6 text-purple-500" />
            AI自動生成
          </h2>
          <p className="text-muted-foreground whitespace-nowrap">
            AIが自動でテンプレートを生成します
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetConfig}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            リセット
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="basic" className="text-xs sm:text-sm">基本設定</TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs sm:text-sm">詳細設定</TabsTrigger>
          <TabsTrigger value="results" className="text-xs sm:text-sm">生成結果</TabsTrigger>
        </TabsList>

        {/* 基本設定 */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                生成対象
              </CardTitle>
              <CardDescription>
                生成するテンプレートの基本情報を設定します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">カテゴリ</Label>
                  <Select
                    value={config.target.category}
                    onValueChange={(value) => updateTarget({ category: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gaming">ゲーミング</SelectItem>
                      <SelectItem value="talk">トーク</SelectItem>
                      <SelectItem value="singing">音楽</SelectItem>
                      <SelectItem value="collaboration">コラボ</SelectItem>
                      <SelectItem value="event">イベント</SelectItem>
                      <SelectItem value="custom">カスタム</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="style">スタイル</Label>
                  <Select
                    value={config.target.style}
                    onValueChange={(value) => updateTarget({ style: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cute">キュート</SelectItem>
                      <SelectItem value="cool">クール</SelectItem>
                      <SelectItem value="elegant">エレガント</SelectItem>
                      <SelectItem value="funny">ファニー</SelectItem>
                      <SelectItem value="simple">シンプル</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aspectRatio">アスペクト比</Label>
                  <Select
                    value={config.target.aspectRatio}
                    onValueChange={(value) => updateTarget({ aspectRatio: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">1:1 (正方形)</SelectItem>
                      <SelectItem value="4:3">4:3 (標準)</SelectItem>
                      <SelectItem value="16:9">16:9 (横長)</SelectItem>
                      <SelectItem value="9:16">9:16 (縦長)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty">難易度</Label>
                  <Select
                    value={config.target.difficulty}
                    onValueChange={(value) => updateTarget({ difficulty: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">初級</SelectItem>
                      <SelectItem value="intermediate">中級</SelectItem>
                      <SelectItem value="advanced">上級</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                生成設定
              </CardTitle>
              <CardDescription>
                生成するテンプレートの数と品質を設定します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="generationCount">生成数: {generationCount}個</Label>
                <Slider
                  value={[generationCount]}
                  onValueChange={(value) => setGenerationCount(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>複雑さ</Label>
                  <Select
                    value={config.quality.complexity}
                    onValueChange={(value) => updateQuality({ complexity: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">低</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="high">高</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>独自性</Label>
                  <Select
                    value={config.quality.uniqueness}
                    onValueChange={(value) => updateQuality({ uniqueness: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">低</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="high">高</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>トレンド性</Label>
                  <Select
                    value={config.quality.trendiness}
                    onValueChange={(value) => updateQuality({ trendiness: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">低</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="high">高</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="lg"
              className="px-8"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  テンプレート生成
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* 詳細設定 */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                カラーパレット
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="colorScheme">配色パターン</Label>
                <Select
                  value={config.parameters.colorScheme}
                  onValueChange={(value) => updateParameters({ colorScheme: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monochrome">モノクロ</SelectItem>
                    <SelectItem value="complementary">補色</SelectItem>
                    <SelectItem value="triadic">三色配色</SelectItem>
                    <SelectItem value="analogous">類似色</SelectItem>
                    <SelectItem value="random">ランダム</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                フォント設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fontStyle">フォントスタイル</Label>
                <Select
                  value={config.parameters.fontStyle}
                  onValueChange={(value) => updateParameters({ fontStyle: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">モダン</SelectItem>
                    <SelectItem value="classic">クラシック</SelectItem>
                    <SelectItem value="playful">プレイフル</SelectItem>
                    <SelectItem value="elegant">エレガント</SelectItem>
                    <SelectItem value="bold">ボールド</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                レイアウト設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="layoutType">レイアウトタイプ</Label>
                <Select
                  value={config.parameters.layoutType}
                  onValueChange={(value) => updateParameters({ layoutType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="centered">中央配置</SelectItem>
                    <SelectItem value="asymmetric">非対称</SelectItem>
                    <SelectItem value="grid">グリッド</SelectItem>
                    <SelectItem value="flow">フロー</SelectItem>
                    <SelectItem value="random">ランダム</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>オブジェクト数: {config.parameters.objectCount.preferred}個</Label>
                <Slider
                  value={[config.parameters.objectCount.preferred]}
                  onValueChange={(value) => updateParameters({ 
                    objectCount: { ...config.parameters.objectCount, preferred: value[0] }
                  })}
                  min={config.parameters.objectCount.min}
                  max={config.parameters.objectCount.max}
                  step={1}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 生成結果 */}
        <TabsContent value="results" className="space-y-6">
          {generatedTemplates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">テンプレートが生成されていません</h3>
                <p className="text-muted-foreground text-center">
                  基本設定タブでテンプレートを生成してください
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  生成結果 ({generatedTemplates.length}個)
                </h3>
                <Button onClick={handleAddAllTemplates} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  全て追加
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedTemplates.map((result, index) => (
                  <Card key={result.template.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{result.template.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {result.template.description}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          #{index + 1}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* スコア表示 */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>総合スコア</span>
                            <span className={`font-semibold ${getScoreColor(result.score.overall)}`}>
                              {result.score.overall}/100
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span>美学</span>
                              <span className={getScoreColor(result.score.aesthetics)}>
                                {result.score.aesthetics}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>使いやすさ</span>
                              <span className={getScoreColor(result.score.usability)}>
                                {result.score.usability}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>独自性</span>
                              <span className={getScoreColor(result.score.uniqueness)}>
                                {result.score.uniqueness}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>トレンド性</span>
                              <span className={getScoreColor(result.score.trendiness)}>
                                {result.score.trendiness}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* メタデータ */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{result.template.metadata.estimatedTime}分</span>
                          <span>{result.template.layout.objects.length}オブジェクト</span>
                        </div>

                        {/* アクションボタン */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectTemplate(result)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            選択
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Star className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>テンプレート詳細</DialogTitle>
                                <DialogDescription>
                                  {result.template.name}の詳細情報と改善提案
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold mb-2">スコア詳細</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span>総合スコア</span>
                                        <span className={getScoreColor(result.score.overall)}>
                                          {result.score.overall}/100
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>美学</span>
                                        <span className={getScoreColor(result.score.aesthetics)}>
                                          {result.score.aesthetics}/100
                                        </span>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span>使いやすさ</span>
                                        <span className={getScoreColor(result.score.usability)}>
                                          {result.score.usability}/100
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>独自性</span>
                                        <span className={getScoreColor(result.score.uniqueness)}>
                                          {result.score.uniqueness}/100
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">改善提案</h4>
                                  <ul className="space-y-1">
                                    {result.suggestions.map((suggestion, index) => (
                                      <li key={index} className="text-sm text-muted-foreground">
                                        • {suggestion}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">生成情報</h4>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <div>生成時間: {result.metadata.generationTime}ms</div>
                                    <div>アルゴリズム: {result.metadata.algorithm}</div>
                                    <div>バージョン: {result.metadata.version}</div>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
