import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { doubleCsrf } from 'csrf-csrf';

const {
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => {
    const secret = process.env.CSRF_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error('CSRF_SECRET environment variable is not set for production');
    }
    return secret || 'a-very-secret-and-long-string-for-development';
  },
  getSessionIdentifier: (req) => {
    return 'placeholder-session-id';
  },
  cookieName: 'csrf.token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  },
  size: 64,
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  try {
    await doubleCsrfProtection(request, NextResponse.next(), {
      tokenHeader: 'X-CSRF-Token',
    });
  } catch (error) {
    console.error('CSRF validation error:', error);
    return new NextResponse('CSRF validation failed', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
  runtime: 'nodejs',
};