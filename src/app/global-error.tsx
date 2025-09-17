'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // ここでSentryなどのエラー監視サービスにログを送信できる
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>予期せぬエラーが発生しました</CardTitle>
              <CardDescription>
                申し訳ありません。アプリケーションの処理中に問題が発生しました。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                この問題が繰り返し発生する場合は、開発者にご連絡ください。
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => reset()} className="w-full">
                再試行
              </Button>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  );
}
