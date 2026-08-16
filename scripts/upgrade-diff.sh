#!/bin/bash
# Hugo upgrade diff harness.
# Builds the site with two Hugo versions and diffs the public/ output.
# Used during the 0.161.1 → 0.165.0 upgrade. For pure refactors
# the diff should be empty; for the version bump itself the diff should be
# explainable by the changelog.
#
# Usage:
#   scripts/upgrade-diff.sh                    # full diff, paginated
#   scripts/upgrade-diff.sh --summary          # just changed-file count + names
#   scripts/upgrade-diff.sh --warnings         # capture deprecation warnings only
#
# Requires Hugo binaries at /private/tmp/hugo-bin/{0.161.1,0.165.0}/hugo. Set
# OLD_HUGO and NEW_HUGO to override.

set -euo pipefail

OLD_HUGO="${OLD_HUGO:-/private/tmp/hugo-bin/0.161.1/hugo}"
NEW_HUGO="${NEW_HUGO:-/private/tmp/hugo-bin/0.165.0/hugo}"
WORK_DIR="$(mktemp -d)"
BASELINE_DIR="$WORK_DIR/baseline"
CURRENT_DIR="$WORK_DIR/current"
WARNINGS_DIR="$WORK_DIR/warnings"
trap 'rm -rf "$WORK_DIR"' EXIT

mode="${1:-full}"

cd "$(dirname "$0")/.."

if [[ ! -x "$OLD_HUGO" ]]; then
  echo "OLD_HUGO not found at $OLD_HUGO" >&2; exit 1
fi
if [[ ! -x "$NEW_HUGO" ]]; then
  echo "NEW_HUGO not found at $NEW_HUGO" >&2; exit 1
fi

mkdir -p "$WARNINGS_DIR"

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
  diff_args=(-rq)
else
  diff_args=(-r)
fi

set +e
diff_output="$(diff "${diff_args[@]}" "$BASELINE_DIR" "$CURRENT_DIR")"
diff_status=$?
set -e

if (( diff_status > 1 )); then
  echo "Diff failed with status $diff_status" >&2
  exit "$diff_status"
fi

if [[ "$mode" == "--summary" ]]; then
  if [[ -z "$diff_output" ]]; then
    changed=0
  else
    changed=$(printf '%s\n' "$diff_output" | wc -l | tr -d ' ')
  fi
  echo "Changed/added/removed files: $changed"
  printf '%s\n' "$diff_output" | awk 'NR <= 50 { print }'
  exit 0
fi

echo "=== diff -r (paginated) ==="
printf '%s\n' "$diff_output" | awk 'NR <= 200 { print }'
