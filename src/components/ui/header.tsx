'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./button";
import { Badge } from "@/components/ui/badge";
import { MdNotifications } from "react-icons/md";
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
    description: '配信スケジュールを管理するツール'
  },
  {
    id: 'thumbnail-generator',
    title: 'サムネイル自動生成',
    href: '/tools/thumbnail-generator',
    icon: Image,
    status: 'beta',
    description: '動画のサムネイルをAIが自動生成'
  },
  {
    id: 'script-generator',
    title: '企画・台本サポートAI',
    href: '/tools/script-generator',
    icon: FileText,
    status: 'beta',
    description: '配信の企画や台本作成をAIがサポート'
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
    description: 'AIが動画のタイトルと概要欄を自動生成'
  },
  {
    id: 'schedule-adjuster',
    title: '配信スケジュール調整',
    href: '/tools/schedule-adjuster',
    icon: Clock,
    status: 'development',
    description: 'コラボ相手との配信スケジュールを自動調整'
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
    description: 'AIが配信用のバーチャル背景を自動生成'
  }
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme } = useTheme();
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
    if (basePath) {
      // GitHub Pages用のパス判定
      if (pathname === basePath || pathname === `${basePath}/`) {
        return "suites";
      }
      if (pathname.startsWith(`${basePath}/tools`)) {
        return "tools";
      }
    } else {
      // ローカル環境用のパス判定
      if (pathname === "/") {
        return "suites";
      }
      if (pathname.startsWith("/tools")) {
        return "tools";
      }
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
      router.push(basePath ? `${basePath}/` : "/");
    } else if (value === "tools") {
      router.push(basePath ? `${basePath}/tools` : "/tools");
    }
  };

  // 現在のツールを特定
  const currentTool = tools.find(tool => {
    if (basePath) {
      // GitHub Pages用: pathname + basePath で比較
      return pathname === `${basePath}${tool.href}` || pathname === `${basePath}${tool.href}/`;
    } else {
      // ローカル環境用: pathname で比較
      return pathname === tool.href || pathname === `${tool.href}/`;
    }
  });
  
  const isToolPage = basePath 
    ? pathname.startsWith(`${basePath}/tools/`) && currentTool
    : pathname.startsWith('/tools/') && currentTool;

  // デバッグ用ログ
  console.log('Tool Page Debug:', { 
    currentTool, 
    isToolPage, 
    tools: tools.map(t => ({ 
      id: t.id, 
      href: t.href, 
      fullPath: basePath ? `${basePath}${t.href}` : t.href,
      matches: basePath ? 
        (pathname === `${basePath}${t.href}` || pathname === `${basePath}${t.href}/`) :
        (pathname === t.href || pathname === `${t.href}/`)
    }))
  });

  // タブを表示すべきかどうかを判定するヘルパー関数
  const shouldShowTabs = () => {
    if (basePath) {
      // GitHub Pages用のパス判定
      return pathname === basePath || pathname === `${basePath}/` || pathname === `${basePath}/tools`;
    } else {
      // ローカル環境用のパス判定
      return pathname === "/" || pathname === "/tools";
    }
  };

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* 左側: ロゴと現在のツール表示 */}
        <div className="flex items-center space-x-4">
          <Link href={basePath ? `${basePath}/` : "/"} className="flex items-center space-x-2">
            <Wrench className="h-6 w-6" />
            <span className="text-2xl font-bold">Kurodev Tools</span>
          </Link>
          
          {/* 現在のツール表示（ツールページの場合） */}
          {isToolPage && currentTool && (
            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              <span>/</span>
              <currentTool.icon className="h-4 w-4" />
              <span>{currentTool.title}</span>
              <Badge 
                variant={currentTool.status === 'beta' ? 'default' : 'secondary'}
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
              <TabsList>
                <TabsTrigger value="suites" asChild>
                  <Link href={basePath ? `${basePath}/` : "/"}>スイート</Link>
                </TabsTrigger>
                <TabsTrigger value="tools" asChild>
                  <Link href={basePath ? `${basePath}/tools` : "/tools"}>ツール</Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </nav>
        )}

        {/* 右側: ツール切替（ツールページの場合）+ 通知とプロフィール */}
        <div className="flex items-center space-x-4">
          {/* ツールページの場合: ツール切り替えドロップダウン */}
          {isToolPage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  ツール切替
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                {tools.map((tool) => (
                  <DropdownMenuItem key={tool.id} asChild>
                    <Link 
                      href={basePath ? `${basePath}${tool.href}` : tool.href}
                      className="flex items-center space-x-3 p-3 w-full"
                    >
                      <tool.icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium truncate">{tool.title}</span>
                          <Badge 
                            variant={tool.status === 'beta' ? 'default' : 'secondary'}
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
                    <AvatarImage src={avatarSrc} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href={basePath ? `${basePath}/settings/profile` : "/settings/profile"}>プロフィール編集</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href={basePath ? `${basePath}/settings/account` : "/settings/account"}>アカウント設定</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href={basePath ? `${basePath}/settings/notifications` : "/settings/notifications"}>通知設定</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>テーマ</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setTheme("light")}>ライト</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>ダーク</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>システム</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href={basePath ? `${basePath}/settings/ai` : "/settings/ai"}>AI設定</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>ログアウト</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild>
              <Link href={basePath ? `${basePath}/login` : "/login"}>ログイン</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}