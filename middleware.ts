// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * CSP ajustada para stack de anúncios (GAM/GPT + Videoo).
 * Inclui liberações para:
 *  - Pub Console (console.googletagservices.com)
 *  - Endpoints de qualidade de tráfego (*.adtrafficquality.google)
 *  - SafeFrames (*.safeframe.googlesyndication.com) e demais iframes de anúncios
 *
 * Observação: Mantemos 'unsafe-inline' e 'unsafe-eval' por pragmatismo em ambiente Next/ads.
 * Depois, dá para apertar usando nonces/hashes se necessário.
 */

const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  "https://securepubads.g.doubleclick.net",
  "https://pagead2.googlesyndication.com",
  "https://www.googletagservices.com",
  "https://console.googletagservices.com", // Pub Console (erro que você viu)
  "https://www.googleadservices.com",
  "https://tpc.googlesyndication.com",
  "https://cm.g.doubleclick.net",
  "https://www.google.com",
  "https://www.googletagmanager.com", // comum em criativos
  "https://static.videoo.tv",
  "https://*.videoo.tv",
];

const frameSrc = [
  "'self'",
  "https://*.doubleclick.net",
  "https://securepubads.g.doubleclick.net",
  "https://pagead2.googlesyndication.com",
  "https://www.googlesyndication.com",
  "https://*.googlesyndication.com", // inclui domínios variados
  "https://*.safeframe.googlesyndication.com", // SafeFrame (erro que você viu)
  "https://www.googleadservices.com",
  "https://www.google.com",
  "https://tpc.googlesyndication.com",
  "gmsg:",
  "https://*.videoo.tv",
];

const connectSrc = [
  "'self'",
  "https://*.doubleclick.net",
  "https://securepubads.g.doubleclick.net",
  "https://pagead2.googlesyndication.com",
  "https://*.google.com",
  "https://www.googleadservices.com",
  "https://tpc.googlesyndication.com",
  "https://*.videoo.tv",
  "https://*.adtrafficquality.google", // SODAR/traffic quality (erro que você viu)
];

const imgSrc = [
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
];

const styleSrc = [
  "'self'",
  "'unsafe-inline'",
  "https://fonts.googleapis.com",
];

const fontSrc = [
  "'self'",
  "https://fonts.gstatic.com",
  "data:",
];

const mediaSrc = [
  "'self'",
  "https:",
  "data:",
  "blob:",
];

const csp = [
  `default-src 'self';`,
  // usar script-src-elem/script-src-attr para maior compatibilidade
  `script-src ${scriptSrc.join(" ")};`,
  `script-src-elem ${scriptSrc.join(" ")};`,
  `script-src-attr 'unsafe-inline';`,
  `style-src ${styleSrc.join(" ")};`,
  `font-src ${fontSrc.join(" ")};`,
  `img-src ${imgSrc.join(" ")};`,
  `connect-src ${connectSrc.join(" ")};`,
  `frame-src ${frameSrc.join(" ")};`,
  `media-src ${mediaSrc.join(" ")};`,
  // Proteções adicionais
  `frame-ancestors 'self';`,
  `base-uri 'self';`,
].join(" ");

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // X-Frame-Options é legado; mantemos SAMEORIGIN por compat, mas 'frame-ancestors' é o efetivo
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("Permissions-Policy", "interest-cohort=()");
  return res;
}

export const config = {
  matcher: ["/:path*"],
};
