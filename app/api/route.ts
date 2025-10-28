// app/api/perfis/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { listProfiles, type ListParams } from '@/lib/queries'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const page    = Number(searchParams.get('page') ?? '1')
    const perPage = Number(searchParams.get('perPage') ?? '12')
    const q       = searchParams.get('q') ?? undefined
    const sector  = searchParams.get('sector') ?? undefined
    const adsOnly = (searchParams.get('adsOnly') ?? '').toLowerCase() === 'true'
    const status  = (searchParams.get('status') as ListParams['status']) || undefined

    const out = await listProfiles({ page, perPage, q, sector, adsOnly, status })
    return NextResponse.json(out, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro inesperado' }, { status: 500 })
  }
}
