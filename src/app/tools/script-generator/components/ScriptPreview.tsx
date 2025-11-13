'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Printer, FileDown, Undo2, Redo2, Save, Copy, Edit2, Volume2, Gauge, Loader2, Clock, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import type { Script, ScriptTemplate, ScriptHistoryItem, GenerationStep } from '../types';

interface ScriptPreviewProps {
  currentScript: Script | null;
  selectedIdeaId: number | null;
  previewMode: 'edit' | 'reading' | 'timeline';
  setPreviewMode: (mode: 'edit' | 'reading' | 'timeline') => void;
  readingSpeed: number;
  setReadingSpeed: (speed: number) => void;
  currentReadingIndex: number | null;
  isReading: boolean;
  setIsReading: (reading: boolean) => void;
  handlePrint: () => void;
  handleExportPDF: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  historyIndex: number;
  scriptHistory: ScriptHistoryItem[];
  saveStatus: 'saved' | 'editing' | 'saving';
  isEditingScript: boolean;
  addToScriptHistory: (script: Script) => void;
  saveScript: (isAutoSave?: boolean) => void;
  handleDuplicateScript: () => void;
  calculateScriptStats: {
    total: {
      chars: number;
      lines: number;
      estimatedMinutes: number;
    };
  } | null;
  currentTemplate: ScriptTemplate;
  getSectionValue: (sectionId: string) => string;
  handleSectionChange: (sectionId: string, value: string) => void;
  sectionColorMap: Record<string, { border: string; bg: string }>;
  calculateTimeline: {
    sections: Array<{
      section: { id: string; label: string; color: string };
      startTime: number;
      endTime: number;
      duration: number;
      chars: number;
    }>;
    totalSeconds: number;
  } | null;
  formatTime: (seconds: number) => string;
  isGeneratingScript: boolean;
  scriptGenerationStep: string | null;
  scriptGenerationSteps: GenerationStep[];
  ProgressBar: React.ComponentType<{
    steps: GenerationStep[];
    currentStepId: string | null;
    type: 'script';
  }>;
}

