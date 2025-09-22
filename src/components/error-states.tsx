import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetCallback?: () => void;
  className?: string;
}

interface LoadingProps {
  message?: string;
  className?: string;
}

interface ErrorStateProps {
  isLoading?: boolean;
  error?: Error | null;
  loadingMessage?: string;
  onRetry?: () => void;
  className?: string;
  children?: React.ReactNode;
}

// エラー表示コンポーネント
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetCallback,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
      <h3 className="text-lg font-semibold text-red-600 mb-2">エラーが発生しました</h3>
      <p className="text-sm text-gray-600 mb-4">{error.message}</p>
      {resetCallback && (
        <Button
          onClick={resetCallback}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          リトライ
        </Button>
      )}
    </div>
  );
};

// ローディング表示コンポーネント
export const Loading: React.FC<LoadingProps> = ({
  message = '処理中...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
};

// エラー状態管理コンポーネント
export const ErrorState: React.FC<ErrorStateProps> = ({
  isLoading = false,
  error = null,
  loadingMessage,
  onRetry,
  className = '',
  children,
}) => {
  if (isLoading) {
    return <Loading message={loadingMessage} className={className} />;
  }

  if (error) {
    return (
      <ErrorFallback
        error={error}
        resetCallback={onRetry}
        className={className}
      />
    );
  }

  return <>{children}</>;
};

// エラーバウンダリ用のフォールバックコンポーネント
export const ErrorBoundaryFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-xl font-semibold text-red-600 mb-2">
        予期せぬエラーが発生しました
      </h2>
      <p className="text-gray-600 mb-4 text-center max-w-md">
        申し訳ありません。エラーが発生しました。
        ページを更新するか、もう一度お試しください。
      </p>
      <pre className="bg-gray-100 p-4 rounded mb-4 text-sm overflow-auto max-w-full">
        {error.message}
      </pre>
      <Button
        onClick={resetErrorBoundary}
        variant="outline"
        className="flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        リトライ
      </Button>
    </div>
  );
};