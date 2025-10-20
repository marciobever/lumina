// app/page.tsx
import { listFeatured } from '@/lib/queries'
import NeonHero from '@/components/NeonHero'
import ProfileCard from '@/components/ProfileCard'
import NewsletterSection from '@/components/NewsletterSection'

export default async function Page() {
  const { data: featured } = await listFeatured(12)
  return (
    <div className="relative">
      <NeonHero />
      <form action="/perfis" method="get" className="search-wrap">
        <input name="q" className="search-box" placeholder="Buscar nome, tag ou cidade…" aria-label="Buscar perfis" />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary px-4 py-2 text-sm">Buscar</button>
      </form>
      <section id="destaques" className="section">
        <div className="container">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="h-section">Destaques recentes</h2>
            <a href="/perfis" className="text-sm text-white/85 hover:underline">Ver todos</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {(featured ?? []).map((p: any) => (
              <div key={p.slug} className="aspect-[3/4]">
                <ProfileCard p={{
                  ...p,
                  nome: p.display_name,
                  titulo: p.title,
                  categoria: p.sector,
                  capa_url: p.cover_url
                }} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <NewsletterSection />
    </div>
  )
}