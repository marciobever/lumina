'use client'

import { useEffect } from 'react'

export default function VideooWall() {
  useEffect(() => {
    // Evita múltiplas cargas por rota
    if ((window as any).__videoowall_loaded__) return
    ;(window as any).__videoowall_loaded__ = true

    // Garante permissão no CSP: script-src/connect-src para static.videoo.tv
    const existing = document.querySelector<HTMLScriptElement>('#__videoowall_script__')
    if (existing) return

    const s = document.createElement('script')
    s.id = '__videoowall_script__'
    s.async = true
    s.src =
      'https://static.videoo.tv/a4ee5d6b80c91488ada774c8d658cf4e74f25043d10e44697965e620f24742ba.js'
    s.setAttribute(
      'data-id',
      'a4ee5d6b80c91488ada774c8d658cf4e74f25043d10e44697965e620f24742ba'
    )
    s.setAttribute('data-cfasync', 'false')

    document.head.appendChild(s)

    return () => {
      // Normalmente Videoo gerencia o próprio ciclo; se quiser
      // forçar cleanup entre rotas, remova o script e marque como não carregado:
      try {
        // document.head.removeChild(s)
        // ;(window as any).__videoowall_loaded__ = false
      } catch {}
    }
  }, [])

  return null
}
