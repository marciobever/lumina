# ---------- base ----------
FROM node:20-bullseye-slim AS base
WORKDIR /app

# ---------- deps: instala TODAS as deps (inclui dev) ----------
FROM base AS deps
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# ---------- builder: compila Next ----------
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# se você usa Tailwind/postcss, os devDeps já estão disponíveis
RUN --mount=type=cache,target=/root/.npm \
    npm run build

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
COPY --from=builder /app/next.config.* ./  # se existir

EXPOSE 3000
CMD ["npm", "start"]