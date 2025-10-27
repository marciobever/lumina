// components/GalleryGrid.tsx
export default function GalleryGrid({ photos }: { photos: Array<{ image_url: string; alt?: string }> }) {
  const items = (photos || []).slice(0, 8)
  return (
    <div className="gallery-grid">
      {items.map((ph, i) => (
        <div key={i} className="gallery-item">
          <img
            src={ph.image_url}
            alt={ph.alt || `Foto ${i + 1}`}
            className="gallery-img"
            loading="lazy"
            draggable={false}
          />
        </div>
      ))}
    </div>
  )
}