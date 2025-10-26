'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface RootHeaderFooterProps {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
}

export function RootHeaderFooter({ children, header, footer }: RootHeaderFooterProps) {
  const pathname = usePathname();
  
  // /toolsページ（個別ツール一覧）は通常のヘッダー・フッターを使用
  // /tools/[id]（各ツールページ）はツール専用レイアウトが使用される
  if (pathname === '/tools') {
    return (
      <>
        {header}
        <main className="flex-grow">
          {children}
        </main>
        {footer}
      </>
    );
  }
  
  // /tools/xxx（各ツールページ）の場合、ヘッダー・フッターを表示せず、ツール専用レイアウトが使用される
  if (pathname?.startsWith('/tools/')) {
    return <>{children}</>;
  }

  // それ以外のページでは通常のヘッダー・フッターを表示
  return (
    <>
      {header}
      <main className="flex-grow">
        {children}
      </main>
      {footer}
    </>
  );
}
