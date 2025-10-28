// lib/queries.ts
// Fonte ÚNICA: NocoDB. Se envs ausentes, lança erro.

export type Profile = {
  id: string
  slug: string
  display_name: string
  title: string | null
  sector: string | null
  nicho?: string | null
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
  article: any | null
  quiz: any | null
  seo: any | null
  created_at: string
  updated_at: string
  hero_photo_id?: number | null
}

export type Photo = { image_url: string; alt?: string }
type AnyObj = Record<string, any>

// ---------------- utils ----------------
const nowIso = () => new Date().toISOString()

function requireEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env ${name} (NocoDB-only mode)`)
  return v
}

const tableId = () => requireEnv("NOCODB_TABLE_ID")

async function nc(path: string, init?: RequestInit) {
  const base = requireEnv("NOCODB_BASE_URL")
  const token = requireEnv("NOCODB_API_TOKEN")
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

function slugify(s: string) {
  return String(s || "")
    .normalize("NFD")
    // @ts-ignore
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function mapRowToProfile(row: AnyObj): Profile {
  const ts = nowIso()
  const display = String(row.display_name ?? row.name ?? "(sem nome)")
  const id = String(row.Id ?? row.id ?? row.uuid ?? row.slug ?? display)
  return {
    id,
    slug: String(row.slug ?? slugify(display)),
    display_name: display,
    title: row.title ?? null,
    sector: row.sector ?? row.category ?? null,
    nicho: row.nicho ?? null,
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
    article: row.article ?? null,
    quiz: row.quiz ?? null,
    seo: row.seo ?? null,
    created_at: row.created_at ?? ts,
    updated_at: row.updated_at ?? ts,
    hero_photo_id: row.hero_photo_id ?? null,
  }
}

// --------------- READS ---------------
export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  const t = tableId()
  const where = encodeURIComponent(`(slug,eq,${slug})`)
  const json = await nc(`/api/v2/tables/${t}/records?where=${where}&limit=1`)
  const row = json?.list?.[0]
  return row ? mapRowToProfile(row) : null
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const t = tableId()
  const json = await nc(`/api/v2/tables/${t}/records/${id}`)
  const row = (json?.list?.[0] || json) as AnyObj
  return row && (row.id ?? row.Id) ? mapRowToProfile(row) : null
}

export async function getProfilePhotos(profileId: string): Promise<Photo[]> {
  const prof = await getProfileById(profileId)
  if (!prof) return []
  const name = prof.display_name
  const urls = prof.gallery_urls || []
  const base = urls.length ? urls : [prof.cover_url, prof.avatar_url].filter(Boolean) as string[]
  return base.map((u, i) => ({ image_url: u, alt: `${name} — ${i + 1}` }))
}

export async function listSimilarProfiles(profileId: string, tags: string[] = [], limit = 6) {
  const t = tableId()
  const json = await nc(`/api/v2/tables/${t}/records?limit=${limit * 4}&sort=-UpdatedAt`)
  let list: AnyObj[] = (json?.list ?? []).filter(
    (r: AnyObj) => String(r.id ?? r.Id) !== String(profileId) && (r.status ?? "published") === "published"
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

export type ListParams = {
  page?: number
  perPage?: number
  q?: string
  sector?: string
  nicho?: string
  status?: "draft" | "published" | string
}

export async function listProfiles(params: ListParams = {}) {
  const page = Math.max(1, params.page ?? 1)
  const perPage = Math.min(50, Math.max(1, params.perPage ?? 12))
  const offset = (page - 1) * perPage

  const t = tableId()
  const wh: string[] = []

  // Somente campos "seguros" no WHERE para evitar 422
  if (params.status) wh.push(encodeURIComponent(`(status,eq,${params.status})`))

  const qs = `${wh.length ? `where=${wh.join("&where=")}&` : ""}limit=${perPage}&offset=${offset}&sort=-UpdatedAt`
  const json = await nc(`/api/v2/tables/${t}/records?${qs}`)
  let list: AnyObj[] = json?.list ?? []

  // Filtro por texto (após fetch) cobrindo múltiplos campos
  if (params.q) {
    const k = params.q.toLowerCase()
    list = list.filter((r: AnyObj) =>
      [r.display_name, r.name, r.title, r.slug, r.city, r.sector, r.category, r.nicho, Array.isArray(r.tags) ? r.tags.join(" ") : r.tags]
        .some((v) => String(v || "").toLowerCase().includes(k))
    )
  }

  // Filtro por setor (server-side)
  if (params.sector) {
    const want = params.sector.toLowerCase()
    list = list.filter((r: AnyObj) => {
      const v = String(r.sector ?? r.category ?? "").toLowerCase()
      return v === want || v.includes(want)
    })
  }

  // Filtro por nicho (server-side)
  if (params.nicho) {
    const want = params.nicho.toLowerCase()
    list = list.filter((r: AnyObj) => String(r.nicho ?? "").toLowerCase().includes(want))
  }

  return {
    data: list.map(mapRowToProfile) as Profile[],
    total: Number(json?.pageInfo?.totalRows || list.length),
    page, perPage
  }
}

export async function listFeatured(limit = 12) {
  const lim = Math.max(1, Math.min(50, limit))
  const t = tableId()
  // Exige apenas cover_url preenchida
  const wCover = encodeURIComponent(`(cover_url,neq,)`)
  const url = `/api/v2/tables/${t}/records?where=${wCover}&limit=${lim}&sort=-UpdatedAt`
  const json = await nc(url)
  const list: AnyObj[] = json?.list ?? []
  const data = list.map(mapRowToProfile)
  return { data, total: Number(json?.pageInfo?.totalRows || data.length) }
}

// --------------- WRITES / MUTATIONS ---------------
export async function createProfile(input: Partial<Profile>): Promise<Profile> {
  const t = tableId()
  const display_name = input.display_name || "Novo Perfil"
  const slug = input.slug || slugify(display_name)
  const ts = nowIso()

  const payload: AnyObj = {
    ...input,
    display_name,
    slug,
    status: input.status ?? "draft",
    created_at: input.created_at || ts,
    updated_at: ts,
  }

  const created = await nc(`/api/v2/tables/${t}/records`, {
    method: "POST",
    body: JSON.stringify({ ...payload }),
  })
  const row = (created?.list?.[0] || created) as AnyObj
  return mapRowToProfile(row)
}

export async function deleteProfile(id: string) {
  const t = tableId()
  await nc(`/api/v2/tables/${t}/records/${id}`, { method: "DELETE" })
  return true
}

// --------------- MÉTRICAS ADMIN ---------------
export type AdminMetrics = {
  totalProfiles: number
  publishedProfiles: number
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const t = tableId()
  const totalJson = await nc(`/api/v2/tables/${t}/records?limit=1`)
  const total = Number(totalJson?.pageInfo?.totalRows || 0)

  const wPub = encodeURIComponent(`(status,eq,published)`)
  const pubJson = await nc(`/api/v2/tables/${t}/records?where=${wPub}&limit=1`)
  const published = Number(pubJson?.pageInfo?.totalRows || 0)

  return { totalProfiles: total, publishedProfiles: published }
}

export async function getDashboardStats(): Promise<{ cards: Array<{ label: string; value: number }> }> {
  const m = await getAdminMetrics()
  return {
    cards: [
      { label: "Perfis", value: m.totalProfiles },
      { label: "Publicados", value: m.publishedProfiles },
    ],
  }
}
