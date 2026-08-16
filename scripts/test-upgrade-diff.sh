#!/bin/bash
# Regression test for scripts/upgrade-diff.sh handling ordinary diff output.

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
test_dir="$(mktemp -d)"
trap 'rm -rf "$test_dir"' EXIT

make_fake_hugo() {
  local target="$1"
  local version="$2"
  local content="$3"

  cat > "$target" <<EOF
#!/bin/bash
set -euo pipefail

if [[ "\${1:-}" == "version" ]]; then
  echo "hugo v${version}+extended"
  exit 0
fi

destination=""
while [[ \$# -gt 0 ]]; do
  case "\$1" in
    --destination)
      destination="\$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

mkdir -p "\$destination"
for index in \$(seq 1 201); do
  printf '%s' '${content}' > "\$destination/\$index.html"
  printf '%05000d\\n' 0 >> "\$destination/\$index.html"
done
EOF
  chmod +x "$target"
}

old_hugo="$test_dir/hugo-old"
new_hugo="$test_dir/hugo-new"
make_fake_hugo "$old_hugo" "0.161.1" "baseline"
make_fake_hugo "$new_hugo" "0.165.0" "current"

summary_output="$(OLD_HUGO="$old_hugo" NEW_HUGO="$new_hugo" bash "$repo_root/scripts/upgrade-diff.sh" --summary)"
grep -Eq 'Changed/added/removed files: [1-9][0-9]*' <<< "$summary_output"

OLD_HUGO="$old_hugo" NEW_HUGO="$new_hugo" bash "$repo_root/scripts/upgrade-diff.sh" > /dev/null
