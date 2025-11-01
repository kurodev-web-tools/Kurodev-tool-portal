import { useEffect, useCallback, useState } from 'react';
import { useEditorState } from './useEditorState';
import { useUIState } from './useUIState';
import { toast } from 'sonner';

interface UseKeyboardShortcutsParams {
  onSave?: () => void;
  onOpenShortcuts?: () => void;
  zoom?: number;
  setZoom?: (zoom: number) => void;
  onFitToScreen?: () => void;
  moveLayerUp?: (id: string) => void;
  moveLayerDown?: (id: string) => void;
}

/**
 * キーボードショートカットを管理するフック
 * 既存の機能を保持しながら、キーボードイベントを管理
 */
export const useKeyboardShortcuts = (params?: UseKeyboardShortcutsParams) => {
  console.log('useKeyboardShortcuts hook called');
  const editorState = useEditorState();
  console.log('editorState updated:', {
    canUndo: editorState.canUndo,
    canRedo: editorState.canRedo,
    selectedLayerId: editorState.selectedLayerId
  });

  // Shiftキーの状態を管理
  const [isShiftKeyDown, setIsShiftKeyDown] = useState(false);

  const {
    selectedLayerId,
    setSelectedLayerId,
    removeLayer,
    duplicateLayer,
    handleUndo,
    handleRedo,
  } = editorState;

  // canUndoとcanRedoをリアルタイムで計算（editorStateから取得した値が古い場合があるため）
  const canUndo = editorState.canUndo;
  const canRedo = editorState.canRedo;

  console.log('Keyboard shortcuts state:', { 
    canUndo, 
    canRedo, 
    selectedLayerId,
    editorStateCanUndo: editorState.canUndo,
    editorStateCanRedo: editorState.canRedo
  });

  // UI状態を取得（グリッド・ガイド設定用）
  const uiState = useUIState();

  const {
    onSave,
    onOpenShortcuts,
    zoom = 1,
    setZoom,
    onFitToScreen,
    moveLayerUp,
    moveLayerDown,
  } = params || {};

  // キーボードイベントハンドラー
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Shiftキーの状態を追跡
    if (e.key === 'Shift') {
      setIsShiftKeyDown(true);
      return;
    }

    // 最新のcanUndoとcanRedoを取得
    const currentCanUndo = editorState.canUndo;
    const currentCanRedo = editorState.canRedo;

    // Ctrl/Cmd + キーの組み合わせ
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'z':
          e.preventDefault();
          console.log('Ctrl+Z pressed', { 
            canUndo: currentCanUndo, 
            canRedo: currentCanRedo, 
            shiftKey: e.shiftKey 
          });
          if (e.shiftKey) {
            // Ctrl+Shift+Z: やり直し
            if (currentCanRedo) {
              console.log('Executing redo');
              handleRedo();
              toast.success('やり直しました');
            } else {
              console.log('Cannot redo');
            }
          } else {
            // Ctrl+Z: 元に戻す
            if (currentCanUndo) {
              console.log('Executing undo');
              handleUndo();
              toast.success('元に戻しました');
            } else {
              console.log('Cannot undo');
            }
          }
          break;
        case 'y':
          e.preventDefault();
          console.log('Ctrl+Y pressed', { canRedo: currentCanRedo });
          // Ctrl+Y: やり直し
          if (currentCanRedo) {
            console.log('Executing redo');
            handleRedo();
            toast.success('やり直しました');
          } else {
            console.log('Cannot redo');
          }
          break;
        case 'd':
          e.preventDefault();
          // Ctrl+D: レイヤーを複製
          if (selectedLayerId) {
            duplicateLayer(selectedLayerId);
            toast.success('レイヤーを複製しました');
          }
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          // Ctrl+Delete/Backspace: レイヤーを削除
          if (selectedLayerId) {
            removeLayer(selectedLayerId);
            toast.success('レイヤーを削除しました');
          }
          break;
        case 's':
        case 'S':
          e.preventDefault();
          // Ctrl+S: 保存
          if (onSave) {
            onSave();
          }
          break;
        case '0':
          e.preventDefault();
          // Ctrl+0: 画面にフィット
          if (onFitToScreen) {
            onFitToScreen();
          } else if (setZoom) {
            setZoom(1);
          }
          break;
        case '=':
        case '+':
          e.preventDefault();
          // Ctrl++: ズームイン
          if (setZoom && zoom < 3.0) {
            const newZoom = Math.min(zoom + 0.25, 3.0);
            setZoom(newZoom);
          }
          break;
        case '-':
          e.preventDefault();
          // Ctrl+-: ズームアウト
          if (setZoom && zoom > 0.1) {
            const newZoom = Math.max(zoom - 0.25, 0.1);
            setZoom(newZoom);
          }
          break;
        case ',':
          e.preventDefault();
          // Ctrl+,: ズームをリセット（100%）
          if (setZoom) {
            setZoom(1);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          // Ctrl+↑: レイヤーを上に移動
          if (selectedLayerId && moveLayerUp) {
            moveLayerUp(selectedLayerId);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          // Ctrl+↓: レイヤーを下に移動
          if (selectedLayerId && moveLayerDown) {
            moveLayerDown(selectedLayerId);
          }
          break;
      }
    }

    // 単独キー（入力欄でない場合のみ）
    const isInputFocused = document.activeElement?.tagName === 'INPUT' || 
                          document.activeElement?.tagName === 'TEXTAREA';
    
    if (!isInputFocused) {
      switch (e.key) {
        case '?':
          // ?: ショートカット一覧を表示
          if (onOpenShortcuts) {
            e.preventDefault();
            onOpenShortcuts();
          }
          break;
      }
    }

    // 単独キー
    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        // Delete/Backspace: レイヤーを削除
        if (selectedLayerId && !e.ctrlKey && !e.metaKey) {
          removeLayer(selectedLayerId);
          toast.success('レイヤーを削除しました');
        }
        break;
      case 'Escape':
        // Escape: 選択を解除
        if (selectedLayerId) {
          setSelectedLayerId(null);
        }
        break;
      case 'g':
      case 'G':
        // G: グリッド表示のトグル
        if (uiState?.setShowGrid) {
          const gridButton = document.querySelector('[aria-label*="グリッド"]') as HTMLElement;
          if (gridButton) {
            gridButton.click();
          } else {
            uiState.setShowGrid(!uiState.showGrid);
          }
        }
        break;
      case 's':
      case 'S':
        // S: セーフエリア表示のトグル（Ctrl+Sと競合しないように、Ctrlが押されていない場合のみ）
        if (!e.ctrlKey && !e.metaKey && uiState?.setShowSafeArea) {
          const safeAreaButton = document.querySelector('[aria-label*="セーフエリア"]') as HTMLElement;
          if (safeAreaButton) {
            safeAreaButton.click();
          } else {
            uiState.setShowSafeArea(!uiState.showSafeArea);
          }
        }
        break;
      case 'c':
      case 'C':
        // C: 中央線表示のトグル（Ctrl+Cと競合しないように、Ctrlが押されていない場合のみ）
        if (!e.ctrlKey && !e.metaKey && uiState?.setShowCenterLines) {
          const centerLinesButton = document.querySelector('[aria-label*="中央線"]') as HTMLElement;
          if (centerLinesButton) {
            centerLinesButton.click();
          } else {
            uiState.setShowCenterLines(!uiState.showCenterLines);
          }
        }
        break;
    }
  }, [
    editorState,
    selectedLayerId,
    setSelectedLayerId,
    removeLayer,
    duplicateLayer,
    handleUndo,
    handleRedo,
    setIsShiftKeyDown,
    uiState,
    onSave,
    onOpenShortcuts,
    zoom,
    setZoom,
    onFitToScreen,
    moveLayerUp,
    moveLayerDown,
  ]);

  // キーアップイベントハンドラー
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    // Shiftキーの状態を追跡
    if (e.key === 'Shift') {
      setIsShiftKeyDown(false);
    }
  }, [setIsShiftKeyDown]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return {
    isShiftKeyDown,
  };
};
