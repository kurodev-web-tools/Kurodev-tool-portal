import { useEffect, useCallback, useState } from 'react';
import { useEditorState } from './useEditorState';
import { toast } from 'sonner';

/**
 * キーボードショートカットを管理するフック
 * 既存の機能を保持しながら、キーボードイベントを管理
 */
export const useKeyboardShortcuts = () => {
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
