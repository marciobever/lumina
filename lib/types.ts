// lib/types.ts

/** ====================== Base (seu schema atual) ====================== */
export type Profile = {
  id: string
  slug: string
  name: string
  sector: string | null
  title: string | null
  bio: string | null
  cover_url: string | null
  gallery_urls: string[] | null
  keywords: string[] | null
  status: 'draft' | 'ready' | 'published' | 'archived'
  created_at: string
  updated_at: string | null
}

export type Asset = {
  id: string
  profile_id: string
  kind: 'cover' | 'gallery' | 'banner' | 'other'
  url: string
  meta: Record<string, any> | null
  created_at: string
}

export type Event = {
  id: string
  profile_id: string | null
  type: string
  payload: Record<string, any> | null
  created_at: string
}

/** ====================== Conteúdo editorial (opcional) ======================
 *  Mantém compat com n8n/DB que podem enviar string JSON ou objetos.
 */
export type ArticleCTA = {
  headline?: string
  text?: string
  button?: string
} | null

export type ArticleSection = {
  text: string
  related_shot?: number
}

export type ArticleData = {
  hook?: string
  sections?: ArticleSection[]
  tips?: string[]
  cta?: ArticleCTA
  seo?: {
    slug?: string
    meta_title?: string
    meta_description?: string
  }
  display_name?: string
  title?: string
  context?: string
}

export type QuizQuestion = {
  id: string
  title: string
  options: string[]
}

export type QuizData =
  | {
      title?: string
      description?: string
      /** formato 1 (preferido pelo widget): */
      questions?: QuizQuestion[] | string[]
      /** formato 2 (alternativo que às vezes vem do n8n): */
      items?: Array<{ id?: string; title?: string; question?: string; options?: string[] }>
    }
  | string // quando vier como JSON serializado

export type SEOData =
  | {
      slug?: string
      meta_title?: string
      meta_description?: string
    }
  | string

/** ====================== Extensão do Profile p/ página ====================== */
export type ProfileExtended = Profile & {
  /** Campos editoriais opcionais que alguns perfis terão */
  display_name?: string | null
  short_bio?: string | null
  avatar_url?: string | null
  hero_url?: string | null
  city?: string | null
  tags?: string[] | null
  article?: ArticleData | string | null
  quiz?: QuizData | null
  seo?: SEOData | null
  /** Layout dinâmico por perfil (opcional) */
  layout?: { blocks?: string[] } | null
}

/** ====================== ViewModel consumido pela page ====================== */
export type PhotoItem = { image_url: string; alt?: string }

export type NormalizedQuiz = {
  title: string
  description?: string
  questions: QuizQuestion[] // sempre {id,title,options[]}
}

/** O que a página realmente precisa, com nomes coerentes */
export type ProfileViewModel = {
  id: string
  slug: string
  display_name: string
  sector: string | null
  sector_label?: string
  headline?: string | null
  short_bio?: string | null
  bio?: string | null
  city?: string | null
  tags: string[]
  avatar_url?: string | null
  hero_url?: string | null
  cover_url?: string | null
  photos: PhotoItem[]
  article: {
    hook?: string
    sections: ArticleSection[]
    tips: string[]
    cta: ArticleCTA
  }
  seo?: { meta_title?: string; meta_description?: string } | null
  quiz: NormalizedQuiz | null
}

/** ====================== Helpers de normalização ====================== */
export function parseMaybe<T = any>(v: any, fallback: T): T {
  if (v == null) return fallback
  if (typeof v === 'string') {
    try { return JSON.parse(v) as T } catch { return fallback }
  }
  return v as T
}

const QUIZ_DEFAULT_OPTIONS = [
  'Discordo totalmente',
  'Discordo',
  'Neutro',
  'Concordo',
  'Concordo totalmente',
]

