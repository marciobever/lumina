export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { toggleAds } from '@/lib/queries'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { on } = await req.json()
    const updated = await toggleAds(params.id, Boolean(on))
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
