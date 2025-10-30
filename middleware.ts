// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * CSP para GAM/GPT + Videoo (produção + debug).
 * Ajustes desta versão:
 *  - frame-src inclui console.googletagservices.com (Pub Console em iframe)
 *  - script-src/script-src-elem incluem *.adtrafficquality.google (sodar2.js)
 */

const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  "https://securepubads.g.doubleclick.net",
  "https://pagead2.googlesyndication.com",
  "https://www.googletagservices.com",
  "https://console.googletagservices.com", // Pub Console
  "https://www.googleadservices.com",
  "https://tpc.googlesyndication.com",
  "https://cm.g.doubleclick.net",
  "https://www.google.com",
  "https://www.googletagmanager.com",
  "https://static.videoo.tv",
  "https://*.videoo.tv",
  "https://*.adtrafficquality.google", // sodar/sodar2.js
];

const frameSrc = [
  "'self'",
  "https://*.doubleclick.net",
  "https://securepubads.g.doubleclick.net",
  "https://pagead2.googlesyndication.com",
  "https://www.googlesyndication.com",
  "https://*.googlesyndication.com",
  "https://*.safeframe.googlesyndication.com",
  "https://www.googleadservices.com",
  "https://www.google.com",
  "https://tpc.googlesyndication.com",
  "https://console.googletagservices.com", // permitir iframe do Pub Console
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
  "https://*.adtrafficquality.google", // qualidade de tráfego
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
  `script-src ${scriptSrc.join(" ")};`,
  `script-src-elem ${scriptSrc.join(" ")};`,
  `script-src-attr 'unsafe-inline';`,
  `style-src ${styleSrc.join(" ")};`,
  `font-src ${fontSrc.join(" ")};`,
  `img-src ${imgSrc.join(" ")};`,
  `connect-src ${connectSrc.join(" ")};`,
  `frame-src ${frameSrc.join(" ")};`,
  `media-src ${mediaSrc.join(" ")};`,
  `frame-ancestors 'self';`,
  `base-uri 'self';`,
].join(" ");

export function middleware(_req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "SAMEORIGIN"); // legado; 'frame-ancestors' é o efetivo
  res.headers.set("Permissions-Policy", "interest-cohort=()");
  return res;
}

export const config = {
  matcher: ["/:path*"],
};
