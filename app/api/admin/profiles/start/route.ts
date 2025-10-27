// app/api/admin/profiles/start/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function jerr(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const {
      NOCODB_BASE_URL,
      NOCODB_TABLE_ID,
      NOCODB_API_TOKEN,
      N8N_START_WEBHOOK,
    } = process.env;

    if (!NOCODB_BASE_URL || !NOCODB_TABLE_ID || !NOCODB_API_TOKEN) {
      return jerr("Env ausente: NOCODB_BASE_URL, NOCODB_TABLE_ID, NOCODB_API_TOKEN", 500);
    }

    const body = await req.json().catch(() => null);
    if (!body) return jerr("Body inválido (JSON obrigatório).");

    const {
      name,
      ethnicity,
      skin_tone,
      age,
      style = "editorial",
      seed_base = 500000,
      model_ref = "rundiffusion:130@100",
      face_mode = "",
      guide_url = "",
      guide_weight = 0.62,
    } = body;

    if (!name || !ethnicity || !skin_tone || !age) {
      return jerr("Campos obrigatórios: name, ethnicity, skin_tone, age");
    }

    const slug = slugify(name);

    // 1) cria linha no NocoDB (queued)
    const createRes = await fetch(
      `${NOCODB_BASE_URL}/api/v2/tables/${NOCODB_TABLE_ID}/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xc-token": NOCODB_API_TOKEN,
        },
        body: JSON.stringify({
          status: "queued",
          name,
          slug,
          ethnicity,
          skin_tone,
          age,
          style,
          seed_base,
          model_ref,
          face_mode,
          guide_url,
          guide_weight,
        }),
        cache: "no-store",
      }
    );

    if (!createRes.ok) {
      const txt = await createRes.text().catch(() => "");
      return jerr(`NocoDB error ${createRes.status}: ${txt || "sem corpo"}`, 502);
    }

    const created = await createRes.json();
    const rowId = created?.Id;
    if (!rowId) return jerr("NocoDB não retornou Id da linha", 502);

    // 2) dispara webhook do n8n
    if (N8N_START_WEBHOOK) {
      await fetch(N8N_START_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowId, slug, source: "admin" }),
        cache: "no-store",
      }).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      Id: rowId,
      slug,
      webhook: { ok: !!N8N_START_WEBHOOK },
      message: "Perfil enfileirado (queued) e webhook acionado.",
    });
  } catch (err: any) {
    return jerr(err?.message || "Erro inesperado", 500);
  }
}
