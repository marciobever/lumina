export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set`);
  return v;
}
function slugify(s: string) {
  return String(s)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
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
  const text = await res.text();
  if (!res.ok) throw new Error(`NocoDB ${res.status}: ${text || res.statusText}`);
  try { return JSON.parse(text); } catch { return {}; }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const name      = String(body?.name ?? '').trim();
    const ethnicity = String(body?.ethnicity ?? '').trim();
    const skin_tone = String(body?.skin_tone ?? '').trim();
    const age       = body?.age ?? ''; // pode ser número ou string
    const style     = String(body?.style ?? 'editorial').trim();
    const nicho     = body?.nicho ? String(body.nicho).trim() : ''; // vai pro N8N

    if (!name) {
      return NextResponse.json({ ok:false, error: 'Campo "name" é obrigatório.' }, { status: 400 });
    }

    const slug = slugify(name);

    // 1) Cria o registro no NocoDB em status "queued"
    const tableId = requireEnv('NOCODB_TABLE_ID');

    // IMPORTANTE: para evitar 422, só envie colunas que sabemos existir (vimos no seu dump):
    // status, name, slug, skin_tone, ethnicity, age, style
    const payload: Record<string, any> = {
      status: 'queued',
      name,
      slug,
      skin_tone: skin_tone || undefined,
      ethnicity: ethnicity || undefined,
      age: age ?? undefined,
      style: style || undefined,
    };

    const created = await nc(`/api/v2/tables/${tableId}/records`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const row: any = created?.list?.[0] || created || {};
    const recordId = String(row?.Id ?? row?.id ?? '');

    if (!recordId) {
      return NextResponse.json(
        { ok:false, error:'Registro criado no NocoDB sem Id. Verifique o schema/retorno.' },
        { status: 500 }
      );
    }

    // 2) Dispara o N8N com o que importa para a geração (inclui "nicho")
    const n8nUrl =
      process.env.N8N_START_WEBHOOK ||
      process.env.NEXT_PUBLIC_N8N_START_WEBHOOK;

    if (!n8nUrl) {
      // ainda assim retornamos sucesso da criação no NocoDB
      return NextResponse.json({
        ok: true,
        Id: recordId,
        slug,
        warn: 'N8N_START_WEBHOOK not set — registro criado no NocoDB, mas N8N não foi disparado.'
      });
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (process.env.N8N_WEBHOOK_SECRET) {
      headers['x-lumina-secret'] = process.env.N8N_WEBHOOK_SECRET!;
    }

    const n8nPayload = {
      source: 'lumina.admin.create',
      record_id: recordId,
      name,
      slug,
      ethnicity,
      skin_tone,
      age,
      style,
      nicho,              // ← pedido: incluir no payload do N8N
      // espaço pra evoluir: persona, locale, seed, etc.
    };

    const n8nRes = await fetch(n8nUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(n8nPayload),
      cache: 'no-store',
    });

    if (!n8nRes.ok) {
      const errText = await n8nRes.text().catch(()=>'');
      return NextResponse.json({
        ok: true,
        Id: recordId,
        slug,
        warn: `N8N retornou ${n8nRes.status}: ${errText || n8nRes.statusText}`
      });
    }

    return NextResponse.json({ ok: true, Id: recordId, slug }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok:false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
