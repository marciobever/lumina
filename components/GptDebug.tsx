// components/GptDebug.tsx
'use client'

import { useEffect, useState } from 'react'

type Ev = {
  t: string
  slot?: any
  info?: any
}

export default function GptDebug() {
  const [events, setEvents] = useState<Ev[]>([])
  const [enabled, setEnabled] = useState<boolean>(false)

  useEffect(() => {
    // habilita via env/flag ou query (?gptdebug=1)
    const qp = new URLSearchParams(window.location.search)
    const on = qp.get('gptdebug') === '1' || process.env.NEXT_PUBLIC_GPT_DEBUG === '1'
    setEnabled(on)
    if (!on) return

    const push = (e: Ev) =>
      setEvents((prev) => [e, ...prev].slice(0, 40)) // mantém últimas 40

    // marcos da lifecycle
    const onReq = (e: any) => push({ t: 'slotRequested', slot: e.slot })
    const onResp = (e: any) => push({ t: 'slotResponseReceived', slot: e.slot })
    const onRendered = (e: any) =>
      push({ t: 'slotRendered', slot: e.slot, info: { isEmpty: e.isEmpty } })
    const onViewable = (e: any) => push({ t: 'impressionViewable', slot: e.slot })
    const onLoad = (e: any) => push({ t: 'slotOnload', slot: e.slot })
    const onVis = (e: any) => push({ t: 'visibilityChanged', info: { vis: e.inViewPercentage }, slot: e.slot })

    const onDestroy = (detail: any) => push({ t: 'slotDestroyed', info: detail })

    // expõe um hook global para os componentes chamarem quando destruírem slots
    ;(window as any).__GPT_DEBUG_DESTROYED__ = (detail: any) => onDestroy(detail)

    const g = (window as any).googletag
    if (!g?.pubads) return

    g.cmd = g.cmd || []
    g.cmd.push(function () {
      const pa = g.pubads()
      pa.addEventListener('slotRequested', onReq)
      pa.addEventListener('slotResponseReceived', onResp)
      pa.addEventListener('slotRenderEnded', onRendered)
      pa.addEventListener('impressionViewable', onViewable)
      pa.addEventListener('slotOnload', onLoad)
      pa.addEventListener('visibilityChanged', onVis)
    })

    return () => {}
  }, [])

  if (!enabled) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        width: 340,
        maxHeight: 280,
        overflow: 'auto',
        fontSize: 12,
        lineHeight: 1.25,
        background: 'rgba(10,10,20,0.9)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,.15)',
        borderRadius: 10,
        padding: 10,
        zIndex: 99999,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        GPT Debug — últimos eventos
      </div>
      {events.map((e, i) => (
        <div key={i} style={{ opacity: 0.9 }}>
          <code>
            {e.t}{' '}
            {e.slot?.getSlotElementId
              ? `#${e.slot.getSlotElementId()}`
              : e.slot?.getAdUnitPath
              ? e.slot.getAdUnitPath()
              : ''}
          </code>
          {e.info ? (
            <div style={{ opacity: 0.8 }}>
              {JSON.stringify(e.info).slice(0, 140)}
            </div>
          ) : null}
          <hr style={{ borderColor: 'rgba(255,255,255,.08)' }} />
        </div>
      ))}
      <div style={{ opacity: 0.7 }}>
        Dica: abra o console e rode <code>googletag.openConsole()</code>.
      </div>
    </div>
  )
}
