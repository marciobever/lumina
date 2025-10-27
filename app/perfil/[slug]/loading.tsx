// app/perfil/[slug]/loading.tsx
export default function LoadingProfile() {
  return (
    <div className="container py-10 animate-pulse">
      <div className="h-64 rounded-2xl bg-white/5 border border-white/10 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          <div className="h-8 w-1/3 bg-white/10 rounded" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-white/5 rounded-xl border border-white/10" />
            ))}
          </div>
        </div>
        <div className="h-[600px] bg-white/5 rounded-xl border border-white/10" />
      </div>
    </div>
  )
}