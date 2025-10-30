// app/perfis/page.tsx
export const dynamic = 'force-dynamic'
export const revalidate = 0

import React from 'react'
import ProfileCard from '@/components/ProfileCard'
import Pagination from '@/components/Pagination'
import { listProfiles } from '@/lib/queries'

// OOP (Anchor + Interstitial) por rota
import RouteOOP from '@/components/RouteOOP'
// VideooWall apenas no client
import dynamicImport from 'next/dynamic'
const VideooWall = dynamicImport(() => import('@/components/VideooWall'), { ssr: false })

// Inline ads via componente
import AdSlot from '@/components/AdSlot'

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
    nicho?: string
    status?: 'draft' | 'published' | 'queued' | 'processing' | 'done' | string
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
    capa_url:
      (typeof p?.hero_url === 'string' && p.hero_url) ||
      (typeof p?.cover_url === 'string' && p.cover_url) ||
      galleryFirst ||
      (typeof p?.avatar_url === 'string' && p.avatar_url) ||
      null,
  }
}

// só considera perfis com alguma imagem pra card
function hasCoverish(p: any) {
  return Boolean(
    (typeof p?.hero_url === 'string' && p.hero_url) ||
      (typeof p?.cover_url === 'string' && p.cover_url) ||
      (Array.isArray(p?.gallery_urls) &&
        p.gallery_urls.some((u: any) => typeof u === 'string' && /^https?:\/\//.test(u))) ||
      (typeof p?.avatar_url === 'string' && p.avatar_url)
  )
}

export default async function PerfisPage({ searchParams }: Props) {
  const page = Math.max(1, Number(searchParams?.page ?? '1'))

  // Regra: 11 perfis + 1 ad = 12 itens na grade
  const PER_PAGE_WITHOUT_AD = 11
  const REQUEST_SIZE = PER_PAGE_WITHOUT_AD + 1 // pedimos 12 p/ olhar próxima página

  // filtros opcionais vindos da URL
  const q = searchParams?.q?.trim() || undefined
  const sector = searchParams?.sector?.trim() || undefined
  const nicho = searchParams?.nicho?.trim() || undefined

  // ⚠️ Não filtramos mais por 'published' por padrão, para incluir 'done/queued'
  const status =
    (searchParams?.status as 'draft' | 'published' | 'queued' | 'processing' | 'done' | string | undefined) ||
    undefined

  const { data, total, perPage } = await listProfiles({
    page,
    perPage: REQUEST_SIZE,
    q,
    sector,
    nicho,
    status,
  })

  // filtra só perfis com imagem
  const visible = Array.isArray(data) ? data.filter(hasCoverish) : []

  // Só 11 perfis na grade; o 12º é lookahead
  const profiles = visible.slice(0, PER_PAGE_WITHOUT_AD)

  // Insere 1 ad DEPOIS do 6º card (se houver)
  const insertAfterIndex = Math.min(6, Math.max(0, profiles.length))
  const grid: Array<{ kind: 'profile'; p: any } | { kind: 'ad' }> = []

  for (let i = 0; i < insertAfterIndex; i++) grid.push({ kind: 'profile', p: profiles[i] })
  if (profiles.length > 0) grid.push({ kind: 'ad' as const })
  for (let i = insertAfterIndex; i < profiles.length; i++) grid.push({ kind: 'profile', p: profiles[i] })

  // Paginação: usa total do backend
  const perPageReal = perPage ?? REQUEST_SIZE
  const hasNext = total > page * perPageReal

  return (
    <div className="relative">
      {/* Interstitial + Anchor (monta/desmonta a cada navegação) */}
      <RouteOOP />
      {/* Videoo Wall (client-only; remonta por rota) */}
      <VideooWall />

      {/* Título */}
      <section className="section pt-8">
        <div className="container">
          <div className="mb-4 md:mb-6">
            <h1 className="h-hero text-3xl md:text-5xl">Perfis de Especialistas</h1>
            <p className="text-white/75 mt-2 text-balance">
              Finanças, arquitetura, tecnologia, saúde, jurídico, educação e mais — descubra referências por nicho.
            </p>
          </div>
        </div>
      </section>

      {/* Leaderboard superior via componente (substitui Script + div id) */}
      <section className="section pt-2 pb-4">
        <div className="container">
          <div className="w-full flex justify-center">
            <div className="w-full max-w-6xl flex flex-col items-center">
              <div className="text-[11px] uppercase tracking-wider text-neutral-400 mb-1">Publicidade</div>
              <AdSlot
                id="LeaderboardTop"
                label="Publicidade"
                variant="leaderboard"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grade (sem lateral) + 1 ad nativo misturado */}
      <section className="pb-10">
        <div className="container">
          {grid.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {grid.map((item, i) => (
                <div key={i} className="card-aspect">
                  {item.kind === 'ad' ? (
                    <AdSlot
                      id="Content3"
                      label="Publicidade"
                      variant="native-card"
                      className="h-full w-full"
                    />
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
