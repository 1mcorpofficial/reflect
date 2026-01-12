#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_FILE="$ROOT_DIR/docs/audit/AUDIT_CONTEXT.md"

timestamp="$(date -Is)"

{
  echo "# AUDIT_CONTEXT"
  echo
  echo "Generated: \`$timestamp\`"
  echo
  echo "## Commands"
  echo
  echo "\`pwd\`"
  pwd
  echo
  echo "\`git status --porcelain=v1 -b\`"
  git status --porcelain=v1 -b
  echo
  echo "\`git rev-parse --abbrev-ref HEAD\`"
  git rev-parse --abbrev-ref HEAD
  echo
  echo "\`git log -n 10 --oneline --decorate\`"
  git log -n 10 --oneline --decorate
  echo
  echo "\`git remote -v\`"
  git remote -v || true
  echo
  echo "\`node -v\`"
  node -v
  echo
  echo "\`npm -v\`"
  npm -v
  echo
  echo "\`docker --version\`"
  docker --version
  echo
  echo "\`docker compose version\`"
  docker compose version
  echo
  echo "\`npx prisma -v\`"
  npx prisma -v
  echo
  echo "\`ss -ltnp | rg :5432\` (port check)"
  ss -ltnp | rg ':5432' || true
} >"$OUT_FILE"

echo "Wrote audit to $OUT_FILE"
