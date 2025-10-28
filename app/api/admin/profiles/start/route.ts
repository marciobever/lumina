// app/api/admin/profiles/start/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

function slugify(s: string) {
  return String(s)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function pick<T = any>(obj: any, ...keys: string[]): T | undefined {
  for (const k of keys) {
    if (obj && typeof obj === 'object' && obj[k] != null) return obj[k]
  }
  return undefined
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = String(body?.name ?? '').trim()
    if (!name) return NextResponse.json({ error: 'Campo "name" é obrigatório.' }, { status: 400 })

    const slug = slugify(name)

    const N8N_URL =
      process.env.N8N_START_WEBHOOK ||
      process.env.NEXT_PUBLIC_N8N_START_WEBHOOK

    if (!N8N_URL) {
      return NextResponse.json({ error: 'N8N_START_WEBHOOK not set' }, { status: 500 })
    }

    // payload mínimo pro seu fluxo
    const payload = {
      action: 'lumina.profile.start',
      name,
      slug,
      ethnicity: body?.ethnicity ?? null,
      skin_tone: body?.skin_tone ?? null,
      age: body?.age ?? null,
      style: body?.style ?? 'editorial',
      source: 'lumina-admin/create',
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (process.env.N8N_WEBHOOK_SECRET) headers['x-lumina-secret'] = process.env.N8N_WEBHOOK_SECRET

    const res = await fetch(N8N_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const text = await res.text()

    // tenta ler JSON do N8N
    let n8n: any = null
    try { n8n = JSON.parse(text) } catch { /* deixa como texto cru */ }

    // NORMALIZAÇÃO: tenta achar Id/slug em vários jeitos comuns
    const flat = (obj: any): any => obj && typeof obj === 'object' ? obj : {}
    const top = flat(n8n)

    // pode vir direto no topo, ou dentro de {data:{...}}/{result:{...}} etc
    const candidates = [
      top,
      flat(top.data),
      flat(top.result),
      Array.isArray(top.list) ? flat(top.list[0]) : undefined,
    ].filter(Boolean)

    let Id: any, idAny: any, outSlug: any
    for (const c of candidates) {
      Id = Id ?? pick(c, 'Id', 'ID')
      idAny = idAny ?? pick(c, 'id', 'uuid')
      outSlug = outSlug ?? pick(c, 'slug')
    }
    // fallbacks
    const finalId = Id ?? idAny ?? null
    const finalSlug = String(outSlug ?? slug)

    return NextResponse.json(
      {
        ok: res.ok,
        status: res.status,
        Id: finalId,            // << o client lê isso
        slug: finalSlug,        // << e isso
        n8n_raw: n8n ?? text,   // debug (pode remover depois)
      },
      { status: res.ok ? 200 : res.status }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Erro inesperado' }, { status: 500 })
  }
}
