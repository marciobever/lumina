// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ▶️ Importante: roda como servidor (standalone) — evita `next export`
  output: 'standalone',

  reactStrictMode: true,
  compress: true,

  images: {
    // Você pode usar só remotePatterns (cobre os domínios abaixo)
    remotePatterns: [
      { protocol: 'https', hostname: 'im.runware.ai', pathname: '/image/**' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'cdn.exemplo.com' },
    ],
  },

  // Opcional: pequenos ganhos DX
  experimental: {
    typedRoutes: true,
  },
}

export default nextConfig
