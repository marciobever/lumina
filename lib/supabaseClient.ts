// lib/supabaseClient.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _public: SupabaseClient | null = null

export function sb() {
  if (_public) return _public
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error('Supabase (client) não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  _public = createClient(url, anon)
  return _public
}