// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: [
    '/admin/:path*',
    '/admin',
    // Добавляем matcher для всех путей при запросе через поддомен
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

  // Если это admin поддомен или путь /admin
  if (hostname?.startsWith('admin.') || pathname.startsWith('/admin')) {
    const basicAuth = request.headers.get('authorization')

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      const [user, pwd] = atob(authValue).split(':')

      if (
        user === process.env.ADMIN_USER &&
        pwd === process.env.ADMIN_PASSWORD
      ) {
        // Перенаправляем на админские роуты
        const url = request.nextUrl.clone()
        // Если это поддомен, убираем /admin из пути
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