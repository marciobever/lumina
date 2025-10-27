// components/ProfileHeader.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'

type Props = {
  slug?: string
  display_name: string
  sector?: string | null
  sector_label?: string | null
  headline?: string | null
  short_bio?: string | null
  city?: string | null
  tags?: string[] | null
  hero_url?: string | null
  avatar_url?: string | null
  /** Opcional: sobrescrever a rota do assistente */
  assistantUrl?: string | null
}

/* ---------- sector helpers ---------- */
const sectorMap: Record<string, string> = {
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

const normalizeSector = (raw?: string | null, given?: string | null) => {
  if (given) return given
  if (!raw) return null
  const k = raw.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
  return sectorMap[k] ?? raw
}

/* ---------- tag helpers (dedupe bonito, sem #) ---------- */
const tagKey = (t?: string | null) =>
  (t ?? '')
    .toString()
    .trim()
    .replace(/^#/, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

const buildPrettyUniqueTags = (arr?: (string | null)[]) => {
  const map = new Map<string, string>()
  ;(arr ?? []).forEach(raw => {
    if (!raw) return
    const pretty = String(raw).trim().replace(/^#/, '')
    const key = tagKey(pretty)
    if (!key) return
    if (!map.has(key)) map.set(key, pretty)
  })
  return Array.from(map.values())
}

export default function ProfileHeader({
  slug,
  display_name,
  sector,
  sector_label: sectorLabelProp,
  headline,
  short_bio,
  city,
  tags,
  hero_url,
  avatar_url,
  assistantUrl,
}: Props) {
  const label = normalizeSector(sector ?? undefined, sectorLabelProp ?? undefined)
  const tagList = useMemo(() => buildPrettyUniqueTags(tags).slice(0, 8), [tags])

  // --- imagem de fundo (cover) ---
  const cover = hero_url || avatar_url || ''
  const [coverOk, setCoverOk] = useState<boolean>(!!cover)
  useEffect(() => {
    if (!cover) { setCoverOk(false); return }
    const i = new Image()
    i.src = cover
    i.onload = () => setCoverOk(true)
    i.onerror = () => setCoverOk(false)
  }, [cover])

  // --- retrato (coluna da esquerda) com fallback robusto ---
  const PLACEHOLDER = '/images/placeholder-600x800.jpg'
  const [portraitSrc, setPortraitSrc] = useState<string>(avatar_url || hero_url || PLACEHOLDER)
  useEffect(() => {
    setPortraitSrc(avatar_url || hero_url || PLACEHOLDER)
  }, [avatar_url, hero_url])

  const handlePortraitError = () =>
    setPortraitSrc(prev => (prev === PLACEHOLDER ? PLACEHOLDER : (hero_url || PLACEHOLDER)))

  // Rota do assistente (dinâmica por slug, com override opcional)
  const assistantHref = assistantUrl || (slug ? `/assistente/${slug}` : '/assistente')

  return (
    <section className="section pt-5 md:pt-6">
      <div className="container">
        <div className="relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          {/* BACKDROP */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            {coverOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
                style={{ filter: 'saturate(1.05) brightness(0.78) blur(8px)' }}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-slate-900 to-slate-950" />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(60%_100%_at_70%_10%,rgba(255,255,255,0.08),transparent_60%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
          </div>

          {/* CONTEÚDO */}
          <div className="relative z-10 mx-auto max-w-7xl p-5 md:p-7 lg:p-8">
            {(label || city) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {label && (
                  <span className="inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-wide text-white/95 border border-white/20 shadow backdrop-blur
                                   [background:linear-gradient(120deg,rgba(168,85,247,.22),rgba(59,130,246,.18))]">
                    {label.toUpperCase()}
                  </span>
                )}
                {city && <span className="pc-chip">{city}</span>}
              </div>
            )}

            <div className="
              grid gap-6 md:gap-7 lg:gap-8
              grid-cols-1 md:grid-cols-[260px_1fr] xl:grid-cols-[300px_1fr_280px]
            ">
              {/* COLUNA 1 — Retrato */}
              <div className="order-1 md:order-1">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/12 bg-white/[0.06]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={portraitSrc}
                    alt={display_name}
                    className="h-full w-full object-cover"
                    onError={handlePortraitError}
                  />
                </div>
              </div>

              {/* COLUNA 2 — Título + textos + CTAs */}
              <div className="order-3 md:order-2 min-w-0">
                <h1 className="text-balance font-display text-[36px] md:text-[48px] xl:text-[56px] font-extrabold leading-[1.05] text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.35)]">
                  {display_name}
                </h1>

                {headline && (
                  <p className="mt-3 text-white/90 text-lg md:text-xl leading-relaxed max-w-3xl">
                    {headline}
                  </p>
                )}

                {short_bio && (
                  <p className="mt-2 text-white/70 text-base md:text-lg leading-relaxed max-w-3xl">
                    {short_bio}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  {/* ✅ CTA DINÂMICO para o assistente */}
                  <a href={assistantHref} className="btn btn-primary px-6 py-3 text-sm md:text-base font-semibold shadow-lg hover:shadow-xl">
                    Fale com {display_name}
                  </a>

                  <a href="#quiz" className="btn btn-ghost px-6 py-3 text-sm md:text-base font-semibold border border-white/15 hover:border-white/25">
                    Fazer o Quiz
                  </a>
                  <a href="#galeria" className="btn btn-ghost px-6 py-3 text-sm md:text-base font-semibold border border-white/15 hover:border-white/25">
                    Ver galeria
                  </a>
                </div>
              </div>

              {/* COLUNA 3 — Rail de meta e tags */}
              <aside className="order-2 md:order-3">
                <div className="rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur p-4 md:p-5">
                  <h3 className="text-sm font-semibold text-white/80 mb-3">Informações</h3>
                  <dl className="space-y-3 text-[13px] leading-relaxed">
                    {label && (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-white/60">Setor</dt>
                        <dd className="text-white/90">{label}</dd>
                      </div>
                    )}
                    {city && (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-white/60">Cidade</dt>
                        <dd className="text-white/90">{city}</dd>
                      </div>
                    )}
                    {tagList.length > 0 && (
                      <div>
                        <dt className="text-white/60 mb-2">Tópicos</dt>
                        <dd className="flex flex-wrap gap-1.5">
                          {tagList.map((t) => (
                            <span key={t} className="rounded-full border border-white/10 bg-white/[0.08] px-2.5 py-1 text-[11px] text-white/80">
                              {t}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-4 h-px w-full bg-white/10" />

                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <a href="#sobre" className="rounded-xl border border-white/10 bg-white/[0.06] py-2 text-[12px] text-white/85 hover:bg-white/[0.08]">
                      Sobre
                    </a>
                    <a href="#editorial" className="rounded-xl border border-white/10 bg-white/[0.06] py-2 text-[12px] text-white/85 hover:bg-white/[0.08]">
                      Editorial
                    </a>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}