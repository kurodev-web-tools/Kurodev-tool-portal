'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Loader2,
  RefreshCw,
  FileCode,
  Eye,
  Plus,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { TitleOptionsList } from './TitleOptionsList';
import { HashtagManager } from './HashtagManager';
import { DescriptionEditor } from './DescriptionEditor';
import type { TitleOption } from '@/types/title-generator';
import type { DescriptionTemplate } from '../types/storage';

const YOUTUBE_DESCRIPTION_LIMIT = 5000;

interface TitleResultsDisplayProps {
  // 再生成ボタン
  isLoading: boolean;
  isRegeneratingTitles: boolean;
  isRegeneratingDescription: boolean;
  onRegenerateTitles: () => void;
  onRegenerateDescription: () => void;
  // 最終編集エリア
  finalTitle: string;
  finalDescription: string;
  onFinalTitleChange: (value: string) => void;
  onFinalDescriptionChange: (value: string) => void;
  // 概要欄テンプレート
  presetTemplates: DescriptionTemplate[];
  customTemplates: DescriptionTemplate[];
  selectedTemplateId: string;
  showTemplatePreview: boolean;
  onSelectedTemplateIdChange: (templateId: string) => void;
  onShowTemplatePreviewChange: (show: boolean) => void;
  onApplyTemplate: (templateId: string) => void;
  // ハッシュタグ管理
  hashtags: string[];
  newHashtagInput: string;
  keywords: string;
  videoTheme: string;
  isClient: boolean;
  onNewHashtagInputChange: (value: string) => void;
  onAddHashtag: (tag: string) => void;
  onRemoveHashtag: (tag: string) => void;
  onSaveHashtagToFavorites: (tag: string) => void;
  onLoadHashtagFavorites: () => string[];
  onSuggestHashtags: (keywords: string, videoTheme: string) => string[];
  onSetHashtags: (tags: string[]) => void;
  onUpdateDescriptionHashtags: (tags: string[]) => void;
  // AI提案エリア
  aiTitles: TitleOption[];
  aiDescription: string;
  descriptionViewMode: 'edit' | 'preview';
  onDescriptionViewModeChange: (mode: 'edit' | 'preview') => void;
  onAiDescriptionChange: (value: string) => void;
  copiedItem: string | null;
  regeneratingTitleId: string | null;
  onDragEnd: (result: any) => void;
  onToggleFavorite: (titleId: string, titleText: string) => void;
  onTitleSelect: (titleText: string) => void;
  onCopy: (text: string, titleId: string) => void;
  onRegenerateSingleTitle: (titleId: string, titleText: string) => void;
  onGenerateVariant: (baseTitleText: string) => void;
}

