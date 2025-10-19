import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  type?: 'network' | 'data' | 'general';
  className?: string;
}

const errorConfig = {
  network: {
    icon: WifiOff,
    title: "ネットワークエラー",
    description: "インターネット接続を確認してください",
    color: "text-red-400"
  },
  data: {
    icon: AlertCircle,
    title: "データ取得エラー",
    description: "データの読み込みに失敗しました",
    color: "text-yellow-400"
  },
  general: {
    icon: AlertCircle,
    title: "エラーが発生しました",
    description: "予期しないエラーが発生しました",
    color: "text-red-400"
  }
};

export function ErrorDisplay({ 
  error, 
  onRetry, 
  type = 'general',
  className = ""
}: ErrorDisplayProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <Card className={`bg-red-900/20 border-red-800 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Icon className={`h-5 w-5 ${config.color}`} />
          <CardTitle className="text-red-200">{config.title}</CardTitle>
        </div>
        <CardDescription className="text-red-300">
          {config.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded border border-red-800">
            {error}
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="border-red-600 text-red-200 hover:bg-red-800/30 hover:border-red-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              再試行
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ネットワーク状態表示コンポーネント
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="bg-yellow-900/20 border-yellow-800">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            <WifiOff className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-yellow-200">オフライン</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 空状態表示コンポーネント
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  title, 
  description, 
  icon: Icon, 
  action,
  className = ""
}: EmptyStateProps) {
  return (
    <Card className={`bg-gray-900/30 border-gray-800 ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {Icon && (
          <Icon className="h-12 w-12 text-gray-500 mb-4" />
        )}
        <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
        <p className="text-gray-400 mb-6 max-w-md">{description}</p>
        {action && (
          <Button
            onClick={action.onClick}
            variant="outline"
            className="border-gray-600 text-gray-200 hover:bg-gray-800/50"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ローディング中の空状態
export function LoadingEmptyState({ className = "" }: { className?: string }) {
  return (
    <Card className={`bg-gray-900/30 border-gray-800 ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#20B2AA] mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">読み込み中...</h3>
        <p className="text-gray-400">データを取得しています</p>
      </CardContent>
    </Card>
  );
}
