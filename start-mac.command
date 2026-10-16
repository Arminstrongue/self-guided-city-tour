#!/bin/bash
# Duplo clique no Finder para arrancar a app no seu Mac (modo de desenvolvimento).
cd "$(dirname "$0")"
if ! command -v node >/dev/null; then
  echo "Falta o Node.js. Instale a versão 22 LTS em https://nodejs.org e volte a abrir este ficheiro."; read -r; exit 1
fi
[ -f .env ] || cp .env.example .env
[ -d node_modules ] || npm install
[ -d .data ] || npm run setup
(sleep 6 && open "http://localhost:3000/pt") &
npm run dev
