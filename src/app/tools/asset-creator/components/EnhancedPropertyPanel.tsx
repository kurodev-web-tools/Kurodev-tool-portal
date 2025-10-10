'use client';

import React from 'react';
import { useTemplate } from '../contexts/TemplateContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RotateCcw } from 'lucide-react';

// textShadowをパースする関数
const parseTextShadow = (shadow: string | undefined): { x: number; y: number; blur: number; color: string; opacity: number } => {
  if (!shadow || shadow === 'none') {
    return { x: 0, y: 0, blur: 0, color: '#000000', opacity: 0.5 };
  }
  
  // 例: "2px 2px 4px rgba(0,0,0,0.5)" をパース
  const match = shadow.match(/(-?\d+)px\s+(-?\d+)px\s+(\d+)px\s+rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return {
      x: parseInt(match[1]),
      y: parseInt(match[2]),
      blur: parseInt(match[3]),
      color: `#${parseInt(match[4]).toString(16).padStart(2, '0')}${parseInt(match[5]).toString(16).padStart(2, '0')}${parseInt(match[6]).toString(16).padStart(2, '0')}`,
      opacity: match[7] ? parseFloat(match[7]) : 1,
    };
  }
  
  // 簡易形式（例: "2px 2px 4px #000000"）
  const simpleMatch = shadow.match(/(-?\d+)px\s+(-?\d+)px\s+(\d+)px\s+(#[0-9a-fA-F]{6})/);
  if (simpleMatch) {
    return {
      x: parseInt(simpleMatch[1]),
      y: parseInt(simpleMatch[2]),
      blur: parseInt(simpleMatch[3]),
      color: simpleMatch[4],
      opacity: 1,
    };
  }
  
  return { x: 0, y: 0, blur: 0, color: '#000000', opacity: 0.5 };
};

// textShadow文字列を生成する関数
const buildTextShadow = (x: number, y: number, blur: number, color: string, opacity: number): string => {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `${x}px ${y}px ${blur}px rgba(${r},${g},${b},${opacity})`;
};

export const EnhancedPropertyPanel: React.FC = () => {
  const { layers, updateLayer, selectedLayerId } = useTemplate();
  const selectedLayer = layers.find(layer => layer.id === selectedLayerId);
  const [shadowEnabled, setShadowEnabled] = React.useState(false);

  React.useEffect(() => {
    if (selectedLayer?.textShadow && selectedLayer.textShadow !== 'none') {
      setShadowEnabled(true);
    } else {
      setShadowEnabled(false);
    }
  }, [selectedLayer?.textShadow]);

  if (!selectedLayer) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm">レイヤーを選択してください</p>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: any) => {
    updateLayer(selectedLayer.id, { [property]: value });
  };

  const resetRotation = () => {
    handlePropertyChange('rotation', 0);
  };

  const handleShadowToggle = (enabled: boolean) => {
    setShadowEnabled(enabled);
    if (!enabled) {
      handlePropertyChange('textShadow', 'none');
    } else {
      handlePropertyChange('textShadow', '2px 2px 4px rgba(0,0,0,0.5)');
    }
  };

  const handleShadowChange = (param: 'x' | 'y' | 'blur' | 'color' | 'opacity', value: number | string) => {
    const current = parseTextShadow(selectedLayer.textShadow);
    const updated = { ...current, [param]: value };
    const newShadow = buildTextShadow(updated.x, updated.y, updated.blur, updated.color, updated.opacity);
    handlePropertyChange('textShadow', newShadow);
  };

  return (
    <div className="space-y-4">
      {/* レイヤー情報 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">レイヤー情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs text-gray-400">名前</Label>
            <Input
              value={selectedLayer.name || ''}
              onChange={(e) => handlePropertyChange('name', e.target.value)}
              className="h-8 mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-400">X</Label>
              <Input
                type="number"
                value={Math.round(selectedLayer.x)}
                onChange={(e) => handlePropertyChange('x', Number(e.target.value))}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-400">Y</Label>
              <Input
                type="number"
                value={Math.round(selectedLayer.y)}
                onChange={(e) => handlePropertyChange('y', Number(e.target.value))}
                className="h-8 mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-400">幅</Label>
              <Input
                type="number"
                value={Math.round(Number(selectedLayer.width))}
                onChange={(e) => handlePropertyChange('width', Number(e.target.value))}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-400">高さ</Label>
              <Input
                type="number"
                value={Math.round(Number(selectedLayer.height))}
                onChange={(e) => handlePropertyChange('height', Number(e.target.value))}
                className="h-8 mt-1"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-400">回転</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={resetRotation}
                className="h-6 px-2"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
            <Input
              type="number"
              value={Math.round(selectedLayer.rotation || 0)}
              onChange={(e) => handlePropertyChange('rotation', Number(e.target.value))}
              className="h-8 mt-1"
              placeholder="角度"
            />
          </div>
        </CardContent>
      </Card>

      {/* テキストプロパティ */}
      {selectedLayer.type === 'text' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">テキスト設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-gray-400">テキスト</Label>
              <Textarea
                value={selectedLayer.text || ''}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
                className="h-16 resize-none mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-400">フォントサイズ</Label>
                <div className="mt-1">
                  <Slider
                    value={[parseFloat(selectedLayer.fontSize || '24') * 10]}
                    onValueChange={([value]) => handlePropertyChange('fontSize', `${value / 10}rem`)}
                    min={8}
                    max={200}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-400 text-center mt-1">
                    {selectedLayer.fontSize || '2.4rem'}
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-400">色</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={selectedLayer.color || '#000000'}
                    onChange={(e) => handlePropertyChange('color', e.target.value)}
                    className="w-8 h-8 rounded border border-gray-600"
                  />
                  <Input
                    value={selectedLayer.color || '#000000'}
                    onChange={(e) => handlePropertyChange('color', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Google Fonts機能 */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-300">フォント設定</h5>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-400">フォントファミリー</Label>
                  <Select
                    value={selectedLayer.fontFamily || 'Arial, sans-serif'}
                    onValueChange={(value) => handlePropertyChange('fontFamily', value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* 日本語フォント */}
                      <SelectItem value="Noto Sans JP, sans-serif">Noto Sans JP</SelectItem>
                      <SelectItem value="M PLUS Rounded 1c, sans-serif">M PLUS Rounded 1c</SelectItem>
                      <SelectItem value="Kosugi Maru, sans-serif">Kosugi Maru</SelectItem>
                      <SelectItem value="Sawarabi Mincho, serif">Sawarabi Mincho</SelectItem>
                      <SelectItem value="Noto Serif JP, serif">Noto Serif JP</SelectItem>
                      
                      {/* 英語フォント - Sans Serif */}
                      <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                      <SelectItem value="Open Sans, sans-serif">Open Sans</SelectItem>
                      <SelectItem value="Lato, sans-serif">Lato</SelectItem>
                      <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                      <SelectItem value="Source Sans 3, sans-serif">Source Sans 3</SelectItem>
                      <SelectItem value="Nunito, sans-serif">Nunito</SelectItem>
                      <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                      <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                      
                      {/* 英語フォント - Serif */}
                      <SelectItem value="Playfair Display, serif">Playfair Display</SelectItem>
                      <SelectItem value="Merriweather, serif">Merriweather</SelectItem>
                      <SelectItem value="Lora, serif">Lora</SelectItem>
                      <SelectItem value="Crimson Text, serif">Crimson Text</SelectItem>
                      
                      {/* 装飾フォント */}
                      <SelectItem value="Bebas Neue, sans-serif">Bebas Neue</SelectItem>
                      <SelectItem value="Oswald, sans-serif">Oswald</SelectItem>
                      <SelectItem value="Anton, sans-serif">Anton</SelectItem>
                      <SelectItem value="Dancing Script, cursive">Dancing Script</SelectItem>
                      <SelectItem value="Pacifico, cursive">Pacifico</SelectItem>
                      <SelectItem value="Great Vibes, cursive">Great Vibes</SelectItem>
                      
                      {/* モノスペースフォント */}
                      <SelectItem value="Roboto Mono, monospace">Roboto Mono</SelectItem>
                      <SelectItem value="Source Code Pro, monospace">Source Code Pro</SelectItem>
                      <SelectItem value="Fira Code, monospace">Fira Code</SelectItem>
                      <SelectItem value="JetBrains Mono, monospace">JetBrains Mono</SelectItem>
                      
                      {/* システムフォント（フォールバック） */}
                      <SelectItem value="Arial, sans-serif">Arial (System)</SelectItem>
                      <SelectItem value="Helvetica, sans-serif">Helvetica (System)</SelectItem>
                      <SelectItem value="Georgia, serif">Georgia (System)</SelectItem>
                      <SelectItem value="Times New Roman, serif">Times New Roman (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-400">フォントウェイト</Label>
                  <Select
                    value={selectedLayer.fontWeight || 'normal'}
                    onValueChange={(value) => handlePropertyChange('fontWeight', value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">通常</SelectItem>
                      <SelectItem value="bold">太字</SelectItem>
                      <SelectItem value="lighter">細字</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="300">300</SelectItem>
                      <SelectItem value="400">400</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                      <SelectItem value="600">600</SelectItem>
                      <SelectItem value="700">700</SelectItem>
                      <SelectItem value="800">800</SelectItem>
                      <SelectItem value="900">900</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-400">フォントスタイル</Label>
                  <Select
                    value={selectedLayer.fontStyle || 'normal'}
                    onValueChange={(value) => handlePropertyChange('fontStyle', value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">通常</SelectItem>
                      <SelectItem value="italic">イタリック</SelectItem>
                      <SelectItem value="oblique">斜体</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-400">文字装飾</Label>
                  <Select
                    value={selectedLayer.textDecoration || 'none'}
                    onValueChange={(value) => handlePropertyChange('textDecoration', value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">なし</SelectItem>
                      <SelectItem value="underline">下線</SelectItem>
                      <SelectItem value="line-through">取り消し線</SelectItem>
                      <SelectItem value="overline">上線</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* 文字シャドウ - ビジュアルエディタ */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-gray-400">文字シャドウ</Label>
                  <Button
                    size="sm"
                    variant={shadowEnabled ? "default" : "outline"}
                    onClick={() => handleShadowToggle(!shadowEnabled)}
                    className="h-6 px-3 text-xs"
                  >
                    {shadowEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
                
                {shadowEnabled && (() => {
                  const shadow = parseTextShadow(selectedLayer.textShadow);
                  return (
                    <div className="space-y-3 pl-2 border-l-2 border-gray-700">
                      {/* 水平位置 */}
                      <div>
                        <Label className="text-xs text-gray-500">水平位置（X）</Label>
                        <Slider
                          value={[shadow.x]}
                          onValueChange={([value]) => handleShadowChange('x', value)}
                          min={-20}
                          max={20}
                          step={1}
                          className="mt-2"
                        />
                        <div className="text-xs text-gray-500 text-center mt-1">
                          {shadow.x}px
                        </div>
                      </div>
                      
                      {/* 垂直位置 */}
                      <div>
                        <Label className="text-xs text-gray-500">垂直位置（Y）</Label>
                        <Slider
                          value={[shadow.y]}
                          onValueChange={([value]) => handleShadowChange('y', value)}
                          min={-20}
                          max={20}
                          step={1}
                          className="mt-2"
                        />
                        <div className="text-xs text-gray-500 text-center mt-1">
                          {shadow.y}px
                        </div>
                      </div>
                      
                      {/* ぼかし */}
                      <div>
                        <Label className="text-xs text-gray-500">ぼかし</Label>
                        <Slider
                          value={[shadow.blur]}
                          onValueChange={([value]) => handleShadowChange('blur', value)}
                          min={0}
                          max={30}
                          step={1}
                          className="mt-2"
                        />
                        <div className="text-xs text-gray-500 text-center mt-1">
                          {shadow.blur}px
                        </div>
                      </div>
                      
                      {/* 影の色 */}
                      <div>
                        <Label className="text-xs text-gray-500">影の色</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="color"
                            value={shadow.color}
                            onChange={(e) => handleShadowChange('color', e.target.value)}
                            className="w-10 h-8 rounded border border-gray-600"
                          />
                          <Input
                            value={shadow.color}
                            onChange={(e) => handleShadowChange('color', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                      
                      {/* 不透明度 */}
                      <div>
                        <Label className="text-xs text-gray-500">不透明度</Label>
                        <Slider
                          value={[shadow.opacity * 100]}
                          onValueChange={([value]) => handleShadowChange('opacity', value / 100)}
                          min={0}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                        <div className="text-xs text-gray-500 text-center mt-1">
                          {Math.round(shadow.opacity * 100)}%
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 図形プロパティ */}
      {selectedLayer.type === 'shape' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">図形設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-gray-400">塗りつぶし色</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={selectedLayer.backgroundColor || '#cccccc'}
                  onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
                  className="w-8 h-8 rounded border border-gray-600"
                />
                <Input
                  value={selectedLayer.backgroundColor || '#cccccc'}
                  onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-400">枠線色</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={selectedLayer.borderColor || '#000000'}
                  onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
                  className="w-8 h-8 rounded border border-gray-600"
                />
                <Input
                  value={selectedLayer.borderColor || '#000000'}
                  onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-400">
                枠線の太さ ({selectedLayer.borderWidth || 0}px)
              </Label>
              <Slider
                value={[selectedLayer.borderWidth || 0]}
                onValueChange={([value]) => handlePropertyChange('borderWidth', value)}
                min={0}
                max={20}
                step={1}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 画像プロパティ */}
      {selectedLayer.type === 'image' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">画像設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-gray-400">画像ファイル</Label>
              <div className="mt-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const src = URL.createObjectURL(file);
                      handlePropertyChange('src', src);
                      handlePropertyChange('name', file.name);
                    }
                  }}
                  className="h-8"
                />
              </div>
            </div>
            {selectedLayer.src && (
              <div>
                <Label className="text-xs text-gray-400">プレビュー</Label>
                <div className="mt-1 p-2 border rounded">
                  <img
                    src={selectedLayer.src}
                    alt={selectedLayer.name}
                    className="w-full h-20 object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};



