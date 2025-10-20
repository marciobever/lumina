# -------- Base --------
FROM node:20-bullseye-slim AS base
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# -------- Deps (com cache de lockfile) --------
FROM base AS deps
# Copia apenas os manifests para otimizar cache
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# -------- Builder --------
FROM base AS builder
# Copia node_modules prod para acelerar (Next precisa de deps em build)
COPY --from=deps /app/node_modules ./node_modules
# Copia o resto do projeto
COPY . .
# Garante que as variáveis de build do Next possam ser embutidas se necessário
# (no Coolify você define em "Environment Variables")
# Ex.: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_BUCKET, PHOTO_CDN_BASE
RUN --mount=type=cache,target=/root/.npm \
    npm run build

# -------- Runner (standalone) --------
FROM node:20-bullseye-slim AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Usuário não-root por segurança
RUN useradd -m nextjs
USER nextjs

# Copia artefatos do build standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Exponha a porta usada pelo Next
EXPOSE 3000

# Start – o standalone já traz server.js
CMD ["node", "server.js"]