// app/perfil/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Script from 'next/script'
import AdSlot from '@/components/AdSlot'

import ProfileHeader from '@/components/ProfileHeader'
import ProfileAbout from '@/components/ProfileAbout'
import ProfileSimilarBlock from '@/components/ProfileSimilarBlock'
import ProfileEditorial from '@/components/ProfileEditorial'
import WhatsAppBanner from '@/components/WhatsAppBanner'
import { normalizeArticle } from '@/lib/adapters/article'

import {
  getProfileBySlug,
  getProfilePhotos,
  listSimilarProfiles,
} from '@/lib/queries'

export const revalidate = 60

/* ================== helpers ================== */
const sectorLabel: Record<string, string> = {
  financas: 'Finanças',
  arquitetura: 'Arquitetura',
  tecnologia: 'Tecnologia',
  marketing: 'Marketing',
  saude: 'Saúde',
  juridico: 'Jurídico',
  educacao: 'Educação',
  imobiliario: 'Imobiliário',
  estetica: 'Estética',
}

const parseMaybe = <T,>(v: any, fallback: T): T => {
  if (v == null) return fallback
  if (typeof v === 'string') {
    // Postgres text[] "{a,b,c}" → string[]
    if (v.startsWith('{') && v.endsWith('}')) {
      const arr = v
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^"(.*)"$/, '$1'))
      return arr as unknown as T
    }
    try {
      return JSON.parse(v) as T
    } catch {
      return fallback
    }
  }
  return v as T
}

type PhotoItem = { image_url: string; alt?: string }

/* ---- URL guards ---- */
const isGoodUrl = (u: any): u is string =>
  typeof u === 'string' && u.length > 6 && /^https?:\/\//i.test(u) && !u.includes('about:blank')
const cleanUrls = (arr: any[]): string[] => (arr || []).map(String).filter(isGoodUrl)

/** Garante grid cheio (8+) aceitando vários formatos de origem */
function buildGallery(opts: {
  apiPhotos?: Array<PhotoItem | { url: string } | string> | null
  gallery_urls?: string[] | string | null
  hero_url?: string | null
  avatar_url?: string | null
  cover_url?: string | null
  display_name: string
  min?: number
}) {
  const { apiPhotos, gallery_urls, hero_url, avatar_url, cover_url, display_name, min = 8 } = opts

  // normaliza apiPhotos → PhotoItem[]
  let fromApi: PhotoItem[] = []
  if (Array.isArray(apiPhotos)) {
    fromApi = apiPhotos
      .map((it: any, i: number) => {
        if (!it) return null
        if (typeof it === 'string' && isGoodUrl(it)) return { image_url: it, alt: `${display_name} — ${i + 1}` }
        if (it.image_url && isGoodUrl(it.image_url)) return { image_url: String(it.image_url), alt: it.alt ?? `${display_name} — ${i + 1}` }
        if (it.url && isGoodUrl(it.url)) return { image_url: String(it.url), alt: it.alt ?? `${display_name} — ${i + 1}` }
        return null
      })
      .filter(Boolean) as PhotoItem[]
  }

  // normaliza gallery_urls (string JSON, text[] ou array)
  const galleryArr = parseMaybe<string[]>(gallery_urls ?? [], [])
  const fromGallery: PhotoItem[] = Array.isArray(galleryArr)
    ? cleanUrls(galleryArr).map((url, i) => ({ image_url: url, alt: `${display_name} — ${i + 1}` }))
    : []

  // fallbacks (hero/avatar/cover) só se válidos
  const fallbacks = cleanUrls([hero_url, avatar_url, cover_url])
  let photos: PhotoItem[] =
    fromApi.length > 0 ? fromApi
    : fromGallery.length > 0 ? fromGallery
    : fallbacks.length ? fallbacks.map((u, i) => ({ image_url: u, alt: `${display_name} — ${i + 1}` }))
    : []

  // garante mínimo (repetindo ordenadamente)
  if (photos.length > 0 && photos.length < min) {
    const out: PhotoItem[] = []
    for (let i = 0; i < min; i++) out.push(photos[i % photos.length])
    photos = out
  }

  const images = photos.map((p) => p.image_url).filter(isGoodUrl)
  return { photos, images }
}

