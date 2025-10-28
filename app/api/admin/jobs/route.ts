// app/api/admin/jobs/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

async function nc(path: string, init?: RequestInit) {
  const base  = requireEnv('NOCODB_BASE_URL');
  const token = requireEnv('NOCODB_API_TOKEN');
  const url   = `${base}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'xc-token': token,
      'Authorization': `Bearer ${token}`,
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(`NocoDB ${res.status}: ${txt || res.statusText}`);
  try { return JSON.parse(txt); } catch { return {}; }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit  = Math.max(1, Math.min(50, Number(searchParams.get('limit') ?? '8')));
    const t      = requireEnv('NOCODB_TABLE_ID');

    // Ordena por atualização mais recente (UpdatedAt é padrão do NocoDB)
    const json = await nc(`/api/v2/tables/${t}/records?limit=${limit}&sort=-UpdatedAt`);

    const list = (json?.list ?? []).map((r: any) => {
      const id    = String(r.Id ?? r.id ?? '');
      const name  = String(r.display_name ?? r.name ?? '');
      const slug  = String(r.slug ?? '');
      const nicho = r.nicho ?? r.sector ?? null;
      const status = String(r.status ?? 'draft');
      const updated_at = r.updated_at ?? r.UpdatedAt ?? null;

      return { id, name, slug, nicho, status, updated_at };
    });

    return NextResponse.json({ ok: true, data: list }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
