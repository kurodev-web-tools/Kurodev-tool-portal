'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar, SidebarToggle } from '@/components/layouts/Sidebar';
import { Settings, Layers, Construction } from "lucide-react";
import { logger } from '@/lib/logger';

import { useTemplate, ShapeType } from '../contexts/TemplateContext';
import TemplateSelector from './TemplateSelector';
import { UnifiedLayerPanel } from '@/components/shared/UnifiedLayerPanel';
import { AssetExportSettingsPanel, AssetExportSettings } from './AssetExportSettingsPanel';

interface SidebarSectionProps {
  isDesktop: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  isExporting: boolean;
  isPreviewDedicatedMode: boolean;
  
  // レイヤー関連
  layers: any[];
  updateLayer: (id: string, updates: any) => void;
  removeLayer: (id: string) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  duplicateLayer: (id: string) => void;
  addLayer: (layer: any) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  
  // テンプレート関連
  selectedTemplate: any;
  setSelectedTemplate: (template: any) => void;
  
  // ツールパネル
  renderToolsPanel: () => React.ReactNode;
  
  // エクスポート関連
  handleBatchExport: (element: HTMLElement, settings: AssetExportSettings) => Promise<void>;
  handleAdvancedExport: (element: HTMLElement, settings: AssetExportSettings) => Promise<void>;
  handleAddShape: (shapeType: ShapeType) => void;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
  isDesktop,
  isSidebarOpen,
  setIsSidebarOpen,
  selectedTab,
  setSelectedTab,
  isExporting,
  isPreviewDedicatedMode,
  layers,
  updateLayer,
  removeLayer,
  selectedLayerId,
  setSelectedLayerId,
  reorderLayers,
  duplicateLayer,
  addLayer,
  moveLayerUp,
  moveLayerDown,
  selectedTemplate,
  setSelectedTemplate,
  renderToolsPanel,
  handleBatchExport,
  handleAdvancedExport,
  handleAddShape,
}) => {
  // サイドバーコンテンツ
  const sidebarContent = (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="settings">テンプレート</TabsTrigger>
        <TabsTrigger value="tools">ツール</TabsTrigger>
        <TabsTrigger value="layers">レイヤー</TabsTrigger>
        <TabsTrigger value="export">エクスポート</TabsTrigger>
      </TabsList>
      <TabsContent value="settings" className="mt-4">
        <TemplateSelector onSelectTemplate={setSelectedTemplate} selectedTemplateId={selectedTemplate?.id || null} />
      </TabsContent>
      <TabsContent value="tools" className="mt-4">
        {renderToolsPanel()}
      </TabsContent>
      <TabsContent value="layers" className="mt-4">
        <UnifiedLayerPanel 
          context={{
            layers,
            updateLayer,
            removeLayer,
            selectedLayerId,
            setSelectedLayerId,
            reorderLayers,
            duplicateLayer,
            addLayer,
            moveLayerUp,
            moveLayerDown,
          }}
          onShapeSelect={(shapeType) => handleAddShape(shapeType as ShapeType)}
          showShapeSelector={true}
        />
      </TabsContent>
      <TabsContent value="export" className="mt-4">
        <AssetExportSettingsPanel 
          onExport={(element, settings) => {
            if (settings.batchExport && settings.batchSizes.length > 0) {
              return handleBatchExport(element, settings);
            } else {
              return handleAdvancedExport(element, settings);
            }
          }}
          isExporting={isExporting}
        />
      </TabsContent>
    </Tabs>
  );

  // モバイル用のサイドバーコンテンツ（テンプレートとエクスポートのみ）
  const mobileSidebarContent = (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 h-12">
        <TabsTrigger value="settings" className="text-xs">テンプレート</TabsTrigger>
        <TabsTrigger value="export" className="text-xs">エクスポート</TabsTrigger>
      </TabsList>
      <TabsContent value="settings" className="mt-4">
        <TemplateSelector onSelectTemplate={setSelectedTemplate} selectedTemplateId={selectedTemplate?.id || null} />
      </TabsContent>
      <TabsContent value="export" className="mt-4">
        <AssetExportSettingsPanel 
          onExport={(element, settings) => {
            if (settings.batchExport && settings.batchSizes.length > 0) {
              return handleBatchExport(element, settings);
            } else {
              return handleAdvancedExport(element, settings);
            }
          }}
          isExporting={isExporting}
        />
      </TabsContent>
    </Tabs>
  );

  return (
    <>
      {/* サイドバーが閉じている場合の開くボタン */}
      {!isSidebarOpen && (
        <SidebarToggle
          onOpen={() => setIsSidebarOpen(true)}
          isDesktop={isDesktop}
          tabs={[
            { id: "settings", label: "テンプレート", icon: <Settings className="h-4 w-4" /> },
            { id: "tools", label: "ツール", icon: <Construction className="h-4 w-4" /> },
            { id: "layers", label: "レイヤー", icon: <Layers className="h-4 w-4" /> }
          ]}
          onTabClick={(tabId) => {
            logger.debug('タブクリック', { tabId }, 'SidebarSection');
            setSelectedTab(tabId);
          }}
        />
      )}

      {/* サイドバー（プレビュー専用モード時は非表示） */}
      {!isPreviewDedicatedMode && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          title=""
          isDesktop={isDesktop}
          className={`${isDesktop ? 'lg:w-96' : 'w-full max-w-sm'}`}
        >
          {isDesktop ? sidebarContent : mobileSidebarContent}
        </Sidebar>
      )}
    </>
  );
};
