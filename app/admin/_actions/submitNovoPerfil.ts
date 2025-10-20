"use server";

import { NovoPerfilSchema } from "../_lib/types";
import { createHash } from "crypto";

const makeSeed = (s: string) =>
  createHash("sha256").update(s).digest("hex").slice(0, 12);
const makeIdem = () =>
  "req-" + Math.random().toString(36).slice(2, 10) + "-" + Date.now();

export async function submitNovoPerfil(raw: unknown) {
  const data = NovoPerfilSchema.parse(raw);
  const seed = makeSeed(
    [data.display_name, data.sector, data.city ?? "", data.tone, new Date().toISOString().slice(0,10)].join("|")
  );

  const payload = {
    display_name: data.display_name,
    sector: data.sector,
    city: data.city ?? null,
    locale: data.locale,
    tone: data.tone,
    tags: data.tags,
    persona: data.persona,
    generation: data.generation,
    exibir_anuncios: data.exibir_anuncios,
    ad_slot_topo: data.ad_slot_topo ?? null,
    ad_slot_meio: data.ad_slot_meio ?? null,
    ad_slot_rodape: data.ad_slot_rodape ?? null,
    status: data.status,
    idempotency_key: makeIdem(),
    meta: { seed, request_source: "admin.lumina" },
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/lumina/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out?.error || "Falha ao criar perfil");
  return out; // { ok, id, slug }
}