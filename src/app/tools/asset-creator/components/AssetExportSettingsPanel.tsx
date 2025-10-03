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
  Palette,
  Printer,
  Globe,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/use-media-query';

// エクスポート設定の型定義（イベント用素材に特化）
export interface AssetExportSettings {
  resolution: 'hd' | 'fhd' | '4k' | 'print' | 'custom';
  customWidth?: number;
  customHeight?: number;
  quality: 'low' | 'medium' | 'high' | 'ultra' | 'print';
  format: 'png' | 'jpeg';
  pixelRatio: number;
  backgroundColor?: string;
  includeTransparency: boolean;
  optimizeForPlatform: 'web' | 'print' | 'social' | 'presentation' | 'general';
  batchExport: boolean;
  batchSizes: Array<{
    name: string;
    width: number;
    height: number;
    platform: string;
  }>;
}

// イベント用素材プリセット設定
const assetPresets = {
  web: [
    { name: 'Web バナー (大)', width: 1200, height: 630, platform: 'web' },
    { name: 'Web バナー (中)', width: 800, height: 420, platform: 'web' },
    { name: 'Web バナー (小)', width: 600, height: 315, platform: 'web' },
    { name: 'ヘッダー画像', width: 1920, height: 400, platform: 'web' },
  ],
  social: [
    { name: 'Twitter ヘッダー', width: 1500, height: 500, platform: 'twitter' },
    { name: 'Twitter 投稿', width: 1200, height: 675, platform: 'twitter' },
    { name: 'Instagram 投稿', width: 1080, height: 1080, platform: 'instagram' },
    { name: 'Instagram ストーリー', width: 1080, height: 1920, platform: 'instagram' },
    { name: 'Facebook カバー', width: 1200, height: 630, platform: 'facebook' },
  ],
  print: [
    { name: 'A4 (300DPI)', width: 2480, height: 3508, platform: 'print' },
    { name: 'A3 (300DPI)', width: 3508, height: 4961, platform: 'print' },
    { name: '名刺 (300DPI)', width: 1063, height: 638, platform: 'print' },
    { name: 'ポスター A2 (300DPI)', width: 4961, height: 7016, platform: 'print' },
    { name: 'フライヤー A5 (300DPI)', width: 1748, height: 2480, platform: 'print' },
  ],
  presentation: [
    { name: 'スライド 16:9', width: 1920, height: 1080, platform: 'presentation' },
    { name: 'スライド 4:3', width: 1024, height: 768, platform: 'presentation' },
    { name: 'プレゼン用高解像度', width: 3840, height: 2160, platform: 'presentation' },
  ]
};

const qualitySettings = {
  low: { pixelRatio: 1, label: '軽量 (1x)', description: 'Web表示用' },
  medium: { pixelRatio: 1.5, label: '標準 (1.5x)', description: '一般的な用途' },
  high: { pixelRatio: 2, label: '高品質 (2x)', description: 'Retina対応' },
  ultra: { pixelRatio: 3, label: '超高品質 (3x)', description: '高解像度ディスプレイ' },
  print: { pixelRatio: 4, label: '印刷用 (4x)', description: '300DPI印刷対応' },
};

interface AssetExportSettingsPanelProps {
  onExport: (element: HTMLElement, settings: AssetExportSettings) => Promise<void>;
  isExporting?: boolean;
}

