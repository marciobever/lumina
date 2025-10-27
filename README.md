# Next Directory PG‑13 — Starter

Starter mínimo para diretório de perfis (PG‑13) com Next.js (App Router), Tailwind e Supabase.

## Rodando
```bash
pnpm i   # ou npm i / yarn
cp .env.example .env.local   # preencha as variáveis
pnpm dev
```

## Páginas
- `/` Home (destaques + CTA)
- `/perfis` Catálogo com grid + filtros (MVP)
- `/perfil/[slug]` Perfil com galeria e quiz (MVP)

## Pastas importantes
- `app/` páginas e layout base
- `components/` componentes UI essenciais
- `lib/` clientes e consultas Supabase + Ads
- `supabase/schema.sql` esquema inicial do banco
