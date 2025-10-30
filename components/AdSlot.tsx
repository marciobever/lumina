type AdSlotProps = {
  id: string;
  unit?: string; // ex: "/2328.../home_topo"
  sizesJSON?: string; // ex: '[[970,250],[970,90],[728,90],"fluid"]'
  map?: "rect" | ""; // aplica mapping retangular global
  minH?: number; // reserva mínima de altura (evita CLS)
  targetingJSON?: string; // ex: '{"pos":"topo","page":"home"}'
  label?: string;
  className?: string;
  variant?: "leaderboard" | "skyscraper" | "native-card";
};

export default function AdSlot({
  id,
  unit,
  sizesJSON,
  map = "",
  minH,
  targetingJSON,
  label,
  className = "",
  variant = "native-card",
}: AdSlotProps) {
  // Caso queira usar "caixa nativa" visual sem chamar GPT.js
  if (variant === "native-card" && !unit) {
    return (
      <div id={id} data-ad-slot aria-label={label || "Publicidade"} className={`profile-card-business h-full w-full ${className}`}>
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

  // Caso queira usar GPT.js pelo mesmo componente (gera DIV fixo com data-gam-*)
  const base =
    "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-md flex items-center justify-center text-center";
  const fallbackSize = variant === "leaderboard" ? "h-[90px]" : variant === "skyscraper" ? "h-[600px]" : "h-[280px]";
  const hint = "absolute top-2 left-2 text-[10px] uppercase tracking-widest text-white/60 bg-white/10 px-2 py-0.5 rounded-full";

  return (
    <div
      id={id}
      data-gam-slot={unit ? "1" : undefined}
      data-gam-unit={unit}
      data-gam-sizes={sizesJSON}
      data-gam-map={map}
      data-gam-minh={minH}
      data-gam-targeting={targetingJSON}
      aria-label={label || "Ad Slot"}
      className={`${base} ${fallbackSize} ${className}`}
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.04), 0 8px 30px rgba(0,0,0,.35)" }}
    >
      <span className={hint}>{label || "Publicidade"}</span>
      <div>
        <div className="font-display text-white/85 text-base md:text-lg">Publicidade</div>
        <div className="text-white/60 text-xs mt-1">{sizesJSON ? "GAM" : "auto-responsivo"}</div>
      </div>
    </div>
  );
}
