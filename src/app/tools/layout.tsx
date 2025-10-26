'use client';

import { usePathname } from 'next/navigation';
import { ToolHeader } from '@/components/tools/ToolHeader';
import { ToolFooter } from '@/components/tools/ToolFooter';

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // /tools ページ（個別ツール一覧）の場合はヘッダー・フッターを表示しない
  // グローバルの Header/Footer を使用
  if (pathname === '/tools') {
    return <>{children}</>;
  }
  
  // /tools/xxx ページ（各ツールページ）の場合は ToolHeader/ToolFooter を使用
  return (
    <div className="min-h-screen flex flex-col bg-[#1A1A1A]">
      <ToolHeader />
      <main className="flex-grow">
        {children}
      </main>
      <ToolFooter />
    </div>
  );
}

