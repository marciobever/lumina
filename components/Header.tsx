// components/Header.tsx
'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Logo from '@/components/Logo'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="header-glass">
      <div className="container py-3 flex items-center justify-between">
        <Link href="/" aria-label="LUMINA">
          <Logo size="text-3xl" className="logo-shimmer" />
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/perfis" className="nav-link">Perfis</Link>
          <a href="#destaques" className="nav-link">Destaques</a>
        </nav>
      </div>
      <div className="neon-separator" />
    </header>
  )
}