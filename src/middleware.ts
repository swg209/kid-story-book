import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { req, res }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 如果用户已登录，允许访问
  if (session) {
    return res
  }

  // 重定向到登录页面
  return NextResponse.redirect(new URL('/auth/login', req.url))
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/projects/:path*',
    '/api/projects/:path*'
  ]
}