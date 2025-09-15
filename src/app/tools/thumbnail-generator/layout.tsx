'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, PanelLeftClose, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from '@/hooks/use-media-query';
import TemplateSelector from './components/TemplateSelector';
import { TemplateProvider, useTemplate } from './contexts/TemplateContext';
import { Input } from '@/components/ui/input'; // Inputをインポート
import { Slider } from '@/components/ui/slider'; // Sliderをインポート
import { Label } from '@/components/ui/label'; // Labelをインポート
import { cn } from '@/lib/utils'; // cnをインポート

function ThumbnailGeneratorView({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState("settings");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const {
    selectedTemplate,
    setSelectedTemplate,
    currentText,
    setCurrentText,
    currentTextColor,
    setCurrentTextColor,
    currentFontSize,
    setCurrentFontSize,
  } = useTemplate(); // useTemplateからテキスト関連の状態も取得

  React.useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true);
    }
  }, [isDesktop]);

  const availableColors = ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']; // プリセットカラー

  return (
    <div className="relative flex flex-col lg:h-screen bg-gray-900 text-white font-sans">
      {/* Mobile-only drawer open button */}
      <div className="absolute top-4 right-4 z-20 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
          <PanelLeftOpen className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row flex-grow lg:h-full lg:overflow-y-auto">
        <main className="flex-grow p-4 w-full lg:w-auto">
          {children}
        </main>

        {/* Overlay for mobile when drawer is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar/Drawer */}
        <aside
          className={[
            "fixed top-0 right-0 h-full w-4/5 max-w-sm bg-background p-4 border-l z-40",
            "transition-transform duration-300 ease-in-out",
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full',
            "lg:static lg:w-1/4 lg:translate-x-0 lg:z-auto",
            isSidebarOpen ? 'lg:block' : 'lg:hidden'
          ].join(' ')}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">設定パネル</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          </div>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="settings">設定</TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="mt-4 space-y-6"> {/* space-y-6を追加 */}
              <TemplateSelector
                onSelectTemplate={setSelectedTemplate}
                selectedTemplateId={selectedTemplate.id}
              />

              {/* テキスト編集機能 */}
              <div className="space-y-2">
                <Label htmlFor="thumbnail-text">サムネイルテキスト</Label>
                <Input
                  id="thumbnail-text"
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>テキストカラー</Label>
                <div className="flex gap-2">
                  {availableColors.map((color) => (
                    <div
                      key={color}
                      className={cn(
                        "w-8 h-8 rounded-full cursor-pointer border-2 border-transparent",
                        currentTextColor === color && "border-primary"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setCurrentTextColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-size">フォントサイズ ({currentFontSize})</Label>
                <Slider
                  id="font-size"
                  min={1}
                  max={5}
                  step={0.1}
                  value={[parseFloat(currentFontSize)]} // Sliderは配列を受け取る
                  onValueChange={(value) => setCurrentFontSize(`${value[0]}rem`)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </aside>

        {/* Icon bar for PC when sidebar is closed */}
        {!isSidebarOpen && (
          <div className="hidden lg:flex p-4 border-l flex-shrink-0 flex-col items-center justify-start space-y-4">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <PanelLeftOpen className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { setIsSidebarOpen(true); setSelectedTab("settings"); }}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ThumbnailGeneratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <TemplateProvider>
      <ThumbnailGeneratorView>{children}</ThumbnailGeneratorView>
    </TemplateProvider>
  );
}
