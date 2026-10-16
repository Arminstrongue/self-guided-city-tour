#!/usr/bin/env bash
# Cópia diária da base de dados (agendar com: crontab -e → 0 3 * * * /opt/self-guided-city-tour/deploy/backup.sh)
set -euo pipefail
cd /opt/self-guided-city-tour
mkdir -p backups
docker compose exec -T db pg_dump -U sgct sgct | gzip > "backups/sgct-$(date +%F).sql.gz"
find backups -name 'sgct-*.sql.gz' -mtime +14 -delete
