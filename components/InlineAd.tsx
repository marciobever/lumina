'use client';

import { useEffect, useRef } from 'react';

type InlineAdProps = {
  /** Ex.: Content1..Content9 — precisa bater com o ID do div e com o sufixo do unitPath no GAM */
  id: string;
  /** Opcional: override do unitPath completo no GAM */
  unitPath?: string;
  /** Classe utilitária para estilizar o contêiner */
  className?: string;
  /** Rótulo acessível */
  label?: string;
};

/**
 * Componente para ads inline (Content1..Content9).
 * Replica o comportamento do bloco AdInserter do WordPress.
 *
 * Uso:
 *   <InlineAd id="Content3" />
 */
export default function InlineAd({ id, unitPath, className = '', label = 'Publicidade' }: InlineAdProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // garante objeto global
    const w = window as any;
    w.googletag = w.googletag || { cmd: [] };

    // registramos slots criados para destruir no unmount
    w.__luminaInlineSlots = w.__luminaInlineSlots || {};

    const run = () => {
      try {
        const g = w.googletag;

        const el = ref.current;
        if (!el) return;

        // unitPath default conforme seus nomes no GAM (igual ao WP)
        const path =
          unitPath ||
          `/23287346478/lumina.marciobevervanso/lumina.marciobevervanso_${id}`;

        // mapping igual ao WP
        const mapping = g
          .sizeMapping()
          .addSize([0, 0], ['fluid', [250, 250], [300, 250], [336, 280]])
          .build();

        // define slot
        const slot = g.defineSlot(path, [[250, 250], [300, 250], [336, 280]], id);
        if (slot) {
          slot.defineSizeMapping(mapping)
              .setCollapseEmptyDiv(true)
              .addService(g.pubads());
        }

        // habilita serviços UMA vez por página (evita duplicar)
        if (!w.__gptServicesEnabled) {
          // se quiser forçar lazyLoad local, descomente:
          // g.pubads().enableLazyLoad({
          //   fetchMarginPercent: 20,
          //   renderMarginPercent: 10,
          //   mobileScaling: 2.0,
          // });
          g.enableServices();
          w.__gptServicesEnabled = true;
        }

        // exibe o slot
        g.display(id);

        // guarda ref p/ cleanup
        w.__luminaInlineSlots[id] = slot || null;
      } catch (_) {
        // fail-safe silencioso
      }
    };

    // empilha no cmd do GPT
    (window as any).googletag.cmd.push(run);

    // cleanup: destrói slot ao desmontar/rotas
    return () => {
      try {
        const g = (window as any).googletag;
        const slot = (window as any).__luminaInlineSlots?.[id];
        if (slot) g.destroySlots([slot]);
        if ((window as any).__luminaInlineSlots) {
          delete (window as any).__luminaInlineSlots[id];
        }
        // opcional: limpar o conteúdo do container
        if (ref.current) ref.current.innerHTML = '';
      } catch {
        /* noop */
      }
    };
  }, [id, unitPath]);

  return (
    <div className={className}>
      <div
        id={id}
        ref={ref}
        aria-label={label}
        className="
          relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm
          flex items-center justify-center text-center h-[280px]
          shadow-[0_0_20px_rgba(255,0,255,0.08)]
        "
      >
        <span className="absolute top-2 left-2 text-[10px] uppercase tracking-widest text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
          {label}
        </span>
        <div className="text-xs text-white/60">Carregando anúncio…</div>
        <noscript>Ative o JavaScript para ver o anúncio.</noscript>
      </div>
    </div>
  );
}
