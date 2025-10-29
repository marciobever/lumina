import GalleryGrid from "./GalleryGrid"

export type PhotoItem = { image_url: string; alt?: string }

export default function ProfileGalleryBlock({ photos }: { photos: PhotoItem[] }) {
  if (!photos?.length) return null

  return (
    <section className="card p-3 md:p-4 mt-6">
      <h2 className="h-section mb-3">Galeria</h2>
      <GalleryGrid photos={photos} />
      <p className="text-white/55 text-xs mt-2">
        Clique nas imagens para ampliar. Use a roda do mouse para zoom; ESC para fechar.
      </p>
    </section>
  )
}
