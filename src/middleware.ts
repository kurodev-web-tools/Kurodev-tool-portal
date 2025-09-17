import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { doubleCsrf } from 'csrf-csrf';

const {
  generateToken, // Use this in your forms
  doubleCsrfProtection, // Use this in your middleware
} = doubleCsrf({
  getSecret: () => {
    const secret = process.env.CSRF_SECRET;
    // In production, the secret must be set
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error('CSRF_SECRET environment variable is not set for production');
    }
    // For development, we can use a fallback secret
    return secret || 'a-very-secret-and-long-string-for-development';
  },
  cookieName: 'csrf.token', // A name for the cookie
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // Or 'lax' or 'none'
    path: '/',
  },
  size: 64, // The size of the generated tokens in bits
  tokenHeader: 'X-CSRF-Token', // The name of the header to be used
});

export async function middleware(request: NextRequest) {
  // Skip CSRF protection for API routes that are meant to be public or use other auth methods
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  try {
    await doubleCsrfProtection(request);
  } catch (error) {
    console.error('CSRF validation error:', error);
    // Return a 403 Forbidden response if CSRF validation fails
    return new NextResponse('CSRF validation failed', { status: 403 });
  }

  // If CSRF validation passes, continue to the requested route
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};