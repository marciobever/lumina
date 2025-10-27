// components/Footer.tsx
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function Footer() {
  return (
    <footer className="footer full-bleed">
      {/* linha neon invertida no topo do rodapé */}
      <div className="neon-separator-footer" />
      <div className="container">
        <div className="footer-wrap">
          {/* Brand à esquerda, menor */}
          <div className="footer-brand">
            <Logo size="text-2xl" />
            <p className="footer-tagline">
              Glamour, estilo e curadoria. Editorial PG-13 — sem nudez explícita.
            </p>
          </div>

          {/* Links essenciais */}
          <nav className="footer-links">
            <Link href="/privacidade">Política de Privacidade</Link>
            <Link href="/sobre">Quem somos</Link>
            <Link href="/termos">Termos</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}