'use client'
import { useEffect } from 'react'

export function GoogleAdsScript() {
  useEffect(() => {
    if (document.querySelector('script[data-adsbygoogle]')) return;
    const s = document.createElement('script')
    s.setAttribute('data-adsbygoogle', '1')
    s.async = true
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
    s.crossOrigin = 'anonymous'
    document.head.appendChild(s)
    try { (window as any).adsbygoogle = (window as any).adsbygoogle || []; (window as any).adsbygoogle.push({}); } catch {}
  }, [])
  return null
}
