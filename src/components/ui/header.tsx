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
import { MdNotifications } from "react-icons/md";

const PROFILE_SETTINGS_KEY = "vtuber-tools-profile-settings";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''; // 環境変数から取得するか、デフォルト値を設定

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);

  // activeTab の初期値を設定するロジック
  const initialActiveTab = () => {
    if (BASE_PATH) {
      if (pathname === BASE_PATH || pathname === `${BASE_PATH}/`) {
        return "suites";
      }
      // ここを修正
      if (pathname.startsWith(`${BASE_PATH}/tools`)) { // 修正箇所
        return "tools";
      }
    } else {
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
      router.push("/");
    } else if (value === "tools") {
      router.push("/tools");
    }
  };

  // タブを表示すべきかどうかを判定するヘルパー関数
  const shouldShowTabs = () => {
    if (BASE_PATH) {
      const fullBasePath = BASE_PATH;
      const fullToolsPath = `${BASE_PATH}/tools`;

      return pathname === fullBasePath || pathname === `${fullBasePath}/` || pathname === fullToolsPath;
    }
    return pathname === "/" || pathname === "/tools";
  };

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold">
          Kurodev Tools
        </Link>
        <nav className="flex items-center space-x-4 lg:space-x-6">
          {shouldShowTabs() && ( // タブを表示すべき場合にのみレンダリング
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="suites" asChild>
                  <Link href="/">スイート</Link>
                </TabsTrigger>
                <TabsTrigger value="tools" asChild>
                  <Link href="/tools">ツール</Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className="flex items-center space-x-4">
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
                    <DropdownMenuItem asChild><Link href="/settings/profile">プロフィール編集</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/settings/account">アカウント設定</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/settings/notifications">通知設定</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>テーマ</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setTheme("light")}>ライト</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>ダーク</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>システム</DropdownMenuItem>
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
        </nav>
      </div>
    </header>
  );
}