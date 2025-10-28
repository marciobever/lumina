// lib/queries.ts
// MODO: NocoDB (se envs presentes) OU fallback local (data/profiles.json)

const PROFILES_TABLE = "profiles";
const PHOTOS_TABLE   = "profile_photos"; // usado só se você tiver tabela de fotos no NocoDB

// ==============================
// Tipagens
// ==============================
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
  status: "draft" | "published"
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

// ==============================
// Helpers
// ==============================
function nowIso() {
  return new Date().toISOString()
}
function slugify(s: string) {
  return String(s || "")
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
function cryptoRandomId() {
  return Math.random().toString(36).slice(2, 10)
}

function nocodbEnabled() {
  return !!(process.env.NOCODB_BASE_URL && process.env.NOCODB_TABLE_ID && process.env.NOCODB_API_TOKEN)
}
function nocodbTableProfiles() {
  return process.env.NOCODB_TABLE_ID as string
}
function nocodbTablePhotos() {
  return (process.env.NOCODB_PHOTOS_TABLE_ID || "") as string
}

async function nocodbFetch(path: string, init?: RequestInit) {
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
  try {
    return await res.json()
  } catch {
    return {}
  }
}

function mapRowToProfile(row: AnyObj): Profile {
  const ts = nowIso()
  const arr = (v: any) => (Array.isArray(v) ? v : v == null ? null : [String(v)])
  return {
    id: String(row.id ?? row.ID ?? row.uuid ?? row.slug ?? cryptoRandomId()),
    slug: row.slug ?? slugify(row.display_name || "perfil"),
    display_name: row.display_name ?? "(sem nome)",
    title: row.title ?? null,
    sector: row.sector ?? null,
    city: row.city ?? null,
    bio: row.bio ?? null,
    headline: row.headline ?? null,
    short_bio: row.short_bio ?? null,
    cover_url: row.cover_url ?? null,
    avatar_url: row.avatar_url ?? null,
    hero_url: row.hero_url ?? null,
    gallery_urls: arr(row.gallery_urls),
    tags: arr(row.tags),
    status: (row.status as any) || "draft",
    exibir_anuncios: !!row.exibir_anuncios,
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

// ==============================
// Fallback LOCAL (data/profiles.json)
// ==============================
const LOCAL_PATH = "data/profiles.json";

async function readLocal(): Promise<Profile[]> {
  try {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const file = path.join(process.cwd(), LOCAL_PATH);
    const raw = await fs.readFile(file, 'utf8').catch(() => '[]');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr as Profile[] : [];
  } catch {
    return [];
  }
}

async function writeLocal(list: Profile[]): Promise<void> {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const file = path.join(process.cwd(), LOCAL_PATH);
  const dir = path.dirname(file);
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(file, JSON.stringify(list, null, 2), 'utf8');
  } catch (e: any) {
    throw new Error(`Falha ao salvar ${LOCAL_PATH} (filesystem possivelmente read-only): ${e?.message || e}`);
  }
}

async function localFindById(id: string): Promise<Profile | null> {
  const all = await readLocal();
  return all.find(p => String(p.id) === String(id)) ?? null;
}
async function localFindBySlug(slug: string): Promise<Profile | null> {
  const all = await readLocal();
  return all.find(p => String(p.slug) === String(slug)) ?? null;
}

// ==============================
// Reads
// ==============================
export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  if (nocodbEnabled()) {
    const table = nocodbTableProfiles()
    const q = encodeURIComponent(`(slug,eq,${slug})`)
    const json = await nocodbFetch(`/api/v2/tables/${table}/records?where=${q}&limit=1`)
    const row = json?.list?.[0] || null
    return row ? mapRowToProfile(row) : null
  }
  return await localFindBySlug(slug);
}

export async function getProfileById(id: string): Promise<Profile | null> {
  if (nocodbEnabled()) {
    const table = nocodbTableProfiles()
    const json = await nocodbFetch(`/api/v2/tables/${table}/records/${id}`)
    const row = (json?.list?.[0] || json) as AnyObj
    return row && row.id ? mapRowToProfile(row) : null
  }
  return await localFindById(id);
}

export async function getProfilePhotos(profileId: string): Promise<Photo[]> {
  if (nocodbEnabled()) {
    const tablePhotos = nocodbTablePhotos()
    if (tablePhotos) {
      const q = encodeURIComponent(`(profile_id,eq,${profileId})`)
      const json = await nocodbFetch(`/api/v2/tables/${tablePhotos}/records?where=${q}&sort=position,created_at`)
      const list: AnyObj[] = json?.list ?? []
      const normalized = list
        .map((p: AnyObj, i: number) => ({
          image_url: String(p.image_url || ""),
          alt: p.alt ?? `Foto ${i + 1}`,
        }))
        .filter((p) => p.image_url && /^https?:\/\//i.test(p.image_url))
      if (normalized.length) return normalized
    }
    // fallback: tirar do próprio perfil
    const prof = await getProfileById(profileId)
    if (!prof) return []
    const name = prof.display_name
    const urls = prof.gallery_urls || []
    const base = urls.length ? urls : [prof.cover_url, prof.avatar_url].filter(Boolean) as string[]
    return base.map((u, i) => ({ image_url: u, alt: `${name} — ${i + 1}` }))
  }

  // local
  const prof = await getProfileById(profileId)
  if (!prof) return []
  const name = prof.display_name
  const urls = prof.gallery_urls || []
  const base = urls.length ? urls : [prof.cover_url, prof.avatar_url].filter(Boolean) as string[]
  return base.map((u, i) => ({ image_url: u!, alt: `${name} — ${i + 1}` }))
}

export async function getProfileQuiz(profileId: string) {
  const prof = await getProfileById(profileId)
  const q = (prof as any)?.quiz
  if (!q) return null
  if (Array.isArray(q)) {
    return { title: "Quiz", questions: q.map((s: string) => ({ q: String(s) })) }
  }
  if (q?.questions && Array.isArray(q.questions)) {
    return {
      title: q.title ?? "Quiz",
      description: q.description ?? "",
      questions: q.questions.map((x: any) =>
        typeof x === "string" ? { q: x } : { q: x.q ?? String(x), options: x.options ?? undefined }
      ),
    }
  }
  return null
}

export async function listSimilarProfiles(profileId: string, tags: string[] = [], limit = 6) {
  if (nocodbEnabled()) {
    const table = nocodbTableProfiles()
    const json = await nocodbFetch(`/api/v2/tables/${table}/records?limit=${limit * 4}&sort=-created_at`)
    let list: AnyObj[] = (json?.list ?? []).filter((r: AnyObj) => String(r.id) !== String(profileId) && (r.status ?? "published") === "published")
    if (tags?.length) {
      const set = new Set(tags.map(String))
      list = list.filter((r) => {
        const rt = Array.isArray(r.tags) ? r.tags.map(String) : []
        return rt.some((t: string) => set.has(String(t)))
      })
    }
    return list.slice(0, limit).map(mapRowToProfile)
  }

  // local
  const all = await readLocal();
  const me = all.find(p => String(p.id) === String(profileId));
  const tagSet = new Set((tags && tags.length ? tags : (me?.tags || []))?.map(String));
  const filtered = all
    .filter(p => p.id !== profileId && p.status === 'published')
    .filter(p => tagSet.size === 0 ? true : (p.tags || []).some(t => tagSet.has(String(t))))
    .slice(0, limit);
  return filtered;
}

export type ListParams = {
  page?: number
  perPage?: number
  q?: string
  sector?: string
  adsOnly?: boolean
  status?: "draft" | "published"
}

export async function listProfiles(params: ListParams = {}) {
  const page = Math.max(1, params.page ?? 1)
  const perPage = Math.min(50, Math.max(1, params.perPage ?? 12))
  const offset = (page - 1) * perPage

  if (nocodbEnabled()) {
    const table = nocodbTableProfiles()
    const where: string[] = []
    if (params.q) {
      const k = params.q.replace(/%/g, "")
      where.push(encodeURIComponent(`(display_name,like,%25${k}%25)`))
    }
    if (params.sector) where.push(encodeURIComponent(`(sector,eq,${params.sector})`))
    if (params.adsOnly) where.push(encodeURIComponent(`(exibir_anuncios,eq,true)`))
    if (params.status) where.push(encodeURIComponent(`(status,eq,${params.status})`))

    const whereStr = where.length ? `where=${where.join("&where=")}` : ""
    const url = `/api/v2/tables/${table}/records?${whereStr}&limit=${perPage}&offset=${offset}&sort=-created_at`
    const json = await nocodbFetch(url)
    let data: AnyObj[] = json?.list ?? []
    if (params.q) {
      const k = params.q.toLowerCase()
      data = data.filter((r: AnyObj) =>
        [r.display_name, r.title, r.slug, r.city].some((v) => String(v || "").toLowerCase().includes(k))
      )
    }

    const total: number =
      (json?.pageInfo?.totalRows as number) ??
      (json?.list?.length ?? 0) + (json?.pageInfo?.page ?? 0) * perPage

    return { data: data.map(mapRowToProfile) as Profile[], total: total || data.length, page, perPage }
  }

  // local
  let data = await readLocal();

  if (params.q) {
    const k = params.q.toLowerCase();
    data = data.filter((r) =>
      [r.display_name, r.title, r.slug, r.city]
        .some((v) => String(v || "").toLowerCase().includes(k))
    );
  }
  if (params.sector) data = data.filter(r => r.sector === params.sector);
  if (params.adsOnly) data = data.filter(r => !!r.exibir_anuncios);
  if (params.status) data = data.filter(r => r.status === params.status);

  const total = data.length;
  const slice = data
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(offset, offset + perPage);

  return { data: slice, total, page, perPage };
}

export async function listFeatured(limit = 12) {
  if (nocodbEnabled()) {
    const table = nocodbTableProfiles()
    const json = await nocodbFetch(`/api/v2/tables/${table}/records?limit=${Math.max(1, Math.min(50, limit))}&sort=-created_at`)
    const list: AnyObj[] = json?.list ?? []
    const filtered = list.filter((r) => (r.status ?? "published") === "published")
    const slice = filtered.slice(0, Math.max(1, Math.min(50, limit)))
    return { data: slice.map(mapRowToProfile), total: slice.length }
  }

  const all = await readLocal();
  const pub = all.filter(p => p.status === 'published')
  const slice = pub
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, Math.max(1, Math.min(50, limit)));
  return { data: slice, total: slice.length };
}

// ==============================
// Writes / Mutations
// ==============================
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
    const table = nocodbTableProfiles()
    const created = await nocodbFetch(`/api/v2/tables/${table}/records`, {
      method: "POST",
      body: JSON.stringify({ ...payload }),
    })
    const row = (created?.list?.[0] || created) as AnyObj
    return mapRowToProfile(row)
  }

  // local
  const all = await readLocal();
  const exists = all.some(p => p.slug === slug || p.id === payload.id);
  if (exists) throw new Error("Já existe um perfil com este slug/id no armazenamento local.");
  const prof = mapRowToProfile(payload);
  all.unshift(prof);
  await writeLocal(all);
  return prof;
}

