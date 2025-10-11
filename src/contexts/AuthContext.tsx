'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

const AUTH_USER_KEY = 'vtuber-tools-auth-user';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => void;
  logout: () => void;
  isLoading: boolean; // 新しく追加
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 新しく追加
  const router = useRouter();

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_USER_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      logger.error('ユーザー情報読み込み失敗', error, 'AuthContext');
    } finally {
      setIsLoading(false); // 読み込み完了
    }
  }, []);

  const login = (email: string, /* pass: string */) => {
    const mockUser: User = { name: 'デモユーザー', email };
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
      toast.success("ログインしました。");
      router.push('/');
    } catch (error) {
      logger.error('ログイン処理失敗', error, 'AuthContext');
      toast.error("ログイン処理に失敗しました。");
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_USER_KEY);
      setUser(null);
      toast.info("ログアウトしました。");
      router.push('/login');
    } catch (error) {
      logger.error('ログアウト処理失敗', error, 'AuthContext');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}