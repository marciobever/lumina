// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Observação: esta CSP é "pragmática" para stack de anúncios.
// Depois podemos ir apertando (ex.: hashes em inline scripts, etc.)
const csp = [
  "default-src 'self';",
  // Scripts de anúncios + Next
  [
    "script-src",
    // permitir scripts do próprio site + Next
    "'self'",
    "'unsafe-inline'", // necessário p/ alguns inlines de provedores (se remover, quebra facilmente)
    "'unsafe-eval'",   // Next/React dev e alguns wrappers de anuncio podem exigir
    "https://securepubads.g.doubleclick.net",
    "https://pagead2.googlesyndication.com",
    "https://www.googletagservices.com",
    "https://www.googleadservices.com",
    "https://tpc.googlesyndication.com",
    "https://cm.g.doubleclick.net",
    "https://www.google.com",
    "https://static.videoo.tv",
    "https://*.videoo.tv",
  ].join(" ") + ";",

  // iframes/frames dos ads
  [
    "frame-src",
    "'self'",
    "https://*.doubleclick.net",
    "https://securepubads.g.doubleclick.net",
    "https://pagead2.googlesyndication.com",
    "https://www.googlesyndication.com",
    "https://www.googleadservices.com",
    "https://www.google.com",
    "https://tpc.googlesyndication.com",
    "gmsg:", // usado por alguns formatos
    "https://*.videoo.tv",
  ].join(" ") + ";",

  // imagens (criativos, tracking pixels)
  [
    "img-src",
    "'self'",
    "data:",
    "blob:",
    "https:",
    "https://*.doubleclick.net",
    "https://*.googlesyndication.com",
    "https://*.googleadservices.com",
    "https://*.google.com",
    "https://*.g.doubleclick.net",
    "https://*.videoo.tv",
  ].join(" ") + ";",

  // conexões XHR/fetch dos SDKs
  [
    "connect-src",
    "'self'",
    "https://*.doubleclick.net",
    "https://securepubads.g.doubleclick.net",
    "https://pagead2.googlesyndication.com",
    "https://*.google.com",
    "https://www.googleadservices.com",
    "https://tpc.googlesyndication.com",
    "https://*.videoo.tv",
  ].join(" ") + ";",

  // estilos/fonts
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
  "font-src 'self' https://fonts.gstatic.com data:;",

  // media (caso algum criativo use vídeo/áudio)
  "media-src 'self' https: data: blob:;",

  // bloquear embed do seu site dentro de terceiros (proteção contra clickjacking)
  // OBS: alguns provedores de anúncio usam iframes próprios, não afeta
  "frame-ancestors 'self';",
].join(" ");

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("Content-Security-Policy", csp);
  // Cabeçalhos úteis adicionais
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "SAMEORIGIN"); // compat; 'frame-ancestors' é o moderno
  res.headers.set("Permissions-Policy", "interest-cohort=()");
  return res;
}

// Aplicar em todas as rotas
export const config = {
  matcher: ["/:path*"],
};
