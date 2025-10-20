// app/api/admin/metrics/route.ts
import { NextResponse } from 'next/server'
import { getAdminMetrics } from '@/lib/queries'

export async function GET() {
  try {
    const data = await getAdminMetrics()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}