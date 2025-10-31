'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Minimize2 } from "lucide-react";
import { Toolbar } from './Toolbar';
import type { HistoryEntry } from '@/utils/historyUtils';

interface ToolbarSectionProps {
  isDesktop: boolean;
  isPreviewDedicatedMode: boolean;
  setIsPreviewDedicatedMode: (mode: boolean) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  onFitToScreen?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showAspectGuide: boolean;
  setShowAspectGuide: (show: boolean) => void;
  showSafeArea: boolean;
  setShowSafeArea: (show: boolean) => void;
  showCenterLines: boolean;
  setShowCenterLines: (show: boolean) => void;
  handleToolbarUndo: () => void;
  handleToolbarRedo: () => void;
  handleSave: () => void;
  handleDownloadThumbnail: (qualityLevel: 'normal' | 'high' | 'super') => Promise<void>;
  history?: HistoryEntry[];
  historyIndex?: number;
  onJumpToHistory?: (index: number) => void;
}

export const ToolbarSection: React.FC<ToolbarSectionProps> = ({
  isDesktop,
  isPreviewDedicatedMode,
  setIsPreviewDedicatedMode,
  zoom,
  setZoom,
  onFitToScreen,
  canUndo,
  canRedo,
  showGrid,
  setShowGrid,
  showAspectGuide,
  setShowAspectGuide,
  showSafeArea,
  setShowSafeArea,
  showCenterLines,
  setShowCenterLines,
  handleToolbarUndo,
  handleToolbarRedo,
  handleSave,
  handleDownloadThumbnail,
  history,
  historyIndex,
  onJumpToHistory,
}) => {
  return (
    <>
      {/* ツールバー - デスクトップのみ表示 */}
      {isDesktop && (
        <Toolbar
          zoom={zoom}
          setZoom={setZoom}
          onFitToScreen={onFitToScreen}
          onUndo={handleToolbarUndo}
          onRedo={handleToolbarRedo}
          onSave={handleSave}
          onDownload={handleDownloadThumbnail}
          canUndo={canUndo}
          canRedo={canRedo}
          isPreviewDedicatedMode={isPreviewDedicatedMode}
          onTogglePreviewMode={() => setIsPreviewDedicatedMode(!isPreviewDedicatedMode)}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          showAspectGuide={showAspectGuide}
          setShowAspectGuide={setShowAspectGuide}
          showSafeArea={showSafeArea}
          setShowSafeArea={setShowSafeArea}
          showCenterLines={showCenterLines}
          setShowCenterLines={setShowCenterLines}
          history={history}
          historyIndex={historyIndex}
          onJumpToHistory={onJumpToHistory}
        />
      )}
      
      {/* モバイル表示でのフルスクリーン表示時の戻るボタン */}
      {!isDesktop && isPreviewDedicatedMode && (
        <div className="absolute top-2 left-2 z-20">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPreviewDedicatedMode(false)}
            className="bg-background/90 backdrop-blur-sm shadow-lg"
          >
            <Minimize2 className="h-4 w-4 mr-1" />
            通常表示に戻る
          </Button>
        </div>
      )}
    </>
  );
};