export async function toggleAds(id: string, enabled: boolean): Promise<{ ok: true; profile?: Profile }> {
  const ts = nowIso()

  if (nocodbEnabled()) {
    const table = nocodbTableProfiles()
    const updated = await nocodbFetch(`/api/v2/tables/${table}/records/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ exibir_anuncios: !!enabled, updated_at: ts }),
    })
    const row = (updated?.list?.[0] || updated) as AnyObj
    return { ok: true, profile: mapRowToProfile(row) }
  }

  // local
  const all = await readLocal();
  const idx = all.findIndex(p => String(p.id) === String(id));
  if (idx < 0) return { ok: true, profile: undefined };
  all[idx] = { ...all[idx], exibir_anuncios: !!enabled, updated_at: ts };
  await writeLocal(all);
  return { ok: true, profile: all[idx] };
}

export async function deleteProfile(id: string) {
  if (nocodbEnabled()) {
    const table = nocodbTableProfiles()
    await nocodbFetch(`/api/v2/tables/${table}/records/${id}`, { method: "DELETE" })
    return true
  }

  // local
  const all = await readLocal();
  const next = all.filter(p => String(p.id) !== String(id));
  await writeLocal(next);
  return true;
}

// ==============================
// Métricas do Admin
// ==============================
export type AdminMetrics = {
  totalProfiles: number
  publishedProfiles: number
  profilesWithAds: number
  profilesWithoutAds: number
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  if (nocodbEnabled()) {
    const table = nocodbTableProfiles()
    const totalJson = await nocodbFetch(`/api/v2/tables/${table}/records?limit=1`)
    const total = Number(totalJson?.pageInfo?.totalRows || 0)

    const wPub = encodeURIComponent(`(status,eq,published)`)
    const pubJson = await nocodbFetch(`/api/v2/tables/${table}/records?where=${wPub}&limit=1`)
    const published = Number(pubJson?.pageInfo?.totalRows || 0)

    const wAds = encodeURIComponent(`(exibir_anuncios,eq,true)`)
    const adsJson = await nocodbFetch(`/api/v2/tables/${wAds ? table : table}/records?where=${wAds}&limit=1`)
    const withAds = Number(adsJson?.pageInfo?.totalRows || 0)

    return {
      totalProfiles: total,
      publishedProfiles: published,
      profilesWithAds: withAds,
      profilesWithoutAds: Math.max(0, total - withAds),
    }
  }

  // local
  const all = await readLocal();
  const total = all.length;
  const published = all.filter(p => p.status === 'published').length;
  const withAds = all.filter(p => !!p.exibir_anuncios).length;
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
