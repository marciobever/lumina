// app/perfis/page.tsx
import React from 'react'
import ProfileCard from '@/components/ProfileCard'
import Pagination from '@/components/Pagination'
import { listProfiles } from '@/lib/queries'
import Script from 'next/script'

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

  // filtros opcionais vindos da URL (a busca/filters UI foi removida, mas querystrings seguem funcionando)
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

      {/* Leaderboard wide no lugar da barra (728x90 desktop / 320x100/50 mobile) */}
      <section className="section pt-2 pb-4">
        <div className="container">
          <div className="w-full flex justify-center">
            <div className="w-full max-w-6xl flex flex-col items-center">
              <div className="text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                Publicidade
              </div>
              <div
                id="LeaderboardTop"
                className="
                  w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm
                  shadow-[0_0_20px_rgba(255,0,255,0.08)]
                  flex items-center justify-center
                  h-[64px] sm:h-[90px]               /* alturas fixas → zero CLS */
                "
              >
                <span className="text-xs text-white/60">Carregando anúncio…</span>
                <noscript>Ative o JavaScript para ver o anúncio.</noscript>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Script local só para o LeaderboardTop (Content1..9 já vem do layout) */}
      <Script id="gpt-leaderboardtop" strategy="afterInteractive">
        {`
          (function(){
            window.googletag = window.googletag || { cmd: [] };
            if (window.__gptLBOnce) return; window.__gptLBOnce = true;

            googletag.cmd.push(function() {
              try {
                var lbMapping = googletag.sizeMapping()
                  .addSize([0,0],     [[320,100],[320,50]])
                  .addSize([728,0],   [[728,90]])
                  .build();

                var el = document.getElementById('LeaderboardTop');
                if (el) {
                  var slotLB = googletag.defineSlot(
                    '/23287346478/lumina.marciobevervanso/lumina.marciobevervanso_LeaderboardTop',
                    [[728,90],[320,100],[320,50]],
                    'LeaderboardTop'
                  );
                  if (slotLB) {
                    slotLB.defineSizeMapping(lbMapping)
                         .setCollapseEmptyDiv(true)
                         .addService(googletag.pubads());
                  }
                  googletag.enableServices();
                  googletag.display('LeaderboardTop');
                }
              } catch(e) {}
            });
          })();
        `}
      </Script>

      {/* Grade (sem lateral) + 1 ad nativo misturado */}
      <section className="pb-10">
        <div className="container">
          {grid.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {grid.map((item, i) => (
                <div key={i} className="card-aspect">
                  {item.kind === 'ad' ? (
                    <div className="profile-card-business relative" data-ad-slot="Content3">
                      <div className="pc-media">
                        {/* o card é 3:4 — mantemos o container com mesmo visual das capas */}
                        <div
                          id="Content3"
                          className="absolute inset-0 m-3 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center backdrop-blur-sm shadow-[0_0_20px_rgba(255,0,255,0.08)]"
                        >
                          <span className="text-xs text-white/60">Carregando anúncio…</span>
                          <noscript>Ative o JavaScript para ver o anúncio.</noscript>
                        </div>
                        <div className="pc-gradient" />
                      </div>
                      <div className="pc-body">
                        <div className="text-[11px] uppercase tracking-wider text-neutral-400">Publicidade</div>
                        <div className="pc-name">Conteúdo patrocinado</div>
                        <div className="pc-headline">Anúncio exibido automaticamente pelo Google Ad Manager.</div>
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
