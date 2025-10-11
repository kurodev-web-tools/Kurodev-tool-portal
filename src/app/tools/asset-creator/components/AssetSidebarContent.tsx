/**
 * アセットクリエイターのサイドバーコンテンツコンポーネント
 * デスクトップ版とモバイル版の両方のサイドバーを提供
 */

'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemplateSelector from './TemplateSelector';
import { UnifiedLayerPanel } from '@/components/shared/UnifiedLayerPanel';
import { AssetExportSettingsPanel } from './AssetExportSettingsPanel';
import { ToolsPanel } from './ToolsPanel';
import { Template } from '@/hooks/useTemplateManagement';
import { Layer, ShapeType } from '../contexts/TemplateContext';
import { AssetEditorHandlers } from '../hooks/useAssetEditorHandlers';

export interface AssetSidebarContentProps {
  // UI状態
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  shadowEnabled: boolean;
  setShadowEnabled: (value: boolean) => void;
  isExporting: boolean;
  isMobile?: boolean;
  
  // Template
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template | null) => void;
  
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
  handlers: AssetEditorHandlers;
}

/**
 * デスクトップ版サイドバーコンテンツ
 */
export const DesktopSidebarContent: React.FC<AssetSidebarContentProps> = ({
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
        <TemplateSelector onSelectTemplate={setSelectedTemplate} selectedTemplateId={selectedTemplate?.id || null} />
      </TabsContent>
      <TabsContent value="tools" className="mt-4">
        <ToolsPanel
          selectedLayer={selectedLayer}
          updateLayer={updateLayer}
          shadowEnabled={shadowEnabled}
          setShadowEnabled={setShadowEnabled}
        />
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
          onShapeSelect={(shapeType) => handlers.handleAddShape(shapeType as ShapeType)}
          showShapeSelector={true}
        />
      </TabsContent>
      <TabsContent value="export" className="mt-4">
        <AssetExportSettingsPanel 
          onExport={(element, settings) => {
            if (settings.batchExport && settings.batchSizes.length > 0) {
              return handlers.handleBatchExport(element, settings);
            } else {
              return handlers.handleAdvancedExport(element, settings);
            }
          }}
          isExporting={isExporting}
        />
      </TabsContent>
    </Tabs>
  );
};

/**
 * モバイル版サイドバーコンテンツ
 */
export const MobileSidebarContent: React.FC<AssetSidebarContentProps> = ({
  selectedTab,
  setSelectedTab,
  isExporting,
  selectedTemplate,
  setSelectedTemplate,
  handlers,
}) => {
  return (
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
              return handlers.handleBatchExport(element, settings);
            } else {
              return handlers.handleAdvancedExport(element, settings);
            }
          }}
          isExporting={isExporting}
        />
      </TabsContent>
    </Tabs>
  );
};

