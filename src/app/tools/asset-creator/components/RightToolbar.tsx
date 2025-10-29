'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar, SidebarToggle } from '@/components/layouts/Sidebar';
import { Settings, Download } from "lucide-react";
import { logger } from '@/lib/logger';

import { ShapeType } from '../contexts/TemplateContext';
import { AssetExportSettingsPanel, AssetExportSettings } from './AssetExportSettingsPanel';

interface RightToolbarProps {
  isDesktop: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isExporting: boolean;
  
  // ツールパネル
  renderToolsPanel: () => React.ReactNode;
  
  // エクスポート関連
  handleBatchExport: (element: HTMLElement, settings: AssetExportSettings) => Promise<void>;
  handleAdvancedExport: (element: HTMLElement, settings: AssetExportSettings) => Promise<void>;
  handleAddShape: (shapeType: ShapeType) => void;
}

export const RightToolbar: React.FC<RightToolbarProps> = ({
  isDesktop,
  isSidebarOpen,
  setIsSidebarOpen,
  isExporting,
  renderToolsPanel,
  handleBatchExport,
  handleAdvancedExport,
  handleAddShape,
}) => {
  const [selectedTab, setSelectedTab] = React.useState("tools");

  // ツールバーコンテンツ
  const toolbarContent = (
    <div className="h-full flex flex-col min-w-0 max-w-full overflow-x-hidden">
      <div className="p-3 border-b border-[#4A4A4A] min-w-0">
        <h2 className="text-base font-semibold text-[#A0A0A0] truncate">編集・エクスポート</h2>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col min-w-0">
        <TabsList className="grid w-10/12 grid-cols-2 mx-auto mt-4 min-w-0">
          <TabsTrigger value="tools" className="text-xs p-2 min-w-0 flex-col gap-2 max-w-full">
            <Settings className="h-4 w-4" />
            <span className="truncate text-xs">編集</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="text-xs p-2 min-w-0 flex-col gap-2 max-w-full">
            <Download className="h-4 w-4" />
            <span className="truncate text-xs">エクスポート</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tools" className="flex-1 px-3 pb-3 pt-2 mt-8 min-w-0 max-w-full overflow-x-hidden overflow-y-auto">
          <div className="min-w-0 max-w-full">
            {renderToolsPanel()}
          </div>
        </TabsContent>
        
        <TabsContent value="export" className="flex-1 px-3 pb-3 pt-2 mt-8 min-w-0 max-w-full overflow-x-hidden overflow-y-auto">
          <div className="min-w-0 max-w-full">
            <AssetExportSettingsPanel
              onExport={handleBatchExport}
              isExporting={isExporting}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  // デスクトップ表示
  if (isDesktop) {
    return (
      <div className="w-1/5 border-l border-[#4A4A4A] bg-[#1A1A1A] overflow-y-auto overflow-x-hidden">
        {toolbarContent}
      </div>
    );
  }

  // モバイル表示（既存のサイドバー方式を踏襲）
  return (
    <>
      <SidebarToggle 
        onOpen={() => setIsSidebarOpen(true)}
        className="fixed top-4 right-4 z-40 lg:hidden"
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title="編集・エクスポート"
      >
        {toolbarContent}
      </Sidebar>
    </>
  );
};
