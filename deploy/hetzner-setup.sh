#!/usr/bin/env bash
# Instala a HelloTravell num servidor Ubuntu 24.04 novo (Hetzner).
# Uso, no servidor como root:  curl -fsSL <url deste ficheiro> | bash -s -- <url do repositório git>
set -euo pipefail
REPO="${1:?indique o URL do repositório git}"
DIR=/opt/self-guided-city-tour

apt-get update -y
apt-get install -y ca-certificates curl git ufw
if ! command -v docker >/dev/null; then curl -fsSL https://get.docker.com | sh; fi

ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable

if [ ! -d "$DIR/.git" ]; then git clone "$REPO" "$DIR"; else git -C "$DIR" pull --ff-only; fi
cd "$DIR"
if [ ! -f .env ]; then
  cp .env.example .env
  sed -i "s|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$(openssl rand -base64 32)|" .env
  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(openssl rand -hex 16)|" .env
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgres://set-by-compose|" .env
  echo ">> Edite $DIR/.env (APP_URL, NEXTAUTH_URL, DOMAIN, Stripe, login) e volte a correr este script."
  exit 0
fi
docker compose up -d --build
docker compose ps
echo ">> Pronto. Configure o webhook Stripe para https://\$DOMAIN/api/stripe/webhook"
