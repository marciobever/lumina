// components/AdSlot.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

type Variant = 'leaderboard' | 'skyscraper' | 'native-card';

type AdSlotProps = {
  id: string;
  label?: string;
  /** compat: aceita ambos */
  size?: string;
  sizes?: string;
  className?: string;
  variant?: Variant;
  /** overrides opcionais */
  unitPath?: string;
  gptSizes?: (googletag.GeneralSize | 'fluid')[];
};

declare global {
  interface Window {
    googletag: any;
    __luminaGpt?: {
      inited?: boolean;
      rectMapping?: any;
    };
  }
}

/** Registro dos slots conhecidos por id do container */
const REGISTRY: Record<
  string,
  { unitPath: string; sizes: (googletag.GeneralSize | 'fluid')[]; buildMapping?: () => any }
> = {
  LeaderboardTop: {
    unitPath:
      '/23287346478/lumina.marciobevervanso/lumina.marciobevervanso_LeaderboardTop',
    sizes: [[728, 90], [320, 100], [320, 50]],
    buildMapping: () =>
      window.googletag
        ?.sizeMapping()
        .addSize([0, 0], [[320, 100], [320, 50]])
        .addSize([728, 0], [[728, 90]])
        .build(),
  },
  Content3: {
    unitPath:
      '/23287346478/lumina.marciobevervanso/lumina.marciobevervanso_Content3',
    sizes: ['fluid', [250, 250], [300, 250], [336, 280]],
    // usa mapping retangular global criado no layout
    buildMapping: () => window.__luminaGpt?.rectMapping ?? null,
  },
};

export default function AdSlot({
  id,
  label = 'Publicidade',
  size,
  sizes,
  className = '',
  variant = 'native-card',
  unitPath,
  gptSizes,
}: AdSlotProps) {
  const displaySize = size || sizes || 'auto';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const slotRef = useRef<any>(null);
  const displayedOnceRef = useRef(false);
  const [ready, setReady] = useState(false);

  // Espera o GPT estar disponível
  useEffect(() => {
    const t = setInterval(() => {
      if (typeof window !== 'undefined' && window.googletag?.cmd) {
        clearInterval(t);
        setReady(true);
      }
    }, 30);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const gpt = window.googletag;
    const el = containerRef.current;
    if (!el) return;

    // se já existir slot com mesmo elementId, destrói antes de criar outro
    try {
      const prevSlots = gpt.pubads().getSlots?.() || [];
      const toDestroy = prevSlots.filter(
        (s: any) => s.getSlotElementId && s.getSlotElementId() === id
      );
      if (toDestroy.length) gpt.destroySlots(toDestroy);
    } catch (_) {}

    const reg = REGISTRY[id];
    const _unitPath = unitPath || reg?.unitPath;
    const _sizes = gptSizes || reg?.sizes;

    if (!_unitPath || !_sizes) {
      console.warn(`[AdSlot] Sem unitPath/sizes para id='${id}'. Ajuste REGISTRY ou passe props.`);
      return;
    }

    gpt.cmd.push(function () {
      const slot = gpt.defineSlot(_unitPath, _sizes as any, id);
      if (!slot) return;

      const mapping =
        reg?.buildMapping?.() ??
        (typeof window.__luminaGpt?.rectMapping !== 'undefined'
          ? window.__luminaGpt?.rectMapping
          : null);

      if (mapping && slot.defineSizeMapping) slot.defineSizeMapping(mapping);
      if (slot.setCollapseEmptyDiv) slot.setCollapseEmptyDiv(true);
      slot.addService(gpt.pubads());
      slotRef.current = slot;

      if (!displayedOnceRef.current) {
        gpt.display(id); // primeiro mount
        displayedOnceRef.current = true;
      } else {
        gpt.pubads().refresh([slot]); // remount/refresh
      }
    });

    // cleanup
    return () => {
      try {
        if (slotRef.current) {
          gpt.destroySlots([slotRef.current]);
          slotRef.current = null;
        }
      } catch (_) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, id, unitPath, JSON.stringify(gptSizes)]);

  // ---------- UI ----------
  const base =
    'relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-md flex items-center justify-center text-center';
  const fallbackSize =
    variant === 'leaderboard'
      ? 'h-[90px]'
      : variant === 'skyscraper'
      ? 'h-[600px]'
      : 'h-[280px]';
  const hint =
    'absolute top-2 left-2 text-[10px] uppercase tracking-widest text-white/60 bg-white/10 px-2 py-0.5 rounded-full';

  if (variant === 'native-card') {
    return (
      <div
        id={id}
        ref={containerRef}
        data-ad-slot=""
        aria-label={label}
        className={`profile-card-business h-full w-full ${className}`}
      >
        <div className="pc-media">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(800px 300px at -10% 110%, rgba(255,0,191,.15), transparent 60%), radial-gradient(600px 260px at 110% -10%, rgba(99,102,241,.12), transparent 60%), linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02))',
            }}
          />
          <div className="pc-gradient" />
          <span className="pc-sector">{label}</span>
        </div>
        <div className="pc-body">
          <h3 className="pc-name">Carregando anúncio…</h3>
          <p className="pc-headline">Formato nativo — integra na grelha de perfis.</p>
          <div className="pc-meta">
            <span className="pc-chip pc-chip-dim">Responsivo</span>
            <span className="pc-chip pc-chip-dim">{displaySize}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={id}
      ref={containerRef}
      data-ad-slot=""
      aria-label={label}
      className={`${base} ${fallbackSize} ${className}`}
      style={{
        boxShadow:
          'inset 0 0 0 1px rgba(255,255,255,.04), 0 8px 30px rgba(0,0,0,.35)',
      }}
    >
      <span className={hint}>{label}</span>
      <div>
        <div className="font-display text-white/85 text-base md:text-lg">
          Carregando anúncio…
        </div>
        <div className="text-white/60 text-xs mt-1">{displaySize}</div>
      </div>
    </div>
  );
}
