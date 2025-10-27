// lib/supabaseClient.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Tipagem ampla para permitir qualquer schema (ex.: 'lumina')
type AnyClient = SupabaseClient<any, any, any>

let _public: AnyClient | null = null

export function sb(): AnyClient {
  if (_public) return _public

  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error(
      'Supabase (client) não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  // Sem db.schema aqui para evitar conflito de tipos.
  _public = createClient(url, anon, {
    auth: { persistSession: true },
  }) as AnyClient

  return _public
}

/** Helper: sempre consulta no schema 'lumina' */
export const fromL = (table: string) =>
  sb().schema('lumina').from(table)
