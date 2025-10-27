// components/BackdropLines.tsx
type Props = { className?: string };

export default function BackdropLines({ className }: Props) {
  return (
    <div
      aria-hidden
      className={
        [
          "pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden",
          // altura padrão caso não seja passada
          className ?? "h-[60vh] sm:h-[62vh] md:h-[66vh]"
        ].join(" ")
      }
    >
      <svg
        className="absolute left-1/2 -translate-x-1/2 top-0 w-[120vw] max-w-none h-full opacity-35"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a855f7">
              <animate attributeName="stop-color" values="#a855f7;#ec4899;#6366F1;#a855f7" dur="14s" repeatCount="indefinite" />
            </stop>
            <stop offset="0.5" stopColor="#ec4899">
              <animate attributeName="stop-color" values="#ec4899;#6366F1;#a855f7;#ec4899" dur="14s" repeatCount="indefinite" />
            </stop>
            <stop offset="1" stopColor="#6366F1">
              <animate attributeName="stop-color" values="#6366F1;#a855f7;#ec4899;#6366F1" dur="14s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          {/* fade mais cedo para não vazar */}
          <linearGradient id="fadeY" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="white" stopOpacity="1" />
            <stop offset="55%"  stopColor="white" stopOpacity="0.25" />
            <stop offset="65%"  stopColor="white" stopOpacity="0.08" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="mask">
            <rect x="0" y="0" width="1200" height="600" fill="url(#fadeY)" />
          </mask>
        </defs>

        <g mask="url(#mask)">
          <g>
            <animateTransform attributeName="transform" type="translate" values="0 0; -24 0; 0 0" dur="22s" repeatCount="indefinite" />
            <path d="M0 300 Q 300 200 600 300 T 1200 300" stroke="url(#g)" strokeOpacity="0.35" strokeWidth="2" fill="none" />
            <path d="M0 360 Q 300 260 600 360 T 1200 360" stroke="url(#g)" strokeOpacity="0.23" strokeWidth="2" fill="none" />
            <path d="M0 420 Q 300 320 600 420 T 1200 420" stroke="url(#g)" strokeOpacity="0.16" strokeWidth="2" fill="none" />
          </g>
        </g>
      </svg>

      {/* véu de segurança para garantir corte suave no fim do bloco */}
      <div className="absolute inset-x-0 bottom-0 h-24 sm:h-28 md:h-32 bg-gradient-to-b from-transparent to-[#050010]" />
    </div>
  );
}