export function ScriptPreview({
  currentScript,
  selectedIdeaId,
  previewMode,
  setPreviewMode,
  readingSpeed,
  setReadingSpeed,
  currentReadingIndex,
  isReading,
  setIsReading,
  handlePrint,
  handleExportPDF,
  handleUndo,
  handleRedo,
  historyIndex,
  scriptHistory,
  saveStatus,
  isEditingScript,
  addToScriptHistory,
  saveScript,
  handleDuplicateScript,
  calculateScriptStats,
  currentTemplate,
  getSectionValue,
  handleSectionChange,
  sectionColorMap,
  calculateTimeline,
  formatTime,
  isGeneratingScript,
  scriptGenerationStep,
  scriptGenerationSteps,
  ProgressBar,
}: ScriptPreviewProps) {
  if (isGeneratingScript) {
    return (
      <div className="h-full flex items-center justify-center">
        <ProgressBar
          steps={scriptGenerationSteps}
          currentStepId={scriptGenerationStep}
          type="script"
        />
      </div>
    );
  }

  if (!currentScript || selectedIdeaId !== currentScript.ideaId) {
    return (
      <div className="w-full bg-[#2D2D2D] rounded-md flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
        <FileText className="w-16 h-16 text-[#A0A0A0] mb-4" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-[#E0E0E0]">台本プレビュー</h3>
        <p className="text-[#A0A0A0] mt-2">企画案を選択して「台本を生成する」ボタンを押すと、ここに台本が表示されます。</p>
      </div>
    );
  }

  return (
    <Card className="bg-[#2D2D2D]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-[#E0E0E0]">
            <FileText className="h-5 w-5" />
            台本プレビュー
          </CardTitle>
          
          {/* 印刷・PDFエクスポートボタン */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0]"
              title="印刷"
            >
              <Printer className="h-4 w-4 mr-1" />
              印刷
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0]"
              title="PDFエクスポート"
            >
              <FileDown className="h-4 w-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 表示モード切り替えタブ */}
        <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as 'edit' | 'reading' | 'timeline')}>
          <TabsList className="grid w-full grid-cols-3 bg-[#1A1A1A] border border-[#4A4A4A] rounded-none p-0 gap-0 h-auto">
            <TabsTrigger 
              value="edit" 
              className="data-[state=active]:bg-[#2D2D2D] data-[state=active]:text-[#E0E0E0] h-full rounded-none border-r border-[#4A4A4A] last:border-r-0 px-2 py-2"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              編集
            </TabsTrigger>
            <TabsTrigger 
              value="reading" 
              className="data-[state=active]:bg-[#2D2D2D] data-[state=active]:text-[#E0E0E0] h-full rounded-none border-r border-[#4A4A4A] last:border-r-0 px-2 py-2"
            >
              <Volume2 className="h-4 w-4 mr-1" />
              読み上げ
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="data-[state=active]:bg-[#2D2D2D] data-[state=active]:text-[#E0E0E0] h-full rounded-none border-r border-[#4A4A4A] last:border-r-0 px-2 py-2"
            >
              <Gauge className="h-4 w-4 mr-1" />
              タイムライン
            </TabsTrigger>
          </TabsList>
          
          {/* 編集モード */}
          <TabsContent value="edit" className="mt-4 space-y-4">
            {/* ツールバー */}
            <div className="space-y-2 pb-2 border-b border-[#4A4A4A]">
              {/* 1行目: ボタン群 */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0] disabled:opacity-50 disabled:cursor-not-allowed"
                  title="アンドゥ"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  disabled={historyIndex >= scriptHistory.length - 1}
                  className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0] disabled:opacity-50 disabled:cursor-not-allowed"
                  title="リドゥ"
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (currentScript) {
                      addToScriptHistory(currentScript);
                      saveScript(false);
                    }
                  }}
                  disabled={!isEditingScript || saveStatus === 'saving'}
                  className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0] disabled:opacity-50 disabled:cursor-not-allowed"
                  title="保存"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      保存
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDuplicateScript}
                  disabled={!currentScript}
                  className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0] disabled:opacity-50 disabled:cursor-not-allowed"
                  title="複製"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  複製
                </Button>
              </div>
              
              {/* 2行目: 統計情報と保存状態 */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {calculateScriptStats && (
                  <div className="flex items-center gap-4 text-xs text-[#A0A0A0] flex-wrap">
                    <span>文字数: {calculateScriptStats.total.chars}</span>
                    <span>行数: {calculateScriptStats.total.lines}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      予想時間: {calculateScriptStats.total.estimatedMinutes}分
                    </span>
                  </div>
                )}
                {/* 保存状態バッジ */}
                {currentScript && (
                  <div>
                    {saveStatus === 'saved' && (
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/50">
                        保存済み
                      </Badge>
                    )}
                    {saveStatus === 'editing' && (
                      <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/50">
                        編集中
                      </Badge>
                    )}
                    {saveStatus === 'saving' && (
                      <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/50">
                        保存中...
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 動的セクション表示（テンプレートベース） */}
            {currentTemplate.sections
              .sort((a, b) => a.order - b.order)
              .map((section) => {
                const sectionValue = getSectionValue(section.id);
                const colorClasses = sectionColorMap[section.color] || sectionColorMap.blue;
                const lineCount = sectionValue.split('\n').length;
                
                return (
                  <div key={section.id} className={cn("border-l-4 p-4 rounded", colorClasses.border, colorClasses.bg)}>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-bold text-[#E0E0E0]">【{section.label}】</h5>
                      <span className="text-xs text-[#A0A0A0]">
                        {sectionValue.length}文字 / {lineCount}行
                      </span>
                    </div>
                    <div className="relative">
                      {/* 行番号表示 */}
                      <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#2D2D2D] border-r border-[#4A4A4A] text-xs text-[#666] font-mono flex flex-col items-end pr-2 py-2 overflow-hidden">
                        {sectionValue.split('\n').map((_, index) => (
                          <div key={index} className="leading-6 whitespace-nowrap">
                            {index + 1}
                          </div>
                        ))}
                      </div>
                      <Textarea
                        value={sectionValue}
                        onChange={(e) => handleSectionChange(section.id, e.target.value)}
                        className="pl-10 font-mono text-sm text-[#E0E0E0] bg-[#1A1A1A] border-[#4A4A4A] resize-none min-h-[120px]"
                        placeholder={section.placeholder}
                      />
                    </div>
                  </div>
                );
              })}
          </TabsContent>
          
          {/* 読み上げモード */}
          <TabsContent value="reading" className="mt-4 space-y-4">
            {/* 読み上げ速度調整 */}
            <div className="space-y-3 pb-4 border-b border-[#4A4A4A]">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-[#E0E0E0]">
                  <Volume2 className="h-4 w-4" />
                  読み上げ速度
                </Label>
                <span className="text-sm text-[#A0A0A0]">{readingSpeed.toFixed(1)}倍速</span>
              </div>
              <Slider
                min={0.5}
                max={2.0}
                step={0.1}
                value={[readingSpeed]}
                onValueChange={(value) => setReadingSpeed(value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[#4A4A4A]">
                <span>0.5倍</span>
                <span>1.0倍</span>
                <span>2.0倍</span>
              </div>
            </div>
            
            {/* 読み上げコントロール */}
            <div className="flex items-center gap-2 pb-4 border-b border-[#4A4A4A]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReading(!isReading)}
                className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0]"
              >
                {isReading ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    停止
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    読み上げ開始
                  </>
                )}
              </Button>
            </div>
            
            {/* 読み上げ表示（大きめフォント） */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {currentTemplate.sections
                .sort((a, b) => a.order - b.order)
                .map((section, sectionIndex) => {
                  const sectionValue = getSectionValue(section.id);
                  const colorClasses = sectionColorMap[section.color] || sectionColorMap.blue;
                  const lines = sectionValue.split('\n');
                  
                  return (
                    <div key={section.id} className={cn("border-l-4 p-4 rounded", colorClasses.border, colorClasses.bg)}>
                      <h5 className="font-bold text-lg text-[#E0E0E0] mb-3">【{section.label}】</h5>
                      <div className="space-y-2">
                        {lines.map((line, lineIndex) => {
                          const globalLineIndex = currentTemplate.sections
                            .slice(0, sectionIndex)
                            .reduce((acc, s) => acc + getSectionValue(s.id).split('\n').length, 0) + lineIndex;
                          const isCurrentLine = currentReadingIndex === globalLineIndex;
                          
                          return (
                            <div
                              key={lineIndex}
                              className={cn(
                                "text-lg leading-relaxed p-2 rounded transition-all",
                                isCurrentLine
                                  ? "bg-primary/20 border-2 border-primary text-[#E0E0E0] font-semibold"
                                  : "text-[#A0A0A0]"
                              )}
                            >
                              {line || '\u00A0'}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </TabsContent>
          
          {/* タイムライン表示 */}
          <TabsContent value="timeline" className="mt-4 space-y-4">
            {calculateTimeline ? (
              <>
                {/* 全体時間表示 */}
                <div className="p-4 bg-[#2D2D2D] rounded-lg border border-[#4A4A4A]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="text-lg font-semibold text-[#E0E0E0]">総時間</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {formatTime(calculateTimeline.totalSeconds)}
                    </span>
                  </div>
                </div>
                
                {/* セクションタイムライン */}
                <div className="space-y-3">
                  {calculateTimeline.sections.map((timelineItem) => {
                    const colorClasses = sectionColorMap[timelineItem.section.color] || sectionColorMap.blue;
                    const percentage = (timelineItem.duration / calculateTimeline.totalSeconds) * 100;
                    
                    // セクションカラーに応じたドットの色を設定
                    const dotColorMap: Record<string, string> = {
                      blue: 'bg-blue-500',
                      green: 'bg-green-500',
                      purple: 'bg-purple-500',
                      yellow: 'bg-yellow-500',
                      orange: 'bg-orange-500',
                      pink: 'bg-pink-500',
                    };
                    const dotColor = dotColorMap[timelineItem.section.color] || 'bg-blue-500';
                    
                    return (
                      <div key={timelineItem.section.id} className="border border-[#4A4A4A] rounded-lg p-4 bg-[#2D2D2D]">
                        <div className="flex items-center justify-between mb-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", dotColor)} />
                            <h5 className="font-semibold text-[#E0E0E0]">【{timelineItem.section.label}】</h5>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-[#A0A0A0]">
                            <span>{formatTime(timelineItem.startTime)}</span>
                            <span className="text-primary">→</span>
                            <span>{formatTime(timelineItem.endTime)}</span>
                          </div>
                        </div>
                        
                        {/* タイムラインバー */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-[#4A4A4A]">
                            <span>開始: {formatTime(timelineItem.startTime)}</span>
                            <span className="text-primary font-semibold">継続時間: {formatTime(timelineItem.duration)}</span>
                            <span>終了: {formatTime(timelineItem.endTime)}</span>
                          </div>
                          <div className="w-full h-3 bg-[#1A1A1A] rounded-full overflow-hidden">
                            <div
                              className={cn("h-full transition-all", dotColor)}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="text-xs text-[#A0A0A0]">
                            {timelineItem.chars}文字 / 累積: {formatTime(timelineItem.endTime)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center text-[#A0A0A0] py-8">
                タイムラインを計算中...
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

