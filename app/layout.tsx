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
        {/* Bootstrap GAM: configurações GLOBAIS (sem OOP aqui) */}
        <Script id="gpt-bootstrap-global" strategy="afterInteractive">
          {`
(function(){
  window.__luminaGpt = window.__luminaGpt || { inited: false };
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

      // ---- Size Mapping global para reuso ----
      var rectMapping = googletag.sizeMapping()
        .addSize([0,0], ['fluid', [250,250], [300,250], [336,280]])
        .build();
      window.__luminaGpt.rectMapping = rectMapping;

      // ---- Lazy load + collapse + SRA ----
      googletag.pubads().enableLazyLoad({
        fetchMarginPercent: 20,
        renderMarginPercent: 10,
        mobileScaling: 2.0
      });
      googletag.pubads().collapseEmptyDivs(true);
      googletag.pubads().enableSingleRequest();

      // ---- Ativa serviços uma vez ----
      googletag.enableServices();
    });
  }
  setup();
})();
          `}
        </Script>

        {/* Wrapper flex para o footer “colar” no fim */}
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {/* Remonta o subtree a cada mudança de rota (efeito "WordPress-like") */}
            <RouteRemount>{children}</RouteRemount>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
