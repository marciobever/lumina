// app/api/admin/profiles/start/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

function slugify(s: string) {
  return String(s)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name ?? '').trim();

    if (!name) {
      return NextResponse.json({ error: 'Campo "name" é obrigatório.' }, { status: 400 });
    }

    const slug = slugify(name);
    return NextResponse.json({ ok: true, slug }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Erro inesperado' },
      { status: 500 }
    );
  }
}
