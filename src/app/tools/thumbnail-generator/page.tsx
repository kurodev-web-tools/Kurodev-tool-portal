'use client';

import React from 'react';
import { toast } from "sonner";
import { Settings, Layers, Construction } from "lucide-react";
import { useSidebar } from '@/hooks/use-sidebar';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { Sidebar, SidebarToggle } from '@/components/layouts/Sidebar';
import { logger } from '@/lib/logger';

import { useTemplate, TemplateProvider } from './contexts/TemplateContext';
import { useCanvasOperations } from '../asset-creator/hooks/useCanvasOperations';
import { useThumbnailEditorState } from './hooks/useThumbnailEditorState';
import { useThumbnailEditorHandlers } from './hooks/useThumbnailEditorHandlers';
import { ThumbnailPreviewArea, ThumbnailMobileControls } from './components/ThumbnailPreviewArea';
import { DesktopThumbnailSidebar, MobileThumbnailSidebar } from './components/ThumbnailSidebarContent';

function ThumbnailGeneratorPage() {
  // UI状態管理
  const { isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen, isDesktop } = useSidebar({
    defaultOpen: false,
    desktopDefaultOpen: true,
  });
  
  const { handleAsyncError } = useErrorHandler();
  
  // State管理（カスタムフック）
  const editorState = useThumbnailEditorState();
  
  // テンプレートと要素の状態をコンテキストから取得
  const {
    selectedTemplate,
    setSelectedTemplate,
    currentText,
    layers,
    addLayer,
    removeLayer,
    updateLayer,
    selectedLayerId,
    setSelectedLayerId,
    reorderLayers,
    duplicateLayer,
    moveLayerUp,
    moveLayerDown,
    aspectRatio,
    customAspectRatio,
  } = useTemplate();

  const selectedLayer = layers.find(layer => layer.id === selectedLayerId);

  // シャドウの有効/無効状態を同期
  React.useEffect(() => {
    if (selectedLayer?.textShadow && selectedLayer.textShadow !== 'none') {
      editorState.setShadowEnabled(true);
    } else {
      editorState.setShadowEnabled(false);
    }
  }, [selectedLayer?.textShadow, editorState]);

  // プレビューエリアのサイズ計算
  const getPreviewSize = React.useCallback(() => {
    if (!isDesktop) {
      return { maxWidth: '100%', maxHeight: '50vh' };
    }

    const size = editorState.isPreviewDedicatedMode
      ? { maxWidth: '95vw', maxHeight: '95vh' }
      : isSidebarOpen
      ? { maxWidth: '65vw', maxHeight: '85vh' }
      : { maxWidth: '90vw', maxHeight: '85vh' };

    logger.debug('Preview size', { isDesktop, isPreviewDedicatedMode: editorState.isPreviewDedicatedMode, isSidebarOpen, size }, 'ThumbnailGenerator');
    return size;
  }, [isDesktop, editorState.isPreviewDedicatedMode, isSidebarOpen]);

  // キャンバス操作機能
  const {
    zoom,
    setZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    addToHistory,
    resetHistoryFlag,
    saveToLocalStorage,
  } = useCanvasOperations(layers, selectedLayerId);

  // イベントハンドラー（カスタムフック）
  const handlers = useThumbnailEditorHandlers({
    setIsExporting: (value: boolean) => {}, // Note: isExportingはuseThumbnailEditorState内で管理されていないため、ここでは空の関数
    layers,
    selectedLayerId,
    currentText,
    isDesktop,
    addLayer,
    updateLayer,
    addToHistory,
    undo,
    redo,
    resetHistoryFlag,
    saveToLocalStorage,
    handleAsyncError,
  });

  // キー入力のイベントハンドラー
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') editorState.setIsShiftKeyDown(true);
      
      // キーボードショートカット
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              const redoState = redo();
              if (redoState) {
                resetHistoryFlag();
              }
            } else {
              const undoState = undo();
              if (undoState) {
                resetHistoryFlag();
              }
            }
            break;
          case 'y':
            e.preventDefault();
            const redoState = redo();
            if (redoState) {
              resetHistoryFlag();
            }
            break;
          case 's':
            e.preventDefault();
            const saved = saveToLocalStorage(layers, selectedLayerId);
            if (saved) {
              toast.success('プロジェクトを保存しました');
            } else {
              toast.error('保存に失敗しました');
            }
            break;
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') editorState.setIsShiftKeyDown(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [undo, redo, resetHistoryFlag, saveToLocalStorage, layers, selectedLayerId, editorState]);

  // デスクトップ表示時は初期状態でサイドバーを開く
  React.useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [isDesktop, setIsSidebarOpen]);

  if (!selectedTemplate) {
    return <div className="flex h-full items-center justify-center"><p>テンプレートを読み込み中...</p></div>;
  }

  // サイドバーコンテンツのprops
  const sidebarProps = {
    selectedTab: editorState.selectedTab,
    setSelectedTab: editorState.setSelectedTab,
    shadowEnabled: editorState.shadowEnabled,
    setShadowEnabled: editorState.setShadowEnabled,
    isExporting: false, // Note: isExportingはuseThumbnailEditorStateに含まれていないため暫定値
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
  };

  return (
    <div className="relative flex flex-col lg:h-screen">
      {/* モバイル用オーバーレイ（サイドバーが開いている時のみ表示） */}
      {isSidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col lg:flex-row flex-grow lg:h-full">
        <main className="flex-1 flex flex-col lg:h-full p-2 pt-16 lg:p-4 lg:pt-4">
          <div className={`${isDesktop ? 'flex-1 flex flex-col min-h-[600px] lg:min-h-0' : 'flex-shrink-0'}`}>
            <ThumbnailPreviewArea
              isDesktop={isDesktop}
              isPreviewDedicatedMode={editorState.isPreviewDedicatedMode}
              setIsPreviewDedicatedMode={editorState.setIsPreviewDedicatedMode}
              isShiftKeyDown={editorState.isShiftKeyDown}
              selectedTab={editorState.selectedTab}
              setSelectedTab={editorState.setSelectedTab}
              aspectRatio={aspectRatio}
              customAspectRatio={customAspectRatio}
              zoom={zoom}
              setZoom={setZoom}
              showGrid={editorState.showGrid}
              setShowGrid={editorState.setShowGrid}
              showAspectGuide={editorState.showAspectGuide}
              setShowAspectGuide={editorState.setShowAspectGuide}
              showSafeArea={editorState.showSafeArea}
              setShowSafeArea={editorState.setShowSafeArea}
              gridSize={editorState.gridSize}
              setGridSize={editorState.setGridSize}
              shadowEnabled={editorState.shadowEnabled}
              setShadowEnabled={editorState.setShadowEnabled}
              canUndo={canUndo}
              canRedo={canRedo}
              layers={layers}
              selectedLayerId={selectedLayerId}
              setSelectedLayerId={setSelectedLayerId}
              updateLayer={updateLayer}
              removeLayer={removeLayer}
              reorderLayers={reorderLayers}
              duplicateLayer={duplicateLayer}
              addLayer={addLayer}
              moveLayerUp={moveLayerUp}
              moveLayerDown={moveLayerDown}
              handlers={handlers}
              getPreviewSize={getPreviewSize}
            />
          </div>
          
          {/* モバイル用コントロール - プレビュー専用モード時は非表示 */}
          {!isDesktop && !editorState.isPreviewDedicatedMode && (
            <div className="border-t bg-background/95 backdrop-blur-sm">
              <div className="p-2">
                <p className="text-xs text-muted-foreground mb-2">
                  💡 ヒント: 「ツール設定」でレイヤーの詳細編集、「レイヤー管理」でレイヤーの並び替えができます。テンプレートやエクスポートはサイドバーからアクセスできます。
                </p>
              </div>
              <ThumbnailMobileControls
                selectedTab={editorState.selectedTab}
                setSelectedTab={editorState.setSelectedTab}
                selectedLayer={selectedLayer}
                updateLayer={updateLayer}
                shadowEnabled={editorState.shadowEnabled}
                setShadowEnabled={editorState.setShadowEnabled}
                layers={layers}
                selectedLayerId={selectedLayerId}
                setSelectedLayerId={setSelectedLayerId}
                removeLayer={removeLayer}
                reorderLayers={reorderLayers}
                duplicateLayer={duplicateLayer}
                addLayer={addLayer}
                moveLayerUp={moveLayerUp}
                moveLayerDown={moveLayerDown}
                handlers={handlers}
                setIsPreviewDedicatedMode={editorState.setIsPreviewDedicatedMode}
              />
            </div>
          )}
        </main>

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
              logger.debug('Tab clicked', { tabId }, 'ThumbnailGenerator');
            }}
          />
        )}

        {/* サイドバー（プレビュー専用モード時は非表示） */}
        {!editorState.isPreviewDedicatedMode && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            title=""
            isDesktop={isDesktop}
            className={`${isDesktop ? 'lg:w-96' : 'w-full max-w-sm'}`}
          >
            {isDesktop ? (
              <DesktopThumbnailSidebar {...sidebarProps} />
            ) : (
              <MobileThumbnailSidebar {...sidebarProps} />
            )}
          </Sidebar>
        )}
      </div>
    </div>
  );
}

// TemplateProviderでラップしたコンポーネント
export default function ThumbnailGeneratorPageWithProvider() {
  return (
    <TemplateProvider>
      <ThumbnailGeneratorPage />
    </TemplateProvider>
  );
}
