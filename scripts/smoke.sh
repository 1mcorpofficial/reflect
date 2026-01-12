#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
BASE="http://localhost:${PORT}"
FAC_EMAIL="${FAC_EMAIL:-demo@reflectus.local}"
FAC_PASS="${FAC_PASS:-demo1234}"
GROUP_CODE="${GROUP_CODE:-DEMO1}"
PERSONAL_CODE="${PERSONAL_CODE:-CODE1234}"

FAC_COOKIE="$(mktemp)"
PART_COOKIE="$(mktemp)"

function cleanup {
  rm -f "$FAC_COOKIE" "$PART_COOKIE"
}
trap cleanup EXIT

echo "Using BASE=$BASE"

echo "--- facilitator login ---"
curl -sS -X POST "$BASE/api/auth/login" \
  -H 'content-type: application/json' \
  -c "$FAC_COOKIE" \
  --data "{\"email\":\"$FAC_EMAIL\",\"password\":\"$FAC_PASS\"}" | tee /tmp/smoke_fac_login.json

echo
echo "--- facilitator groups ---"
curl -sS "$BASE/api/groups" -b "$FAC_COOKIE" | tee /tmp/smoke_fac_groups.json

echo
echo "--- participant login ---"
curl -sS -X POST "$BASE/api/participants/login" \
  -H 'content-type: application/json' \
  -c "$PART_COOKIE" \
  --data "{\"groupCode\":\"$GROUP_CODE\",\"personalCode\":\"$PERSONAL_CODE\"}" | tee /tmp/smoke_part_login.json

echo
echo "--- participant activities ---"
curl -sS "$BASE/api/participants/activities" -b "$PART_COOKIE" | tee /tmp/smoke_part_activities.json

ACTIVITY_ID=$(node -e 'const d=require("/tmp/smoke_part_activities.json"); const first=(d.activities&&d.activities[0])||{}; console.log(first.id||"");')
if [ -z "$ACTIVITY_ID" ]; then
  echo "No activity found; skipping analytics/export"
  exit 0
fi

echo
echo "--- analytics ---"
curl -sS "$BASE/api/activities/${ACTIVITY_ID}/analytics" -b "$FAC_COOKIE" | tee /tmp/smoke_analytics.json

echo
echo "--- export csv ---"
curl -sS -D /tmp/smoke_export_headers.txt "$BASE/api/activities/${ACTIVITY_ID}/export?format=csv" -b "$FAC_COOKIE" -o /tmp/smoke_export.csv
head -n 5 /tmp/smoke_export_headers.txt
head -n 2 /tmp/smoke_export.csv

echo
echo "Smoke complete."
