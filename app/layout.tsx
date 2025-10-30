import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Playfair_Display, Manrope } from "next/font/google";
import Script from "next/script";
import RouteRemount from "@/components/RouteRemount";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "LUMINA — Perfis Glamourosos (PG-13)",
  description: "Diretório editorial feminino. Glamour, estilo e curadoria — PG-13.",
};

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
        {/* Bootstrap GAM: Configurações GLOBAIS (Anchor, Interstitial, Init) */}
        <Script id="gpt-bootstrap-global" strategy="afterInteractive">
          {`
(function(){
  window.__luminaGpt = window.__luminaGpt || { inited: false };
  window.googletag = window.googletag || { cmd: [] };

  function setup() {
    if (window.__luminaGpt.inited) return;
    window.__luminaGpt.inited = true;

    googletag.cmd.push(function () {
      try {
        var q = new URLSearchParams(window.location.search || "");
        var utm_source   = q.get("utm_source");
        var utm_medium   = q.get("utm_medium");
        var utm_campaign = q.get("utm_campaign");
        if (utm_source)   googletag.pubads().setTargeting('utm_source',   [utm_source]);
        if (utm_medium)   googletag.pubads().setTargeting('utm_medium',   [utm_medium]);
        if (utm_campaign) googletag.pubads().setTargeting('utm_campaign', [utm_campaign]);
      } catch (e) {}

      // Mapping retangular global (opcional por slot)
      var rectMapping = googletag.sizeMapping()
        .addSize([0,0], ['fluid', [250,250], [300,250], [336,280]])
        .build();
      window.__luminaGpt.rectMapping = rectMapping;

      // Interstitial
      var slotInt = googletag.defineOutOfPageSlot(
        '/23287346478/lumina.marciobevervanso/lumina.marciobevervanso_Interstitial',
        googletag.enums.OutOfPageFormat.INTERSTITIAL
      );
      if (slotInt) slotInt.addService(googletag.pubads());

      // Anchor
      var slotAnchor = googletag.defineOutOfPageSlot(
        '/23287346478/lumina.marciobevervanso/lumina.marciobevervanso_Anchor',
        googletag.enums.OutOfPageFormat.BOTTOM_ANCHOR
      );
      if (slotAnchor) slotAnchor.addService(googletag.pubads());

      googletag.pubads().enableLazyLoad({
        fetchMarginPercent: 20,
        renderMarginPercent: 10,
        mobileScaling: 2.0
      });
      googletag.pubads().collapseEmptyDivs(true);
      googletag.pubads().enableSingleRequest();
      googletag.enableServices();

      if (slotInt) googletag.display(slotInt);
      if (slotAnchor) googletag.display(slotAnchor);
    });
  }
  setup();
})();
          `}
        </Script>

        {/* Auto-define/refresh/destroy para DIVs FIXOS (efeito WordPress) */}
        <Script id="gpt-auto-ads" strategy="afterInteractive">
          {`
(function(){
  function parseJSON(raw, fallback){
    if(!raw) return fallback;
    try{ return JSON.parse(raw); }catch(_){ return fallback; }
  }

  function defineAll(){
    var g = window.googletag;
    if(!g || !g.cmd) return;

    var els = Array.from(document.querySelectorAll('[data-gam-slot]'));
    if(!els.length) return;

    g.cmd.push(function(){
      var fresh = [];
      els.forEach(function(el){
        var id   = el.id || '';
        var unit = el.getAttribute('data-gam-unit') || '';
        if(!id || !unit) return;

        if (el.__gptSlot) return; // já definido neste mount

        // Reserva de altura mínima (reduz CLS)
        var minH = Number(el.getAttribute('data-gam-minh') || '0');
        if (minH > 0) el.style.minHeight = minH + 'px';

        // Tamanhos
        var sizesAttr = el.getAttribute('data-gam-sizes');
        var sizes = parseJSON(sizesAttr, ['fluid', [336,280], [300,250], [250,250]]);

        var slot = g.defineSlot(unit, sizes, id);
        if(!slot) return;

        // Size mapping global opcional
        var mapFlag = (el.getAttribute('data-gam-map') || '').toLowerCase();
        if (mapFlag === 'rect' && window.__luminaGpt && window.__luminaGpt.rectMapping) {
          try { slot.defineSizeMapping(window.__luminaGpt.rectMapping); } catch(_){}
        }

        // Targeting por slot
        var targeting = parseJSON(el.getAttribute('data-gam-targeting'), null);
        if (targeting && typeof targeting === 'object') {
          Object.keys(targeting).forEach(function(k){
            var v = targeting[k];
            slot.setTargeting(k, Array.isArray(v) ? v : [String(v)]);
          });
        }

        slot.addService(g.pubads());
        el.__gptSlot = slot;

        g.display(id);
        fresh.push(slot);
      });

      if (fresh.length) {
        g.pubads().refresh(fresh);
      }
    });
  }

  function destroyAll(){
    try{
      var els = Array.from(document.querySelectorAll('[data-gam-slot]'));
      var slots = els.map(function(el){ return el.__gptSlot; }).filter(Boolean);
      if (slots.length && window.googletag && window.googletag.destroySlots) {
        window.googletag.destroySlots(slots);
      }
      els.forEach(function(el){ try{ el.__gptSlot = null; el.innerHTML=''; }catch(_){ } });
    }catch(_){}
  }

  window.addEventListener('lumina:page-will-unmount', destroyAll);
  window.addEventListener('lumina:page-mounted', defineAll);
  document.addEventListener('DOMContentLoaded', defineAll);
})();
          `}
        </Script>

        {/* Estrutura */}
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <RouteRemount>{children}</RouteRemount>
          </main>
          <Footer />
        </div>

        {/* Videoo Wall */}
        <Script
          id="videoowall"
          src="https://static.videoo.tv/a4ee5d6b80c91488ada774c8d658cf4e74f25043d10e44697965e620f24742ba.js"
          strategy="afterInteractive"
          data-id="a4ee5d6b80c91488ada774c8d658cf4e74f25043d10e44697965e620f24742ba"
          data-cfasync="false"
        />
      </body>
    </html>
  );
}
