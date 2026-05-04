#!/bin/bash
# Hugo upgrade diff harness.
# Builds the site with two Hugo versions and diffs the public/ output.
# Used during the 0.157 → 0.161 upgrade (HUGO_UPGRADE.md). For pure refactors
# the diff should be empty; for the version bump itself the diff should be
# explainable by the changelog.
#
# Usage:
#   scripts/upgrade-diff.sh                    # full diff, paginated
#   scripts/upgrade-diff.sh --summary          # just changed-file count + names
#   scripts/upgrade-diff.sh --warnings         # capture deprecation warnings only
#
# Requires Hugo binaries at /tmp/hugo-bin/{old,new}-extract/hugo. Set OLD_HUGO
# and NEW_HUGO to override.

set -euo pipefail

OLD_HUGO="${OLD_HUGO:-/tmp/hugo-bin/0.157.0-extract/hugo}"
NEW_HUGO="${NEW_HUGO:-/tmp/hugo-bin/0.161.1-extract/hugo}"
BASELINE_DIR="/tmp/hugo-baseline"
CURRENT_DIR="/tmp/hugo-current"
WARNINGS_DIR="/tmp/hugo-warnings"

mode="${1:-full}"

cd "$(dirname "$0")/.."

if [[ ! -x "$OLD_HUGO" ]]; then
  echo "OLD_HUGO not found at $OLD_HUGO" >&2; exit 1
fi
if [[ ! -x "$NEW_HUGO" ]]; then
  echo "NEW_HUGO not found at $NEW_HUGO" >&2; exit 1
fi

mkdir -p "$WARNINGS_DIR"
# Clean stale output to prevent misleading diffs from partial prior runs.
rm -rf "$BASELINE_DIR" "$CURRENT_DIR"

echo "=== Building baseline ($($OLD_HUGO version | awk '{print $2}')) ==="
"$OLD_HUGO" --minify --destination "$BASELINE_DIR" --quiet 2> "$WARNINGS_DIR/baseline.log" || {
  echo "Baseline build failed; see $WARNINGS_DIR/baseline.log"; exit 2;
}

echo "=== Building current ($($NEW_HUGO version | awk '{print $2}')) ==="
"$NEW_HUGO" --minify --destination "$CURRENT_DIR" --quiet 2> "$WARNINGS_DIR/current.log" || {
  echo "Current build failed; see $WARNINGS_DIR/current.log"; exit 2;
}

baseline_pages=$(find "$BASELINE_DIR" -name "*.html" | wc -l | tr -d ' ')
current_pages=$(find "$CURRENT_DIR" -name "*.html" | wc -l | tr -d ' ')
echo "Pages: baseline=$baseline_pages current=$current_pages"

if [[ "$mode" == "--warnings" ]]; then
  echo "=== Deprecation warnings (current build) ==="
  grep -iE "deprecat|warn" "$WARNINGS_DIR/current.log" | sort -u || echo "(none)"
  exit 0
fi

if [[ "$mode" == "--summary" ]]; then
  changed=$(diff -rq "$BASELINE_DIR" "$CURRENT_DIR" 2>/dev/null | wc -l | tr -d ' ')
  echo "Changed/added/removed files: $changed"
  diff -rq "$BASELINE_DIR" "$CURRENT_DIR" 2>/dev/null | head -50
  exit 0
fi

echo "=== diff -r (paginated) ==="
diff -r "$BASELINE_DIR" "$CURRENT_DIR" | head -200
