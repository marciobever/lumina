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

  _public = createClient(url, anon, {
    auth: { persistSession: true },
    db:   { schema: 'lumina' as const }, // 👈 define o schema padrão do client
  })

  return _public
}

/** Use sempre este helper nas consultas do client/SSR */
export const fromL = (table: string) => sb().schema('lumina').from(table)
