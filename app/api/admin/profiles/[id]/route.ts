import { NextResponse } from 'next/server'
import { deleteProfile } from '@/lib/queries'

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const out = await deleteProfile(params.id)
    return NextResponse.json(out)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}