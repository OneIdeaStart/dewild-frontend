// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: [
    '/admin/:path*',
    '/admin',
    // Add matcher for all paths when requesting through subdomain
    {
      source: '/:path*',
      has: [
        {
          type: 'host',
          value: 'admin.localhost:3000',
        },
      ],
    },
  ]
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  const { pathname } = request.nextUrl;

  // If this is admin subdomain or path /admin
  if (hostname?.startsWith('admin.') || pathname.startsWith('/admin')) {
    const basicAuth = request.headers.get('authorization')

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      const [user, pwd] = atob(authValue).split(':')

      if (
        user === process.env.ADMIN_USER &&
        pwd === process.env.ADMIN_PASSWORD
      ) {
        // Redirect to admin routes
        const url = request.nextUrl.clone()
        // If this is a subdomain, remove /admin from the path
        if (hostname?.startsWith('admin.')) {
          url.pathname = pathname === '/' ? '/admin' : `/admin${pathname}`
        }
        return NextResponse.rewrite(url)
      }
    }

    return new NextResponse(null, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"'
      }
    })
  }

  return NextResponse.next()
}