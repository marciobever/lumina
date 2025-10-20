// app/api/lumina/profiles/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'

// === ENV ===
const N8N_URL = process.env.N8N_LUMINA_CREATE // ex.: https://n8n.your.com/webhook/profiles/create
const N8N_SECRET = process.env.N8N_WEBHOOK_SECRET // opcional

// === Helpers ===
const normalize = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
const slugify = (s = '') =>
  normalize(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const toTextArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String).filter(Boolean)
  if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean)
  return []
}

// Zod alinhado às colunas de lumina.profiles
const ProfileSchema = z.object({
  display_name: z.string().min(1),
  slug: z.string().optional(),
  title: z.string().nullable().optional(),
  sector: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  cover_url: z.string().url().nullable().optional(),
  gallery_urls: z.union([z.array(z.string().url()), z.string()]).optional(), // normalizamos p/ []
  tags: z.union([z.array(z.string()), z.string()]).optional(),               // normalizamos p/ []
  status: z.enum(['publicado', 'rascunho']).optional(), // se tiver outros, ajuste aqui
  exibir_anuncios: z.boolean().optional(),
  ad_slot_topo: z.string().nullable().optional(),
  ad_slot_meio: z.string().nullable().optional(),
  ad_slot_rodape: z.string().nullable().optional(),
})

async function forwardToN8N(payload: unknown) {
  if (!N8N_URL) {
    return NextResponse.json({ error: 'N8N_LUMINA_CREATE not set' }, { status: 500 })
  }

  // 1) Validação + normalização
  const parsed = ProfileSchema.parse(payload)
  const display_name = parsed.display_name
  const slug = parsed.slug ? slugify(parsed.slug) : slugify(display_name)

  const body = {
    slug,
    display_name,
    title: parsed.title ?? null,
    sector: parsed.sector ?? null,
    city: parsed.city ?? null,
    bio: parsed.bio ?? null,
    cover_url: parsed.cover_url ?? null,
    gallery_urls: toTextArray(parsed.gallery_urls), // NOT NULL no DB → [] se vazio
    tags: toTextArray(parsed.tags),                 // NOT NULL no DB → [] se vazio
    status: parsed.status ?? 'publicado',
    exibir_anuncios: parsed.exibir_anuncios ?? true,
    ad_slot_topo: parsed.ad_slot_topo ?? null,
    ad_slot_meio: parsed.ad_slot_meio ?? null,
    ad_slot_rodape: parsed.ad_slot_rodape ?? null,
  }

  // 2) Timeout + retry leve
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000) // 12s
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'seureview-app/pg13-proxy',
  }
  if (N8N_SECRET) headers['x-lumina-secret'] = N8N_SECRET

  let lastErr: unknown
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(N8N_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
        cache: 'no-store',
      })
      clearTimeout(timeout)

      const text = await res.text()
      // Tenta JSON, mas respeita texto do n8n
      try {
        const json = JSON.parse(text)
        return NextResponse.json(json, { status: res.status })
      } catch {
        return new NextResponse(text, {
          status: res.status,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      }
    } catch (err) {
      lastErr = err
      if (attempt === 2) break
      await new Promise(r => setTimeout(r, 400)) // backoff curto
    }
  }

  return NextResponse.json(
    { error: 'Failed to reach n8n', detail: String((lastErr as Error)?.message || lastErr) },
    { status: 504 },
  )
}

// === Handlers ===
export async function POST(req: Request) {
  try {
    const payload = await req.json()
    return await forwardToN8N(payload)
  } catch (e) {
    return NextResponse.json(
      { error: 'Invalid JSON body', detail: String((e as Error).message) },
      { status: 400 },
    )
  }
}

export function GET() {
  // Healthcheck simples
  return NextResponse.json(
    { ok: true, target: Boolean(N8N_URL), fields: Object.keys(ProfileSchema.shape) },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  )
}