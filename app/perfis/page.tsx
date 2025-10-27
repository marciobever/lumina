// app/perfis/page.tsx
import React from 'react'
import FiltersBar from '@/components/FiltersBar'
import ProfileCard from '@/components/ProfileCard'
import Pagination from '@/components/Pagination'
import { listProfiles } from '@/lib/queries'

export const metadata = {
  title: 'Perfis • LUMINA',
  description:
    'Especialistas em finanças, arquitetura, tecnologia, saúde, jurídico e mais — curadoria editorial.',
}

type Props = {
  searchParams?: {
    page?: string
    q?: string
    sector?: string
    status?: 'draft' | 'published'
    adsOnly?: 'true' | 'false'
  }
}

// normaliza o objeto do banco para o formato que o <ProfileCard /> espera
function mapToCardProps(p: any) {
  const galleryFirst =
    Array.isArray(p?.gallery_urls) && p.gallery_urls.length
      ? p.gallery_urls.find((u: string) => typeof u === 'string' && /^https?:\/\//.test(u))
      : null

  return {
    ...p,
    nome: p?.display_name ?? p?.name ?? p?.slug ?? '—',
    titulo: p?.title ?? '',
    categoria: p?.sector ?? '',
    // ordem de preferência para a capa
    capa_url:
      (typeof p?.hero_url === 'string' && p.hero_url) ||
      (typeof p?.cover_url === 'string' && p.cover_url) ||
      galleryFirst ||
      (typeof p?.avatar_url === 'string' && p.avatar_url) ||
      null,
  }
}

export default async function PerfisPage({ searchParams }: Props) {
  const page = Math.max(1, Number(searchParams?.page ?? '1'))

  // Regra: 11 perfis + 1 ad = 12 itens na grade
  const PER_PAGE_WITHOUT_AD = 11
  const REQUEST_SIZE = PER_PAGE_WITHOUT_AD + 1 // pedimos 12 p/ olhar próxima página

  // filtros opcionais vindos da URL
  const q = searchParams?.q?.trim() || undefined
  const sector = searchParams?.sector?.trim() || undefined
  const status = (searchParams?.status as 'draft' | 'published' | undefined) || 'published'
  const adsOnly = searchParams?.adsOnly === 'true' ? true : undefined

  const { data, total, perPage } = await listProfiles({
    page,
    perPage: REQUEST_SIZE,
    q,
    sector,
    status,
    adsOnly,
  })

  // Só 11 perfis na grade; o 12º é lookahead
  const profiles = Array.isArray(data) ? data.slice(0, PER_PAGE_WITHOUT_AD) : []

  // Insere 1 ad DEPOIS do 6º card (se houver)
  const insertAfterIndex = Math.min(6, Math.max(0, profiles.length))
  const grid: Array<{ kind: 'profile'; p: any } | { kind: 'ad' }> = []

  for (let i = 0; i < insertAfterIndex; i++) grid.push({ kind: 'profile', p: profiles[i] })
  if (profiles.length > 0) grid.push({ kind: 'ad' as const })
  for (let i = insertAfterIndex; i < profiles.length; i++) grid.push({ kind: 'profile', p: profiles[i] })

  // Paginação correta
  const perPageReal = perPage ?? REQUEST_SIZE
  const hasNext = total > page * perPageReal

  return (
    <div className="relative">
      {/* Topo: “Leaderboard” visual usando Content2 (retângulo responsivo) */}
      <div className="container pt-6">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[970px] flex flex-col items-center">
            <div className="text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
              Publicidade
            </div>
            <div
              id="Content2"
              className="w-full min-h-[90px] rounded-lg border border-white/10 bg-white/5 flex items-center justify-center backdrop-blur-sm shadow-[0_0_20px_rgba(255,0,255,0.08)]"
            >
              <span className="text-xs text-white/60">Carregando anúncio…</span>
              <noscript>Ative o JavaScript para ver o anúncio.</noscript>
            </div>
          </div>
        </div>
      </div>

      {/* Título + filtros */}
      <section className="section">
        <div className="container">
          <div className="mb-5 md:mb-6">
            <h1 className="h-hero text-3xl md:text-5xl">Perfis de Especialistas</h1>
            <p className="text-white/75 mt-2">
              Finanças, arquitetura, tecnologia, saúde, jurídico, educação e mais — descubra referências por nicho.
            </p>
          </div>
          <FiltersBar />
        </div>
      </section>

      {/* Grade + Sidebar */}
      <section className="pb-10">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            {/* Coluna principal */}
            <div className="min-w-0">
              {grid.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {grid.map((item, i) => (
                    <div key={i} className="card-aspect">
                      {item.kind === 'ad' ? (
                        // Card de publicidade dentro da grade (Content3)
                        <div className="w-full h-full rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-center">
                          <div className="w-full">
                            <div className="text-[11px] uppercase tracking-wider text-neutral-400 mb-1 text-center">
                              Publicidade
                            </div>
                            <div
                              id="Content3"
                              className="w-full min-h-[280px] rounded-lg border border-white/10 bg-white/5 flex items-center justify-center backdrop-blur-sm"
                            >
                              <span className="text-xs text-white/60">Carregando anúncio…</span>
                              <noscript>Ative o JavaScript para ver o anúncio.</noscript>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <ProfileCard p={mapToCardProps(item.p)} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-white/70">Nenhum perfil encontrado para os filtros aplicados.</div>
              )}

              {/* Paginação */}
              <div className="mt-8">
                <Pagination page={page} hasNext={!!hasNext} />
              </div>
            </div>

            {/* Lateral (só em lg+) */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                {/* Retângulo lateral (Content4) */}
                <div className="w-[300px] mx-auto">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400 mb-1 text-center">
                    Publicidade
                  </div>
                  <div
                    id="Content4"
                    className="w-full min-h-[280px] rounded-lg border border-white/10 bg-white/5 flex items-center justify-center backdrop-blur-sm"
                  >
                    <span className="text-xs text-white/60">Carregando anúncio…</span>
                    <noscript>Ative o JavaScript para ver o anúncio.</noscript>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
