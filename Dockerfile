# ---------- base ----------
FROM node:20-bullseye-slim AS base
WORKDIR /app

# ---------- deps: instala TODAS as deps (inclui dev) ----------
FROM base AS deps
COPY package.json package-lock.json* ./
# Garante devDependencies no build, mesmo se NODE_ENV=production vier do ambiente
ENV NPM_CONFIG_PRODUCTION=false
RUN --mount=type=cache,target=/root/.npm npm ci --include=dev

# ---------- builder: compila Next ----------
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
# Também garante dev deps visíveis aqui
ENV NPM_CONFIG_PRODUCTION=false
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN --mount=type=cache,target=/root/.npm npm run build

# ---------- runner: copia artefatos e faz prune ----------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# copia só o necessário
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
RUN npm prune --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

EXPOSE 3000
CMD ["npm", "start"]
