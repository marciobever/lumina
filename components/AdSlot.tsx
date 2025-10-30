"use client";

import { useEffect, useRef } from "react";

/**
 * Observações:
 * - Para manter compatibilidade, os props originais continuam válidos.
 * - Se você passar `adUnitPath` (recomendado), o slot será criado no GPT.
 * - Se NÃO passar `adUnitPath`, o componente renderiza apenas o placeholder visual.
 */

type GeneralSize = googletag.GeneralSize | Array<number | string> | any;

type AdSlotProps = {
  id: string;
  label?: string;
  size?: string;
  className?: string;
  variant?: "leaderboard" | "skyscraper" | "native-card" | "rectangle";
  /** Opcional, mas necessário para servir de fato via GAM */
  adUnitPath?: string;
  /** Tamanhos; se omitido, usa um default por variant */
  sizes?: GeneralSize;
  /** Size mapping vindo do bootstrap global (window.__luminaGpt.rectMapping) se omitido */
  useGlobalRectMapping?: boolean;
  /** Targeting adicional por slot */
  targeting?: Record<string, string | string[]>;
  /** Reserva mínima de altura para evitar CLS */
  reserveMinHeight?: number;
};

declare global {
  interface Window {
    googletag: any;
    __luminaGpt?: {
      inited?: boolean;
      rectMapping?: googletag.SizeMappingArray;
    };
  }
}

export default function AdSlot({
  id,
  label,
  size,
  className = "",
  variant = "native-card",
  adUnitPath, // se não vier, fica só placeholder
  sizes,
  useGlobalRectMapping = true,
  targeting,
  reserveMinHeight,
}: AdSlotProps) {
  // --- Caso "native-card": mantemos o cartão editorial (não GPT) ---
  if (variant === "native-card") {
    return (
      <div
        id={id}
        data-ad-slot
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
            <span className="pc-chip pc-chip-dim">{size || "auto"}</span>
          </div>
        </div>
      </div>
    );
  }

  // --- Defaults por variant (se o `sizes` não vier) ---
  const defaultSizes: Record<string, GeneralSize> = {
    leaderboard: [
      [970, 250],
      [970, 90],
      [728, 90],
      "fluid",
    ],
    skyscraper: [
      [300, 600],
      [160, 600],
      [300, 250],
      "fluid",
    ],
    rectangle: [
      [336, 280],
      [300, 250],
      [250, 250],
      "fluid",
    ],
  };

  const chosenSizes: GeneralSize =
    sizes ||
    (variant === "leaderboard"
      ? defaultSizes.leaderboard
      : variant === "skyscraper"
      ? defaultSizes.skyscraper
      : defaultSizes.rectangle);

  const base =
    "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-md flex items-center justify-center text-center";
  const fallbackSize =
    variant === "leaderboard"
      ? "h-[90px] md:h-[90px] lg:h-[250px]"
      : variant === "skyscraper"
      ? "h-[600px]"
      : "h-[280px]";
  const hint =
    "absolute top-2 left-2 text-[10px] uppercase tracking-widest text-white/60 bg-white/10 px-2 py-0.5 rounded-full";

  const slotRef = useRef<googletag.Slot | null>(null);

  useEffect(() => {
    // Se não temos adUnitPath ou não há GPT pronto, deixamos apenas o placeholder visual.
    if (!adUnitPath) {
      console.warn(`[AdSlot:${id}] adUnitPath ausente — renderizando como placeholder visual.`);
      return;
    }

    const g = window.googletag;
    if (!g || !g.cmd) {
      console.warn(`[AdSlot:${id}] googletag indisponível — confirmE bootstrap global.`);
      return;
    }

    const container = document.getElementById(id);
    if (!container) {
      console.warn(`[AdSlot:${id}] container inexistente.`);
      return;
    }

    // Opcional: reservar altura mínima para evitar CLS
    if (reserveMinHeight && reserveMinHeight > 0) {
      container.style.minHeight = `${reserveMinHeight}px`;
    } else if (!reserveMinHeight) {
      // Reserva padrão por variant
      const minH = variant === "leaderboard" ? 90 : variant === "skyscraper" ? 600 : 280;
      container.style.minHeight = `${minH}px`;
    }

    g.cmd.push(function () {
      // Define
      const slot = g.defineSlot(adUnitPath, chosenSizes as any, id);
      if (!slot) {
        console.warn(`[AdSlot:${id}] falha ao defineSlot(${adUnitPath}).`);
        return;
      }
      slotRef.current = slot;

      // Size mapping global (retângulos) se habilitado e disponível
      if (useGlobalRectMapping && window.__luminaGpt?.rectMapping && variant !== "leaderboard" && variant !== "skyscraper") {
        try {
          slot.defineSizeMapping(window.__luminaGpt.rectMapping);
        } catch {}
      }

      // Serviços
      slot.addService(g.pubads());

      // Targeting por slot
      if (targeting) {
        Object.entries(targeting).forEach(([k, v]) =>
          slot.setTargeting(k, Array.isArray(v) ? (v as string[]) : [String(v)])
        );
      }

      // Display + refresh (pedido imediato)
      g.display(id);
      g.pubads().refresh([slot]);
    });

    return () => {
      const s = slotRef.current;
      try {
        if (s && window.googletag?.destroySlots) {
          window.googletag.destroySlots([s]);
        }
      } catch {}
      // Limpa o container para evitar reaproveito de safeframe
      const el = document.getElementById(id);
      if (el) el.innerHTML = "";
      slotRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, adUnitPath, variant, useGlobalRectMapping]);

  // Container visível (com hint) — o GPT vai ocupar este nó
  return (
    <div
      id={id}
      data-ad-slot
      data-variant={variant}
      aria-label={label || "Publicidade"}
      className={`${base} ${fallbackSize} ${className}`}
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.04), 0 8px 30px rgba(0,0,0,.35)" }}
    >
      <span className={hint}>{label || "Publicidade"}</span>
      {/* Fallback visual enquanto o GPT não preenche */}
      <div>
        <div className="font-display text-white/85 text-base md:text-lg">Publicidade</div>
        <div className="text-white/60 text-xs mt-1">{size || "auto-responsivo"}</div>
      </div>
    </div>
  );
}
