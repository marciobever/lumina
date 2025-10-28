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

export async function POST(req: NextRequest) {
  try {
    // 1) validar entrada mínima
    const body = await req.json().catch(() => ({}))
    const name = String(body?.name ?? '').trim()
    if (!name) {
      return NextResponse.json({ error: 'Campo "name" é obrigatório.' }, { status: 400 })
    }
    const slug = slugify(name)

    // 2) pegar URL do webhook do n8n via N8N_START_WEBHOOK
    const N8N_URL =
      process.env.N8N_START_WEBHOOK ||
      process.env.NEXT_PUBLIC_N8N_START_WEBHOOK

    if (!N8N_URL) {
      return NextResponse.json(
        { error: 'N8N_START_WEBHOOK not set' },
        { status: 500 }
      )
    }

    // 3) montar payload — repassando os campos gerados no form
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

    // 4) headers (inclui segredo se existir)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (process.env.N8N_WEBHOOK_SECRET) {
      headers['x-lumina-secret'] = process.env.N8N_WEBHOOK_SECRET
    }

    // 5) chamar o n8n
    const res = await fetch(N8N_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const text = await res.text()
    // tenta JSON, senão devolve texto cru
    try {
      const json = JSON.parse(text)
      return NextResponse.json(
        { ok: res.ok, slug, n8n_status: res.status, n8n: json },
        { status: res.ok ? 200 : res.status }
      )
    } catch {
      return NextResponse.json(
        { ok: res.ok, slug, n8n_status: res.status, n8n_text: text },
        { status: res.ok ? 200 : res.status }
      )
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Erro inesperado' },
      { status: 500 }
    )
  }
}
