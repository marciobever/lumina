// app/api/admin/profiles/start/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

function slugify(s: string) {
  return String(s || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function POST(req: NextRequest) {
  const N8N_URL =
    process.env.N8N_LUMINA_CREATE ||
    process.env.NEXT_PUBLIC_N8N_LUMINA_CREATE

  const N8N_SECRET = process.env.N8N_WEBHOOK_SECRET

  if (!N8N_URL) {
    return NextResponse.json(
      { ok: false, error: 'N8N_LUMINA_CREATE not set' },
      { status: 500 }
    )
  }

  try {
    const incoming = await req.json().catch(() => ({} as any))

    // validações mínimas
    const name = String(incoming?.name || '').trim()
    if (!name) {
      return NextResponse.json(
        { ok: false, error: 'Campo "name" é obrigatório.' },
        { status: 400 }
      )
    }

    // normalizações/opcionais
    const slug = slugify(incoming?.slug || name)
    const locale = (incoming?.locale === 'pt-PT') ? 'pt-PT' : (incoming?.locale || 'pt-BR')

    // idempotência leve pra evitar duplicações acidentais
    const idempotency_key =
      incoming?.idempotency_key ||
      `lumina-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const payload = {
      ...incoming,
      name,
      slug,
      locale,
      idempotency_key,
      meta: {
        ...(incoming?.meta || {}),
        request_source: 'admin.create',
      },
    }

    const res = await fetch(N8N_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_SECRET ? { 'x-lumina-secret': N8N_SECRET } : {}),
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const raw = await res.text()
    let data: any = null
    try { data = JSON.parse(raw) } catch { /* mantém como texto */ }

    // tenta mapear Id/slug caso venham em formatos diferentes
    const Id =
      data?.Id ??
      data?.id ??
      data?.record?.Id ??
      data?.record?.id ??
      null

    const returnedSlug =
      data?.slug ??
      data?.record?.slug ??
      slug

    // resposta padronizada pro front
    return NextResponse.json(
      data && typeof data === 'object'
        ? { ok: res.ok, Id, slug: returnedSlug, ...data }
        : { ok: res.ok, Id, slug: returnedSlug, raw },
      { status: res.status }
    )
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Erro inesperado' },
      { status: 500 }
    )
  }
}
