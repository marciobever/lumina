// components/ProfileCard.tsx
'use client'

type P = {
  p: {
    slug: string
    nome: string
    titulo?: string | null
    categoria?: string | null
    capa_url?: string | null
  }
}

export default function ProfileCard({ p }: P) {
  const img = p.capa_url || '/placeholder-600x800.jpg'
  return (
    <a
      href={`/perfil/${p.slug}`}
      className="block group overflow-hidden rounded-2xl bg-zinc-900/40 ring-1 ring-white/10"
    >
      <div className="relative w-full h-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={p.nome || 'Perfil'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          // ⚠️ nada de onError/onLoad aqui
        />
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold">{p.nome}</h3>
        {p.titulo && <p className="text-white/70 text-sm">{p.titulo}</p>}
        {p.categoria && <p className="text-white/50 text-xs mt-1">{p.categoria}</p>}
      </div>
    </a>
  )
}
