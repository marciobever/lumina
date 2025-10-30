// app/layout.tsx
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
  // Estado global (apenas para o mapping)
  window.__luminaGpt = window.__luminaGpt || { inited: false };
  window.googletag = window.googletag || { cmd: [] };

  function setup() {
    if (window.__luminaGpt.inited) return; // Só executa uma vez
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

      // ---- Size Mapping (será usado pelas páginas) ----
      var rectMapping = googletag.sizeMapping()
        .addSize([0,0], ['fluid', [250,250], [300,250], [336,280]])
        .build();

      // Guarda mapping para reuso nas páginas
      window.__luminaGpt.rectMapping = rectMapping;

      // ---- Interstitial ----
      var slotInt = googletag.defineOutOfPageSlot(
        '/23287346478/lumina.marciobevervanso/lumina.marciobevervanso_Interstitial',
        googletag.enums.OutOfPageFormat.INTERSTITIAL
      );
      if (slotInt) slotInt.addService(googletag.pubads());

      // ---- Anchor (BOTTOM) ----
      var slotAnchor = googletag.defineOutOfPageSlot(
        '/23287346478/lumina.marciobevervanso/lumina.marciobevervanso_Anchor',
        googletag.enums.OutOfPageFormat.BOTTOM_ANCHOR
      );
      if (slotAnchor) slotAnchor.addService(googletag.pubads());

      // ---- Lazy load global + collapse ----
      googletag.pubads().enableLazyLoad({
        fetchMarginPercent: 20,
        renderMarginPercent: 10,
        mobileScaling: 2.0
      });
      googletag.pubads().collapseEmptyDivs(true);

      // ---- Ativa SRA (Single Request Architecture) ----
      // CRUCIAL para a lógica de refresh das páginas funcionar
      googletag.pubads().enableSingleRequest();

      // ---- Ativa serviços uma vez ----
      googletag.enableServices();

      // ---- Exibir out-of-page ----
      // O SRA vai "segurar" este pedido até ao primeiro refresh
      if (slotInt) googletag.display(slotInt);
      if (slotAnchor) googletag.display(slotAnchor);
    });
  }

  // Setup inicial
  setup();
})();
          `}
        </Script>

        {/* Wrapper flex para o footer “colar” no fim */}
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {/* Remonta todo o subtree a cada mudança de rota (efeito "WordPress-like") */}
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
