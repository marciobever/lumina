// app/page.tsx
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { listFeatured } from '@/lib/queries'
import BackdropLines from '@/components/BackdropLines'
import NeonHero from '@/components/NeonHero'
import ProfileCard from '@/components/ProfileCard'
import NewsletterSection from '@/components/NewsletterSection'

type FeaturedIn = {
  slug: string
  display_name?: string | null
  name?: string | null
  title?: string | null
  sector?: string | null
  cover_url?: string | null
  hero_url?: string | null
  avatar_url?: string | null
}

type CardOut = {
  slug: string
  nome: string
  titulo?: string | null
  categoria?: string | null
  capa_url?: string | null
}

// Normaliza o item vindo do banco para o formato esperado pelo Card
function toCard(p: FeaturedIn): CardOut {
  const capa =
    p.cover_url ||
    p.hero_url ||
    p.avatar_url ||
    null

  return {
    slug: String(p.slug),
    // 🔒 garante string SEMPRE (evita erro de tipo no build)
    nome: String(p.display_name || p.name || p.slug || 'Perfil'),
    titulo: p.title ?? null,
    categoria: p.sector ?? null,
    capa_url: capa,
  }
}

export default async function Page() {
  let featured: FeaturedIn[] = []
  try {
    const { data } = await listFeatured(12)
    featured = Array.isArray(data) ? data : []
  } catch {
    featured = []
  }

  const cards: CardOut[] = featured.map(toCard)

  return (
    <div className="relative bg-[#050010] text-white">
      {/* Fundo neon no topo */}
      <BackdropLines />

      {/* BLOCO SUPERIOR: ocupa ~a dobra inteira */}
      <section
        className="relative z-10 min-h-[92vh] flex flex-col items-center"
        aria-label="Hero + busca + publicidade"
      >
        {/* HERO */}
        <NeonHero />

        {/* Conteúdo abaixo do hero, centralizado e com respiro */}
        <div className="w-full flex flex-col items-center px-4 mt-2 md:mt-0">
          {/* BUSCA */}
          <form
            action="/perfis"
            method="get"
            className="relative w-full max-w-2xl mx-auto mt-4"
          >
            <input
              name="q"
              className="w-full bg-white/10 rounded-full px-5 py-3 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              placeholder="Buscar nome, tag ou cidade…"
              aria-label="Buscar perfis"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform"
            >
              Buscar
            </button>
          </form>

          {/* SLOT DE PUBLICIDADE (GAM — visual “bonitinho”) */}
          <div className="w-full flex justify-center mt-8">
            <div className="w-full max-w-[336px] flex flex-col items-center">
              <div className="text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                Publicidade
              </div>

              <div
                id="Content1"
                className="w-full min-h-[280px] rounded-lg border border-white/10 bg-white/5 flex items-center justify-center backdrop-blur-sm shadow-[0_0_20px_rgba(255,0,255,0.08)]"
              >
                <span className="text-xs text-white/60">Carregando anúncio…</span>
                <noscript>Ative o JavaScript para ver o anúncio.</noscript>
              </div>
            </div>
          </div>

          {/* Dica de rolagem + respiro para empurrar a próxima seção abaixo da dobra */}
          <div className="text-center text-white/70 mt-6">
            ↓ role para ver os destaques
          </div>

          {/* Espaço de segurança para não vazar o título da próxima seção */}
          <div className="h-16 sm:h-20 md:h-24" />
        </div>
      </section>

      {/* DESTAQUES – começa abaixo da dobra sem “vazar” */}
      <section
        id="destaques"
        className="relative section scroll-mt-24 bg-gradient-to-b from-transparent via-[#08001A]/80 to-[#050010]"
      >
        <div className="container">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="h-section">Destaques recentes</h2>
            <a href="/perfis" className="text-sm text-white/85 hover:underline">
              Ver todos
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {cards.map((p) => (
              <div key={p.slug} className="aspect-[3/4]">
                <ProfileCard p={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <NewsletterSection />
    </div>
  )
}
