import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest } from 'next/server'

export async function createClient(req: NextRequest) {
  // 为API路由创建Supabase中间件客户端
  return createMiddlewareClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { req }
  )
}