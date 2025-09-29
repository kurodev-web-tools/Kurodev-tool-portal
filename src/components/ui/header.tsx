'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OptimizedImage } from "@/components/ui/optimized-image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./button";
import { Badge } from "@/components/ui/badge";
import { MdNotifications } from "react-icons/md";
import { SearchBar } from "./search-bar";
import { 
  Calendar, 
  Image, 
  FileText, 
  Lightbulb, 
  Type, 
  Clock, 
  Palette, 
  Sparkles,
  Wrench
} from 'lucide-react';

const PROFILE_SETTINGS_KEY = "vtuber-tools-profile-settings";

interface Tool {
  id: string;
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'beta' | 'development';
  description: string;
}

const tools: Tool[] = [
  {
    id: 'schedule-calendar',
    title: 'スケジュールカレンダー',
    href: '/tools/schedule-calendar',
    icon: Calendar,
    status: 'beta',
    description: '配信・ライブのスケジュールを管理するツール'
  },
  {
    id: 'thumbnail-generator',
    title: 'サムネイル自動生成',
    href: '/tools/thumbnail-generator',
    icon: Image,
    status: 'beta',
    description: '動画・コンテンツのサムネイルをAIが自動生成'
  },
  {
    id: 'script-generator',
    title: '企画・台本サポートAI',
    href: '/tools/script-generator',
    icon: FileText,
    status: 'beta',
    description: 'コンテンツの企画や台本作成をAIがサポート'
  },
  {
    id: 'branding-generator',
    title: 'コンセプト・ブランディング',
    href: '/tools/branding-generator',
    icon: Lightbulb,
    status: 'development',
    description: 'AIがあなたのブランドコンセプトを提案'
  },
  {
    id: 'title-generator',
    title: '動画タイトル・概要欄',
    href: '/tools/title-generator',
    icon: Type,
    status: 'development',
    description: 'AIが動画・コンテンツのタイトルと概要欄を自動生成'
  },
  {
    id: 'schedule-adjuster',
    title: '配信スケジュール調整',
    href: '/tools/schedule-adjuster',
    icon: Clock,
    status: 'development',
    description: 'コラボ相手との配信・ライブスケジュールを自動調整'
  },
  {
    id: 'asset-creator',
    title: 'イベント用素材制作',
    href: '/tools/asset-creator',
    icon: Palette,
    status: 'development',
    description: 'Canvaのようにイベント用の素材を制作'
  },
  {
    id: 'virtual-bg-generator',
    title: 'バーチャル背景自動生成',
    href: '/tools/virtual-bg-generator',
    icon: Sparkles,
    status: 'development',
    description: 'AIが配信・ライブ用のバーチャル背景を自動生成'
  }
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);

  // GitHub Pages用のbasePathを判定（より確実な方法）
  const getBasePath = () => {
    if (typeof window !== 'undefined') {
      const fullPath = window.location.pathname;
      if (fullPath.startsWith('/Kurodev-tool-portal')) {
        return '/Kurodev-tool-portal';
      }
    }
    return process.env.NEXT_PUBLIC_BASE_PATH || '';
  };
  
  const basePath = getBasePath();
  const isGitHubPages = basePath === '/Kurodev-tool-portal';

  // デバッグ用ログ
  console.log('Header Debug:', { 
    pathname, 
    isGitHubPages, 
    basePath, 
    envBasePath: process.env.NEXT_PUBLIC_BASE_PATH,
    windowPath: typeof window !== 'undefined' ? window.location.pathname : 'undefined'
  });

  // activeTab の初期値を設定するロジック
  const initialActiveTab = () => {
    if (!pathname) return "suites";
    
    // pathnameは既にbasePathを除いたパスなので、環境に関係なく同じロジックを使用
    if (pathname === "/") {
      return "suites";
    }
    if (pathname.startsWith("/tools")) {
      return "tools";
    }
    return "suites"; // デフォルト
  };

  const [activeTab, setActiveTab] = useState<string>(initialActiveTab());

  const loadProfileAvatar = () => {
    try {
      const savedSettings = localStorage.getItem(PROFILE_SETTINGS_KEY);
      if (savedSettings) {
        const profile = JSON.parse(savedSettings);
        setAvatarSrc(profile.avatar);
      }
    } catch (error) {
      console.error("Failed to load profile settings for header", error);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfileAvatar();
      window.addEventListener('profileUpdated', loadProfileAvatar);
      return () => {
        window.removeEventListener('profileUpdated', loadProfileAvatar);
      };
    } else {
      setAvatarSrc(undefined);
    }
  }, [user]);

  useEffect(() => {
    setActiveTab(initialActiveTab()); // useEffect 内でも更新ロジックを呼び出す
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "suites") {
      router.push("/");
    } else if (value === "tools") {
      router.push("/tools");
    }
  };

  // 現在のツールを特定
  const currentTool = tools.find(tool => {
    // usePathname()は既にbasePathを除いたパスを返すため、直接比較
    return pathname === tool.href || pathname === `${tool.href}/`;
  });
  
  const isToolPage = pathname?.startsWith('/tools/') && currentTool;

  // デバッグ用ログ（詳細版）
  console.log('Tool Page Debug:', { 
    currentTool, 
    isToolPage, 
    pathname,
    basePath,
    tools: tools.map(t => {
      const fullPath = basePath ? `${basePath}${t.href}` : t.href;
      const fullPathWithSlash = basePath ? `${basePath}${t.href}/` : `${t.href}/`;
      const exactMatch = pathname === fullPath;
      const slashMatch = pathname === fullPathWithSlash;
      
      return { 
        id: t.id, 
        href: t.href, 
        fullPath,
        fullPathWithSlash,
        exactMatch,
        slashMatch,
        willMatch: exactMatch || slashMatch
      };
    })
  });

  // schedule-calendarツールの詳細デバッグ
  const scheduleTool = tools.find(t => t.id === 'schedule-calendar');
  if (scheduleTool) {
    console.log('Schedule Calendar Debug (Fixed):', {
      pathname,
      basePath,
      toolHref: scheduleTool.href,
      exactMatch: pathname === scheduleTool.href,
      slashMatch: pathname === `${scheduleTool.href}/`,
      shouldMatch: pathname === scheduleTool.href || pathname === `${scheduleTool.href}/`,
      currentToolFound: !!currentTool
    });
  }

  // タブを表示すべきかどうかを判定するヘルパー関数
  const shouldShowTabs = () => {
    // ポータルページ（スイート・ツール一覧）または個別ツールページでタブを表示
    return pathname === "/" || pathname === "/tools" || pathname?.startsWith("/tools/");
  };

  return (
    <header className="border-b bg-gradient-to-r from-black to-gray-900 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* 左側: ロゴと現在のツール表示 */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Kurodev Tools
            </span>
          </Link>
          
          {/* 現在のツール表示（ツールページの場合） */}
          {isToolPage && currentTool && (
            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              <span>/</span>
              <currentTool.icon className="h-4 w-4" />
              <span>{currentTool.title}</span>
                          <Badge 
                            variant={currentTool.status === 'beta' ? 'warning' : 'danger'}
                            className="text-xs"
                          >
                            {currentTool.status === 'beta' ? 'ベータ' : '開発中'}
                          </Badge>
            </div>
          )}
        </div>

        {/* 中央: ナビゲーション（ポータルページのみ） */}
        {shouldShowTabs() && ( // タブを表示すべき場合にのみレンダリング
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="bg-gray-900/50 backdrop-blur-sm p-1 rounded-lg shadow-lg border border-gray-700/50">
                <TabsTrigger 
                  value="suites" 
                  asChild
                  className="text-xs md:text-sm font-medium text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:text-blue-400 tracking-normal"
                >
                  <Link href="/" className="flex items-center gap-2 px-4 py-2">
                    <Sparkles className="h-4 w-4" />
                    スイート
                  </Link>
                </TabsTrigger>
                <TabsTrigger 
                  value="tools" 
                  asChild
                  className="text-xs md:text-sm font-medium text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:text-blue-400 tracking-normal"
                >
                  <Link href="/tools" className="flex items-center gap-2 px-4 py-2">
                    <Wrench className="h-4 w-4" />
                    ツール
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </nav>
        )}

        {/* 検索バー（ポータルページのみ） */}
        {shouldShowTabs() && (
          <div className="hidden md:block">
            <SearchBar 
              items={tools.map(tool => ({
                id: tool.id,
                title: tool.title,
                description: tool.description,
                status: tool.status,
                href: tool.href,
                iconName: tool.id === 'schedule-calendar' ? 'calendar' :
                         tool.id === 'script-generator' ? 'brain' :
                         tool.id === 'thumbnail-generator' ? 'image' :
                         tool.id === 'branding-generator' ? 'sparkles' :
                         tool.id === 'title-generator' ? 'trending-up' : 'wrench',
                color: tool.id === 'schedule-calendar' ? 'from-blue-500 to-cyan-500' :
                       tool.id === 'script-generator' ? 'from-blue-500 to-cyan-500' :
                       tool.id === 'thumbnail-generator' ? 'from-green-500 to-emerald-500' :
                       tool.id === 'branding-generator' ? 'from-orange-500 to-red-500' :
                       tool.id === 'title-generator' ? 'from-indigo-500 to-blue-500' :
                       tool.id === 'schedule-adjuster' ? 'from-purple-500 to-pink-500' :
                       tool.id === 'asset-creator' ? 'from-pink-500 to-rose-500' :
                       tool.id === 'virtual-bg-generator' ? 'from-cyan-500 to-blue-500' :
                       'from-gray-500 to-gray-600'
              }))}
              onItemClick={(item) => {
                const fullPath = basePath ? `${basePath}${item.href}` : item.href;
                router.push(fullPath);
              }}
              placeholder="ツールを検索..."
              className="w-80"
            />
          </div>
        )}

        {/* 右側: ツール切替（ツールページの場合）+ 通知とプロフィール */}
        <div className="flex items-center space-x-4">
          {/* ツールページの場合: ツール切り替えドロップダウン */}
          {isToolPage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-gray-900 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-all shadow-sm text-gray-300">
                  ツール切替
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-gray-900/95 backdrop-blur-md border-gray-700">
                {tools.map((tool) => (
                  <DropdownMenuItem key={tool.id} asChild>
                    <Link 
                      href={tool.href}
                      className="flex items-center space-x-3 p-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-sm">
                        <tool.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium truncate">{tool.title}</span>
                          <Badge 
                            variant={tool.status === 'beta' ? 'warning' : 'danger'}
                            className="text-xs"
                          >
                            {tool.status === 'beta' ? 'ベータ' : '開発中'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {tool.description}
                        </p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {user ? (
            <>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <MdNotifications className="h-6 w-6" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <OptimizedImage 
                      src={avatarSrc || '/default-avatar.png'} 
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                          <DropdownMenuItem asChild><Link href="/settings/profile">プロフィール編集</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href="/settings/account">アカウント設定</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href="/settings/notifications">通知設定</Link></DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild><Link href="/settings/ai">AI設定</Link></DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={logout}>ログアウト</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
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