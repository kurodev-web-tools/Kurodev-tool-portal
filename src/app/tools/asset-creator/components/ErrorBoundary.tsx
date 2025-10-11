'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Asset Creator Error', { error, errorInfo }, 'ErrorBoundary');
    
    // エラー情報をローカルストレージに保存（デバッグ用）
    try {
      const errorData = {
        timestamp: new Date().toISOString(),
        error: {
          message: error.message,
          stack: error.stack,
        },
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      
      const existingErrors = JSON.parse(localStorage.getItem('assetCreatorErrors') || '[]');
      existingErrors.push(errorData);
      
      // 最新の10件のみ保持
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      
      localStorage.setItem('assetCreatorErrors', JSON.stringify(existingErrors));
    } catch (storageError) {
      logger.error('localStorage保存失敗', storageError, 'ErrorBoundary');
    }

    this.setState({
      error,
      errorInfo,
    });

    // ユーザーフレンドリーなエラー通知
    toast.error('予期しないエラーが発生しました', {
      description: 'ページをリロードするか、サポートにお問い合わせください。',
      action: {
        label: 'リロード',
        onClick: () => window.location.reload(),
      },
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ error, resetError }) => {
  const handleReportError = () => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // エラーレポートをクリップボードにコピー
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2)).then(() => {
      toast.success('エラー情報をクリップボードにコピーしました', {
        description: 'サポートにお問い合わせの際にご利用ください。',
      });
    }).catch(() => {
      toast.error('エラー情報のコピーに失敗しました');
    });
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">エラーが発生しました</CardTitle>
          <CardDescription>
            Asset Creatorで予期しないエラーが発生しました。
            ご不便をおかけして申し訳ございません。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-gray-100 rounded-md">
            <p className="text-sm font-medium text-gray-700 mb-1">エラー詳細:</p>
            <p className="text-xs text-gray-600 font-mono break-all">
              {error.message}
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={resetError} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              再試行
            </Button>
            
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              ページをリロード
            </Button>
            
            <Button variant="outline" onClick={handleGoHome} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
            
            <Button variant="ghost" onClick={handleReportError} className="w-full text-xs">
              エラー情報をコピー（サポート用）
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            問題が続く場合は、サポートまでお問い合わせください。
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// 非同期エラー用のハンドラー
export const setupGlobalErrorHandling = () => {
  // 未処理のPromise拒否をキャッチ
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', { reason: event.reason }, 'GlobalErrorHandler');
    
    toast.error('処理中にエラーが発生しました', {
      description: '操作を再試行してください。',
    });
    
    // デフォルトの動作を防ぐ（コンソールエラーを抑制）
    event.preventDefault();
  });

  // 一般的なJavaScriptエラーをキャッチ
  window.addEventListener('error', (event) => {
    logger.error('Global error', { error: event.error }, 'GlobalErrorHandler');
    
    toast.error('予期しないエラーが発生しました', {
      description: 'ページをリロードしてください。',
      action: {
        label: 'リロード',
        onClick: () => window.location.reload(),
      },
    });
  });
};


