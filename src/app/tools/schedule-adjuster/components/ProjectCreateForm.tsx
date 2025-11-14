'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Plus } from 'lucide-react';
import type { ProjectFormValues } from '../types/project';

interface ProjectCreateFormProps {
  formValues: ProjectFormValues;
  onFormChange: (values: Partial<ProjectFormValues>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error: string | null;
  variant?: 'sidebar' | 'mobile';
}

export function ProjectCreateForm({
  formValues,
  onFormChange,
  onSubmit,
  isSubmitting,
  error,
  variant = 'sidebar',
}: ProjectCreateFormProps) {
  const isMobile = variant === 'mobile';

  if (isMobile) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-[#E0E0E0] mb-2">新しいプロジェクト</h3>
          <p className="text-sm text-[#A0A0A0]">コラボ配信のスケジュール調整を開始します</p>
        </div>

        <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#E0E0E0] flex items-center gap-2">
              <Plus className="h-4 w-4" />
              基本情報
            </CardTitle>
            <CardDescription className="text-[#A0A0A0]">
              プロジェクトの基本情報を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="mobile-name" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                  プロジェクト名 <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="mobile-name"
                  value={formValues.name}
                  onChange={(e) => onFormChange({ name: e.target.value })}
                  placeholder="例: 3人コラボ配信"
                  className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#6A6A6A]"
                />
              </div>
              <div>
                <Label htmlFor="mobile-description" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                  説明
                </Label>
                <Textarea
                  id="mobile-description"
                  value={formValues.description}
                  onChange={(e) => onFormChange({ description: e.target.value })}
                  placeholder="プロジェクトの詳細を入力（任意）"
                  className="min-h-[120px] md:min-h-[100px] resize-none bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#6A6A6A]"
                />
              </div>
              <div>
                <Label htmlFor="mobile-duration" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                  配信時間
                </Label>
                <Select value={formValues.duration} onValueChange={(value) => onFormChange({ duration: value })}>
                  <SelectTrigger className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] focus:border-[#6A6A6A]">
                    <SelectValue placeholder="配信時間を選択" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2D2D2D] border-[#4A4A4A]">
                    <SelectItem value="30" className="text-[#E0E0E0] focus:bg-[#2D2D2D]">30分</SelectItem>
                    <SelectItem value="60" className="text-[#E0E0E0] focus:bg-[#2D2D2D]">60分</SelectItem>
                    <SelectItem value="90" className="text-[#E0E0E0] focus:bg-[#2D2D2D]">90分</SelectItem>
                    <SelectItem value="120" className="text-[#E0E0E0] focus:bg-[#2D2D2D]">120分</SelectItem>
                    <SelectItem value="180" className="text-[#E0E0E0] focus:bg-[#2D2D2D]">180分</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4 border-t border-[#4A4A4A]">
              <Button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="w-full bg-[#0070F3] hover:bg-[#0051CC] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    作成中...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    プロジェクトを作成
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sidebar variant
  return (
    <div className="space-y-4">
      <Card className="border-[#4A4A4A] bg-[#2D2D2D]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#E0E0E0] flex items-center gap-2">
            <Plus className="h-4 w-4" />
            新しいプロジェクト
          </CardTitle>
          <CardDescription className="text-[#A0A0A0]">
            基本情報を入力してプロジェクトを作成します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                プロジェクト名 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                value={formValues.name}
                onChange={(e) => onFormChange({ name: e.target.value })}
                placeholder="例: 3人コラボ配信"
                className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#6A6A6A]"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                説明
              </Label>
              <Textarea
                id="description"
                value={formValues.description}
                onChange={(e) => onFormChange({ description: e.target.value })}
                placeholder="プロジェクトの詳細を入力（任意）"
                className="min-h-[80px] resize-none bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#6A6A6A]"
              />
            </div>
            <div>
              <Label htmlFor="duration" className="text-sm font-medium text-[#E0E0E0] mb-1.5 block">
                配信時間
              </Label>
              <Select value={formValues.duration} onValueChange={(value) => onFormChange({ duration: value })}>
                <SelectTrigger className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] focus:border-[#6A6A6A]">
                  <SelectValue placeholder="配信時間を選択" />
                </SelectTrigger>
                <SelectContent className="bg-[#2D2D2D] border-[#4A4A4A]">
                  <SelectItem value="30" className="text-[#E0E0E0] focus:bg-[#2D2D2D]">30分</SelectItem>
                  <SelectItem value="60" className="text-[#E0E0E0] focus:bg-[#2D2D2D]">60分</SelectItem>
                  <SelectItem value="90" className="text-[#E0E0E0] focus:bg-[#2D2D2D]">90分</SelectItem>
                  <SelectItem value="120" className="text-[#E0E0E0] focus:bg-[#2D2D2D]">120分</SelectItem>
                  <SelectItem value="180" className="text-[#E0E0E0] focus:bg-[#2D2D2D]">180分</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">エラーが発生しました</p>
                <p className="text-xs text-red-300 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-[#4A4A4A]">
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full bg-[#0070F3] hover:bg-[#0051CC] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  作成中...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  プロジェクトを作成
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

