#!/usr/bin/env bash
set -euo pipefail

project_root="${1:-}"
output_archive="${2:-}"
force="${3:-}"
if [[ -z "$project_root" || -z "$output_archive" || ( -n "$force" && "$force" != "--force" ) ]]; then
  echo "usage: package-handoff.sh <project-root> <output.tar.gz> [--force]" >&2
  exit 2
fi
project_root="$(cd "$project_root" && pwd)"
case "$output_archive" in /*) ;; *) output_archive="$(pwd)/$output_archive" ;; esac
if [[ "$output_archive" != *.tar.gz ]]; then echo "output must end in .tar.gz" >&2; exit 2; fi
if [[ -e "$output_archive" && "$force" != "--force" ]]; then
  echo "refusing to overwrite existing archive; rerun with --force after reviewing the target" >&2
  exit 2
fi

script_dir="$(cd "$(dirname "$0")" && pwd)"
node "$script_dir/validate-handoff.mjs" "$project_root"

archive_dir="$(dirname "$output_archive")"
archive_name="$(basename "$output_archive")"
mkdir -p "$archive_dir"
temporary_dir="$(mktemp -d /tmp/toegisa-handoff.XXXXXX)"
temporary_archive="$temporary_dir/$archive_name"
temporary_log="$temporary_dir/tar.stderr"
cleanup() { rm -f "$temporary_archive" "$temporary_log"; rmdir "$temporary_dir" 2>/dev/null || true; }
trap cleanup EXIT

tar -C "$project_root" -czf "$temporary_archive" \
  --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='.vinext' --exclude='dist' \
  --exclude='.wrangler' --exclude='coverage' --exclude='.env' --exclude='.env.*' \
  --exclude='.DS_Store' \
  --exclude='.dev.vars' --exclude='.npmrc' --exclude='.pypirc' --exclude='.netrc' \
  --exclude='credentials*' --exclude='secrets*' --exclude='service-account*.json' \
  --exclude='*.pem' --exclude='*.key' --exclude='*.p12' --exclude='*.pfx' \
  --exclude='*.sqlite' --exclude='*.sqlite3' --exclude='*.db' --exclude='*.log' \
  --exclude='*.zip' --exclude='*.tar' --exclude='*.tar.gz' --exclude='*.tgz' . 2>"$temporary_log"

if [[ -s "$temporary_log" ]]; then
  cat "$temporary_log" >&2
  exit 1
fi

if tar -tzf "$temporary_archive" | grep -E '(^|/)(\.git|node_modules|\.next|\.vinext|dist|\.wrangler|coverage)(/|$)|(^|/)(\.DS_Store|\.env([^/]*)?|\.dev\.vars|\.npmrc|\.pypirc|\.netrc|credentials[^/]*|secrets?[^/]*|service-account[^/]*\.json)$|\.(pem|key|p12|pfx|sqlite|sqlite3|db|log|zip|tar|tar\.gz|tgz)$' >/dev/null; then
  echo "archive audit found a forbidden path" >&2
  exit 1
fi

mv -f "$temporary_archive" "$output_archive"
cleanup
trap - EXIT
if command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "$output_archive"
elif command -v sha256sum >/dev/null 2>&1; then
  sha256sum "$output_archive"
else
  echo "$output_archive"
fi
