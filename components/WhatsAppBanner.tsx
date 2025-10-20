// components/WhatsAppBanner.tsx
'use client'

type Props = {
  /** Se passado, usa este destino (ex.: "/assistente/slug") em vez de wa.me */
  href?: string
  /** Fallback para abrir o WhatsApp quando não houver href interno */
  phone?: string // ex: '5511999999999'
  text?: string
  title?: string
  subtitle?: string
  className?: string
}

export default function WhatsAppBanner({
  href,
  phone,
  text = 'Olá! Vim do seu perfil no LUMINA e quero saber mais 🙂',
  title = 'Falar comigo no WhatsApp',
  subtitle = 'Dúvidas rápidas, parcerias e convites',
  className = '',
}: Props) {
  const fallbackHref = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : '#'
  const finalHref = href ?? fallbackHref

  // Se for link interno (começa com "/"), abre na mesma aba; senão (wa.me), em nova aba
  const isInternal = typeof finalHref === 'string' && finalHref.startsWith('/')

  return (
    <a
      href={finalHref}
      target={isInternal ? undefined : '_blank'}
      rel={isInternal ? undefined : 'noopener noreferrer'}
      className={`block rounded-2xl border border-white/10 bg-white/[0.05] p-5 md:p-6
                 hover:bg-white/[0.07] transition-colors shadow-[0_10px_30px_rgba(0,0,0,.35)]
                 [box-shadow:inset_0_0_0_1px_rgba(255,255,255,.05)] ${className}`}
      aria-label={isInternal ? 'Abrir assistente' : 'Abrir conversa no WhatsApp'}
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 shrink-0 rounded-xl border border-white/10 bg-white/[0.06] grid place-items-center">
          {/* Ícone (genérico de chat) para valer tanto para WA quanto assistente */}
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="text-white/90">
            <path fill="currentColor" d="M12 3c4.97 0 9 3.58 9 8s-4.03 8-9 8c-.86 0-1.7-.1-2.49-.3L4 21l1.44-3.37A7.94 7.94 0 0 1 3 11c0-4.42 4.03-8 9-8"/>
          </svg>
        </div>
        <div className="min-w-0">
          <div className="text-white font-semibold truncate">{title}</div>
          {subtitle && <div className="text-white/70 text-sm truncate">{subtitle}</div>}
        </div>
        <span className="ml-auto rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/80">
          Abrir
        </span>
      </div>
      {text && isInternal && (
        <p className="text-white/70 text-sm mt-3 line-clamp-2">{text}</p>
      )}
    </a>
  )
}