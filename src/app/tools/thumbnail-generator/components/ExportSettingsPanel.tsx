'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Settings, 
  Save, 
  Loader2, 
  Image as ImageIcon,
  Monitor,
  Smartphone,
  Tablet,
  Zap,
  FileImage,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// エクスポート設定の型定義
export interface ExportSettings {
  resolution: 'hd' | 'fhd' | '4k' | 'custom';
  customWidth?: number;
  customHeight?: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  format: 'png' | 'jpeg';
  pixelRatio: number;
  backgroundColor?: string;
  includeTransparency: boolean;
  optimizeForPlatform: 'youtube' | 'twitter' | 'instagram' | 'general';
  batchExport: boolean;
  batchSizes: Array<{
    name: string;
    width: number;
    height: number;
    platform: string;
  }>;
}

// プリセット設定
const EXPORT_PRESETS: Record<string, ExportSettings> = {
  'youtube-standard': {
    resolution: 'fhd',
    quality: 'high',
    format: 'png',
    pixelRatio: 2,
    includeTransparency: true,
    optimizeForPlatform: 'youtube',
    batchExport: false,
    batchSizes: []
  },
  'twitter-optimized': {
    resolution: 'custom',
    customWidth: 1200,
    customHeight: 675,
    quality: 'high',
    format: 'jpeg',
    pixelRatio: 2,
    includeTransparency: false,
    optimizeForPlatform: 'twitter',
    batchExport: false,
    batchSizes: []
  },
  'instagram-square': {
    resolution: 'custom',
    customWidth: 1080,
    customHeight: 1080,
    quality: 'high',
    format: 'jpeg',
    pixelRatio: 2,
    includeTransparency: false,
    optimizeForPlatform: 'instagram',
    batchExport: false,
    batchSizes: []
  },
  'batch-all-platforms': {
    resolution: 'fhd',
    quality: 'high',
    format: 'png',
    pixelRatio: 2,
    includeTransparency: true,
    optimizeForPlatform: 'general',
    batchExport: true,
    batchSizes: [
      { name: 'YouTube', width: 1920, height: 1080, platform: 'youtube' },
      { name: 'Twitter', width: 1200, height: 675, platform: 'twitter' },
      { name: 'Instagram', width: 1080, height: 1080, platform: 'instagram' },
      { name: 'Facebook', width: 1200, height: 630, platform: 'facebook' }
    ]
  }
};

// 解像度設定
const RESOLUTION_PRESETS = {
  hd: { width: 1280, height: 720, label: 'HD (1280×720)' },
  fhd: { width: 1920, height: 1080, label: 'FHD (1920×1080)' },
  '4k': { width: 3840, height: 2160, label: '4K (3840×2160)' },
  custom: { width: 0, height: 0, label: 'カスタム' }
};

// 品質設定
const QUALITY_PRESETS = {
  low: { pixelRatio: 1, quality: 0.6, label: '低品質 (軽量)' },
  medium: { pixelRatio: 1.5, quality: 0.8, label: '中品質 (バランス)' },
  high: { pixelRatio: 2, quality: 0.9, label: '高品質 (推奨)' },
  ultra: { pixelRatio: 3, quality: 1.0, label: '最高品質 (重い)' }
};

interface ExportSettingsPanelProps {
  onExport: (settings: ExportSettings) => Promise<void>;
  isExporting: boolean;
}

