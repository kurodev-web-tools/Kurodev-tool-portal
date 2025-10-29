'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar, SidebarToggle } from '@/components/layouts/Sidebar';
import { Layers, FolderOpen } from "lucide-react";
import { logger } from '@/lib/logger';

import { useTemplate } from '../contexts/TemplateContext';
import TemplateSelector from './TemplateSelector';
import { UnifiedLayerPanel } from '@/components/shared/UnifiedLayerPanel';

interface LeftSidebarProps {
  isDesktop: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  
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
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isDesktop,
  isSidebarOpen,
  setIsSidebarOpen,
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
}) => {
  const [selectedTab, setSelectedTab] = React.useState("templates");

  // サイドバーコンテンツ
  const sidebarContent = (
    <div className="h-full flex flex-col min-w-0 max-w-full overflow-x-hidden">
      <div className="p-3 border-b border-[#4A4A4A] min-w-0">
        <h2 className="text-base font-semibold text-[#A0A0A0] truncate">素材・レイヤー</h2>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col min-w-0">
        <TabsList className="grid w-10/12 grid-cols-2 mx-auto mt-4 min-w-0">
          <TabsTrigger value="templates" className="text-xs p-2 min-w-0 flex-col gap-2 max-w-full">
            <FolderOpen className="h-4 w-4" />
            <span className="truncate text-xs">素材</span>
          </TabsTrigger>
          <TabsTrigger value="layers" className="text-xs p-2 min-w-0 flex-col gap-2 max-w-full">
            <Layers className="h-4 w-4" />
            <span className="truncate text-xs">レイヤー</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="flex-1 px-3 pb-3 pt-2 mt-8 min-w-0 max-w-full overflow-x-hidden">
          <div className="min-w-0 max-w-full">
            <TemplateSelector 
              onSelectTemplate={setSelectedTemplate} 
              selectedTemplateId={selectedTemplate?.id || null} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="layers" className="flex-1 px-3 pb-3 pt-2 mt-8 min-w-0 max-w-full overflow-x-hidden">
          <div className="min-w-0 max-w-full">
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
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  // デスクトップ表示
  if (isDesktop) {
    return (
      <div className="w-1/5 border-r border-[#4A4A4A] bg-[#1A1A1A] overflow-y-auto overflow-x-hidden">
        {sidebarContent}
      </div>
    );
  }

  // モバイル表示（既存のサイドバー方式を踏襲）
  return (
    <>
      <SidebarToggle 
        onOpen={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden"
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title="素材・レイヤー"
      >
        {sidebarContent}
      </Sidebar>
    </>
  );
};
