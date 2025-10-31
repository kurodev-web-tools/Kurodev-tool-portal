'use client';

import { useEffect, useCallback, useState } from 'react';
import { useTemplate } from '../contexts/TemplateContext';
import { toast } from 'sonner';

interface UseKeyboardShortcutsParams {
  canvasOperations: {
    undo: () => any;
    redo: () => any;
    canUndo: boolean;
    canRedo: boolean;
    saveToLocalStorage: (layers: any[], selectedLayerId: string | null) => boolean;
  };
  guideSettings?: {
    showGrid?: boolean;
    setShowGrid?: (show: boolean) => void;
    showSafeArea?: boolean;
    setShowSafeArea?: (show: boolean) => void;
    showCenterLines?: boolean;
    setShowCenterLines?: (show: boolean) => void;
  };
}

/**
 * キーボードショートカットを管理するフック
 * 既存の機能を保持しながら、キーボードイベントを管理
 */
export const useKeyboardShortcuts = ({ canvasOperations, guideSettings }: UseKeyboardShortcutsParams) => {
  console.log('useKeyboardShortcuts hook called');
  
  const templateContext = useTemplate();
  
  console.log('Canvas operations state:', {
    canUndo: canvasOperations.canUndo,
    canRedo: canvasOperations.canRedo,
    selectedLayerId: templateContext.selectedLayerId
  });

  // Shiftキーの状態を管理
  const [isShiftKeyDown, setIsShiftKeyDown] = useState(false);

  const {
    selectedLayerId,
    setSelectedLayerId,
    removeLayer,
    duplicateLayer,
  } = templateContext;

  const {
    undo,
    redo,
    canUndo,
    canRedo,
  } = canvasOperations;

  console.log('Keyboard shortcuts state:', {
    canUndo,
    canRedo,
    selectedLayerId,
    canvasOperationsCanUndo: canvasOperations.canUndo,
    canvasOperationsCanRedo: canvasOperations.canRedo
  });

  // キーボードイベントハンドラー
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Shiftキーの状態を追跡
    if (e.key === 'Shift') {
      setIsShiftKeyDown(true);
      return;
    }

    // 最新のcanUndoとcanRedoを取得
    const currentCanUndo = canvasOperations.canUndo;
    const currentCanRedo = canvasOperations.canRedo;

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
              const result = redo();
              if (result) {
                toast.success('やり直しました');
              }
            } else {
              console.log('Cannot redo');
            }
          } else {
            // Ctrl+Z: 元に戻す
            if (currentCanUndo) {
              console.log('Executing undo');
              const result = undo();
              if (result) {
                toast.success('元に戻しました');
              }
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
            const result = redo();
            if (result) {
              toast.success('やり直しました');
            }
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
          e.preventDefault();
          // Ctrl+S: 保存
          const saved = canvasOperations.saveToLocalStorage(templateContext.layers, templateContext.selectedLayerId);
          if (saved) {
            toast.success('プロジェクトを保存しました');
          } else {
            toast.error('保存に失敗しました');
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
        if (guideSettings?.setShowGrid && guideSettings?.showGrid !== undefined) {
          guideSettings.setShowGrid(!guideSettings.showGrid);
        }
        break;
      case 's':
      case 'S':
        // S: セーフエリア表示のトグル（Ctrl+Sと競合しないように、Ctrlが押されていない場合のみ）
        if (!e.ctrlKey && !e.metaKey && guideSettings?.setShowSafeArea && guideSettings?.showSafeArea !== undefined) {
          guideSettings.setShowSafeArea(!guideSettings.showSafeArea);
        }
        break;
      case 'c':
      case 'C':
        // C: 中央線表示のトグル（Ctrl+Cと競合しないように、Ctrlが押されていない場合のみ）
        if (!e.ctrlKey && !e.metaKey && guideSettings?.setShowCenterLines && guideSettings?.showCenterLines !== undefined) {
          guideSettings.setShowCenterLines(!guideSettings.showCenterLines);
        }
        break;
    }
  }, [
    canvasOperations,
    templateContext,
    selectedLayerId,
    setSelectedLayerId,
    removeLayer,
    duplicateLayer,
    undo,
    redo,
    setIsShiftKeyDown,
    guideSettings,
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
    canUndo,
    canRedo,
  };
};


