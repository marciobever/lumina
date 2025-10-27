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
  // Estado global para evitar repetições
  window.__luminaGpt = window.__luminaGpt || { inited:false, slots:{}, displayed:{} };

  window.googletag = window.googletag || { cmd: [] };

  function setup() {
    if (window.__luminaGpt.inited) return;
    window.__luminaGpt.inited = true;

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

      // Guarda mapping para reuso
      window.__luminaGpt.rectMapping = rectMapping;

      // ---- Interstitial ----
      try {
        var slotInt = googletag.defineOutOfPageSlot(
          '/23287346478/lumina.marciobevervanso/lumina.marciobevervanso_Interstitial',
          googletag.enums.OutOfPageFormat.INTERSTITIAL
        );
        if (slotInt) {
          slotInt.addService(googletag.pubads());
          window.__luminaGpt.slotInt = slotInt;
        }
      } catch (e) {}

      // ---- Anchor (TOP) ----
      try {
        var slotAnchor = googletag.defineOutOfPageSlot(
          '/23287346478/lumina.marciobevervanso/lumina.marciobevervanso_Anchor',
          googletag.enums.OutOfPageFormat.TOP_ANCHOR
        );
        if (slotAnchor) {
          slotAnchor.addService(googletag.pubads());
          window.__luminaGpt.slotAnchor = slotAnchor;
        }
      } catch (e) {}

      // ---- Lazy load global + collapse ----
      try {
        googletag.pubads().enableLazyLoad({
          fetchMarginPercent: 20,
          renderMarginPercent: 10,
          mobileScaling: 2.0
        });
        googletag.pubads().collapseEmptyDivs(true);
      } catch (e) {}

      // ---- Ativa serviços uma vez ----
      googletag.enableServices();

      // ---- Exibir out-of-page uma vez ----
      try { if (window.__luminaGpt.slotInt) googletag.display(window.__luminaGpt.slotInt); } catch(e){}
      try { if (window.__luminaGpt.slotAnchor) googletag.display(window.__luminaGpt.slotAnchor); } catch(e){}
    });
  }

  // Cria/mostra um slot ContentX quando o div aparece
  function ensureSlot(id) {
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;

    googletag.cmd.push(function () {
      // Se já temos o slot definido, só exibe (uma vez)
      if (!window.__luminaGpt.slots[id]) {
        var path = '/23287346478/lumina.marciobevervanso/lumina.marciobevervanso_' + id;

        var slot = googletag.defineSlot(
          path,
          [[250,250],[300,250],[336,280]],
          id
        );

        if (slot) {
          slot.defineSizeMapping(window.__luminaGpt.rectMapping)
              .setCollapseEmptyDiv(true)
              .addService(googletag.pubads());
          window.__luminaGpt.slots[id] = slot;
        }
      }

      // Display apenas uma vez por div
      if (!window.__luminaGpt.displayed[id]) {
        window.__luminaGpt.displayed[id] = true;
        googletag.display(id);
      }
    });
  }

  // IDs suportados (iguais ao WP)
  var ids = ['Content1','Content2','Content3','Content4','Content5','Content6','Content7','Content8','Content9'];

  // Setup inicial
  setup();

  // Primeira varredura (caso alguns divs já existam na primeira renderização)
  function initialScan() {
    ids.forEach(function(id){ ensureSlot(id); });
  }
  initialScan();

  // Observa o DOM e, quando aparecer qualquer ContentX, define/exibe o slot
  var mo = new MutationObserver(function(mutations){
    for (var m of mutations) {
      if (!m.addedNodes) continue;
      for (var n of m.addedNodes) {
        if (!(n instanceof HTMLElement)) continue;
        // Se o nó adicionado for o próprio slot
        if (ids.includes(n.id)) {
          ensureSlot(n.id);
        }
        // Ou se contiver slots dentro
        ids.forEach(function(id){
          var found = n.querySelector && n.querySelector('#' + id);
          if (found) ensureSlot(id);
        });
      }
    }
  });

  try {
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch(e) {}

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
