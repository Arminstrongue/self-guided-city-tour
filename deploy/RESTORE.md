# Cópias de segurança e recuperação — HelloTravell

## O que é copiado
| O quê | Onde | Frequência | Guarda |
|---|---|---|---|
| Base de dados (contas, compras, publicações, mensagens…) | `backups/db/sgct-AAAA-MM-DD_HHMM.dump` no servidor **e** `hellotravell/db/` na Storage Box | todos os dias às 03:17 | 30 dias (`BACKUP_KEEP_DAYS`) |
| Fotos, vídeos e áudios enviados pelos utilizadores (volume `media`) | `hellotravell/media/` na Storage Box | todos os dias (só o que mudou) | tudo |

**Não é copiado** (de propósito): o ficheiro `.env` (tem as chaves). Guarde uma cópia dele num gestor de passwords (1Password, Bitwarden…). Sem ele, uma recuperação demora muito mais.

## Instalar (uma vez)
1. Hetzner → **Storage Box** → ative **SSH support** e anote o utilizador (`u123456`) e o servidor (`u123456.your-storagebox.de`).
2. No servidor, junte ao `.env`:
   ```
   BACKUP_TARGET=u123456@u123456.your-storagebox.de
   ```
3. Corra:
   ```
   cd /opt/self-guided-city-tour && deploy/backup.sh --install
   ```
   Pede a password da Storage Box **uma vez** (para instalar a chave). Depois corre sozinho todas as noites.
4. Teste já: `deploy/backup.sh` e depois `deploy/backup.sh --status`.

## Ver se está a funcionar
```
deploy/backup.sh --status
tail -20 /var/log/hellotravell-backup.log
```
"Última cópia completa" deve ser de hoje ou de ontem.

## Recuperar a base de dados
⚠️ Substitui os dados atuais pelos da cópia. Faça antes uma cópia do estado atual (`deploy/backup.sh`).
```
cd /opt/self-guided-city-tour
ls backups/db                      # escolha o ficheiro
docker compose stop app worker
docker compose exec -T db pg_restore -U sgct -d sgct --clean --if-exists < backups/db/sgct-AAAA-MM-DD_HHMM.dump
docker compose start app worker
```
Se o ficheiro só existir na Storage Box:
```
rsync -a -e "ssh -p 23 -i ~/.ssh/storagebox_ed25519" u123456@u123456.your-storagebox.de:hellotravell/db/sgct-AAAA-MM-DD_HHMM.dump backups/db/
```

## Recuperar as fotos e vídeos
```
MEDIA=$(docker volume inspect -f '{{ .Mountpoint }}' self-guided-city-tour_media)
rsync -a -e "ssh -p 23 -i ~/.ssh/storagebox_ed25519" u123456@u123456.your-storagebox.de:hellotravell/media/ "$MEDIA/"
```

## Servidor novo (o atual perdeu-se)
1. Servidor Ubuntu 24.04 novo → `deploy/hetzner-setup.sh <url do repositório>`.
2. Copie o `.env` guardado no gestor de passwords para `/opt/self-guided-city-tour/.env`.
3. `docker compose up -d db` e espere 10 s.
4. Traga a cópia mais recente da Storage Box (comando acima) e restaure com `pg_restore` (acima).
5. Restaure a media (acima) e faça `docker compose up -d --build`.
6. Cloudflare → DNS: aponte o registo `A` de hellotravell.com para o IP novo.
