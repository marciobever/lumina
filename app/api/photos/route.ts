// app/api/photos/route.ts  ✅ público + Node.js (usa NocoDB ou fallback local)
export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { getProfileBySlug, getProfilePhotos } from '@/lib/queries'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = (searchParams.get('slug') || '')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
    const type = (searchParams.get('type') || 'gallery').toLowerCase()

    if (!slug) {
      return new Response('missing slug', { status: 400 })
    }

    // 1) busca o perfil pelo slug (NocoDB -> fallback local)
    const prof = await getProfileBySlug(slug)
    if (!prof) {
      return new Response('not found', { status: 404 })
    }

    // 2) decide a fonte conforme o "type"
    if (type === 'cover') {
      const url =
        prof.cover_url ||
        prof.hero_url ||
        prof.avatar_url ||
        (Array.isArray(prof.gallery_urls) && prof.gallery_urls[0]) ||
        null

      if (!url) return new Response('not found', { status: 404 })

      return new Response(JSON.stringify({ url }), {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
        },
      })
    }

    // 3) gallery: usa helper que já resolve NocoDB ou local
    const photos = await getProfilePhotos(prof.id)
    const pool = photos
      .map((p) => p.image_url)
      .filter((u): u is string => typeof u === 'string' && !!u)

    // fallback: se não houver galeria, tenta cover/avatar/hero
    if (!pool.length) {
      const fallback = [prof.cover_url, prof.avatar_url, prof.hero_url].filter(Boolean) as string[]
      if (!fallback.length) return new Response('not found', { status: 404 })
      return new Response(JSON.stringify({ url: fallback[0] }), {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
        },
      })
    }

    const url = pool[Math.floor(Math.random() * pool.length)]
    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    })
  } catch (e: any) {
    return new Response(`error: ${e?.message || e}`, { status: 500 })
  }
}
