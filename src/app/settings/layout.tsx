'use client';

import { useEffect } from 'react';
import Link from "next/link";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { User, KeyRound, Bell, Brain, Settings as SettingsIcon } from 'lucide-react';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && user === null) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const navItems = [
    { href: "/settings/profile", label: "プロフィール", icon: User },
    { href: "/settings/account", label: "アカウント", icon: KeyRound },
    { href: "/settings/notifications", label: "通知", icon: Bell },
    { href: "/settings/ai", label: "AI設定", icon: Brain },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-[#20B2AA]" />
            設定
          </h1>
          <p className="text-[#A0A0A0]">アカウント設定とカスタマイズ</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* サイドナビゲーション */}
          <aside className="md:w-64 flex-shrink-0">
            <nav className="flex flex-row flex-wrap gap-2 md:flex-col">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-all duration-200
                      md:w-full
                      ${
                        isActive
                          ? 'bg-[#20B2AA]/20 text-[#20B2AA] border border-[#20B2AA]/30 shadow-lg shadow-[#20B2AA]/10'
                          : 'bg-[#2D2D2D]/50 border border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#2D2D2D] hover:text-[#20B2AA] hover:border-[#20B2AA]/30 hover:shadow-md'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* メインコンテンツ */}
          <main className="flex-1">
            <div className="bg-[#2D2D2D]/50 backdrop-blur-sm rounded-xl border border-[#3A3A3A] shadow-xl overflow-hidden">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}