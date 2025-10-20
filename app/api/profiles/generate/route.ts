// app/api/profiles/generate/route.ts
import { NextResponse } from 'next/server'
import { triggerN8nGenerateProfile } from '@/lib/n8n'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // payload mínimo: profileId OU slug (e qualquer outro campo que seu n8n precise)
    const resp = await triggerN8nGenerateProfile(body)
    return NextResponse.json({ ok: true, resp })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}