export function normalizeQuiz(raw: QuizData | null | undefined): NormalizedQuiz | null {
  if (!raw) return null
  const q = parseMaybe<any>(raw, null)
  if (!q) return null

  // já é [{title, options?}]
  if (Array.isArray(q.questions) && q.questions.every((it: any) => typeof it === 'object')) {
    return {
      title: String(q.title ?? 'Quiz'),
      description: q.description ? String(q.description) : undefined,
      questions: q.questions.map((it: any, i: number) => ({
        id: String(it?.id ?? `q${i + 1}`),
        title: String(it?.title ?? it?.question ?? `Pergunta ${i + 1}`),
        options: Array.isArray(it?.options) && it.options.length > 0 ? it.options.map(String) : QUIZ_DEFAULT_OPTIONS,
      })),
    }
  }

  // veio como items[]
  if (Array.isArray(q.items)) {
    return {
      title: String(q.title ?? 'Quiz'),
      description: q.description ? String(q.description) : undefined,
      questions: q.items.map((it: any, i: number) => ({
        id: String(it?.id ?? `q${i + 1}`),
        title: String(it?.title ?? it?.question ?? `Pergunta ${i + 1}`),
        options: Array.isArray(it?.options) && it.options.length > 0 ? it.options.map(String) : QUIZ_DEFAULT_OPTIONS,
      })),
    }
  }

  // veio como questions: string[]
  if (Array.isArray(q.questions) && q.questions.every((it: any) => typeof it !== 'object')) {
    return {
      title: String(q.title ?? 'Quiz'),
      description: q.description ? String(q.description) : undefined,
      questions: q.questions.map((t: any, i: number) => ({
        id: `q${i + 1}`,
        title: String(t),
        options: QUIZ_DEFAULT_OPTIONS,
      })),
    }
  }

  return null
}

export function normalizePhotos(input: {
  apiPhotos?: PhotoItem[] | null
  gallery_urls?: string[] | null
  hero_url?: string | null
  avatar_url?: string | null
  display_name: string
  min?: number
}): PhotoItem[] {
  const { apiPhotos, gallery_urls, hero_url, avatar_url, display_name, min = 8 } = input

  let photos: PhotoItem[] =
    Array.isArray(apiPhotos) && apiPhotos.length > 0
      ? apiPhotos
      : Array.isArray(gallery_urls) && gallery_urls.length > 0
      ? gallery_urls.map((url, i) => ({ image_url: url, alt: `${display_name} — ${i + 1}` }))
      : [
          { image_url: hero_url || avatar_url || '', alt: `${display_name} — 1` },
          { image_url: avatar_url || hero_url || '', alt: `${display_name} — 2` },
        ]

  if (photos.length < min) {
    const out: PhotoItem[] = []
    for (let i = 0; i < Math.max(min, photos.length); i++) out.push(photos[i % photos.length])
    photos = out
  }
  return photos
}

/** Mapeia do seu Profile/Extended para o que a página usa */
export function toViewModel(input: Profile | ProfileExtended, extras: {
  apiPhotos?: PhotoItem[] | null
  quizFromApi?: QuizData | null
} = {}): ProfileViewModel {
  const p = input as ProfileExtended

  const display_name = p.display_name ?? p.name
  const tags = Array.isArray(p.tags) ? p.tags : Array.isArray(p.keywords) ? p.keywords! : []

  const article = parseMaybe<ArticleData>(p.article ?? null, {}) || {}
  const seo = parseMaybe<SEOData>(p.seo ?? null, null)
  const quizRaw = extras.quizFromApi ?? p.quiz ?? null

  return {
    id: p.id,
    slug: p.slug,
    display_name,
    sector: p.sector ?? null,
    headline: p.title ?? null,
    short_bio: p.short_bio ?? null,
    bio: p.bio ?? null,
    city: p.city ?? null,
    tags,
    avatar_url: p.avatar_url ?? null,
    hero_url: p.hero_url ?? p.cover_url ?? null,
    cover_url: p.cover_url ?? null,
    photos: normalizePhotos({
      apiPhotos: extras.apiPhotos ?? null,
      gallery_urls: p.gallery_urls ?? null,
      hero_url: p.hero_url ?? p.cover_url ?? null,
      avatar_url: p.avatar_url ?? null,
      display_name,
      min: 8,
    }),
    article: {
      hook: article?.hook,
      sections: Array.isArray(article?.sections) ? article.sections : [],
      tips: Array.isArray(article?.tips) ? article.tips : [],
      cta: article?.cta ?? null,
    },
    seo: seo && typeof seo !== 'string' ? {
      meta_title: (seo as any)?.meta_title,
      meta_description: (seo as any)?.meta_description,
    } : null,
    quiz: normalizeQuiz(quizRaw),
  }
}