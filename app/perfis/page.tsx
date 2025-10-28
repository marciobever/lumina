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
      {/* TOP: Slot com o MESMO visual da home (retângulo responsivo) */}
      <section className="section pt-6">
        <div className="container">
          <div className="w-full flex justify-center">
            <div className="w-full max-w-[336px] flex flex-col items-center">
              <div className="ad-label">Publicidade</div>
              {/* O layout cria/exibe este slot automaticamente
                 path: /23287346478/lumina.marciobevervanso/lumina.marciobevervanso_Content2 */}
              <div id="Content2" className="ad-block ad--rect">
                <span className="loading">Carregando anúncio…</span>
                <noscript>Ative o JavaScript para ver o anúncio.</noscript>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Título + filtros */}
      <section className="section pt-4">
        <div className="container">
          <div className="mb-5 md:mb-6">
            <h1 className="h-hero text-3xl md:text-5xl">Perfis de Especialistas</h1>
            <p className="text-white/75 mt-2 text-balance">
              Finanças, arquitetura, tecnologia, saúde, jurídico, educação e mais — descubra referências por nicho.
            </p>
          </div>
          <FiltersBar />
        </div>
      </section>

      {/* Grade (sem lateral) com 1 ad misturado aos cards */}
      <section className="pb-10">
        <div className="container">
          {grid.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {grid.map((item, i) => (
                <div key={i} className="card-aspect">
                  {item.kind === 'ad' ? (
                    // Card de anúncio com mesmo tamanho e visual consistente do diretório
                    <div className="profile-card-business ad-card relative" data-ad-slot="Content3">
                      <div className="ad-label">Publicidade</div>
                      {/* Path compatível com WP: Content3, mapeado como retângulo */}
                      <div id="Content3" className="ad-block ad--rect">
                        <span className="loading">Carregando anúncio…</span>
                        <noscript>Ative o JavaScript para ver o anúncio.</noscript>
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
      </section>
    </div>
  )
}
