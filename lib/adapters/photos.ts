import type { PhotoItem } from "@/lib/types"

export function normalizePhotos(opts: {
  apiPhotos?: PhotoItem[] | null
  gallery_urls?: string[]
  hero_url?: string | null
  avatar_url?: string | null
  display_name: string
  min?: number
}): PhotoItem[] {
  const { apiPhotos, gallery_urls = [], hero_url, avatar_url, display_name, min = 8 } = opts

  let photos: PhotoItem[] =
    Array.isArray(apiPhotos) && apiPhotos.length > 0
      ? apiPhotos
      : gallery_urls.length > 0
      ? gallery_urls.map((url, i) => ({ image_url: url, alt: `${display_name} — ${i + 1}` }))
      : [
          { image_url: hero_url || avatar_url || "", alt: `${display_name} — 1` },
          { image_url: avatar_url || hero_url || "", alt: `${display_name} — 2` },
        ]

  if (!Array.isArray(photos)) photos = []
  if (photos.length === 0) photos = [{ image_url: "", alt: display_name }]

  if (photos.length < min) {
    const out: PhotoItem[] = []
    for (let i = 0; i < Math.max(min, photos.length); i++) out.push(photos[i % photos.length])
    photos = out
  }
  return photos
}