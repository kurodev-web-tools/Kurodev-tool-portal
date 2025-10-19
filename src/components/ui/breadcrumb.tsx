'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbProps {
  className?: string;
  customItems?: BreadcrumbItem[];
}

const pathLabels: Record<string, string> = {
  '/': 'ホーム',
  '/tools': '個別ツール',
  '/tools/schedule-calendar': 'スケジュール管理',
  '/tools/script-generator': '台本生成AI',
  '/tools/thumbnail-generator': 'サムネイル生成',
  '/tools/branding-generator': 'ブランディング生成',
  '/tools/title-generator': 'タイトル生成',
  '/tools/schedule-adjuster': 'スケジュール調整',
  '/tools/asset-creator': 'アセット作成',
  '/tools/virtual-bg-generator': 'バーチャル背景生成',
  '/about': 'このサイトについて',
  '/contact': 'お問い合わせ',
  '/privacy': 'プライバシーポリシー',
  '/terms': '利用規約',
};

export function Breadcrumb({ className, customItems }: BreadcrumbProps) {
  const pathname = usePathname();

  // カスタムアイテムが提供されている場合はそれを使用
  const breadcrumbItems = customItems || generateBreadcrumbItems(pathname || '/');

  if (breadcrumbItems.length <= 1) {
    return null; // ホームページのみの場合は表示しない
  }

  return (
    <nav 
      className={cn(
        "flex items-center space-x-1 text-sm text-gray-400 mb-6",
        className
      )}
      aria-label="パンくずリスト"
    >
      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index === 0 ? (
            <Link
              href={item.href}
              className={cn(
                "flex items-center space-x-1 hover:text-[#20B2AA] transition-colors",
                item.isCurrentPage && "text-gray-300 cursor-default"
              )}
              aria-current={item.isCurrentPage ? 'page' : undefined}
            >
              <Home className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ) : (
            <>
              <ChevronRight className="h-4 w-4 text-gray-500 mx-2" />
              {item.isCurrentPage ? (
                <span className="text-gray-300 font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-[#20B2AA] transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </>
          )}
        </div>
      ))}
    </nav>
  );
}

function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [
    { label: 'ホーム', href: '/' }
  ];

  let currentPath = '';
  
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const isLast = i === segments.length - 1;
    
    items.push({
      label: pathLabels[currentPath] || segments[i],
      href: currentPath,
      isCurrentPage: isLast
    });
  }

  return items;
}

// ブレッドクラムアイテムを生成するヘルパー関数
export function createBreadcrumbItems(items: BreadcrumbItem[]): BreadcrumbItem[] {
  return items;
}
