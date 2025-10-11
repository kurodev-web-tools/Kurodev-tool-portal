/**
 * サムネイル生成ツールのサイドバーコンテンツコンポーネント
 * デスクトップ版とモバイル版の両方のサイドバーを提供
 */

'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemplateSelector from './TemplateSelector';
import { UnifiedLayerPanel } from '@/components/shared/UnifiedLayerPanel';
import { ExportSettingsPanel } from './ExportSettingsPanel';
import { ThumbnailToolsPanel } from './ThumbnailToolsPanel';
import { ThumbnailTemplate } from '@/types/template';
import { Layer, ShapeType } from '../contexts/TemplateContext';
import { ThumbnailEditorHandlers } from '../hooks/useThumbnailEditorHandlers';

export interface ThumbnailSidebarContentProps {
  // UI状態
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  shadowEnabled: boolean;
  setShadowEnabled: (value: boolean) => void;
  isExporting: boolean;
  
  // Template
  selectedTemplate: ThumbnailTemplate | null;
  setSelectedTemplate: (template: ThumbnailTemplate) => void;
  
  // Layers
  layers: Layer[];
  selectedLayerId: string | null;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  setSelectedLayerId: (id: string | null) => void;
  reorderLayers: (startIndex: number, endIndex: number) => void;
  duplicateLayer: (id: string) => void;
  addLayer: (layer: Omit<Layer, 'id' | 'rotation' | 'zIndex'>) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  
  // Handlers
  handlers: ThumbnailEditorHandlers;
}

/**
 * デスクトップ版サイドバーコンテンツ
 */
export const DesktopThumbnailSidebar: React.FC<ThumbnailSidebarContentProps> = ({
  selectedTab,
  setSelectedTab,
  shadowEnabled,
  setShadowEnabled,
  isExporting,
  selectedTemplate,
  setSelectedTemplate,
  layers,
  selectedLayerId,
  updateLayer,
  removeLayer,
  setSelectedLayerId,
  reorderLayers,
  duplicateLayer,
  addLayer,
  moveLayerUp,
  moveLayerDown,
  handlers,
}) => {
  const selectedLayer = layers.find(layer => layer.id === selectedLayerId);

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="settings">テンプレート</TabsTrigger>
        <TabsTrigger value="tools">ツール</TabsTrigger>
        <TabsTrigger value="layers">レイヤー</TabsTrigger>
        <TabsTrigger value="export">エクスポート</TabsTrigger>
      </TabsList>
      <TabsContent value="settings" className="mt-4">
        <TemplateSelector onSelectTemplate={setSelectedTemplate} selectedTemplateId={selectedTemplate?.id || ''} />
      </TabsContent>
      <TabsContent value="tools" className="mt-4">
        <ThumbnailToolsPanel
          selectedLayer={selectedLayer}
          updateLayer={updateLayer}
          shadowEnabled={shadowEnabled}
          setShadowEnabled={setShadowEnabled}
        />
      </TabsContent>
      <TabsContent value="layers" className="mt-4">
        <UnifiedLayerPanel 
          context={{
            layers: layers as never[],
            updateLayer: updateLayer as never,
            removeLayer,
            selectedLayerId,
            setSelectedLayerId,
            reorderLayers,
            duplicateLayer,
            addLayer: addLayer as never,
            moveLayerUp,
            moveLayerDown,
          }}
          onShapeSelect={(shapeType) => handlers.handleAddShape(shapeType as ShapeType)}
          showShapeSelector={true}
        />
      </TabsContent>
      <TabsContent value="export" className="mt-4">
        <ExportSettingsPanel onExport={handlers.handleAdvancedExport} isExporting={isExporting} />
      </TabsContent>
    </Tabs>
  );
};

/**
 * モバイル版サイドバーコンテンツ
 */
export const MobileThumbnailSidebar: React.FC<ThumbnailSidebarContentProps> = ({
  selectedTab,
  setSelectedTab,
  isExporting,
  selectedTemplate,
  setSelectedTemplate,
  handlers,
}) => {
  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <TabsList className="w-full h-12 items-center justify-center rounded-md bg-secondary p-1 text-secondary-foreground">
        <TabsTrigger 
          value="settings"
          className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        >
          テンプレート
        </TabsTrigger>
        <TabsTrigger 
          value="export"
          className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        >
          エクスポート
        </TabsTrigger>
      </TabsList>
      <TabsContent value="settings" className="mt-4">
        <TemplateSelector onSelectTemplate={setSelectedTemplate} selectedTemplateId={selectedTemplate?.id || ''} />
      </TabsContent>
      <TabsContent value="export" className="mt-4">
        <ExportSettingsPanel onExport={handlers.handleAdvancedExport} isExporting={isExporting} />
      </TabsContent>
    </Tabs>
  );
};

