// components/NewsletterSection.tsx
import Newsletter from '@/components/Newsletter'

export default function NewsletterSection() {
  return (
    <section className="nl-section full-bleed">
      {/* linhas neon de fundo */}
      <svg className="nl-lines" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="nl-g" x1="0" y1="0" x2="1200" y2="0">
            <stop stopColor="#a855f7"/><stop offset="0.5" stopColor="#ec4899"/><stop offset="1" stopColor="#6366F1"/>
          </linearGradient>
        </defs>
        <path d="M0 170 Q 300 130 600 170 T 1200 170" stroke="url(#nl-g)" strokeOpacity="0.22" strokeWidth="2" fill="none" />
        <path d="M0 210 Q 300 170 600 210 T 1200 210" stroke="url(#nl-g)" strokeOpacity="0.16" strokeWidth="2" fill="none" />
      </svg>

      <div className="container">
        <div className="nl-card">
          <div className="text-center">
            <h3 className="font-display text-2xl md:text-3xl font-bold">Assine o catálogo</h3>
            <p className="text-white/75 mt-1">Destaques da semana direto no seu e-mail.</p>
          </div>
          <Newsletter />
        </div>
      </div>
    </section>
  )
}