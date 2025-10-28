// lib/queries.ts
// Fonte: NocoDB. Se envs ausentes, cai no fallback LOCAL (data/profiles.json)

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

export type Photo = { image_url: string; alt?: string }
type AnyObj = Record<string, any>

const LOCAL_PATH = "data/profiles.json"

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

const cryptoRandomId = () => Math.random().toString(36).slice(2, 10)

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
    } catch { return null }
  }
  return s.split(",").map(t => t.trim()).filter(Boolean)
}

function mapRowToProfile(row: AnyObj): Profile {
  const ts = nowIso()
  const display = String(row.display_name ?? row.name ?? "(sem nome)")
  const id = String(row.Id ?? row.id ?? row.uuid ?? row.slug ?? cryptoRandomId())
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

async function writeLocal(list: Profile[]): Promise<void> {
  const fs = await import("node:fs/promises")
  const path = await import("node:path")
  const file = path.join(process.cwd(), LOCAL_PATH)
  const dir = path.dirname(file)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(file, JSON.stringify(list, null, 2), "utf8")
}

async function localFindById(id: string): Promise<Profile | null> {
  const all = await readLocal()
  return all.find(p => String(p.id) === String(id)) ?? null
}
async function localFindBySlug(slug: string): Promise<Profile | null> {
  const all = await readLocal()
  return all.find(p => String(p.slug) === String(slug)) ?? null
}

// --------------- READS ---------------
export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  if (nocodbEnabled()) {
    const t = tableId()
    const where = encodeURIComponent(`(slug,eq,${slug})`)
    const json = await nc(`/api/v2/tables/${t}/records?where=${where}&limit=1`)
    const row = json?.list?.[0]
    return row ? mapRowToProfile(row) : null
  }
  return await localFindBySlug(slug)
}

export async function getProfileById(id: string): Promise<Profile | null> {
  if (nocodbEnabled()) {
    const t = tableId()
    const json = await nc(`/api/v2/tables/${t}/records/${id}`)
    const row = (json?.list?.[0] || json) as AnyObj
    return row && row.id ? mapRowToProfile(row) : null
  }
  return await localFindById(id)
}

export async function getProfilePhotos(profileId: string): Promise<Photo[]> {
  if (nocodbEnabled()) {
    // Sem tabela de fotos separada? Usa as URLs do próprio perfil.
    const prof = await getProfileById(profileId)
    if (!prof) return []
    const name = prof.display_name
    const urls = prof.gallery_urls || []
    const base = urls.length ? urls : [prof.cover_url, prof.avatar_url].filter(Boolean) as string[]
    return base.map((u, i) => ({ image_url: u, alt: `${name} — ${i + 1}` }))
  }
  const prof = await getProfileById(profileId)
  if (!prof) return []
  const name = prof.display_name
  const urls = prof.gallery_urls || []
  const base = urls.length ? urls : [prof.cover_url, prof.avatar_url].filter(Boolean) as string[]
  return base.map((u, i) => ({ image_url: u!, alt: `${name} — ${i + 1}` }))
}

export async function listSimilarProfiles(profileId: string, tags: string[] = [], limit = 6) {
  if (nocodbEnabled()) {
    const t = tableId()
    const json = await nc(`/api/v2/tables/${t}/records?limit=${limit * 4}&sort=-created_at`)
    let list: AnyObj[] = (json?.list ?? []).filter(
      (r: AnyObj) => String(r.id) !== String(profileId) && (r.status ?? "published") === "published"
    )
    if (tags?.length) {
      const set = new Set(tags.map(String))
      list = list.filter((r) => {
        const rt = Array.isArray(r.tags) ? r.tags.map(String) : parseMaybeJsonArray(r.tags) || []
        return rt.some((t: string) => set.has(String(t)))
      })
    }
    return list.slice(0, limit).map(mapRowToProfile)
  }
  const all = await readLocal()
  const me = all.find(p => String(p.id) === String(profileId))
  const tagSet = new Set((tags && tags.length ? tags : (me?.tags || []))?.map(String))
  const filtered = all
    .filter(p => p.id !== profileId && p.status === 'published')
    .filter(p => tagSet.size === 0 ? true : (p.tags || []).some(t => tagSet.has(String(t))))
    .slice(0, limit)
  return filtered
}

export type ListParams = {
  page?: number
  perPage?: number
  q?: string
  sector?: string
  adsOnly?: boolean
  status?: "draft" | "published" | string
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
    if (params.adsOnly) wh.push(encodeURIComponent(`(exibir_anuncios,eq,true)`))
    if (params.status) wh.push(encodeURIComponent(`(status,eq,${params.status})`))

    const qs = `${wh.length ? `where=${wh.join("&where=")}&` : ""}limit=${perPage}&offset=${offset}&sort=-updated_at`
    const json = await nc(`/api/v2/tables/${t}/records?${qs}`)
    const list: AnyObj[] = json?.list ?? []
    if (params.q) {
      const k = params.q.toLowerCase()
      // refine local (após where like do Noco)
      list.splice(0, list.length, ...list.filter((r: AnyObj) =>
        [r.display_name, r.title, r.slug, r.city].some((v) => String(v || "").toLowerCase().includes(k))
      ))
    }
    return {
      data: list.map(mapRowToProfile) as Profile[],
      total: Number(json?.pageInfo?.totalRows || list.length),
      page, perPage
    }
  }

  // local
  let data = await readLocal()
  if (params.q) {
    const k = params.q.toLowerCase()
    data = data.filter((r) =>
      [r.display_name, r.title, r.slug, r.city]
        .some((v) => String(v || "").toLowerCase().includes(k))
    )
  }
  if (params.sector) data = data.filter(r => r.sector === params.sector)
  if (params.adsOnly) data = data.filter(r => !!r.exibir_anuncios)
  if (params.status) data = data.filter(r => r.status === params.status)

  const total = data.length
  const slice = data
    .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))
    .slice(offset, offset + perPage)

  return { data: slice, total, page, perPage }
}

