// app/admin/_lib/types.ts
import { z } from "zod";

export const NovoPerfilSchema = z.object({
  display_name: z.string().min(1),
  sector: z.string().min(1),
  city: z.string().optional().nullable(),
  locale: z.enum(["pt-BR","pt-PT"]).default("pt-BR"),
  tone: z.enum(["fashion","editorial","aconselhamento","tech","neutro"]).default("neutro"),
  tags: z.array(z.string()).default([]),

  persona: z.object({
    age_range: z.string().optional().nullable(),
    style: z.array(z.string()).default([]),
    interests: z.array(z.string()).default([]),
    bio_length: z.enum(["curta","média"]).default("curta"),
  }).default({} as any),

  generation: z.object({
    title_from: z.enum(["llm","sector"]).default("llm"),
    bio_from: z.enum(["llm","template"]).default("llm"),
    tags_strategy: z.enum(["given","extract","mix"]).default("mix"),
    max_photos: z.number().int().min(1).max(9).default(6),
    photo_sources: z.array(z.enum(["pexels","unsplash"])).default(["pexels","unsplash"]),
    upload_to_supabase: z.boolean().default(true),
    pg13_guard: z.boolean().default(true),
  }).default({} as any),

  exibir_anuncios: z.boolean().default(true),
  ad_slot_topo: z.string().optional().nullable(),
  ad_slot_meio: z.string().optional().nullable(),
  ad_slot_rodape: z.string().optional().nullable(),
  status: z.enum(["publicado","rascunho"]).default("publicado"),
});

export type NovoPerfilInput = z.infer<typeof NovoPerfilSchema>;