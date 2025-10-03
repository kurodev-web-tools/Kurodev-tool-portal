'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onSelectAll?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  onToggleVisibility?: () => void;
  onToggleLock?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isEnabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onUndo,
  onRedo,
  onSave,
  onDelete,
  onDuplicate,
  onSelectAll,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleVisibility,
  onToggleLock,
  canUndo = false,
  canRedo = false,
  isEnabled = true,
}: KeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    // フォーカスが入力フィールドにある場合はショートカットを無効化
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    const { ctrlKey, metaKey, shiftKey, key } = event;
    const isModifierPressed = ctrlKey || metaKey;

    // 基本操作
    if (isModifierPressed && key === 'z' && !shiftKey && canUndo) {
      event.preventDefault();
      onUndo?.();
      return;
    }

    if (isModifierPressed && ((key === 'y') || (key === 'z' && shiftKey)) && canRedo) {
      event.preventDefault();
      onRedo?.();
      return;
    }

    if (isModifierPressed && key === 's') {
      event.preventDefault();
      onSave?.();
      return;
    }

    // レイヤー操作
    if (key === 'Delete' || key === 'Backspace') {
      event.preventDefault();
      onDelete?.();
      return;
    }

    if (isModifierPressed && key === 'd') {
      event.preventDefault();
      onDuplicate?.();
      return;
    }

    if (isModifierPressed && key === 'a') {
      event.preventDefault();
      onSelectAll?.();
      return;
    }

    // ビュー操作
    if (isModifierPressed && key === '=') {
      event.preventDefault();
      onZoomIn?.();
      return;
    }

    if (isModifierPressed && key === '-') {
      event.preventDefault();
      onZoomOut?.();
      return;
    }

    if (isModifierPressed && key === '0') {
      event.preventDefault();
      onZoomReset?.();
      return;
    }

    // 表示・ロック切り替え
    if (key === 'v' && !isModifierPressed) {
      event.preventDefault();
      onToggleVisibility?.();
      return;
    }

    if (key === 'l' && !isModifierPressed) {
      event.preventDefault();
      onToggleLock?.();
      return;
    }
  }, [
    isEnabled,
    onUndo,
    onRedo,
    onSave,
    onDelete,
    onDuplicate,
    onSelectAll,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onToggleVisibility,
    onToggleLock,
    canUndo,
    canRedo,
  ]);

  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, isEnabled]);

  // ショートカット一覧を返す（ヘルプ表示用）
  const shortcuts = [
    { key: 'Ctrl+Z', description: '元に戻す', enabled: canUndo },
    { key: 'Ctrl+Y / Ctrl+Shift+Z', description: 'やり直し', enabled: canRedo },
    { key: 'Ctrl+S', description: '保存', enabled: true },
    { key: 'Delete / Backspace', description: 'レイヤー削除', enabled: true },
    { key: 'Ctrl+D', description: 'レイヤー複製', enabled: true },
    { key: 'Ctrl+A', description: '全選択', enabled: true },
    { key: 'Ctrl++', description: 'ズームイン', enabled: true },
    { key: 'Ctrl+-', description: 'ズームアウト', enabled: true },
    { key: 'Ctrl+0', description: 'ズームリセット', enabled: true },
    { key: 'V', description: '表示/非表示切り替え', enabled: true },
    { key: 'L', description: 'ロック/アンロック切り替え', enabled: true },
  ];

  return { shortcuts };
};