/* ---------- Artigo fallback se o banco vier curto ou vazio ---------- */
function buildFallbackArticle(p: any) {
  const name = p?.display_name ?? p?.name ?? p?.slug ?? 'Especialista'
  const set = p?.tags && Array.isArray(p.tags) ? p.tags.slice(0, 5) : []
  return {
    hook:
      'Houve um tempo em que olhar para as finanças significava apertar o peito — até eu descobrir que organização é um ato de gentileza com o meu futuro.',
    content: [
      {
        type: 'paragraph',
        text: `Lembro do domingo em que decidi trocar a culpa por curiosidade. Abri meu aplicativo do banco com um café do lado e me perguntei: o que esse extrato está tentando me contar sobre mim? Foi a primeira vez que dinheiro virou linguagem — não sentença.`,
      },
      {
        type: 'paragraph',
        text: `Comecei pequeno: 30 minutos semanais para revisar a última semana e desenhar a próxima. Nada de planilhas mirabolantes — só uma bússola que coubesse na vida real. O resultado? Menos ansiedade, mais clareza, e a liberdade de dizer “não” ao que não conversa com meus valores.`,
      },
      {
        type: 'tips',
        items: [
          'Use o 50/30/20 como esqueleto flexível (não como prisão).',
          'Automatize aportes no dia do pagamento: o que importa vem antes do impulso.',
          'Crie um ‘Diário de Gastos Emocionais’ por 7 dias — entenda seus gatilhos.',
          'Dê nome aos objetivos e coloque data: o cérebro corre melhor quando enxerga a linha de chegada.',
        ],
      },
      {
        type: 'paragraph',
        text: `Com ${name}, o papo sobre ${p?.sector ?? 'finanças'} é menos sobre fórmulas e mais sobre escolhas consistentes. ${set.map((t: string) => `#${t}`).join(' ')}`,
      },
      {
        type: 'cta',
        headline: 'Sua vida financeira é um roteiro original ou uma reprise?',
        text: 'Descubra seu estilo de decisão e receba um plano leve para os próximos 30 dias.',
        button: 'Fazer o Quiz',
      },
    ],
  }
}

/* ================== SEO ================== */
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await getProfileBySlug(params.slug)
  if (!p) return { title: 'Perfil não encontrado • LUMINA', robots: { index: false, follow: false } }

  const articleRaw = (p as any).article
  const article = parseMaybe<any>(articleRaw, {})
  const meta = parseMaybe<any>((p as any).seo, {}) || parseMaybe<any>(article?.seo, {})

  const name = (p as any).display_name ?? (p as any).name ?? p.slug
  const title = meta?.meta_title || `${name} (PG-13) — Galeria & Perfil Editorial • LUMINA`
  const desc =
    meta?.meta_description ||
    (p as any).short_bio ||
    (p as any).headline ||
    `Perfil editorial de ${name}: bio, galeria (PG-13) e tags.`
  const image = (p as any).hero_url || (p as any).avatar_url || p.cover_url || undefined
  const canonical = `${process.env.NEXT_PUBLIC_SITE_URL}/perfil/${p.slug}`

  const isPublished = (p as any).status === 'published'

  return {
    title,
    description: desc,
    alternates: { canonical },
    robots: { index: isPublished, follow: isPublished },
    openGraph: {
      type: 'profile',
      url: canonical,
      title,
      description: desc,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: image ? [image] : undefined,
    },
  }
}

