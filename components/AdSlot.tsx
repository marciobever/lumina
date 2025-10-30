"use client";

import { useEffect, useId, useRef } from "react";

type GptSize = "fluid" | [number, number];

type AdSlotProps = {
  /** ID único do contêiner. Se não passar, um ID estável é gerado. */
  id?: string;
  /** Caminho do ad unit no GAM, ex: "/23287346478/lumina.marciobevervanso/home_topo" */
  unit?: string;
  /** Tamanhos do slot. Ex: [["fluid"], [336,280], [300,250], [250,250]] */
  sizes?: GptSize[];
  /** Aplica size mapping retangular global definido no layout */
  map?: "rect" | "";
  /** Altura mínima para evitar CLS (em px) */
  minH?: number;
  /** Targeting por slot (k: string → string | string[]) */
  targeting?: Record<string, string | string[]>;
  /** Rótulo visível no fallback/placeholder */
  label?: string;
  /** Classe extra do contêiner */
  className?: string;
  /** Estética do placeholder (não altera GPT) */
  variant?: "leaderboard" | "skyscraper" | "native-card";
};

declare global {
  interface Window {
    googletag?: any;
    __luminaGpt?: { inited?: boolean; rectMapping?: any };
  }
}

/**
 * AdSlot
 * - Monta: defineSlot + display + refresh (após googletag pronto)
 * - Desmonta: destroySlots + limpa o HTML do container
 * - Se `unit` não vier, exibe apenas o "cartão nativo" visual (placeholder elegante)
 */
export default function AdSlot({
  id,
  unit,
  sizes = ["fluid", [336, 280], [300, 250], [250, 250]],
  map = "",
  minH,
  targeting,
  label,
  className = "",
  variant = "native-card",
}: AdSlotProps) {
  const autoId = useId().replace(/:/g, "-");
  const domId = id || `ad-${autoId}`;
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Sem unit → é só placeholder visual (não toca GPT)
    if (!unit) return;

    const g = window.googletag;
    if (!g || !g.cmd) return;

    let slotRef: any = null;
    const el = ref.current;
    if (!el) return;

    // Reserva de altura para reduzir layout shift
    if (minH && minH > 0) {
      el.style.minHeight = `${minH}px`;
    }

    // Função para garantir googletag pronto e então definir/exibir/atualizar
    const mount = () => {
      g.cmd.push(function () {
        try {
          // Já existe um slot anexado? (em re-mounts rápidos)
          if ((el as any).__gptSlot) return;

          // DefineSlot
          const slot = g.defineSlot(unit, sizes, domId);
          if (!slot) return;

          // Mapping retangular global
          if (map === "rect" && window.__luminaGpt?.rectMapping) {
            try {
              slot.defineSizeMapping(window.__luminaGpt.rectMapping);
            } catch {}
          }

          // Targeting por slot
          if (targeting && typeof targeting === "object") {
            Object.keys(targeting).forEach((k) => {
              const v = targeting[k];
              slot.setTargeting(k, Array.isArray(v) ? v : [String(v)]);
            });
          }

          slot.addService(g.pubads());
          (el as any).__gptSlot = slot;
          slotRef = slot;

          // Display + Refresh (SRA ativo no layout)
          g.display(domId);
          g.pubads().refresh([slot]);
        } catch {
          /* no-op */
        }
      });
    };

    // Desmontagem limpa
    const unmount = () => {
      try {
        const s = (el as any).__gptSlot;
        if (s && window.googletag?.destroySlots) {
          window.googletag.destroySlots([s]);
        }
        (el as any).__gptSlot = null;
        el.innerHTML = "";
      } catch {
        /* no-op */
      }
    };

    mount();
    return () => unmount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, domId, map, minH, JSON.stringify(sizes), JSON.stringify(targeting)]);

  // --------- UI / Placeholder (enquanto não renderiza GPT ou quando `unit` ausente) ---------
  if (variant === "native-card" && !unit) {
    return (
      <div
        id={domId}
        ref={ref}
        aria-label={label || "Publicidade"}
        className={`profile-card-business h-full w-full ${className}`}
      >
        <div className="pc-media">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(800px 300px at -10% 110%, rgba(255,0,191,.15), transparent 60%), radial-gradient(600px 260px at 110% -10%, rgba(99,102,241,.12), transparent 60%), linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02))",
            }}
          />
          <div className="pc-gradient" />
          <span className="pc-sector">{label || "Publicidade"}</span>
        </div>
        <div className="pc-body">
          <h3 className="pc-name">Anuncie neste espaço</h3>
          <p className="pc-headline">Formato nativo — integra na grelha de perfis.</p>
          <div className="pc-meta">
            <span className="pc-chip pc-chip-dim">Responsivo</span>
            <span className="pc-chip pc-chip-dim">auto</span>
          </div>
        </div>
      </div>
    );
  }

  const base =
    "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-md flex items-center justify-center text-center";
  const fallbackSize =
    variant === "leaderboard" ? "h-[90px]" : variant === "skyscraper" ? "h-[600px]" : "h-[280px]";
  const hint =
    "absolute top-2 left-2 text-[10px] uppercase tracking-widest text-white/60 bg-white/10 px-2 py-0.5 rounded-full";

  return (
    <div
      id={domId}
      ref={ref}
      aria-label={label || "Ad Slot"}
      className={`${base} ${fallbackSize} ${className}`}
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.04), 0 8px 30px rgba(0,0,0,.35)" }}
    >
      <span className={hint}>{label || "Publicidade"}</span>
      {/* Enquanto o iframe do GPT não chega, mostramos um placeholder limpo */}
      <div>
        <div className="font-display text-white/85 text-base md:text-lg">Publicidade</div>
        <div className="text-white/60 text-xs mt-1">{unit ? "Carregando…" : "auto-responsivo"}</div>
      </div>
    </div>
  );
}
