export const runtime = 'nodejs'
export const dynamic = 'force-dynamic' // força SSR; não tenta SSG no build

import { NextResponse } from 'next/server'
import { getDashboardStats } from '@/lib/queries'

export async function GET() {
  try {
    const stats = await getDashboardStats()
    return NextResponse.json(stats)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
