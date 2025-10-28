// components/ProfileCard.tsx
type CardData = {
  slug: string
  nome: string
  titulo?: string | null
  categoria?: string | null
  capa_url?: string | null
}

type Props = { p: CardData }

const PLACEHOLDER = '/placeholder-600x800.jpg'

export default function ProfileCard({ p }: Props) {
  const img = p.capa_url || PLACEHOLDER
  const alt =
    p.titulo
      ? `${p.nome} — ${p.titulo}`
      : `${p.nome} — perfil`

  return (
    <a
      href={`/perfil/${p.slug}`}
      className="group block overflow-hidden rounded-2xl bg-zinc-900/40 ring-1 ring-white/10"
      aria-label={`Abrir perfil de ${p.nome}`}
    >
      {/* Wrapper com aspecto 3:4 pra evitar CLS */}
      <div className="relative w-full aspect-[3/4]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement
            if (el.src !== PLACEHOLDER) el.src = PLACEHOLDER
          }}
        />
        {/* brilho sutil no hover */}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      <div className="p-4">
        <h3 className="text-white font-semibold line-clamp-1">{p.nome}</h3>
        {p.titulo && (
          <p className="text-white/70 text-sm line-clamp-1">{p.titulo}</p>
        )}
        {p.categoria && (
          <p className="text-white/50 text-xs mt-1 line-clamp-1">{p.categoria}</p>
        )}
      </div>
    </a>
  )
}
