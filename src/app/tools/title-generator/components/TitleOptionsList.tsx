import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Star,
  GripVertical,
  Copy,
  Check,
  AlertCircle,
  TrendingUp,
  Loader2,
  RefreshCw,
  Wand2,
  MoreVertical,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import type { TitleOption } from '@/types/title-generator';

const YOUTUBE_TITLE_RECOMMENDED_LENGTH = 60;

interface TitleAnalysis {
  charCount: number;
  keywordCoverage: number;
  features: string[];
  score: number;
  clickRateScore: number;
  isOverRecommended: boolean;
}

interface TitleOptionsListProps {
  titles: TitleOption[];
  keywords: string;
  copiedItem: string | null;
  regeneratingTitleId: string | null;
  isRegeneratingTitles: boolean;
  onDragEnd: (result: DropResult) => void;
  onToggleFavorite: (titleId: string, titleText: string) => void;
  onSelect: (title: string) => void;
  onCopy: (text: string, id: string) => void;
  onRegenerateSingle: (titleId: string, currentText: string) => void;
  onGenerateVariant: (baseTitleText: string) => void;
}

/**
 * タイトル分析関数
 */
function analyzeTitle(title: string, inputKeywords: string): TitleAnalysis {
  const charCount = title.length;
  const keywordList = inputKeywords
    .split(/[,、，]/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  // キーワード含有率の計算
  let keywordMatches = 0;
  keywordList.forEach((keyword) => {
    if (title.toLowerCase().includes(keyword.toLowerCase())) {
      keywordMatches++;
    }
  });
  const keywordCoverage =
    keywordList.length > 0
      ? Math.round((keywordMatches / keywordList.length) * 100)
      : 0;

  // 特徴タグの検出
  const features: string[] = [];
  if (title.includes('【') && title.includes('】')) {
    features.push('構造化');
  }
  if (title.includes('！') || title.includes('!')) {
    features.push('キャッチー');
  }
  if (title.includes('？') || title.includes('?')) {
    features.push('疑問形');
  }
  if (keywordCoverage >= 50) {
    features.push('キーワード豊富');
  }
  if (charCount <= YOUTUBE_TITLE_RECOMMENDED_LENGTH && charCount >= 30) {
    features.push('最適長');
  }
  if (charCount > YOUTUBE_TITLE_RECOMMENDED_LENGTH) {
    features.push('長文');
  }
  if (charCount < 30) {
    features.push('短文');
  }

  // 評価スコアの計算（0-100点）
  let score = 0;
  // 文字数スコア（30-60文字が最適: 40点満点）
  if (charCount >= 30 && charCount <= YOUTUBE_TITLE_RECOMMENDED_LENGTH) {
    score += 40;
  } else if (charCount > YOUTUBE_TITLE_RECOMMENDED_LENGTH && charCount <= 70) {
    score += 30; // 少し長いが許容範囲
  } else if (charCount > 70) {
    score += 10; // 長すぎる
  } else if (charCount >= 20 && charCount < 30) {
    score += 25; // やや短い
  } else {
    score += 10; // 短すぎる
  }

  // キーワード含有率スコア（30点満点）
  score += Math.round((keywordCoverage / 100) * 30);

  // 特徴タグスコア（30点満点）
  let featureScore = 0;
  if (features.includes('構造化')) featureScore += 10;
  if (features.includes('キャッチー')) featureScore += 10;
  if (features.includes('最適長')) featureScore += 10;
  score += Math.min(featureScore, 30);

  return {
    charCount,
    keywordCoverage,
    features,
    score: Math.min(score, 100),
    clickRateScore: Math.round(score * 0.8),
    isOverRecommended: charCount > YOUTUBE_TITLE_RECOMMENDED_LENGTH,
  };
}

export function TitleOptionsList({
  titles,
  keywords,
  copiedItem,
  regeneratingTitleId,
  isRegeneratingTitles,
  onDragEnd,
  onToggleFavorite,
  onSelect,
  onCopy,
  onRegenerateSingle,
  onGenerateVariant,
}: TitleOptionsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>タイトル案</span>
          {titles.length > 0 && (
            <span className="text-xs text-muted-foreground font-normal">
              {titles.filter((t) => t.isFavorite).length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {titles.filter((t) => t.isFavorite).length}件お気に入り
                </Badge>
              )}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {titles.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            タイトル案がありません
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="title-options">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {titles.map((titleOption, index) => {
                    const analysis = analyzeTitle(titleOption.text, keywords);
                    return (
                      <Draggable
                        key={titleOption.id}
                        draggableId={titleOption.id}
                        index={index}
                        isDragDisabled={titleOption.isFavorite} // お気に入りは固定
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              'flex items-center gap-2 p-3 border rounded-md transition-all',
                              titleOption.isFavorite
                                ? 'bg-[#2D2D2D] border-[#20B2AA]/50'
                                : 'hover:bg-accent/50',
                              snapshot.isDragging &&
                                'shadow-lg opacity-90 bg-[#3A3A3A]',
                              titleOption.isFavorite &&
                                'border-l-4 border-l-[#20B2AA]',
                            )}
                          >
                            {/* ドラッグハンドル（デスクトップのみ表示） */}
                            {!titleOption.isFavorite && (
                              <div
                                {...provided.dragHandleProps}
                                className="hidden md:flex flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                                aria-label="ドラッグして並び替え"
                              >
                                <GripVertical className="h-4 w-4" />
                              </div>
                            )}

                            {/* お気に入りボタン */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                'flex-shrink-0 h-8 w-8 p-0',
                                titleOption.isFavorite && 'text-[#20B2AA]',
                              )}
                              onClick={() =>
                                onToggleFavorite(titleOption.id, titleOption.text)
                              }
                              aria-label={
                                titleOption.isFavorite
                                  ? 'お気に入りを解除'
                                  : 'お気に入りに追加'
                              }
                            >
                              <Star
                                className={cn(
                                  'h-4 w-4',
                                  titleOption.isFavorite
                                    ? 'fill-[#20B2AA] text-[#20B2AA]'
                                    : '',
                                )}
                              />
                            </Button>

                            {/* タイトルと分析情報 */}
                            <div className="flex-1 min-w-0">
                              {/* タイトルテキスト */}
                              <span
                                className={cn(
                                  'block text-sm mb-2',
                                  titleOption.isFavorite && 'font-medium',
                                )}
                              >
                                {titleOption.text}
                              </span>

                              {/* 分析情報 */}
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                {/* モバイル: 主要情報のみ表示 */}
                                <div className="flex items-center gap-2 md:hidden">
                                  {/* 文字数表示 */}
                                  <div className="flex items-center gap-1">
                                    <span
                                      className={cn(
                                        'font-medium',
                                        analysis.isOverRecommended
                                          ? 'text-yellow-400'
                                          : analysis.charCount >= 30 &&
                                              analysis.charCount <=
                                                YOUTUBE_TITLE_RECOMMENDED_LENGTH
                                            ? 'text-green-400'
                                            : 'text-muted-foreground',
                                      )}
                                    >
                                      {analysis.charCount}文字
                                    </span>
                                    {analysis.isOverRecommended && (
                                      <AlertCircle className="h-3 w-3 text-yellow-400" />
                                    )}
                                  </div>
                                  {/* 評価スコア */}
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">
                                      スコア:
                                    </span>
                                    <span
                                      className={cn(
                                        'font-semibold',
                                        analysis.score >= 80
                                          ? 'text-green-400'
                                          : analysis.score >= 60
                                            ? 'text-yellow-400'
                                            : 'text-red-400',
                                      )}
                                    >
                                      {analysis.score}
                                    </span>
                                    <span className="text-muted-foreground text-[10px]">
                                      /100
                                    </span>
                                  </div>
                                </div>

                                {/* デスクトップ: すべての情報を表示 */}
                                <div className="hidden md:flex md:flex-wrap md:items-center md:gap-2">
                                  {/* 文字数表示 */}
                                  <div className="flex items-center gap-1">
                                    <span
                                      className={cn(
                                        'font-medium',
                                        analysis.isOverRecommended
                                          ? 'text-yellow-400'
                                          : analysis.charCount >= 30 &&
                                              analysis.charCount <=
                                                YOUTUBE_TITLE_RECOMMENDED_LENGTH
                                            ? 'text-green-400'
                                            : 'text-muted-foreground',
                                      )}
                                    >
                                      {analysis.charCount}文字
                                    </span>
                                    {analysis.isOverRecommended && (
                                      <AlertCircle className="h-3 w-3 text-yellow-400" />
                                    )}
                                    {analysis.charCount >= 30 &&
                                      analysis.charCount <=
                                        YOUTUBE_TITLE_RECOMMENDED_LENGTH && (
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] px-1.5 py-0 h-4 border-green-400/50 text-green-400"
                                        >
                                          推奨
                                        </Badge>
                                      )}
                                  </div>

                                  {/* キーワード含有率 */}
                                  {keywords.trim() && (
                                    <div className="flex items-center gap-1">
                                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-muted-foreground">
                                        キーワード: {analysis.keywordCoverage}%
                                      </span>
                                      {analysis.keywordCoverage >= 50 && (
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] px-1.5 py-0 h-4 border-blue-400/50 text-blue-400"
                                        >
                                          高
                                        </Badge>
                                      )}
                                    </div>
                                  )}

                                  {/* 特徴タグ */}
                                  {analysis.features.length > 0 && (
                                    <div className="flex items-center gap-1 flex-wrap">
                                      {analysis.features.map((feature, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="text-[10px] px-1.5 py-0 h-4"
                                        >
                                          {feature}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}

                                  {/* 評価スコア */}
                                  <div className="flex items-center gap-1 ml-auto">
                                    <span className="text-muted-foreground">
                                      スコア:
                                    </span>
                                    <span
                                      className={cn(
                                        'font-semibold',
                                        analysis.score >= 80
                                          ? 'text-green-400'
                                          : analysis.score >= 60
                                            ? 'text-yellow-400'
                                            : 'text-red-400',
                                      )}
                                    >
                                      {analysis.score}
                                    </span>
                                    <span className="text-muted-foreground text-[10px]">
                                      /100
                                    </span>
                                    {/* 星評価 */}
                                    <div className="flex gap-0.5 ml-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={cn(
                                            'h-2.5 w-2.5',
                                            i < Math.round(analysis.score / 20)
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'text-muted-foreground/30',
                                          )}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* アクションボタン */}
                            <div className="flex gap-2 flex-shrink-0">
                              {/* 主要ボタン（モバイル・デスクトップ共通） */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onSelect(titleOption.text)}
                                aria-label={`タイトル案${index + 1}を選択`}
                              >
                                選択
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  onCopy(titleOption.text, titleOption.id)
                                }
                                aria-label={`タイトル案${index + 1}をコピー`}
                              >
                                {copiedItem === titleOption.id ? (
                                  <Check className="h-4 w-4 text-[#20B2AA]" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              {/* デスクトップ: すべてのボタンを表示 */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRegenerateSingle(
                                    titleOption.id,
                                    titleOption.text,
                                  );
                                }}
                                disabled={regeneratingTitleId === titleOption.id}
                                aria-label={`タイトル案${index + 1}を再生成`}
                                title="このタイトル案を再生成"
                                className="hidden md:flex"
                              >
                                {regeneratingTitleId === titleOption.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onGenerateVariant(titleOption.text);
                                }}
                                disabled={isRegeneratingTitles}
                                aria-label={`タイトル案${index + 1}をもとに別パターンを生成`}
                                title="この案をもとに別パターンを生成"
                                className="hidden md:flex"
                              >
                                {isRegeneratingTitles ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Wand2 className="h-4 w-4" />
                                )}
                              </Button>
                              {/* モバイル: ドロップダウンメニューで追加オプションを表示 */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="md:hidden"
                                    aria-label="その他のオプション"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-[#2D2D2D] border-[#4A4A4A] shadow-lg"
                                >
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRegenerateSingle(
                                        titleOption.id,
                                        titleOption.text,
                                      );
                                    }}
                                    disabled={
                                      regeneratingTitleId === titleOption.id
                                    }
                                  >
                                    {regeneratingTitleId === titleOption.id ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        再生成中...
                                      </>
                                    ) : (
                                      <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        このタイトル案を再生成
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onGenerateVariant(titleOption.text);
                                    }}
                                    disabled={isRegeneratingTitles}
                                  >
                                    {isRegeneratingTitles ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        生成中...
                                      </>
                                    ) : (
                                      <>
                                        <Wand2 className="mr-2 h-4 w-4" />
                                        別パターンを生成
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </CardContent>
    </Card>
  );
}
