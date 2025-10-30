// components/VideooWall.tsx
'use client'

import { useEffect } from 'react'

type VideooWallProps = {
  enabled?: boolean
  /** Opcional: se quiser um id de script diferente por rota */
  scriptId?: string
}

/**
 * Injeta o script do Videoo Wall no client, e desmonta ao trocar de rota.
 * IMPORTANTE: remova qualquer <Script id="videoowall" ...> que esteja no layout,
 * para evitar duplicidade.
 */
export default function VideooWall({
  enabled = true,
  scriptId = 'videoowall-script',
}: VideooWallProps) {
  useEffect(() => {
    if (!enabled) return

    // Evita múltiplas injeções
    if (document.getElementById(scriptId)) return

    const s = document.createElement('script')
    s.id = scriptId
    s.src =
      'https://static.videoo.tv/a4ee5d6b80c91488ada774c8d658cf4e74f25043d10e44697965e620f24742ba.js'
    s.async = true
    s.setAttribute(
      'data-id',
      'a4ee5d6b80c91488ada774c8d658cf4e74f25043d10e44697965e620f24742ba'
    )
    s.setAttribute('data-cfasync', 'false')

    document.body.appendChild(s)

    // Limpeza ao desmontar (rota mudou): remove o script e deixa o provedor recriar no próximo mount
    return () => {
      try {
        s.remove()
      } catch {}
    }
  }, [enabled, scriptId])

  return null
}
