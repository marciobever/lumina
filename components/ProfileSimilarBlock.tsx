import ProfileCard from './ProfileCard'

export default function ProfileSimilarBlock({ items }: { items: any[] }) {
  if (!items?.length) return null
  return (
    <div className="mt-8">
      <h2 className="h-section mb-3">Semelhantes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.slice(0, 6).map((sp: any) => (
          <div key={sp.slug} className="card-aspect">
            <ProfileCard p={sp} />
          </div>
        ))}
      </div>
    </div>
  )
}