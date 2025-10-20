export function ogImageForProfile(p: { display_name: string; hero_url?: string | null }) {
  return p.hero_url || '/og.jpg'
}
