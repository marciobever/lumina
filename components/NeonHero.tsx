// components/NeonHero.tsx
import clsx from 'clsx'

type Props = {
  fullscreen?: boolean
  scrollHintHref?: string // ex: "#destaques"
}

export default function NeonHero({ fullscreen = false, scrollHintHref }: Props) {
  return (
    <section
      className={clsx(
        'relative overflow-hidden pt-20 md:pt-28 pb-12 text-center',
        fullscreen && 'min-h-screen flex flex-col justify-center'
      )}
    >
      {/* --- Linhas neon sutis --- */}
      <svg
        className="absolute inset-0 -z-10 w-[110vw] h-full opacity-40"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a855f7" />
            <stop offset="0.5" stopColor="#ec4899" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        <path d="M0 300 Q 300 200 600 300 T 1200 300" stroke="url(#g)" strokeOpacity="0.35" strokeWidth="2" fill="none" />
        <path d="M0 360 Q 300 260 600 360 T 1200 360" stroke="url(#g)" strokeOpacity="0.25" strokeWidth="2" fill="none" />
        <path d="M0 420 Q 300 320 600 420 T 1200 420" stroke="url(#g)" strokeOpacity="0.18" strokeWidth="2" fill="none" />
      </svg>

      {/* --- Conteúdo principal --- */}
      <div className="container relative">
        <span className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase text-white/70">
          GLAMOUR • EDITORIAL • PG-13
        </span>

        <h1 className="h-hero neon-white mt-2 leading-tight">
          Descubra <br />
          <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            perfis glamourosos
          </span>
        </h1>

        <p className="text-white/80 md:text-lg mt-3 max-w-2xl mx-auto">
          Catálogo editorial leve e elegante. Bios breves, quizzes e galerias sensuais no limite PG-13 —
          tudo com curadoria e estilo.
        </p>

        {/* --- CTA multiline --- */}
        <div className="cta-wrap">
          {/* Usei <a> para evitar typedRoutes até as páginas existirem */}
          <a href="/perfis" className="cta-primary mt-6">
            🌟 Explorar catálogo completo
          </a>

          <div className="cta-row mt-2">
            <a href="/perfis?tag=novas" className="cta-pill">
              <div className="k">em destaque</div>
              <div className="t">Novas perfis da semana</div>
            </a>

            <a href="#quiz" className="cta-pill">
              <div className="k">diversão</div>
              <div className="t">Faça o quiz “Qual estilo é o seu?”</div>
            </a>
          </div>

          <div className="cta-row mt-2">
            <a href="/editorial" className="cta-pill">
              <div className="k">curadoria</div>
              <div className="t">Histórias e bastidores</div>
            </a>

            <a href="/beneficios" className="cta-pill">
              <div className="k">parcerias</div>
              <div className="t">Descubra benefícios exclusivos</div>
            </a>
          </div>
        </div>
      </div>

      {/* --- Dica para rolar (opcional) --- */}
      {scrollHintHref && (
        <div className="mt-6 md:mt-10">
          <a href={scrollHintHref} className="inline-block text-white/80 hover:text-white transition">
            <span className="sr-only">Ir para a seção</span>
            ↓ role para ver os destaques
          </a>
        </div>
      )}
    </section>
  )
}
