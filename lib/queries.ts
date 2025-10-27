// lib/queries.ts
import { db } from "./supabaseServer"

// atenção: o client já aponta para o schema "lumina".
// portanto, NÃO prefixe com "lumina." aqui.
const PROFILES_TABLE = "profiles"
const PHOTOS_TABLE   = "profile_photos"

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

function parsePgTextArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String)
  if (typeof v === "string" && v.startsWith("{") && v.endsWith("}")) {
    return v.slice(1, -1).split(",").map((s) => s.trim().replace(/^"(.*)"$/, "$1"))
  }
  return []
}

export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  const supa = db()
  const { data, error } = await supa
    .from(PROFILES_TABLE)
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as Profile | null
}

export async function getProfilePhotos(profileId: string): Promise<Photo[]> {
  const supa = db()

  const { data: photos, error: photosErr } = await supa
    .from(PHOTOS_TABLE)
    .select("image_url, alt, position, created_at")
    .eq("profile_id", profileId)
    .order("position", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true, nullsFirst: true })
  if (photosErr) throw photosErr

  const normalized =
    (photos ?? [])
      .map((p: any, i: number) => ({
        image_url: String(p.image_url),
        alt: p.alt ?? `Foto ${i + 1}`,
      }))
      .filter((p) => typeof p.image_url === "string" && /^https?:\/\//i.test(p.image_url))

  if (normalized.length) return normalized

  const { data: prof, error } = await supa
    .from(PROFILES_TABLE)
    .select("display_name, cover_url, avatar_url, gallery_urls")
    .eq("id", profileId)
    .maybeSingle()
  if (error) throw error
  if (!prof) return []

  const name = (prof as any).display_name as string
  const urls = parsePgTextArray((prof as any).gallery_urls)
  const base: string[] = urls.length ? urls : [prof.cover_url, prof.avatar_url].filter(Boolean) as string[]

  return base.map((u, i) => ({ image_url: u, alt: `${name} — ${i + 1}` }))
}

export async function getProfileQuiz(profileId: string) {
  const supa = db()
  const { data, error } = await supa
    .from(PROFILES_TABLE)
    .select("quiz")
    .eq("id", profileId)
    .maybeSingle()
  if (error) throw error
  const q = (data as any)?.quiz
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
  const supa = db()

  if (!tags?.length) {
    const { data, error } = await supa
      .from(PROFILES_TABLE)
      .select("id, slug, display_name, title, sector, cover_url, avatar_url, hero_url, tags")
      .neq("id", profileId)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) throw error
    return data ?? []
  }

  const { data, error } = await supa
    .from(PROFILES_TABLE)
    .select("id, slug, display_name, title, sector, cover_url, avatar_url, hero_url, tags")
    .neq("id", profileId)
    .eq("status", "published")
    .overlaps("tags", tags)
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
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
  const supa = db()
  const page = Math.max(1, params.page ?? 1)
  const perPage = Math.min(50, Math.max(1, params.perPage ?? 12))
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let q = supa
    .from(PROFILES_TABLE)
    .select(
      `
      id, slug, display_name, title, sector, city, bio,
      cover_url, gallery_urls, tags, status,
      exibir_anuncios, ad_slot_topo, ad_slot_meio, ad_slot_rodape,
      created_at, updated_at
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to)

  if (params.q) {
    const k = params.q.replace(/%/g, "")
    q = q.or(`display_name.ilike.%${k}%,title.ilike.%${k}%,slug.ilike.%${k}%,city.ilike.%${k}%`)
  }
  if (params.sector) q = q.eq("sector", params.sector)
  if (params.adsOnly) q = q.eq("exibir_anuncios", true)
  if (params.status) q = q.eq("status", params.status)

  const { data, error, count } = await q
  if (error) throw error
  return { data: (data ?? []) as Profile[], total: count ?? 0, page, perPage }
}

export async function listFeatured(limit = 12) {
  const supa = db()
  const { data, error } = await supa
    .from(PROFILES_TABLE)
    .select("id, slug, display_name, title, sector, cover_url, gallery_urls, exibir_anuncios, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(Math.max(1, Math.min(50, limit)))
  if (error) throw error
  return { data: data ?? [], total: data?.length ?? 0 }
}

// === deleteProfile (NocoDB primeiro; fallback Supabase) ===
export async function deleteProfile(id: string) {
  const base = process.env.NOCODB_BASE_URL;
  const table = process.env.NOCODB_TABLE_ID;
  const token = (process.env.NOCODB_API_TOKEN || "").trim();

  if (base && table && token) {
    const res = await fetch(`${base}/api/v2/tables/${table}/records/${id}`, {
      method: "DELETE",
      headers: {
        "xc-token": token,
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`NocoDB error ${res.status}: ${txt || "sem corpo"}`);
    }
    return true;
  }

  // Fallback: deleta no Supabase
  const supa = db()
  const { error } = await supa.from(PROFILES_TABLE).delete().eq("id", id)
  if (error) throw error
  return true
}
