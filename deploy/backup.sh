#!/usr/bin/env bash
# Cópia de segurança diária: base de dados + fotos/vídeos/áudios (volume media), no servidor e na Storage Box.
#
#   Instalar (uma vez):   deploy/backup.sh --install
#   Correr agora:         deploy/backup.sh
#   Ver o estado:         deploy/backup.sh --status
#
# No .env (opcional, mas recomendado — sem isto fica só a cópia local no próprio servidor):
#   BACKUP_TARGET=u123456@u123456.your-storagebox.de   (utilizador e endereço da Storage Box)
#   BACKUP_KEEP_DAYS=30                                 (dias de cópias da base de dados a guardar)
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"
LOG=/var/log/hellotravell-backup.log
KEY="$HOME/.ssh/storagebox_ed25519"
val() { grep -E "^$1=" .env 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '"' || true; }
TARGET="$(val BACKUP_TARGET)"
KEEP="$(val BACKUP_KEEP_DAYS)"; KEEP="${KEEP:-30}"
SSH="ssh -p 23 -i $KEY -o StrictHostKeyChecking=accept-new -o BatchMode=yes"

if [[ "${1:-}" == "--install" ]]; then
  command -v rsync >/dev/null || apt-get install -y rsync >/dev/null
  mkdir -p "$HOME/.ssh" && chmod 700 "$HOME/.ssh"
  [[ -f "$KEY" ]] || ssh-keygen -t ed25519 -N "" -C "hellotravell-backup" -f "$KEY" >/dev/null
  (crontab -l 2>/dev/null | grep -v 'deploy/backup.sh'; echo "17 3 * * * $DIR/deploy/backup.sh >> $LOG 2>&1") | crontab -
  echo "✓ Agendado: todos os dias às 03:17 (hora do servidor). Registo em $LOG"
  if [[ -n "$TARGET" ]]; then
    echo "→ A instalar a chave na Storage Box (pede a password da Storage Box UMA vez):"
    ssh-copy-id -p 23 -s -i "$KEY.pub" "$TARGET" && echo "✓ Chave instalada."
  else
    echo "ℹ Sem BACKUP_TARGET no .env: as cópias ficam só neste servidor ($DIR/backups)."
  fi
  exit 0
fi

if [[ "${1:-}" == "--status" ]]; then
  echo "Locais:"; ls -lh backups/db 2>/dev/null | tail -5 || echo "  (nenhuma)"
  [[ -f backups/LAST_OK ]] && echo "Última cópia completa: $(cat backups/LAST_OK)" || echo "Ainda não houve nenhuma cópia completa."
  [[ -n "$TARGET" ]] && { echo "Storage Box:"; $SSH "$TARGET" ls -l hellotravell/db 2>/dev/null | tail -5 || echo "  (sem acesso — correu --install?)"; }
  exit 0
fi

echo "== $(date -Is) início"
mkdir -p backups/db
STAMP="$(date +%F_%H%M)"
# 1) Base de dados (formato custom: comprimido e restaurável tabela a tabela)
docker compose exec -T db pg_dump -U sgct -Fc sgct > "backups/db/sgct-$STAMP.dump.part"
[[ -s "backups/db/sgct-$STAMP.dump.part" ]] || { echo "✗ pg_dump vazio"; exit 1; }
mv "backups/db/sgct-$STAMP.dump.part" "backups/db/sgct-$STAMP.dump"
find backups/db -name 'sgct-*.dump' -mtime +"$KEEP" -delete
echo "✓ base de dados: $(du -h "backups/db/sgct-$STAMP.dump" | cut -f1)"

# 2) Media (fotos, vídeos, áudios das publicações) — caminho do volume no disco
MEDIA="$(docker volume inspect -f '{{ .Mountpoint }}' "$(basename "$DIR")_media" 2>/dev/null || true)"

# 3) Envio para a Storage Box (incremental: só o que mudou)
if [[ -n "$TARGET" ]]; then
  for d in hellotravell hellotravell/db hellotravell/media; do $SSH "$TARGET" mkdir "$d" >/dev/null 2>&1 || true; done
  rsync -a --delete -e "$SSH" backups/db/ "$TARGET:hellotravell/db/"
  [[ -n "$MEDIA" && -d "$MEDIA" ]] && rsync -a -e "$SSH" "$MEDIA/" "$TARGET:hellotravell/media/"
  echo "✓ enviado para a Storage Box"
else
  echo "ℹ sem BACKUP_TARGET: cópia só local"
fi
date -Is > backups/LAST_OK
echo "== $(date -Is) fim"
