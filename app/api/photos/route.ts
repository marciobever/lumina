// app/api/photos/route.ts  ✅ público + Edge
import { NextRequest } from 'next/server'
import { sb } from '@/lib/supabaseClient' // usa ANON

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = (searchParams.get('slug') || '').toLowerCase().replace(/[^a-z0-9-]/g, '')
  const type = (searchParams.get('type') || 'gallery').toLowerCase()
  if (!slug) return new Response('missing slug', { status: 400 })

  const s = sb()
  const prefix = type === 'cover'
    ? `photos/${slug}/cover`   // <- sem barra no final
    : `photos/${slug}/gallery`

  const { data: list, error } = await s.storage.from('media').list(prefix, {
    limit: 200,
    sortBy: { column: 'name', order: 'asc' },
  })
  if (error) return new Response(`list error: ${error.message}`, { status: 500 })

  const files = (list || []).filter(f => !f.name.endsWith('/') && !f.name.startsWith('.'))
  if (!files.length) return new Response('not found', { status: 404 })

  const f = files[Math.floor(Math.random() * files.length)]
  const path = `${prefix}/${f.name}`

  const { data } = s.storage.from('media').getPublicUrl(path)
  return new Response(JSON.stringify({ url: data.publicUrl }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  })
}