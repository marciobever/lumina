// components/RouteOOP.tsx
'use client'
import { useEffect } from 'react'

type Props = {
  anchorUnitPath?: string
  interstitialUnitPath?: string
}

export default function RouteOOP({
  anchorUnitPath = '/23287346478/lumina.marciobevervanso/lumina.marciobevervanso_Anchor',
  interstitialUnitPath = '/23287346478/lumina.marciobevervanso/lumina.marciobevervanso_Interstitial',
}: Props) {
  useEffect(() => {
    const g: any = (window as any).googletag || { cmd: [] }
    let anchorSlot: any = null
    let interSlot: any = null

    g.cmd.push(function () {
      interSlot = g.defineOutOfPageSlot(interstitialUnitPath, g.enums.OutOfPageFormat.INTERSTITIAL)
      if (interSlot) interSlot.addService(g.pubads())

      anchorSlot = g.defineOutOfPageSlot(anchorUnitPath, g.enums.OutOfPageFormat.BOTTOM_ANCHOR)
      if (anchorSlot) anchorSlot.addService(g.pubads())

      if (interSlot) g.display(interSlot)
      if (anchorSlot) g.display(anchorSlot)

      const toRefresh = [interSlot, anchorSlot].filter(Boolean)
      if (toRefresh.length) g.pubads().refresh(toRefresh)
    })

    return () => {
      g.cmd.push(function () {
        const toDestroy = [interSlot, anchorSlot].filter(Boolean)
        if (toDestroy.length) g.destroySlots(toDestroy)
      })
    }
  }, [anchorUnitPath, interstitialUnitPath])

  return null
}
