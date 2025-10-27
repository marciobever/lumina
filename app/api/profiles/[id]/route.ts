// app/api/admin/profiles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function jerr(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { NOCODB_BASE_URL, NOCODB_TABLE_ID, NOCODB_API_TOKEN } = process.env;
  if (!NOCODB_BASE_URL || !NOCODB_TABLE_ID || !NOCODB_API_TOKEN) {
    return jerr("Env ausente: NOCODB_BASE_URL, NOCODB_TABLE_ID, NOCODB_API_TOKEN", 500);
  }
  const id = params.id;
  if (!id) return jerr("Id obrigatório");

  const url = `${NOCODB_BASE_URL}/api/v2/tables/${NOCODB_TABLE_ID}/records/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { "xc-token": NOCODB_API_TOKEN },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return jerr(`NocoDB error ${res.status}: ${txt || "sem corpo"}`, 502);
  }

  return NextResponse.json({ ok: true, deletedId: id });
}
