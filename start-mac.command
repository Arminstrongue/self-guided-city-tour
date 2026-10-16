#!/bin/bash
# Duplo clique no Finder (ou ./start-mac.command no Terminal) para arrancar a app no seu Mac.
cd "$(dirname "$0")"
if ! command -v node >/dev/null; then
  echo "Falta o Node.js. Instale a versão 22 LTS em https://nodejs.org e volte a abrir este ficheiro."; read -r; exit 1
fi

# Escolhe a primeira porta livre a partir da 3000.
PORT=3000
while lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do PORT=$((PORT+1)); done
URL="http://localhost:$PORT"

[ -f .env ] || cp .env.example .env
# Acerta os endereços da app no .env para a porta escolhida.
sed -i '' -E "s#^APP_URL=.*#APP_URL=$URL#; s#^NEXTAUTH_URL=.*#NEXTAUTH_URL=$URL#" .env

grep -q "^DEV_ADMIN=" .env || echo "DEV_ADMIN=1" >> .env
npm install --no-audit --no-fund
npm run db:migrate
[ -d .data/db ] && [ -f .data/.seeded ] || { npm run db:seed && touch .data/.seeded; }

echo ""
echo "  App:            $URL/pt"
echo "  Administração:  $URL/pt/admin"
echo "  Roteiro de demonstração (sem pagar):"
npx tsx scripts/seed.ts | grep "Link"
echo ""
(sleep 5 && open "$URL/pt") &
npx next dev -p "$PORT"
