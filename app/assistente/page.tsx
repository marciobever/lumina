// app/assistente/page.tsx
import AdSlot from '@/components/AdSlot'
import ChatPanel from '@/components/ChatPanel'
import { getProfileBySlug } from '@/lib/queries'
import type { Metadata } from 'next'

type Props = { searchParams?: { slug?: string } }

const slugToTitle = (s: string) =>
  s ? s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : ''

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const slug = searchParams?.slug || ''
  const profile = slug ? await getProfileBySlug(slug) : null
  const name = profile?.display_name || slugToTitle(slug) || 'Conversa'

  return {
    title: `${name} • Conversa`,
    description: profile?.seo?.meta_description || 'Troque mensagens em tempo real.',
  }
}

export default async function Page({ searchParams }: Props) {
  const slug = searchParams?.slug || ''
  const profile = slug ? await getProfileBySlug(slug) : null
  const name = profile?.display_name || slugToTitle(slug) || 'Conversa'

  return (
    <section className="section">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="min-w-0">
            <div className="mb-4">
              <h1 className="h-section">{name}</h1>
              <p className="text-white/70">
                Mensagens em tempo real — papo leve, direto e no seu ritmo
                {profile?.sector ? <> ({profile.sector})</> : null}.
              </p>
            </div>

            <ChatPanel
              context={{
                slug,
                profile: profile && {
                  display_name: profile.display_name,
                  sector: profile.sector,
                  city: profile.city,
                  headline: profile.headline,
                  short_bio: profile.short_bio,
                  tags: profile.tags,
                  article: profile.article,
                  seo: profile.seo,
                },
              }}
            />
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <AdSlot id="ad-assistant-top" label="Publicidade" size="300x600" variant="skyscraper" />
              <AdSlot id="ad-assistant-rect" label="Publicidade" size="300x250" variant="leaderboard" />
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}