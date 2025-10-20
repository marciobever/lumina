// app/layout.tsx
import './globals.css'
import { GoogleAdsScript } from '@/lib/adsense'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BackdropLines from '@/components/BackdropLines'
import { Playfair_Display, Manrope } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display' })
const manrope  = Manrope({ subsets: ['latin'], variable: '--font-sans' })

export const metadata = {
  title: 'LUMINA — Perfis Glamourosos (PG-13)',
  description: 'Diretório editorial feminino. Glamour, estilo e curadoria — PG-13.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className={`${manrope.variable} ${playfair.variable} font-sans relative min-h-screen`}>
        <GoogleAdsScript />
        <Header />
        <BackdropLines />   {/* <<< linhas globais, full-width e sem retângulo */}
        <main className="container">{children}</main>
        <Footer />
      </body>
    </html>
  )
}