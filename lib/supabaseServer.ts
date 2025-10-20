// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js'

export function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY! // server-side only
  if (!url || !key) throw new Error('Supabase: envs ausentes.')

  return createClient(url, key, {
    auth: { persistSession: false },
    db: { schema: 'lumina' }, // 👈 isso garante que apontamos para o schema certo
  })
}