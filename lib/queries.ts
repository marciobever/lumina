// lib/queries.ts
// Fonte: NocoDB (lumina_profiles_template_csv). Se envs ausentes, cai no fallback local.

export type Profile = {
  id: string
  slug: string
  display_name: string
  title: string | null
  sector: string | null
  city: string | null
  bio: string | null
  headline: string | null
  short_bio: string | null
  cover_url: string | null
  avatar_url: string | null
  hero_url: string | null
  gallery_urls: string[] | null
  tags: string[] | null
  status: string
  exibir_anuncios: boolean | null
  ad_slot_topo: string | null
  ad_slot_meio: string | null
  ad_slot_rodape: string | null
  article: any | null
  quiz: any | null
  seo: any | null
  created_at: string
  updated_at: string
  hero_photo_id?: number | null
}

type AnyObj = Record<string, any>

const LOCAL_PATH = "data/profiles.json";

// ---------------- utils ----------------
const nowIso = () => new Date().toISOString()
const slugify = (s: string) =>
  String(s || "")
    .normalize("NFD")
    // @ts-ignore
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const nocodbEnabled = () =>
  !!(process.env.NOCODB_BASE_URL && process.env.NOCODB_TABLE_ID && process.env.NOCODB_API_TOKEN)

const tableId = () => process.env.NOCODB_TABLE_ID as string

async function nc(path: string, init?: RequestInit) {
  const base = process.env.NOCODB_BASE_URL!
  const token = process.env.NOCODB_API_TOKEN!
  const url = `${base}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "xc-token": token,
      "Authorization": `Bearer ${token}`,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  })
  if (!res.ok) {
    const t = await res.text().catch(() => "")
    throw new Error(`NocoDB ${res.status}: ${t || res.statusText}`)
  }
  try { return await res.json() } catch { return {} }
}

function parseMaybeJsonArray(v: any): string[] | null {
  if (v == null) return null
  if (Array.isArray(v)) return v.map(String)
  const s = String(v).trim()
  if (!s) return null
  if (s.startsWith("[") && s.endsWith("]")) {
    try {
      const arr = JSON.parse(s)
      return Array.isArray(arr) ? arr.map(String) : null
    } catch {
      return null
    }
  }
  // trata CSV simples
  return s.split(",").map(t => t.trim()).filter(Boolean)
}

function mapRow(row: AnyObj): Profile {
  const ts = nowIso()
  const display = String(row.display_name ?? row.name ?? "(sem nome)")
  const id = String(row.Id ?? row.id ?? row.uuid ?? row.slug ?? display)
  return {
    id,
    slug: String(row.slug ?? slugify(display)),
    display_name: display,
    title: row.title ?? null,
    sector: row.sector ?? row.category ?? null,
    city: row.city ?? null,
    bio: row.bio ?? null,
    headline: row.headline ?? null,
    short_bio: row.short_bio ?? null,
    cover_url: row.cover_url ?? null,
    avatar_url: row.avatar_url ?? null,
    hero_url: row.hero_url ?? null,
    gallery_urls: parseMaybeJsonArray(row.gallery_urls),
    tags: parseMaybeJsonArray(row.tags),
    status: String(row.status ?? "draft"),
    exibir_anuncios: row.exibir_anuncios == null ? null : !!row.exibir_anuncios,
    ad_slot_topo: row.ad_slot_topo ?? null,
    ad_slot_meio: row.ad_slot_meio ?? null,
    ad_slot_rodape: row.ad_slot_rodape ?? null,
    article: row.article ?? null,
    quiz: row.quiz ?? null,
    seo: row.seo ?? null,
    created_at: row.created_at ?? ts,
    updated_at: row.updated_at ?? ts,
    hero_photo_id: row.hero_photo_id ?? null,
  }
}

// --------------- LOCAL fallback ---------------
async function readLocal(): Promise<Profile[]> {
  try {
    const fs = await import("node:fs/promises")
    const path = await import("node:path")
    const file = path.join(process.cwd(), LOCAL_PATH)
    const raw = await fs.readFile(file, "utf8").catch(() => "[]")
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? (arr as Profile[]) : []
  } catch { return [] }
}

// --------------- READS ---------------
export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  if (nocodbEnabled()) {
    const t = tableId()
    const where = encodeURIComponent(`(slug,eq,${slug})`)
    const json = await nc(`/api/v2/tables/${t}/records?where=${where}&limit=1`)
    const row = json?.list?.[0]
    return row ? mapRow(row) : null
  }
  const all = await readLocal()
  return all.find(p => p.slug === slug) ?? null
}

export async function listFeatured(limit = 12): Promise<{ data: Profile[]; total: number }> {
  const lim = Math.max(1, Math.min(50, limit))
  if (nocodbEnabled()) {
    const t = tableId()

    // status aceitáveis para ter capa válida na home
    const w1 = encodeURIComponent(`(status,in,cover_done|gallery_done|published)`)
    const w2 = encodeURIComponent(`(cover_url,neq,)`)
    const url = `/api/v2/tables/${t}/records?where=${w1}&where=${w2}&limit=${lim}&sort=-updated_at`
    const json = await nc(url)
    const list: AnyObj[] = json?.list ?? []
    const data = list.map(mapRow)
    return { data, total: Number(json?.pageInfo?.totalRows || data.length) }
  }

  const all = await readLocal()
  const data = all
    .filter(p => !!p.cover_url)
    .sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""))
    .slice(0, lim)
  return { data, total: data.length }
}

export type ListParams = {
  page?: number
  perPage?: number
  q?: string
  sector?: string
  status?: string
}

export async function listProfiles(params: ListParams = {}) {
  const page = Math.max(1, params.page ?? 1)
  const perPage = Math.min(50, Math.max(1, params.perPage ?? 12))
  const offset = (page - 1) * perPage

  if (nocodbEnabled()) {
    const t = tableId()
    const wh: string[] = []
    if (params.q) {
      const k = params.q.replace(/%/g, "")
      wh.push(encodeURIComponent(`(display_name,like,%25${k}%25)`))
    }
    if (params.sector) wh.push(encodeURIComponent(`(sector,eq,${params.sector})`))
    if (params.status) wh.push(encodeURIComponent(`(status,eq,${params.status})`))

    const qs = `${wh.length ? `where=${wh.join("&where=")}&` : ""}limit=${perPage}&offset=${offset}&sort=-updated_at`
    const json = await nc(`/api/v2/tables/${t}/records?${qs}`)
    const list: AnyObj[] = json?.list ?? []
    return {
      data: list.map(mapRow),
      total: Number(json?.pageInfo?.totalRows || list.length),
      page, perPage,
    }
  }

  const all = await readLocal()
  let data = all.slice()
  if (params.q) {
    const k = params.q.toLowerCase()
    data = data.filter(r =>
      [r.display_name, r.title, r.slug, r.city].some(v => String(v || "").toLowerCase().includes(k))
    )
  }
  if (params.sector) data = data.filter(r => r.sector === params.sector)
  if (params.status) data = data.filter(r => r.status === params.status)

  const total = data.length
  data = data.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || "")).slice(offset, offset + perPage)
  return { data, total, page, perPage }
}
