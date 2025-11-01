'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'basic' | 'layer' | 'view' | 'export';
}

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUTS: ShortcutItem[] = [
  // 基本操作
  { keys: ['Ctrl', 'Z'], description: '元に戻す', category: 'basic' },
  { keys: ['Ctrl', 'Y'], description: 'やり直し', category: 'basic' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'やり直し（別パターン）', category: 'basic' },
  { keys: ['Ctrl', 'S'], description: 'プロジェクトを保存', category: 'basic' },
  { keys: ['?'], description: 'ショートカット一覧を表示', category: 'basic' },
  { keys: ['Esc'], description: '選択を解除', category: 'basic' },
  
  // レイヤー操作
  { keys: ['Delete'], description: 'レイヤーを削除', category: 'layer' },
  { keys: ['Backspace'], description: 'レイヤーを削除（別パターン）', category: 'layer' },
  { keys: ['Ctrl', 'D'], description: 'レイヤーを複製', category: 'layer' },
  { keys: ['Ctrl', '↑'], description: 'レイヤーを上に移動', category: 'layer' },
  { keys: ['Ctrl', '↓'], description: 'レイヤーを下に移動', category: 'layer' },
  
  // 表示設定
  { keys: ['G'], description: 'グリッド表示の切り替え', category: 'view' },
  { keys: ['S'], description: 'セーフエリア表示の切り替え', category: 'view' },
  { keys: ['C'], description: '中央線表示の切り替え', category: 'view' },
  { keys: ['Ctrl', '0'], description: '画面にフィット', category: 'view' },
  { keys: ['Ctrl', '+'], description: 'ズームイン', category: 'view' },
  { keys: ['Ctrl', '-'], description: 'ズームアウト', category: 'view' },
  { keys: ['Ctrl', ','], description: 'ズームをリセット（100%）', category: 'view' },
];

const CATEGORY_LABELS = {
  basic: '基本操作',
  layer: 'レイヤー操作',
  view: '表示設定',
  export: 'エクスポート',
};

const KEY_DISPLAY: Record<string, string> = {
  'Ctrl': 'Ctrl',
  'Shift': 'Shift',
  'Alt': 'Alt',
  'Meta': '⌘',
  'Esc': 'Esc',
  'Delete': 'Del',
  'Backspace': '⌫',
  '↑': '↑',
  '↓': '↓',
  '←': '←',
  '→': '→',
  '+': '+',
  '-': '-',
  '0': '0',
  ',': ',',
  '?': '?',
  'G': 'G',
  'S': 'S',
  'C': 'C',
  'Z': 'Z',
  'Y': 'Y',
  'D': 'D',
};

export const ShortcutsDialog: React.FC<ShortcutsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const shortcutsByCategory = React.useMemo(() => {
    const grouped: Record<string, ShortcutItem[]> = {
      basic: [],
      layer: [],
      view: [],
      export: [],
    };
    SHORTCUTS.forEach(shortcut => {
      grouped[shortcut.category].push(shortcut);
    });
    return grouped;
  }, []);

  const formatKey = (key: string): string => {
    return KEY_DISPLAY[key] || key.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#1A1A1A] border border-[#4A4A4A]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#E0E0E0]">
            キーボードショートカット
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {Object.entries(shortcutsByCategory).map(([category, shortcuts]) => {
            if (shortcuts.length === 0) return null;
            
            return (
              <div key={category}>
                <h3 className="text-sm font-semibold text-[#A0A0A0] mb-3">
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                </h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded hover:bg-[#2D2D2D] transition-colors"
                    >
                      <span className="text-sm text-[#E0E0E0]">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs font-mono px-2 py-1 min-w-[32px] text-center",
                                "bg-[#2D2D2D] border-[#4A4A4A] text-[#E0E0E0]",
                                "font-semibold"
                              )}
                            >
                              {formatKey(key)}
                            </Badge>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-[#A0A0A0] text-xs mx-1">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {category !== 'export' && <Separator className="mt-4 bg-[#4A4A4A]" />}
              </div>
            );
          })}
        </div>
        
        <div className="pt-4 border-t border-[#4A4A4A]">
          <p className="text-xs text-[#A0A0A0] text-center">
            💡 ヒント: キーボードショートカットで作業効率を向上させましょう
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