/* ================== Página ================== */
export default async function PerfilPage({ params }: { params: { slug: string } }) {
  const p = await getProfileBySlug(params.slug)
  if (!p) notFound()

  const sectorText = p.sector ? sectorLabel[p.sector] ?? p.sector : undefined

  const [photosRes, similarRes] = await Promise.allSettled([
    getProfilePhotos(p.id),
    listSimilarProfiles(p.id, Array.isArray((p as any).tags) ? (p as any).tags : (p as any).keywords ?? []),
  ])

  const apiPhotos = photosRes.status === 'fulfilled' ? photosRes.value : []
  const similar = similarRes.status === 'fulfilled' && Array.isArray(similarRes.value) ? similarRes.value : []

  const { images } = buildGallery({
    apiPhotos,
    gallery_urls: (p as any).gallery_urls,
    hero_url: (p as any).hero_url ?? null,
    avatar_url: (p as any).avatar_url ?? null,
    cover_url: p.cover_url ?? null,
    display_name: (p as any).display_name ?? (p as any).name ?? p.slug,
    min: 8,
  })

  const articleNorm = normalizeArticle((p as any).article)
  const article = articleNorm && articleNorm.content?.length ? articleNorm : buildFallbackArticle(p)

  const slug = (p as any).slug
  const showAds = !!(p as any).exibir_anuncios

  // JSON-LD
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  const name = (p as any).display_name ?? (p as any).name ?? p.slug
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `${name} (PG-13)`,
    url: `${site}/perfil/${slug}`,
    mainEntity: {
      '@type': 'Person',
      name,
      description: (p as any).short_bio || (p as any).bio || '',
      jobTitle: p.sector || undefined,
      address: (p as any).city ? { '@type': 'PostalAddress', addressLocality: (p as any).city } : undefined,
      image: [ (p as any).hero_url, (p as any).avatar_url, p.cover_url ].filter(Boolean),
      sameAs: [], // redes se houver
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: site },
        { '@type': 'ListItem', position: 2, name: 'Perfis', item: `${site}/perfis` },
        { '@type': 'ListItem', position: 3, name },
      ],
    },
  }

  return (
    <div className="relative min-h-screen">
      {/* JSON-LD */}
      <Script id="ld-profile" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* toggle sem JS: #quiz escondido até ser acionado por âncora */}
      <style>{`
        #quiz { display: none; }
        #quiz:target { display: block; }
      `}</style>

      {/* AD topo */}
      {showAds && (
        <div className="container pt-8 pb-4">
          <AdSlot
            id="ad-leaderboard-top"
            label=""
            size="728x90"
            variant="leaderboard"
            slot={(p as any).ad_slot_topo}
            width={728}
            height={90}
          />
        </div>
      )}

      {/* HEADER */}
      <ProfileHeader
        display_name={(p as any).display_name ?? (p as any).name ?? p.slug}
        sector={p.sector}
        sector_label={sectorText}
        headline={(p as any).headline ?? p.title}
        short_bio={(p as any).short_bio ?? p.bio}
        city={(p as any).city ?? null}
        tags={Array.isArray((p as any).tags) ? (p as any).tags.filter(Boolean) : []}
        hero_url={(p as any).hero_url || p.cover_url || (p as any).avatar_url || ''}
        avatar_url={(p as any).avatar_url || (p as any).hero_url || p.cover_url || ''}
      />

      {/* CTA WhatsApp — VISUAL do banner + OVERLAY de link para o Assistente */}
      <div className="container mt-6">
        <div className="relative">
          <WhatsAppBanner
            phone="5511987654321"
            title={`Fale com ${name} no WhatsApp`}
            subtitle="Consultas, parcerias e convites"
            text={`Oi, ${name}! Encontrei seu perfil no LUMINA e gostaria de conversar.`}
          />
          <a
            href={`/assistente/${encodeURIComponent(slug)}`}
            className="absolute inset-0"
            aria-label={`Abrir assistente de ${name}`}
          />
        </div>
      </div>

      {/* meta leve */}
      <div className="container mt-6 mb-10">
        <div className="text-base text-white/60">
          {sectorText ? <span className="font-medium text-white/90">{sectorText}</span> : null}
          {(p as any).city ? <span className="ml-3">• {(p as any).city}</span> : null}
        </div>
      </div>

      <div className="pb-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            {/* Principal */}
            <div className="min-w-0 space-y-10">
              {/* SOBRE */}
              <section className="card px-6 md:px-8 py-7 md:py-9" id="sobre">
                <h2 className="text-2xl font-semibold text-white/95 mb-6">Sobre</h2>
                <ProfileAbout
                  text={(p as any).bio || (p as any).short_bio}
                  tags={Array.isArray((p as any).tags) ? (p as any).tags.filter(Boolean) : []}
                />
              </section>

              {/* EDITORIAL */}
              <section id="editorial" className="scroll-mt-24">
                <ProfileEditorial article={article} />
              </section>

              {/* Banner Ad no meio do conteúdo */}
              {showAds && (
                <div className="my-8 flex justify-center">
                  <AdSlot
                    id="ad-rectangle-mid"
                    label="Publicidade"
                    size="728x90"
                    variant="leaderboard"
                    slot={(p as any).ad_slot_meio}
                    width={728}
                    height={90}
                  />
                </div>
              )}

              {/* QUIZ inline (abre via #quiz) */}
              <section id="quiz" className="card px-6 md:px-8 py-7 md:py-9 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white/95 mb-4">Verifique sua elegibilidade</h2>
                {/* plug do InteractiveQuiz pode voltar aqui quando quiser */}
              </section>

              {/* GALERIA */}
              <section className="card px-6 md:px-8 py-7 md:py-9" id="galeria">
                <h2 className="text-2xl font-semibold text-white/95 mb-6">Galeria</h2>
                {images?.length ? (
                  <>
                    <div className="mt-6 gallery-grid">
                      {images.slice(0, 8).map((src, i) => (
                        <figure key={i} className="gallery-item img-smooth aspect-square group overflow-hidden rounded-2xl">
                          <div className="absolute inset-0 bg-white/[0.04] animate-pulse" />
                          <div
                            className="gallery-img transition-transform duration-500 group-hover:scale-110"
                            style={{ backgroundImage: `url("${src.replace(/"/g, '\\"')}")` }}
                            aria-label={`Foto ${i + 1} — ${name}`}
                          />
                        </figure>
                      ))}
                    </div>
                    <p className="mt-5 text-xs text-white/40 italic">* Visual PG-13 — sem clique.</p>
                  </>
                ) : (
                  <p className="mt-2 text-white/60 text-base">Sem imagens disponíveis.</p>
                )}
              </section>

              {/* SEMELHANTES */}
              {similar.length > 0 ? (
                <section className="card px-6 md:px-8 py-7 md:py-9">
                  <h2 className="text-2xl font-semibold text-white/95 mb-6">Perfis semelhantes</h2>
                  <div className="mt-6">
                    <ProfileSimilarBlock items={similar} />
                  </div>
                </section>
              ) : null}
            </div>

            {/* Lateral (ads com altura fixa para evitar CLS) */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                {showAds && (
                  <>
                    <AdSlot
                      id="ad-skyscraper-profile"
                      label=""
                      size="300x600"
                      variant="skyscraper"
                      slot={(p as any).ad_slot_side}
                      width={300}
                      height={600}
                    />
                    <AdSlot
                      id="ad-rectangle-side"
                      label=""
                      size="300x250"
                      variant="leaderboard"
                      slot={(p as any).ad_slot_rodape}
                      width={300}
                      height={250}
                    />
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Rodapé com anúncio */}
      {showAds && (
        <div className="mt-2 mb-10 flex justify-center">
          <AdSlot
            id="ad-rodape"
            label=""
            size="728x90"
            variant="leaderboard"
            slot={(p as any).ad_slot_rodape}
            width={728}
            height={90}
          />
        </div>
      )}
    </div>
  )
}