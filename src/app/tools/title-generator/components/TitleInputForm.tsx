import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Controller, type UseFormReturn } from 'react-hook-form';
import type { TitleGenerationFormValues } from '@/types/title-generator';

// バリデーション制限
const VIDEO_THEME_MIN_LENGTH = 10;
const VIDEO_THEME_MAX_LENGTH = 500;
const KEYWORDS_MAX_LENGTH = 100;
const TARGET_AUDIENCE_MAX_LENGTH = 100;
const VIDEO_MOOD_MAX_LENGTH = 100;

interface TitleInputFormProps {
  form: UseFormReturn<TitleGenerationFormValues>;
  videoTheme: string;
  keywords: string;
  targetAudience: string;
  videoMood: string;
  videoThemeError: { message?: string; suggestion?: string };
  keywordsError: { message?: string; suggestion?: string };
  targetAudienceError: { message?: string; suggestion?: string };
  videoMoodError: { message?: string; suggestion?: string };
  isLoading: boolean;
  onGenerate: () => void;
}

export function TitleInputForm({
  form,
  videoTheme,
  keywords,
  targetAudience,
  videoMood,
  videoThemeError,
  keywordsError,
  targetAudienceError,
  videoMoodError,
  isLoading,
  onGenerate,
}: TitleInputFormProps) {
  const { register, control } = form;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>動画情報入力</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 動画のテーマ・内容は全幅（5.9対応: バリデーション強化） */}
          <div>
            <Label htmlFor="video-theme" className="flex items-center gap-2">
              <span>動画のテーマ・内容</span>
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                必須
              </Badge>
            </Label>
            <Controller
              name="videoTheme"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="video-theme"
                  placeholder="例: 新作RPGゲームを初見プレイ。序盤のキャラクター作成から、最初のボス戦までの流れを実況します。"
                  rows={4}
                  className={cn(
                    'resize-y',
                    videoThemeError.message &&
                      'border-red-500 focus-visible:ring-red-500',
                  )}
                />
              )}
            />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-1 gap-1 md:gap-0">
              <div className="flex-1">
                {videoThemeError.message ? (
                  <div className="space-y-1">
                    <p className="text-xs text-red-500">
                      {videoThemeError.message}
                    </p>
                    {videoThemeError.suggestion && (
                      <p className="text-xs text-muted-foreground">
                        {videoThemeError.suggestion}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {VIDEO_THEME_MIN_LENGTH}〜{VIDEO_THEME_MAX_LENGTH}
                    文字推奨。動画の内容や台本の要約を具体的に入力してください。
                  </p>
                )}
              </div>
              <span
                className={cn(
                  'text-xs md:ml-2',
                  videoTheme.length < VIDEO_THEME_MIN_LENGTH
                    ? 'text-red-500'
                    : videoTheme.length > VIDEO_THEME_MAX_LENGTH
                      ? 'text-red-500'
                      : 'text-muted-foreground',
                )}
              >
                {videoTheme.length}/{VIDEO_THEME_MAX_LENGTH}
              </span>
            </div>
          </div>

          {/* 2カラムレイアウト（5.1対応、5.9対応: バリデーション強化） */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="keywords">主要キーワード</Label>
              <Controller
                name="keywords"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="keywords"
                    placeholder="例: ゲーム名, キャラクター名, 感想"
                    className={cn(
                      keywordsError.message &&
                        'border-red-500 focus-visible:ring-red-500',
                    )}
                  />
                )}
              />
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-1 gap-1 md:gap-0">
                <div className="flex-1">
                  {keywordsError.message ? (
                    <div className="space-y-1">
                      <p className="text-xs text-red-500">
                        {keywordsError.message}
                      </p>
                      {keywordsError.suggestion && (
                        <p className="text-xs text-muted-foreground">
                          {keywordsError.suggestion}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      カンマ区切りで入力。タイトル生成に使用されます。
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs md:ml-2',
                    keywords.length > KEYWORDS_MAX_LENGTH
                      ? 'text-red-500'
                      : 'text-muted-foreground',
                  )}
                >
                  {keywords.length}/{KEYWORDS_MAX_LENGTH}
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="target-audience">ターゲット層</Label>
              <Controller
                name="targetAudience"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="target-audience"
                    placeholder="例: 10代男性, VTuberファン"
                    className={cn(
                      targetAudienceError.message &&
                        'border-red-500 focus-visible:ring-red-500',
                    )}
                  />
                )}
              />
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-1 gap-1 md:gap-0">
                <div className="flex-1">
                  {targetAudienceError.message ? (
                    <div className="space-y-1">
                      <p className="text-xs text-red-500">
                        {targetAudienceError.message}
                      </p>
                      {targetAudienceError.suggestion && (
                        <p className="text-xs text-muted-foreground">
                          {targetAudienceError.suggestion}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      任意。視聴者の属性を入力。
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs md:ml-2',
                    targetAudience.length > TARGET_AUDIENCE_MAX_LENGTH
                      ? 'text-red-500'
                      : 'text-muted-foreground',
                  )}
                >
                  {targetAudience.length}/{TARGET_AUDIENCE_MAX_LENGTH}
                </span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="video-mood">動画の雰囲気</Label>
            <Controller
              name="videoMood"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="video-mood"
                  placeholder="例: 面白い, 感動, 解説"
                  className={cn(
                    videoMoodError.message &&
                      'border-red-500 focus-visible:ring-red-500',
                  )}
                />
              )}
            />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-1 gap-1 md:gap-0">
              <div className="flex-1">
                {videoMoodError.message ? (
                  <div className="space-y-1">
                    <p className="text-xs text-red-500">
                      {videoMoodError.message}
                    </p>
                    {videoMoodError.suggestion && (
                      <p className="text-xs text-muted-foreground">
                        {videoMoodError.suggestion}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    任意。動画の雰囲気やトーンを入力。
                  </p>
                )}
              </div>
              <span
                className={cn(
                  'text-xs md:ml-2',
                  videoMood.length > VIDEO_MOOD_MAX_LENGTH
                    ? 'text-red-500'
                    : 'text-muted-foreground',
                )}
              >
                {videoMood.length}/{VIDEO_MOOD_MAX_LENGTH}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Button
        size="lg"
        className="w-full"
        onClick={onGenerate}
        disabled={isLoading}
      >
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
  );
}
