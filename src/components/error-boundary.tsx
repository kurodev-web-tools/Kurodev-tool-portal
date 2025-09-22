import React, { Component, ErrorInfo, PropsWithChildren } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <h2 className="text-2xl font-bold mb-4 text-red-600">
        申し訳ありません。エラーが発生しました。
      </h2>
      {error && (
        <pre className="bg-gray-100 p-4 rounded mb-4 text-sm overflow-auto max-w-full">
          {error.message}
        </pre>
      )}
      <div className="space-y-4">
        <p className="text-gray-600">
          ページを更新するか、もう一度お試しください。
        </p>
        <Button
          onClick={resetErrorBoundary}
          variant="outline"
          className="w-full sm:w-auto"
        >
          リトライ
        </Button>
      </div>
    </div>
  );
};

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // エラーログの送信やトラッキングをここで実装
    console.error('Uncaught error:', error, errorInfo);
    
    // ユーザーへの通知
    toast.error('エラーが発生しました。', {
      description: '操作を保存できない可能性があります。ページを更新してください。',
      duration: 5000,
    });
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}