export async function listFeatured(limit = 12) {
  const lim = Math.max(1, Math.min(50, limit))
  if (nocodbEnabled()) {
    const t = tableId()
    const w1 = encodeURIComponent(`(status,in,cover_done|gallery_done|published)`)
    const w2 = encodeURIComponent(`(cover_url,neq,)`)
    const url = `/api/v2/tables/${t}/records?where=${w1}&where=${w2}&limit=${lim}&sort=-updated_at`
    const json = await nc(url)
    const list: AnyObj[] = json?.list ?? []
    const data = list.map(mapRowToProfile)
    return { data, total: Number(json?.pageInfo?.totalRows || data.length) }
  }
  const all = await readLocal()
  const pub = all.filter(p => !!p.cover_url)
  const slice = pub
    .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))
    .slice(0, lim)
  return { data: slice, total: slice.length }
}

// --------------- WRITES / MUTATIONS ---------------
export async function createProfile(input: Partial<Profile>): Promise<Profile> {
  const payload: AnyObj = { ...input }
  const display_name = payload.display_name || "Novo Perfil"
  const slug = payload.slug || slugify(display_name)
  const ts = nowIso()

  payload.id              = payload.id || cryptoRandomId()
  payload.display_name    = display_name
  payload.slug            = slug
  payload.status          = (payload.status as any) || "draft"
  payload.exibir_anuncios = !!payload.exibir_anuncios
  payload.created_at      = payload.created_at || ts
  payload.updated_at      = ts

  if (nocodbEnabled()) {
    const t = tableId()
    const created = await nc(`/api/v2/tables/${t}/records`, {
      method: "POST",
      body: JSON.stringify({ ...payload }),
    })
    const row = (created?.list?.[0] || created) as AnyObj
    return mapRowToProfile(row)
  }

  const all = await readLocal()
  const exists = all.some(p => p.slug === slug || p.id === payload.id)
  if (exists) throw new Error("Já existe um perfil com este slug/id no armazenamento local.")
  const prof = mapRowToProfile(payload)
  all.unshift(prof)
  await writeLocal(all)
  return prof
}

export async function toggleAds(id: string, enabled: boolean): Promise<{ ok: true; profile?: Profile }> {
  const ts = nowIso()
  if (nocodbEnabled()) {
    const t = tableId()
    const updated = await nc(`/api/v2/tables/${t}/records/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ exibir_anuncios: !!enabled, updated_at: ts }),
    })
    const row = (updated?.list?.[0] || updated) as AnyObj
    return { ok: true, profile: mapRowToProfile(row) }
  }
  const all = await readLocal()
  const idx = all.findIndex(p => String(p.id) === String(id))
  if (idx < 0) return { ok: true, profile: undefined }
  all[idx] = { ...all[idx], exibir_anuncios: !!enabled, updated_at: ts }
  await writeLocal(all)
  return { ok: true, profile: all[idx] }
}

export async function deleteProfile(id: string) {
  if (nocodbEnabled()) {
    const t = tableId()
    await nc(`/api/v2/tables/${t}/records/${id}`, { method: "DELETE" })
    return true
  }
  const all = await readLocal()
  const next = all.filter(p => String(p.id) !== String(id))
  await writeLocal(next)
  return true
}

// --------------- MÉTRICAS ADMIN ---------------
export type AdminMetrics = {
  totalProfiles: number
  publishedProfiles: number
  profilesWithAds: number
  profilesWithoutAds: number
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  if (nocodbEnabled()) {
    const t = tableId()
    const totalJson = await nc(`/api/v2/tables/${t}/records?limit=1`)
    const total = Number(totalJson?.pageInfo?.totalRows || 0)

    const wPub = encodeURIComponent(`(status,eq,published)`)
    const pubJson = await nc(`/api/v2/tables/${t}/records?where=${wPub}&limit=1`)
    const published = Number(pubJson?.pageInfo?.totalRows || 0)

    const wAds = encodeURIComponent(`(exibir_anuncios,eq,true)`)
    const adsJson = await nc(`/api/v2/tables/${t}/records?where=${wAds}&limit=1`)
    const withAds = Number(adsJson?.pageInfo?.totalRows || 0)

    return {
      totalProfiles: total,
      publishedProfiles: published,
      profilesWithAds: withAds,
      profilesWithoutAds: Math.max(0, total - withAds),
    }
  }

  const all = await readLocal()
  const total = all.length
  const published = all.filter(p => p.status === 'published').length
  const withAds = all.filter(p => !!p.exibir_anuncios).length
  return {
    totalProfiles: total,
    publishedProfiles: published,
    profilesWithAds: withAds,
    profilesWithoutAds: Math.max(0, total - withAds),
  }
}

export async function getDashboardStats(): Promise<{ cards: Array<{ label: string; value: number }> }> {
  const m = await getAdminMetrics()
  return {
    cards: [
      { label: "Perfis", value: m.totalProfiles },
      { label: "Publicados", value: m.publishedProfiles },
      { label: "Com Anúncios", value: m.profilesWithAds },
    ],
  }
}
