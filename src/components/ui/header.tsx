'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { MdNotifications } from "react-icons/md"; // Material Design Iconsから通知アイコンをインポート

const PROFILE_SETTINGS_KEY = "vtuber-tools-profile-settings";

export function Header() {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);

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

      // プロフィール更新をリッスン
      window.addEventListener('profileUpdated', loadProfileAvatar);

      return () => {
        window.removeEventListener('profileUpdated', loadProfileAvatar);
      };
    } else {
      setAvatarSrc(undefined);
    }
  }, [user]);

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold">
          VTuber Tools
        </Link>
        <nav className="flex items-center space-x-4 lg:space-x-6">
          <Tabs defaultValue={pathname === "/tools" ? "tools" : "suites"}>
            <TabsList>
              <TabsTrigger value="suites" asChild>
                <Link href="/">スイート</Link>
              </TabsTrigger>
              <TabsTrigger value="tools" asChild>
                <Link href="/tools">ツール</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* 通知アイコンをMdNotificationsに置き換え */}
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