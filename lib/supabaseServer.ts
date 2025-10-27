// lib/supabaseServer.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _server: SupabaseClient | null = null

export function db(): SupabaseClient {
  if (_server) return _server
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!url || !key) throw new Error('Supabase: envs ausentes.')
  _server = createClient(url, key, {
    auth: { persistSession: false },
    db:   { schema: 'lumina' }, // default
  })
  return _server
}

/** helper server-only (service_role) */
export const fromLServer = (table: string) => db().schema('lumina').from(table)