// app/assistente/[slug]/page.tsx
import { redirect } from 'next/navigation'

export default function Page({ params }: { params: { slug: string } }) {
  redirect(`/assistente?slug=${encodeURIComponent(params.slug)}`)
}