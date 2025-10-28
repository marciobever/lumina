// app/api/profiles/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic' // força SSR; não tenta SSG no build

import { NextResponse } from 'next/server'
import { listProfiles } from '@/lib/queries'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const page    = Number(searchParams.get('page')    ?? '1')
  const perPage = Number(searchParams.get('perPage') ?? '12')
  const q       = searchParams.get('q')       ?? undefined
  const sector  = searchParams.get('sector')  ?? undefined
  const status  = searchParams.get('status')  ?? undefined

  try {
    const result = await listProfiles({ page, perPage, q, sector, status })
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
