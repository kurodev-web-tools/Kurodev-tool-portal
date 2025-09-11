'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
      console.error("Failed to load user from localStorage", error);
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
      console.error("Failed to save user to localStorage", error);
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
      console.error("Failed to remove user from localStorage", error);
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