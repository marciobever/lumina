// lib/supabaseServer.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Tipagem ampla para não travar o schema
type AnyServer = SupabaseClient<any, any, any>

let _server: AnyServer | null = null

export function db(): AnyServer {
  if (_server) return _server

  // Tenta SUPABASE_URL; se faltar, usa a pública
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase: envs ausentes (SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY).')
  }

  // Não setar db.schema aqui para evitar conflito de tipos com o default "public"
  _server = createClient(url, key, {
    auth: { persistSession: false },
  }) as AnyServer

  return _server
}

/** helper server-only (service_role) sempre no schema 'lumina' */
export const fromLServer = (table: string) => db().schema('lumina').from(table)
