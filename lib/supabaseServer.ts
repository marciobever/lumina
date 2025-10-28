// lib/supabaseServer.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type AnyServer = SupabaseClient<any, any, any>
let _server: AnyServer | null = null

function hasEnv() {
  return !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)
      && !!process.env.SUPABASE_SERVICE_ROLE_KEY
}

export const SUPABASE_READY = hasEnv()

export function db(): AnyServer | null {
  if (_server) return _server
  if (!SUPABASE_READY) return null // ← modo sem banco (no-op)

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

  _server = createClient(url, key, {
    auth: { persistSession: false },
    db: { schema: 'lumina' }, // já aponta para lumina
  }) as AnyServer

  return _server
}

/** helper “from lumina” seguro (retorna null se DB off) */
export const fromLServer = (table: string) => {
  const client = db()
  return client ? client.from(table) : null
}
