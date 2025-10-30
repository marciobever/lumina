'use client'

import { useEffect, useRef } from 'react'

export default function RouteOOP() {
  const slotsRef = useRef<{ inter?: any; anchor?: any } | null>(null)

  useEffect(() => {
    let destroyed = false
    const g = (window as any).googletag || ((window as any).googletag = { cmd: [] })

    g.cmd.push(function () {
      try {
        // (1) Define Interstitial
        const inter = g.defineOutOfPageSlot(
          '/23287346478/lumina.marciobevervanso/lumina.marciobevervanso_Interstitial',
          g.enums.OutOfPageFormat.INTERSTITIAL
        )
        if (inter) inter.addService(g.pubads())

        // (2) Define Anchor (BOTTOM ou TOP; no seu header estava TOP_ANCHOR)
        const anchor = g.defineOutOfPageSlot(
          '/23287346478/lumina.marciobevervanso/lumina.marciobevervanso_Anchor',
          g.enums.OutOfPageFormat.BOTTOM_ANCHOR
          // ou TOP_ANCHOR se preferir:
          // g.enums.OutOfPageFormat.TOP_ANCHOR
        )
        if (anchor) anchor.addService(g.pubads())

        // Não chame enableServices() aqui se já foi chamado globalmente.
        // Se o enableServices global não existir, você pode chamar uma única vez:
        try {
          // Chama enableServices só se nunca foi chamado
          if (!(window as any).__gptServicesEnabled__) {
            g.pubads().enableLazyLoad({
              fetchMarginPercent: 20,
              renderMarginPercent: 10,
              mobileScaling: 2.0,
            })
            g.pubads().collapseEmptyDivs(true)
            g.pubads().enableSingleRequest()
            g.enableServices()
            ;(window as any).__gptServicesEnabled__ = true
          }
        } catch {}

        // (3) Exibir sem refresh
        if (inter) g.display(inter)
        if (anchor) g.display(anchor)

        slotsRef.current = { inter, anchor }
      } catch (e) {
        // swallow
      }
    })

    return () => {
      try {
        if (destroyed) return
        destroyed = true
        const g = (window as any).googletag
        const s = slotsRef.current
        if (g?.pubads && s) {
          const list = [s.inter, s.anchor].filter(Boolean)
          if (list.length) {
            g.destroySlots(list)
            ;(window as any).__GPT_DEBUG_DESTROYED__?.({
              id: 'OOP',
              units: list.map((x: any) => x?.getAdUnitPath?.()),
            })
          }
        }
        slotsRef.current = null
      } catch {}
    }
  }, [])

  return null
}