export function TitleResultsDisplay({
  isLoading,
  isRegeneratingTitles,
  isRegeneratingDescription,
  onRegenerateTitles,
  onRegenerateDescription,
  finalTitle,
  finalDescription,
  onFinalTitleChange,
  onFinalDescriptionChange,
  presetTemplates,
  customTemplates,
  selectedTemplateId,
  showTemplatePreview,
  onSelectedTemplateIdChange,
  onShowTemplatePreviewChange,
  onApplyTemplate,
  hashtags,
  newHashtagInput,
  keywords,
  videoTheme,
  isClient,
  onNewHashtagInputChange,
  onAddHashtag,
  onRemoveHashtag,
  onSaveHashtagToFavorites,
  onLoadHashtagFavorites,
  onSuggestHashtags,
  onSetHashtags,
  onUpdateDescriptionHashtags,
  aiTitles,
  aiDescription,
  descriptionViewMode,
  onDescriptionViewModeChange,
  onAiDescriptionChange,
  copiedItem,
  regeneratingTitleId,
  onDragEnd,
  onToggleFavorite,
  onTitleSelect,
  onCopy,
  onRegenerateSingleTitle,
  onGenerateVariant,
}: TitleResultsDisplayProps) {
  const allTemplates = [...presetTemplates, ...customTemplates];

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(finalTitle);
    toast.success('タイトルをコピーしました');
  };

  const handleCopyDescription = () => {
    navigator.clipboard.writeText(finalDescription);
    toast.success('概要欄をコピーしました');
  };

  const handleSetPresetHashtags = (preset: string[]) => {
    onSetHashtags(preset);
    onUpdateDescriptionHashtags(preset);
  };

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 space-y-4 relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mb-4">
        <h2 className="text-2xl font-semibold">生成結果</h2>
        {/* 再生成ボタンセクション */}
        {aiTitles.length > 0 || aiDescription ? (
          <div className="flex flex-col sm:flex-row gap-2">
            {aiTitles.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRegenerateTitles}
                disabled={isRegeneratingTitles || isLoading}
              >
                {isRegeneratingTitles ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    再生成中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    タイトルのみ再生成
                  </>
                )}
              </Button>
            )}
            {aiDescription && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRegenerateDescription}
                disabled={isRegeneratingDescription || isLoading}
              >
                {isRegeneratingDescription ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    再生成中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    概要欄のみ再生成
                  </>
                )}
              </Button>
            )}
          </div>
        ) : null}
      </div>
      <Separator />
      <div className="flex-grow space-y-4 md:overflow-auto">
        {/* 最終編集エリア */}
        <Card>
          <CardHeader>
            <CardTitle>最終編集エリア</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 最終タイトル */}
            <div>
              <Label htmlFor="final-title">最終タイトル</Label>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    id="final-title"
                    placeholder="AIが生成したタイトル案"
                    value={finalTitle}
                    onChange={(e) => onFinalTitleChange(e.target.value)}
                    className="flex-1"
                  />
                )}
                <Button
                  variant="outline"
                  onClick={handleCopyTitle}
                  disabled={!finalTitle}
                  className="w-full md:w-auto"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  コピー
                </Button>
              </div>
            </div>

            {/* 最終概要欄 */}
            <div>
              <Label htmlFor="final-description">
                最終概要欄
                <span
                  className={cn(
                    'ml-2 text-xs font-normal',
                    finalDescription.length > YOUTUBE_DESCRIPTION_LIMIT
                      ? 'text-red-400'
                      : finalDescription.length > YOUTUBE_DESCRIPTION_LIMIT * 0.9
                        ? 'text-yellow-400'
                        : 'text-muted-foreground',
                  )}
                >
                  ({finalDescription.length} / {YOUTUBE_DESCRIPTION_LIMIT})
                </span>
              </Label>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                {isLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <Textarea
                    id="final-description"
                    placeholder="AIが生成した概要欄"
                    value={finalDescription}
                    onChange={(e) => onFinalDescriptionChange(e.target.value)}
                    rows={8}
                    className="resize-y flex-1"
                  />
                )}
                <Button
                  variant="outline"
                  onClick={handleCopyDescription}
                  disabled={!finalDescription}
                  className="w-full md:w-auto"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  コピー
                </Button>
              </div>
            </div>

            {/* 概要欄テンプレート選択 */}
            <div>
              <Label className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  概要欄テンプレート
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onShowTemplatePreviewChange(!showTemplatePreview)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  {showTemplatePreview ? 'プレビューを閉じる' : 'プレビュー'}
                </Button>
              </Label>

              <div className="flex gap-2 mb-2">
                <Select
                  value={selectedTemplateId}
                  onValueChange={onApplyTemplate}
                >
                  <SelectTrigger className="flex-1 truncate">
                    <SelectValue>
                      {(() => {
                        const selectedTemplate =
                          allTemplates.find((t) => t.id === selectedTemplateId) ||
                          presetTemplates[0];
                        if (!selectedTemplate) {
                          return <span>テンプレートを選択</span>;
                        }
                        return (
                          <>
                            <span className="md:hidden">{selectedTemplate.name}</span>
                            <span className="hidden md:inline truncate">
                              {selectedTemplate.name}
                              {selectedTemplate.description && (
                                <span className="text-muted-foreground ml-1">
                                  ({selectedTemplate.description})
                                </span>
                              )}
                            </span>
                          </>
                        );
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      プリセット
                    </div>
                    {presetTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {template.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                    {customTemplates.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                          カスタム
                        </div>
                        {customTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {template.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>カスタムテンプレートを作成</DialogTitle>
                      <DialogDescription>
                        新しい概要欄テンプレートを作成します
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="template-name">テンプレート名</Label>
                        <Input
                          id="template-name"
                          placeholder="例: ゲーム実況用（カスタム）"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="template-description">説明</Label>
                        <Input
                          id="template-description"
                          placeholder="このテンプレートの説明"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>セクション構成</Label>
                        <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                          <p>
                            現在のテンプレート機能では、プリセットテンプレートの選択と適用が可能です。
                          </p>
                          <p>カスタムテンプレートの作成機能は次回実装予定です。</p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* テンプレートプレビュー */}
              {showTemplatePreview && (() => {
                const template =
                  allTemplates.find((t) => t.id === selectedTemplateId) ||
                  presetTemplates[0];
                return (
                  <Card className="mb-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        テンプレート構造: {template.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-xs text-muted-foreground mb-2">
                        {template.description}
                      </div>
                      {template.sections
                        .filter((s: { enabled: boolean }) => s.enabled)
                        .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
                        .map((section: { type: string; title?: string; order: number }, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs p-2 bg-muted/30 rounded"
                          >
                            <Badge variant="outline" className="text-[10px]">
                              {idx + 1}
                            </Badge>
                            <span className="font-medium">
                              {section.title ||
                                (section.type === 'summary'
                                  ? '動画の概要'
                                  : section.type)}
                            </span>
                            <span className="text-muted-foreground ml-auto">
                              {section.type}
                            </span>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                );
              })()}
            </div>

            {/* ハッシュタグ管理 */}
            <HashtagManager
              hashtags={hashtags}
              newHashtagInput={newHashtagInput}
              keywords={keywords}
              videoTheme={videoTheme}
              isClient={isClient}
              onNewHashtagInputChange={onNewHashtagInputChange}
              onAddHashtag={onAddHashtag}
              onRemoveHashtag={onRemoveHashtag}
              onSaveToFavorites={onSaveHashtagToFavorites}
              onLoadFavorites={onLoadHashtagFavorites}
              onSuggestHashtags={onSuggestHashtags}
              onSetPreset={handleSetPresetHashtags}
            />
          </CardContent>
        </Card>

        {/* AI提案エリア */}
        <h3 className="text-xl font-semibold">AI提案エリア</h3>
        {isLoading ? (
          <div className="space-y-4">
            <div className="w-full h-full bg-[#2D2D2D] rounded-md flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
              <Loader2
                className="w-16 h-16 text-[#A0A0A0] mb-4 animate-spin"
                aria-hidden="true"
              />
              <h3 className="text-xl font-semibold text-[#E0E0E0]">
                タイトルと概要欄を生成中...
              </h3>
              <p className="text-[#A0A0A0] mt-2">
                AIが最適なタイトルと概要欄を考えています。しばらくお待ちください。
              </p>
            </div>
            <div
              className="space-y-4"
              role="status"
              aria-label="タイトルと概要欄生成中"
            >
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : (
          <>
            <TitleOptionsList
              titles={aiTitles}
              keywords={keywords}
              copiedItem={copiedItem}
              regeneratingTitleId={regeneratingTitleId}
              isRegeneratingTitles={isRegeneratingTitles}
              onDragEnd={onDragEnd}
              onToggleFavorite={onToggleFavorite}
              onSelect={onTitleSelect}
              onCopy={onCopy}
              onRegenerateSingle={onRegenerateSingleTitle}
              onGenerateVariant={onGenerateVariant}
            />
            
            {/* AI生成概要欄 */}
            {aiDescription && (
              <DescriptionEditor
                description={aiDescription}
                viewMode={descriptionViewMode}
                onViewModeChange={onDescriptionViewModeChange}
                onDescriptionChange={onAiDescriptionChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
