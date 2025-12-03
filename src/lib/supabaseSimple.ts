import { createClient } from '@supabase/supabase-js'

export function createSimpleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient(supabaseUrl, supabaseAnonKey)
}

// 导出为 createClient 以保持API一致性
export { createSimpleClient as createClient }