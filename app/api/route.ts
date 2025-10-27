// app/api/perfis/route.ts
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { db } from '@/lib/supabaseServer'

export async function GET() {
  const supa = db()
  const { data, error } = await supa.from('lumina_profiles').select('*').limit(12)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
