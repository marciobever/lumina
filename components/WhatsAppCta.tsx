'use client'

type WhatsAppCtaProps = {
  phone: string                 // só números, ex: 5511999999999
  text?: string                 // mensagem pré-preenchida
  title?: string
  subtitle?: string
  buttonLabel?: string
  showAdAbove?: boolean         // mostra AdSlot acima
  showAdBelow?: boolean         // mostra AdSlot abaixo
  adIdAbove?: string
  adIdBelow?: string
}

export default function WhatsAppCta({
  phone,
  text = 'Oi! Vim pelo seu perfil na LUMINA e queria saber mais.',
  title = 'Fale comigo no WhatsApp',
  subtitle = 'Resposta rápida. Conte seu objetivo e te ajudo a dar o próximo passo.',
  buttonLabel = 'Abrir no WhatsApp',
  showAdAbove = false,
  showAdBelow = false,
  adIdAbove = 'ad-wa-above',
  adIdBelow = 'ad-wa-below',
}: WhatsAppCtaProps) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
  return (
    <section className="space-y-3">
      {showAdAbove && (
        <div className="mb-1">
          {/* placeholder do ad: você já tem AdSlot no projeto */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-md h-[120px] flex items-center justify-center text-center" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.04), 0 8px 30px rgba(0,0,0,.35)' }}>
            <span className="absolute top-2 left-2 text-[10px] uppercase tracking-widest text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
              Publicidade
            </span>
            <div>
              <div className="font-display text-white/85 text-base md:text-lg">AdSense/Ad Manager</div>
              <div className="text-white/60 text-xs mt-1">Slot: {adIdAbove}</div>
            </div>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-5 md:p-6">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full opacity-20"
             style={{ background: 'radial-gradient(closest-side, rgba(var(--accent),.22), transparent)' }} />
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-display text-xl md:text-2xl font-semibold">{title}</h3>
            <p className="text-white/75 mt-1">{subtitle}</p>
          </div>
          <div className="shrink-0">
            <a href={href} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-medium border border-white/[0.06]"
               style={{ background: 'linear-gradient(90deg, rgba(var(--accent),0.95), rgba(var(--accent2),0.95))', color: '#fff', boxShadow: '0 12px 36px rgba(255,0,191,.25), inset 0 0 0 1px rgba(255,255,255,0.06)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M20.52 3.48A11.8 11.8 0 0 0 12.06 0C5.45 0 .09 5.36.09 11.98c0 2.07.55 4.07 1.6 5.84L0 24l6.34-1.66a11.9 11.9 0 0 0 5.72 1.47h.01c6.61 0 11.98-5.36 11.98-11.98 0-3.2-1.25-6.21-3.53-8.39ZM12.07 22.05h-.01a10.1 10.1 0 0 1-5.15-1.41l-.37-.22-3.76.98 1-3.66-.24-.38a10.1 10.1 0 1 1 8.52 4.69Zm5.54-7.54c-.3-.15-1.8-.89-2.08-.99-.28-.1-.48-.15-.68.15-.2.3-.78.99-.96 1.19-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.51-1.8-1.68-2.1-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.68-1.65-.93-2.27-.24-.58-.48-.5-.68-.5l-.58-.01c-.2 0-.53.08-.8.38-.28.3-1.06 1.04-1.06 2.54s1.08 2.95 1.23 3.15c.15.2 2.11 3.22 5.12 4.52.72.31 1.28.49 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.8-.74 2.06-1.45.25-.71.25-1.33.18-1.45-.08-.12-.3-.2-.6-.35Z"/>
              </svg>
              {buttonLabel}
            </a>
          </div>
        </div>
      </div>

      {showAdBelow && (
        <div className="mt-2">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-md h-[120px] flex items-center justify-center text-center" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.04), 0 8px 30px rgba(0,0,0,.35)' }}>
            <span className="absolute top-2 left-2 text-[10px] uppercase tracking-widest text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
              Publicidade
            </span>
            <div>
              <div className="font-display text-white/85 text-base md:text-lg">AdSense/Ad Manager</div>
              <div className="text-white/60 text-xs mt-1">Slot: {adIdBelow}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}