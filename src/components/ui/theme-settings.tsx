'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Layout, Zap, Sun, Contrast } from 'lucide-react';

const colorOptions = [
  { value: '#20B2AA', label: 'ウォームシアン', name: 'warm-cyan' },
  { value: '#f59e0b', label: 'アンバー', name: 'amber' },
  { value: '#06b6d4', label: 'シアン', name: 'cyan' },
  { value: '#8b5cf6', label: 'バイオレット', name: 'violet' },
  { value: '#10b981', label: 'エメラルド', name: 'emerald' },
];

const layoutOptions = [
  { value: 'grid', label: 'グリッド表示', description: 'カード形式で表示' },
  { value: 'list', label: 'リスト表示', description: '一覧形式で表示' },
];

const animationOptions = [
  { value: 'minimal', label: 'ミニマル', description: 'アニメーションなし' },
  { value: 'subtle', label: '控えめ', description: '軽いアニメーション' },
  { value: 'enhanced', label: '強化', description: '豊富なアニメーション' },
];

const brightnessOptions = [
  { value: 'dim', label: '暗め', description: '目に優しい' },
  { value: 'normal', label: '標準', description: 'バランスの取れた明るさ' },
  { value: 'bright', label: '明るめ', description: '鮮明で見やすい' },
];

export function ThemeSettings() {
  const { preferences, updatePreferences, resetToDefault } = useTheme();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          テーマ設定
        </CardTitle>
        <CardDescription>
          お好みに合わせてデザインをカスタマイズできます
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Color */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-[#20B2AA]">メインカラー</Label>
          <Select
            value={preferences.primaryColor}
            onValueChange={(value: string) => updatePreferences({ primaryColor: value })}
          >
            <SelectTrigger className="bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 hover:bg-gray-700/60 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800/80 backdrop-blur-sm border border-gray-600/50">
              {colorOptions.map((color) => (
                <SelectItem key={color.value} value={color.value} className="hover:bg-gray-700/60 transition-colors data-[highlighted]:bg-[#20B2AA]/10 data-[highlighted]:text-[#20B2AA]">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-slate-300"
                      style={{ backgroundColor: color.value }}
                    />
                    <span>{color.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Layout */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2 text-[#20B2AA]">
            <Layout className="h-4 w-4" />
            レイアウト
          </Label>
          <Select
            value={preferences.layout}
            onValueChange={(value: string) => updatePreferences({ layout: value as 'grid' | 'list' })}
          >
            <SelectTrigger className="bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 hover:bg-gray-700/60 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800/80 backdrop-blur-sm border border-gray-600/50">
              {layoutOptions.map((layout) => (
                <SelectItem key={layout.value} value={layout.value} className="hover:bg-gray-700/60 transition-colors data-[highlighted]:bg-[#20B2AA]/10 data-[highlighted]:text-[#20B2AA]">
                  <div>
                    <div className="font-medium">{layout.label}</div>
                    <div className="text-sm text-gray-300">{layout.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Animations */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2 text-[#20B2AA]">
            <Zap className="h-4 w-4" />
            アニメーション
          </Label>
          <Select
            value={preferences.animations}
            onValueChange={(value) => updatePreferences({ animations: value as any })}
          >
            <SelectTrigger className="bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 hover:bg-gray-700/60 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800/80 backdrop-blur-sm border border-gray-600/50">
              {animationOptions.map((animation) => (
                <SelectItem key={animation.value} value={animation.value} className="hover:bg-gray-700/60 transition-colors data-[highlighted]:bg-[#20B2AA]/10 data-[highlighted]:text-[#20B2AA]">
                  <div>
                    <div className="font-medium">{animation.label}</div>
                    <div className="text-sm text-gray-300">{animation.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Brightness */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2 text-[#20B2AA]">
            <Sun className="h-4 w-4" />
            明るさ
          </Label>
          <Select
            value={preferences.brightness}
            onValueChange={(value) => updatePreferences({ brightness: value as any })}
          >
            <SelectTrigger className="bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 hover:bg-gray-700/60 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800/80 backdrop-blur-sm border border-gray-600/50">
              {brightnessOptions.map((brightness) => (
                <SelectItem key={brightness.value} value={brightness.value} className="hover:bg-gray-700/60 transition-colors data-[highlighted]:bg-[#20B2AA]/10 data-[highlighted]:text-[#20B2AA]">
                  <div>
                    <div className="font-medium">{brightness.label}</div>
                    <div className="text-sm text-gray-300">{brightness.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={resetToDefault}>
            デフォルトに戻す
          </Button>
          <div className="text-sm text-slate-500">
            設定は自動的に保存されます
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
