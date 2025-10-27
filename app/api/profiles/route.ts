// app/api/profiles/route.ts
import { NextResponse } from 'next/server'
import { listProfiles } from '@/lib/queries' // <- só GET usa
// REMOVE: createProfile (POST agora vai para o n8n)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || '1')
  const perPage = Number(searchParams.get('perPage') || '12')
  const q = searchParams.get('q') || undefined
  const sector = searchParams.get('sector') || undefined
  const adsOnly = searchParams.get('adsOnly') === 'true' ? true : undefined
  const status = (searchParams.get('status') as any) || undefined

  try {
    const result = await listProfiles({ page, perPage, q, sector, adsOnly, status })
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const N8N_URL = process.env.N8N_LUMINA_CREATE || process.env.NEXT_PUBLIC_N8N_LUMINA_CREATE
  const N8N_SECRET = process.env.N8N_WEBHOOK_SECRET

  if (!N8N_URL) {
    return NextResponse.json({ error: 'N8N_LUMINA_CREATE not set' }, { status: 500 })
  }

  try {
    const incoming = await req.json()

    // MODO MINIMAL: se vier só sector/locale, completa com seed + idempotency
    const sector = typeof incoming?.sector === 'string' ? incoming.sector.trim() : ''
    const locale = incoming?.locale === 'pt-PT' ? 'pt-PT' : (incoming?.locale || 'pt-BR')

    let body: any = incoming
    if (sector && Object.keys(incoming).length <= 3) {
      const seed = Buffer
        .from(`${sector}|${new Date().toISOString().slice(0,10)}`)
        .toString('base64')
        .slice(0, 12)
      const idempotency_key = `req-${Date.now()}-${Math.random().toString(36).slice(2,8)}`

      body = {
        sector,
        locale,
        idempotency_key,
        meta: { seed, request_source: 'admin.lumina.quick' },
      }
    }

    const res = await fetch(N8N_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_SECRET ? { 'x-lumina-secret': N8N_SECRET } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const text = await res.text()

    // Repassa status e tenta JSON
    try {
      const json = JSON.parse(text)
      return NextResponse.json(json, { status: res.status })
    } catch {
      return new NextResponse(text, {
        status: res.status,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Invalid JSON or forward error', detail: String(e?.message || e) },
      { status: 400 },
    )
  }
}