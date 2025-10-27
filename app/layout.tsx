// app/layout.tsx
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Playfair_Display, Manrope } from 'next/font/google'
import Script from 'next/script'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display' })
const manrope  = Manrope({ subsets: ['latin'], variable: '--font-sans' })

export const metadata = {
  title: 'LUMINA — Perfis Glamourosos (PG-13)',
  description: 'Diretório editorial feminino. Glamour, estilo e curadoria — PG-13.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <head>
        {/* GPT.js */}
        <Script
          id="gpt-lib"
          src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${manrope.variable} ${playfair.variable} font-sans bg-[#050010] text-white`}>
        {/* Bootstrap GAM: UTM targeting, Interstitial, Anchor e Content1..Content9 */}
        <Script id="gpt-bootstrap" strategy="afterInteractive">
          {`
(function(){
  window.googletag = window.googletag || {cmd: []};

  googletag.cmd.push(function () {
    // ---- Targeting UTM ----
    try {
      var q = new URLSearchParams(window.location.search || "");
      var utm_source   = q.get("utm_source");
      var utm_medium   = q.get("utm_medium");
      var utm_campaign = q.get("utm_campaign");
      if (utm_source)   googletag.pubads().setTargeting('utm_source',   [utm_source]);
      if (utm_medium)   googletag.pubads().setTargeting('utm_medium',   [utm_medium]);
      if (utm_campaign) googletag.pubads().setTargeting('utm_campaign', [utm_campaign]);
    } catch (e) {}

    // ---- Size Mapping comum (retângulos / fluid) ----
    var rectMapping = googletag.sizeMapping()
      .addSize([0,0], ['fluid', [250,250], [300,250], [336,280]])
      .build();

    // ---- Interstitial ----
    try {
      var slotInt = googletag.defineOutOfPageSlot(
        '/23287346478/lumina.marciobevervanso/lumina.marciobevervanso_Interstitial',
        googletag.enums.OutOfPageFormat.INTERSTITIAL
      );
      if (slotInt) slotInt.addService(googletag.pubads());
    } catch (e) {}

    // ---- Anchor (TOP) ----
    try {
      var slotAnchor = googletag.defineOutOfPageSlot(
        '/23287346478/lumina.marciobevervanso/lumina.marciobevervanso_Anchor',
        googletag.enums.OutOfPageFormat.TOP_ANCHOR
      );
      if (slotAnchor) slotAnchor.addService(googletag.pubads());
    } catch (e) {}

    // ---- Lazy load global ----
    try {
      googletag.pubads().enableLazyLoad({
        fetchMarginPercent: 20,
        renderMarginPercent: 10,
        mobileScaling: 2.0
      });
    } catch (e) {}

    // ---- Content1..Content9: cria só se o elemento existir ----
    var ids = ['Content1','Content2','Content3','Content4','Content5','Content6','Content7','Content8','Content9'];
    ids.forEach(function(id){
      var el = document.getElementById(id);
      if (!el) return;

      // Caminho fixo (igual WP)
      var path = '/23287346478/lumina.marciobevervanso/lumina.marciobevervanso_' + id;

      var slot = googletag.defineSlot(path, [[250,250],[300,250],[336,280]], id);
      if (!slot) return;

      slot.defineSizeMapping(rectMapping)
          .setCollapseEmptyDiv(true)
          .addService(googletag.pubads());
    });

    // ---- Ativa serviços uma vez ----
    googletag.enableServices();

    // ---- Display: interstitial/anchor + blocos presentes ----
    try { if (typeof slotInt !== 'undefined' && slotInt) googletag.display(slotInt); } catch(e){}
    try { if (typeof slotAnchor !== 'undefined' && slotAnchor) googletag.display(slotAnchor); } catch(e){}

    ids.forEach(function(id){
      if (document.getElementById(id)) googletag.display(id);
    });
  });
})();
          `}
        </Script>

        {/* Wrapper flex para o footer “colar” no fim */}
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
