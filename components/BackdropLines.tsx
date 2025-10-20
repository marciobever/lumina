// components/BackdropLines.tsx
export default function BackdropLines() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden backdrop-lines"
    >
      <svg
        className="absolute left-0 top-0 w-[120vw] max-w-none h-[70vh] md:h-[75vh] opacity-40"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a855f7"/><stop offset="0.5" stopColor="#ec4899"/><stop offset="1" stopColor="#6366F1"/>
          </linearGradient>
          {/* máscara suave nas bordas para não “marcar” corte */}
          <linearGradient id="fadeY" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="1"/>
            <stop offset="85%" stopColor="white" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <g mask="url(#mask)">
          <path d="M0 300 Q 300 200 600 300 T 1200 300" stroke="url(#g)" strokeOpacity="0.35" strokeWidth="2" fill="none" />
          <path d="M0 360 Q 300 260 600 360 T 1200 360" stroke="url(#g)" strokeOpacity="0.25" strokeWidth="2" fill="none" />
          <path d="M0 420 Q 300 320 600 420 T 1200 420" stroke="url(#g)" strokeOpacity="0.18" strokeWidth="2" fill="none" />
        </g>
        <mask id="mask">
          <rect x="0" y="0" width="1200" height="600" fill="url(#fadeY)"/>
        </mask>
      </svg>
    </div>
  );
}