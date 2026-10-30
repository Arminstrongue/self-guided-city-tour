# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Variáveis NEXT_PUBLIC_* ficam gravadas no código do navegador na construção: têm de entrar aqui (vêm do .env via compose).
ARG NEXT_PUBLIC_ETIAS_LIVE=0
ENV NEXT_PUBLIC_ETIAS_LIVE=$NEXT_PUBLIC_ETIAS_LIVE
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
# ffmpeg converte os vídeos da carteira (H.264 720p, estilo TikTok).
RUN apk add --no-cache ffmpeg && addgroup -S app && adduser -S app -G app && mkdir -p /data/media && chown app:app /data/media
ENV MEDIA_DIR=/data/media
COPY --from=builder /app/public ./public
# Fotografias próprias só para quem tem passe (servidas por /api/own-photo, nunca como ficheiros públicos)
COPY --from=builder --chown=app:app /app/private ./private
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
USER app
EXPOSE 3000
CMD ["node", "server.js"]
