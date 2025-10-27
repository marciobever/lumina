import { NextResponse } from 'next/server'
import { createProfile, listProfiles } from '@/lib/queries'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') ?? '1')
  const perPage = Number(searchParams.get('perPage') ?? '12')
  const q = searchParams.get('q') ?? undefined
  const sector = searchParams.get('sector') ?? undefined
  const adsOnly = searchParams.get('adsOnly') === 'true'

  try {
    const out = await listProfiles({ page, perPage, q, sector, adsOnly })
    return NextResponse.json(out)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const created = await createProfile(body)
    return NextResponse.json(created, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}