export const ExportSettingsPanel: React.FC<ExportSettingsPanelProps> = ({ 
  onExport, 
  isExporting 
}) => {
  const [settings, setSettings] = useState<ExportSettings>(EXPORT_PRESETS['youtube-standard']);
  const [savedPresets, setSavedPresets] = useState<Record<string, ExportSettings>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // プリセットの読み込み
  React.useEffect(() => {
    const saved = localStorage.getItem('thumbnailExportPresets');
    if (saved) {
      setSavedPresets(JSON.parse(saved));
    }
  }, []);

  // 設定の更新
  const updateSettings = (updates: Partial<ExportSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  // プリセットの適用
  const applyPreset = (presetKey: string) => {
    const preset = EXPORT_PRESETS[presetKey] || savedPresets[presetKey];
    if (preset) {
      setSettings(preset);
      toast.success(`プリセット「${presetKey}」を適用しました`);
    }
  };

  // カスタムプリセットの保存
  const savePreset = () => {
    const presetName = prompt('プリセット名を入力してください:');
    if (presetName && presetName.trim()) {
      const newPresets = { ...savedPresets, [presetName]: settings };
      setSavedPresets(newPresets);
      localStorage.setItem('thumbnailExportPresets', JSON.stringify(newPresets));
      toast.success(`プリセット「${presetName}」を保存しました`);
    }
  };

  // エクスポート実行
  const handleExport = async () => {
    try {
      await onExport(settings);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // 解像度の計算
  const getCurrentResolution = () => {
    if (settings.resolution === 'custom') {
      return {
        width: settings.customWidth || 1920,
        height: settings.customHeight || 1080
      };
    }
    return RESOLUTION_PRESETS[settings.resolution];
  };

  const currentResolution = getCurrentResolution();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          エクスポート設定
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* プリセット選択 */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">プリセット</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={settings.resolution === 'fhd' && !settings.batchExport ? 'default' : 'outline'}
              size="sm"
              onClick={() => applyPreset('youtube-standard')}
            >
              <ImageIcon className="h-4 w-4 mr-1" />
              YouTube
            </Button>
            <Button
              variant={settings.optimizeForPlatform === 'twitter' ? 'default' : 'outline'}
              size="sm"
              onClick={() => applyPreset('twitter-optimized')}
            >
              <ImageIcon className="h-4 w-4 mr-1" />
              Twitter
            </Button>
            <Button
              variant={settings.optimizeForPlatform === 'instagram' ? 'default' : 'outline'}
              size="sm"
              onClick={() => applyPreset('instagram-square')}
            >
              <ImageIcon className="h-4 w-4 mr-1" />
              Instagram
            </Button>
            <Button
              variant={settings.batchExport ? 'default' : 'outline'}
              size="sm"
              onClick={() => applyPreset('batch-all-platforms')}
            >
              <Zap className="h-4 w-4 mr-1" />
              一括出力
            </Button>
          </div>
        </div>

        <Separator />

        {/* 基本設定 */}
        <div className="space-y-4">
          <h4 className="font-medium">基本設定</h4>
          
          {/* 解像度 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">解像度</Label>
            <Select value={settings.resolution} onValueChange={(value: 'hd' | 'fhd' | '4k' | 'custom') => updateSettings({ resolution: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hd">HD (1280×720)</SelectItem>
                <SelectItem value="fhd">FHD (1920×1080)</SelectItem>
                <SelectItem value="4k">4K (3840×2160)</SelectItem>
                <SelectItem value="custom">カスタム</SelectItem>
              </SelectContent>
            </Select>
            
            {settings.resolution === 'custom' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">幅 (px)</Label>
                  <Input
                    type="number"
                    value={settings.customWidth || 1920}
                    onChange={(e) => updateSettings({ customWidth: Number(e.target.value) })}
                    min="100"
                    max="8000"
                  />
                </div>
                <div>
                  <Label className="text-xs">高さ (px)</Label>
                  <Input
                    type="number"
                    value={settings.customHeight || 1080}
                    onChange={(e) => updateSettings({ customHeight: Number(e.target.value) })}
                    min="100"
                    max="8000"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 品質 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">品質</Label>
            <Select value={settings.quality} onValueChange={(value: 'low' | 'medium' | 'high' | 'ultra') => {
              const qualityPreset = QUALITY_PRESETS[value];
              updateSettings({ 
                quality: value,
                pixelRatio: qualityPreset.pixelRatio
              });
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">低品質 (軽量)</SelectItem>
                <SelectItem value="medium">中品質 (バランス)</SelectItem>
                <SelectItem value="high">高品質 (推奨)</SelectItem>
                <SelectItem value="ultra">最高品質 (重い)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 形式 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">形式</Label>
            <Select value={settings.format} onValueChange={(value: 'png' | 'jpeg') => updateSettings({ format: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG (高品質・透明対応)</SelectItem>
                <SelectItem value="jpeg">JPEG (軽量・写真向け)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* バッチエクスポート設定 */}
        {settings.batchExport && (
          <div className="space-y-4">
            <Separator />
            <h4 className="font-medium">バッチエクスポート</h4>
            <div className="space-y-2">
              {settings.batchSizes.map((size, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <span className="font-medium">{size.name}</span>
                    <span className="text-sm text-gray-500 ml-2">{size.width}×{size.height}</span>
                  </div>
                  <Badge variant="secondary">{size.platform}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 詳細設定 */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            {showAdvanced ? '詳細設定を隠す' : '詳細設定を表示'}
          </Button>
          
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {/* 背景色 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">背景色</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.backgroundColor || '#ffffff'}
                    onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded border border-gray-300"
                  />
                  <Input
                    value={settings.backgroundColor || '#ffffff'}
                    onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* 透明度の保持 */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="transparency"
                  checked={settings.includeTransparency}
                  onCheckedChange={(checked) => updateSettings({ includeTransparency: !!checked })}
                />
                <Label htmlFor="transparency" className="text-sm">
                  透明度を保持する
                </Label>
              </div>

              {/* ピクセル比 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  ピクセル比: {settings.pixelRatio}x
                </Label>
                <Slider
                  value={[settings.pixelRatio]}
                  onValueChange={([value]) => updateSettings({ pixelRatio: value })}
                  min={0.5}
                  max={4}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* プレビュー情報 */}
        <div className="space-y-2">
          <h4 className="font-medium">出力情報</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">解像度:</span>
              <span className="ml-2 font-medium">{currentResolution.width}×{currentResolution.height}</span>
            </div>
            <div>
              <span className="text-gray-500">形式:</span>
              <span className="ml-2 font-medium">{settings.format.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-gray-500">品質:</span>
              <span className="ml-2 font-medium">{QUALITY_PRESETS[settings.quality].label}</span>
            </div>
            <div>
              <span className="text-gray-500">ファイル数:</span>
              <span className="ml-2 font-medium">
                {settings.batchExport ? settings.batchSizes.length : 1}個
              </span>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                エクスポート中...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                エクスポート
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={savePreset}
            disabled={isExporting}
          >
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
