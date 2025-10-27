// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

let _public: ReturnType<typeof createClient> | null = null

export function sb(): ReturnType<typeof createClient> {
  if (_public) return _public

  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error(
      'Supabase (client) não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  // 🔧 Sem db.schema aqui para evitar conflito de tipos no build
  _public = createClient(url, anon, {
    auth: { persistSession: true },
  })

  return _public
}

/** Use sempre este helper nas consultas do client/SSR (schema 'lumina') */
export const fromL = (table: string) => sb().schema('lumina').from(table)
