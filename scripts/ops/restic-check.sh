#!/bin/bash
# Full weekly verification is practical for this small repository. A random
# 10% sample does not guarantee complete coverage after ten runs.
set -euo pipefail
umask 077
set -a
. /etc/restic/r2-credentials.env
set +a
export RESTIC_PASSWORD_FILE=/etc/restic/passphrase
echo "restic-check starting at $(date -u +'%Y-%m-%d %H:%M:%S UTC')"
/usr/local/bin/restic --cache-dir /var/cache/restic check --read-data
echo "restic-check OK at $(date -u +'%Y-%m-%d %H:%M:%S UTC')"
