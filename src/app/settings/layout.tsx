'use client';

import { useEffect } from 'react';
import Link from "next/link";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const { user, isLoading } = useAuth(); // isLoading を取得
  const router = useRouter();

  useEffect(() => {
    // 認証情報の読み込みが完了し、かつユーザーがいない場合にリダイレクト
    if (!isLoading && user === null) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const navItems = [
    { href: "/settings/profile", label: "プロフィール" },
    { href: "/settings/account", label: "アカウント" },
    { href: "/settings/notifications", label: "通知" },
    { href: "/settings/ai", label: "AI設定" },
  ];

  // 認証情報の読み込み中の場合はローディング表示
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  // ログイン済みの場合は設定ページを表示
  // isLoading が false で user が null の場合は、useEffect で /login にリダイレクトされるため、
  // ここに到達するのは user が null でない場合のみ。
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row md:space-x-6">
        <aside className="md:w-1/4">
          <nav className="flex flex-row flex-wrap gap-2 md:flex-col md:space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-md border text-muted-foreground hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 mt-6 md:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
}