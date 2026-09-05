#!/bin/bash
set -euo pipefail
umask 077

RESTIC_BIN=/usr/local/bin/restic
STAGE_DIR="/var/backups/sqlite"
mkdir -p "$STAGE_DIR"
chmod 700 "$STAGE_DIR"

# Fresh Postgres dumpall (ensures today's data is captured).
systemctl start pg-backup.service
for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
  systemctl is-active --quiet pg-backup.service || break
  sleep 1
done

# Consistent SQLite snapshot while the live analytics database is written to.
sqlite3 /var/lib/goatcounter/db.sqlite3 ".backup ${STAGE_DIR}/goatcounter.sqlite3"

"$RESTIC_BIN" --cache-dir /var/cache/restic backup \
  --tag nightly \
  --exclude-caches \
  --exclude "/var/lib/forgejo/data/indexers" \
  --exclude "/var/lib/forgejo/data/sessions" \
  --exclude "/var/lib/forgejo/data/queues" \
  --exclude "/var/lib/forgejo/data/tmp" \
  /var/backups/pg \
  "$STAGE_DIR" \
  /var/lib/forgejo \
  /var/lib/goatcounter/db.sqlite3 \
  /etc/forgejo \
  /etc/listmonk \
  /etc/caddy \
  /etc/site-build \
  /etc/forgejo-webhook \
  /etc/restic \
  /etc/systemd/system \
  /etc/sudoers.d \
  /usr/local/sbin

rm -f "${STAGE_DIR}/goatcounter.sqlite3"

# Keep the established nightly retention policy. Maintenance can explicitly
# skip pruning to retain every pre-upgrade snapshot during verification.
if [[ "${RESTIC_SKIP_PRUNE:-0}" != "1" ]]; then
  "$RESTIC_BIN" --cache-dir /var/cache/restic forget --tag nightly \
    --keep-daily 7 \
    --keep-weekly 4 \
    --keep-monthly 12 \
    --prune
fi
