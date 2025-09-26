import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 静的エクスポート時はミドルウェアを無効化
export async function middleware(request: NextRequest) {
  // 静的エクスポート時は何もしない
  if (process.env.NODE_ENV === 'production' && process.env.GITHUB_ACTIONS) {
    return NextResponse.next();
  }

  // 開発環境でのみCSRF保護を適用
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};