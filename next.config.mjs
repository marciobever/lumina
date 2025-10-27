// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'im.runware.ai',
      'images.unsplash.com',
      'picsum.photos',
      'cdn.exemplo.com',
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'im.runware.ai', pathname: '/image/**' },
    ],
  },
}

export default nextConfig