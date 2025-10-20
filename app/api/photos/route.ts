// /app/api/photos/route.ts (Next 13+/App Router)
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // se bucket for privado; se for público, pode usar anon
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = (searchParams.get('slug') || '').toLowerCase().replace(/[^a-z0-9-]/g, '')
  const type = (searchParams.get('type') || 'any').toLowerCase().replace(/[^a-z0-9-]/g, '')

  if (!slug) return new Response('missing slug', { status: 400 })

  // Convenção de pastas no bucket: photos/<slug>/cover/* e photos/<slug>/gallery/*
  const basePath = `photos/${slug}`
  const prefix = type === 'cover' ? `${basePath}/cover/` : `${basePath}/gallery/`

  const { data: list, error } = await supabase.storage.from('media').list(prefix, { limit: 100 })
  if (error) return new Response('list error', { status: 500 })
  const files = (list || []).filter(f => !f.name.endsWith('/') && !f.name.startsWith('.'))
  if (!files.length) return new Response('not found', { status: 404 })

  // aleatória
  const pick = files[Math.floor(Math.random() * files.length)]
  const path = `${prefix}${pick.name}`

  // Se bucket público:
  const { data: pub } = supabase.storage.from('media').getPublicUrl(path)
  const url = pub?.publicUrl

  // Se bucket for privado, troque por signedUrl:
  // const { data: signed } = await supabase.storage.from('media').createSignedUrl(path, 60)
  // const url = signed?.signedUrl

  return new Response(JSON.stringify({ url }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  })
}