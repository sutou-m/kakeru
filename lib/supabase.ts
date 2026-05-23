import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// クライアントサイド用（anon key）
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// サーバーサイド用（service key）— Server Action のみで使用
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)
