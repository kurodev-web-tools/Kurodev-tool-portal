'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Wrench, ChevronDown, Calendar, Image, FileText, Lightbulb, Type, Clock, Palette, Sparkles } from 'lucide-react';
import { siteConfig } from "@/config/site";

const PROFILE_SETTINGS_KEY = "vtuber-tools-profile-settings";

interface Tool {
  id: string;
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'beta' | 'development';
  description: string;
  suiteId: string; // スイートIDを追加
}

const tools: Tool[] = [
  // 企画準備スイート (suite-1) - 全8ツール
  {
    id: 'schedule-calendar',
    title: 'スケジュールカレンダー',
    href: '/tools/schedule-calendar',
    icon: Calendar,
    status: 'beta',
    description: '配信・ライブのスケジュールを管理するツール',
    suiteId: 'suite-1'
  },
  {
    id: 'script-generator',
    title: '企画・台本サポートAI',
    href: '/tools/script-generator',
    icon: FileText,
    status: 'beta',
    description: 'コンテンツの企画や台本作成をAIがサポート',
    suiteId: 'suite-1'
  },
  {
    id: 'thumbnail-generator',
    title: 'サムネイル自動生成',
    href: '/tools/thumbnail-generator',
    icon: Image,
    status: 'beta',
    description: '動画・コンテンツのサムネイルをAIが自動生成',
    suiteId: 'suite-1'
  },
  {
    id: 'branding-generator',
    title: 'コンセプト・ブランディング',
    href: '/tools/branding-generator',
    icon: Lightbulb,
    status: 'development',
    description: 'AIがあなたのブランドコンセプトを提案',
    suiteId: 'suite-1'
  },
  {
    id: 'title-generator',
    title: '動画タイトル・概要欄',
    href: '/tools/title-generator',
    icon: Type,
    status: 'development',
    description: 'AIが動画・コンテンツのタイトルと概要欄を自動生成',
    suiteId: 'suite-1'
  },
  {
    id: 'schedule-adjuster',
    title: '配信スケジュール調整',
    href: '/tools/schedule-adjuster',
    icon: Clock,
    status: 'development',
    description: 'コラボ相手との配信・ライブスケジュールを自動調整',
    suiteId: 'suite-1'
  },
  {
    id: 'asset-creator',
    title: 'イベント用素材制作',
    href: '/tools/asset-creator',
    icon: Palette,
    status: 'development',
    description: 'Canvaのようにイベント用の素材を制作',
    suiteId: 'suite-1'
  },
  {
    id: 'virtual-bg-generator',
    title: 'バーチャル背景自動生成',
    href: '/tools/virtual-bg-generator',
    icon: Sparkles,
    status: 'development',
    description: 'AIが配信・ライブ用のバーチャル背景を自動生成',
    suiteId: 'suite-1'
  }
];

export function ToolHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);
  const [isScrolled, setIsScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  // スクロール検知
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // アバター読み込み
  useEffect(() => {
    if (user) {
      try {
        const savedSettings = localStorage.getItem(PROFILE_SETTINGS_KEY);
        if (savedSettings) {
          const profile = JSON.parse(savedSettings);
          setAvatarSrc(profile.avatar);
        }
      } catch (error) {
        console.error("Failed to load profile settings", error);
      }
    }
  }, [user]);

  // 現在のツールを特定
  const currentTool = tools.find(tool => 
    pathname === tool.href || pathname === `${tool.href}/`
  );

  // 現在のツールが属するスイートのツールのみをフィルタリング
  const filteredTools = currentTool 
    ? tools.filter(tool => tool.suiteId === currentTool.suiteId)
    : tools; // ツール一覧ページなどの場合は全ツール表示

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const handleHomeClick = () => {
    router.push('/');
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gradient-to-r from-[#2D2D2D] to-[#1A1A1A] backdrop-blur-md shadow-lg border-b border-[#20B2AA]/20' 
          : 'bg-[#2D2D2D]/95 backdrop-blur-sm border-b border-[#3A3A3A]'
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* 左側: ロゴと現在のツール表示 */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleHomeClick}
            className="flex items-center space-x-2 hover:bg-[#3A3A3A] transition-colors"
          >
            <div className="w-8 h-8 bg-[#20B2AA] rounded-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#20B2AA] tracking-wider hidden md:inline">
              {siteConfig.name}
            </span>
          </Button>
          
          {/* 現在のツール表示 */}
          {currentTool && (
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <ChevronDown className="h-4 w-4 text-[#A0A0A0] rotate-[-90deg]" />
              <currentTool.icon className="h-4 w-4 text-[#20B2AA]" />
              <span className="font-medium">{currentTool.title}</span>
              <Badge 
                variant={currentTool.status === 'beta' ? 'warning' : 'danger'}
                className="text-xs"
              >
                {currentTool.status === 'beta' ? 'ベータ' : '開発中'}
              </Badge>
            </div>
          )}
        </div>

        {/* 右側: ツール切替、通知、プロフィール */}
        <div className="flex items-center space-x-3">
          {/* ツール切り替えドロップダウン */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden md:flex bg-[#2D2D2D] border-[#4A4A4A] hover:bg-[#3A3A3A] text-[#E0E0E0]"
              >
                <Wrench className="h-4 w-4 mr-2" />
                ツール切替
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-80 bg-[#2D2D2D]/95 backdrop-blur-md border-[#4A4A4A] max-h-[60vh] overflow-y-auto"
            >
              {filteredTools.map((tool) => (
                <DropdownMenuItem key={tool.id} asChild>
                  <Link 
                    href={tool.href}
                    className={`flex items-center space-x-3 p-3 w-full transition-colors ${
                      currentTool?.id === tool.id 
                        ? 'bg-[#20B2AA]/20 hover:bg-[#20B2AA]/30' 
                        : 'hover:bg-[#3A3A3A]'
                    }`}
                  >
                    <div className="w-10 h-10 bg-[#20B2AA] rounded-sm flex items-center justify-center shadow-sm">
                      <tool.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium truncate text-white">{tool.title}</span>
                        <Badge 
                          variant={tool.status === 'beta' ? 'warning' : 'danger'}
                          className="text-xs"
                        >
                          {tool.status === 'beta' ? 'ベータ' : '開発中'}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#A0A0A0] truncate">
                        {tool.description}
                      </p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 通知 */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-[#3A3A3A] transition-colors"
          >
            <Bell className="h-5 w-5 text-[#A0A0A0]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-[#20B2AA] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>

          {/* プロフィール */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer ring-2 ring-transparent hover:ring-[#20B2AA] transition-all">
                  <OptimizedImage 
                    src={avatarSrc || '/default-avatar.png'} 
                    alt={user.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <AvatarFallback className="bg-[#20B2AA] text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-[#2D2D2D]/95 backdrop-blur-md border-[#4A4A4A]"
              >
                <DropdownMenuLabel className="text-white">{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-[#E0E0E0] hover:bg-[#3A3A3A]">
                  <Link href="/settings/profile">プロフィール編集</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-[#E0E0E0] hover:bg-[#3A3A3A]">
                  <Link href="/settings/account">アカウント設定</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-[#E0E0E0] hover:bg-[#3A3A3A]">
                  <Link href="/settings/ai">AI設定</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={logout}
                  className="text-red-400 hover:bg-red-500/10"
                >
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">ログイン</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
