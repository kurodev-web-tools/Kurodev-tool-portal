'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Keyboard, Save, Download, Settings } from 'lucide-react';
import { useState } from 'react';

export function ToolFooter() {
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  return (
    <footer className="border-t border-[#3A3A3A] bg-[#2D2D2D]/50 backdrop-blur-sm mt-auto">
      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* 左側: ステータス情報 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-[#20B2AA] rounded-full animate-pulse" />
              <span className="text-sm text-[#A0A0A0]">自動保存有効</span>
            </div>
            <Badge variant="outline" className="border-[#20B2AA]/30 text-[#20B2AA]">
              ベータ版
            </Badge>
          </div>

          {/* 右側: アクション */}
          <div className="flex items-center gap-2">
            {/* キーボードショートカット */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
              className="text-[#A0A0A0] hover:text-[#20B2AA] hover:bg-[#3A3A3A]"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              ショートカット
            </Button>

            {/* ヘルプ */}
            <Button
              variant="ghost"
              size="sm"
              className="text-[#A0A0A0] hover:text-[#20B2AA] hover:bg-[#3A3A3A]"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              ヘルプ
            </Button>

            {/* 設定 */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-[#A0A0A0] hover:text-[#20B2AA] hover:bg-[#3A3A3A]"
            >
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                設定
              </Link>
            </Button>
          </div>
        </div>

        {/* キーボードショートカット一覧 */}
        {showKeyboardShortcuts && (
          <div className="mt-4 p-4 bg-[#1A1A1A] rounded-lg border border-[#3A3A3A]">
            <h3 className="text-sm font-semibold mb-3 text-white">キーボードショートカット</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#A0A0A0]">保存</span>
                <kbd className="px-2 py-1 bg-[#2D2D2D] border border-[#3A3A3A] rounded text-xs text-white">Ctrl + S</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A0A0A0]">取り消し</span>
                <kbd className="px-2 py-1 bg-[#2D2D2D] border border-[#3A3A3A] rounded text-xs text-white">Ctrl + Z</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A0A0A0]">やり直し</span>
                <kbd className="px-2 py-1 bg-[#2D2D2D] border border-[#3A3A3A] rounded text-xs text-white">Ctrl + Y</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A0A0A0]">エクスポート</span>
                <kbd className="px-2 py-1 bg-[#2D2D2D] border border-[#3A3A3A] rounded text-xs text-white">Ctrl + E</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A0A0A0]">ヘルプ</span>
                <kbd className="px-2 py-1 bg-[#2D2D2D] border border-[#3A3A3A] rounded text-xs text-white">?</kbd>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ボトムバー */}
      <div className="border-t border-[#3A3A3A] bg-[#1A1A1A]">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between text-xs text-[#808080]">
          <p>© {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME || 'Kurodev Tools'}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-[#20B2AA] transition-colors">
              プライバシーポリシー
            </Link>
            <Link href="/terms-of-service" className="hover:text-[#20B2AA] transition-colors">
              利用規約
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