export const AssetExportSettingsPanel: React.FC<AssetExportSettingsPanelProps> = ({
  onExport,
  isExporting = false,
}) => {
  const isMobile = !useMediaQuery("(min-width: 768px)");
  
  // エクスポート設定の状態
  const [settings, setSettings] = useState<AssetExportSettings>({
    resolution: 'fhd',
    quality: 'high',
    format: 'png',
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    includeTransparency: false,
    optimizeForPlatform: 'general',
    batchExport: false,
    batchSizes: [],
  });

  // プリセット設定の状態
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<keyof typeof assetPresets>('web');
  const [savedPresets, setSavedPresets] = useState<AssetExportSettings[]>([]);

  // 設定の更新
  const updateSettings = (updates: Partial<AssetExportSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  // プリセットの適用
  const applyPreset = (category: keyof typeof assetPresets) => {
    const presets = assetPresets[category];
    updateSettings({
      batchExport: true,
      batchSizes: presets,
      optimizeForPlatform: category === 'web' ? 'web' : category === 'print' ? 'print' : 'social',
      quality: category === 'print' ? 'print' : 'high',
      format: category === 'print' ? 'png' : 'png',
      includeTransparency: category !== 'print',
    });
    setSelectedPresetCategory(category);
  };

  // エクスポート実行
  const handleExport = async () => {
    const element = document.getElementById('download-target');
    if (!element) {
      toast.error('プレビューエリアが見つかりません');
      return;
    }

    try {
      await onExport(element, settings);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('エクスポートに失敗しました');
    }
  };

  // プリセット保存
  const savePreset = () => {
    const presetName = prompt('プリセット名を入力してください:');
    if (presetName) {
      const newPreset = { ...settings, name: presetName };
      setSavedPresets(prev => [...prev, newPreset]);
      toast.success(`プリセット "${presetName}" を保存しました`);
    }
  };

  return (
    <div className="space-y-4">
      {/* プラットフォーム別プリセット */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4" />
            用途別プリセット
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedPresetCategory === 'web' ? 'default' : 'outline'}
              size={isMobile ? 'sm' : 'default'}
              onClick={() => applyPreset('web')}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Web用</span>
              <span className="sm:hidden">Web</span>
            </Button>
            <Button
              variant={selectedPresetCategory === 'social' ? 'default' : 'outline'}
              size={isMobile ? 'sm' : 'default'}
              onClick={() => applyPreset('social')}
              className="flex items-center gap-2"
            >
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">SNS用</span>
              <span className="sm:hidden">SNS</span>
            </Button>
            <Button
              variant={selectedPresetCategory === 'print' ? 'default' : 'outline'}
              size={isMobile ? 'sm' : 'default'}
              onClick={() => applyPreset('print')}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">印刷用</span>
              <span className="sm:hidden">印刷</span>
            </Button>
            <Button
              variant={selectedPresetCategory === 'presentation' ? 'default' : 'outline'}
              size={isMobile ? 'sm' : 'default'}
              onClick={() => applyPreset('presentation')}
              className="flex items-center gap-2"
            >
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">プレゼン用</span>
              <span className="sm:hidden">プレゼン</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 基本設定 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            基本設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 解像度設定 */}
          <div className="space-y-2">
            <Label htmlFor="resolution">解像度</Label>
            <Select
              value={settings.resolution}
              onValueChange={(value: AssetExportSettings['resolution']) => 
                updateSettings({ resolution: value })
              }
            >
              <SelectTrigger className={isMobile ? "h-10" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hd">HD (1280×720)</SelectItem>
                <SelectItem value="fhd">Full HD (1920×1080)</SelectItem>
                <SelectItem value="4k">4K (3840×2160)</SelectItem>
                <SelectItem value="print">印刷用高解像度</SelectItem>
                <SelectItem value="custom">カスタム</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* カスタム解像度 */}
          {settings.resolution === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="customWidth">幅 (px)</Label>
                <Input
                  id="customWidth"
                  type="number"
                  value={settings.customWidth || ''}
                  onChange={(e) => updateSettings({ customWidth: parseInt(e.target.value) || undefined })}
                  placeholder="1920"
                  inputMode="numeric"
                  className={isMobile ? "h-10" : ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="customHeight">高さ (px)</Label>
                <Input
                  id="customHeight"
                  type="number"
                  value={settings.customHeight || ''}
                  onChange={(e) => updateSettings({ customHeight: parseInt(e.target.value) || undefined })}
                  placeholder="1080"
                  inputMode="numeric"
                  className={isMobile ? "h-10" : ""}
                />
              </div>
            </div>
          )}

          {/* 品質設定 */}
          <div className="space-y-2">
            <Label htmlFor="quality">品質</Label>
            <Select
              value={settings.quality}
              onValueChange={(value: AssetExportSettings['quality']) => {
                const qualityConfig = qualitySettings[value];
                updateSettings({ 
                  quality: value,
                  pixelRatio: qualityConfig.pixelRatio 
                });
              }}
            >
              <SelectTrigger className={isMobile ? "h-10" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(qualitySettings).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex flex-col">
                      <span>{config.label}</span>
                      <span className="text-xs text-muted-foreground">{config.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* フォーマット設定 */}
          <div className="space-y-2">
            <Label htmlFor="format">フォーマット</Label>
            <Select
              value={settings.format}
              onValueChange={(value: AssetExportSettings['format']) => 
                updateSettings({ format: value })
              }
            >
              <SelectTrigger className={isMobile ? "h-10" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG (透明背景対応)</SelectItem>
                <SelectItem value="jpeg">JPEG (軽量)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 透明背景設定 */}
          {settings.format === 'png' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="transparency"
                checked={settings.includeTransparency}
                onCheckedChange={(checked) => 
                  updateSettings({ includeTransparency: checked as boolean })
                }
              />
              <Label htmlFor="transparency" className="text-sm">
                透明背景を使用
              </Label>
            </div>
          )}

          {/* 背景色設定 */}
          {!settings.includeTransparency && (
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">背景色</Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                  className="w-12 h-10 p-1 border rounded"
                />
                <Input
                  value={settings.backgroundColor}
                  onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                  placeholder="#ffffff"
                  className={cn("flex-1", isMobile ? "h-10" : "")}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* バッチエクスポート設定 */}
      {settings.batchExport && settings.batchSizes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              バッチエクスポート
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                以下のサイズで一括エクスポートします:
              </p>
              <div className="grid gap-1">
                {settings.batchSizes.map((size, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                    <span>{size.name}</span>
                    <Badge variant="secondary">
                      {size.width}×{size.height}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* エクスポート実行 */}
      <div className="flex gap-2">
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className={cn("flex-1", isMobile ? "h-11" : "")}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              エクスポート中...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              エクスポート
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={savePreset}
          disabled={isExporting}
          className={isMobile ? "h-11" : ""}
          title="現在の設定をプリセットとして保存"
        >
          <Save className="h-4 w-4" />
          {isMobile ? "" : "保存"}
        </Button>
      </div>
    </div>
  );
};
