#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
BASE="http://localhost:${PORT}"
TS="$(date +%s)"

FAC_EMAIL="${FAC_EMAIL:-demo@reflectus.local}"
FAC_PASS="${FAC_PASS:-demo1234}"
ORG_B_NAME="Org Isolation B ${TS}"

FAC_COOKIE_A="$(mktemp)"
FAC_COOKIE_B="$(mktemp)"

CURL_JSON_OPTS=(-m 60 -sS --retry 2 --retry-delay 2)
CURL_CODE_OPTS=(-m 30 -sS --retry 2 --retry-delay 2)

cleanup() {
  rm -f "$FAC_COOKIE_A" "$FAC_COOKIE_B"
}
trap cleanup EXIT

echo "Using BASE=$BASE"

echo "--- facilitator login (A) ---"
curl "${CURL_JSON_OPTS[@]}" -X POST "$BASE/api/auth/login" \
  -H 'content-type: application/json' \
  -c "$FAC_COOKIE_A" \
  --data "{\"email\":\"$FAC_EMAIL\",\"password\":\"$FAC_PASS\"}" \
  | tee /tmp/org_isolation_login_a.json

echo
echo "--- create org B (new org context) ---"
curl "${CURL_JSON_OPTS[@]}" -X POST "$BASE/api/orgs" \
  -H 'content-type: application/json' \
  -b "$FAC_COOKIE_A" \
  -c "$FAC_COOKIE_B" \
  --data "{\"name\":\"$ORG_B_NAME\"}" \
  | tee /tmp/org_isolation_org_b.json

echo
echo "--- create group (A) ---"
curl "${CURL_JSON_OPTS[@]}" -X POST "$BASE/api/groups" \
  -H 'content-type: application/json' \
  -b "$FAC_COOKIE_A" \
  --data "{\"name\":\"Org A Group\",\"description\":\"Isolation test\"}" \
  | tee /tmp/org_isolation_group.json

GROUP_ID="$(node -e 'const d=require("/tmp/org_isolation_group.json"); console.log((d.group&&d.group.id)||"")')"
if [ -z "$GROUP_ID" ]; then
  echo "Failed to create group for A" >&2
  exit 1
fi
echo "Group ID: $GROUP_ID"

echo
echo "--- create activity (A) ---"
cat > /tmp/org_isolation_activity.json <<EOF
{
  "groupId": "${GROUP_ID}",
  "title": "Isolation Activity",
  "description": "Org isolation test",
  "privacyMode": "NAMED",
  "questions": [
    {
      "prompt": "Kaip pavyko pamoka?",
      "type": "TRAFFIC_LIGHT",
      "config": { "options": [
        { "value": "green", "label": "Puikiai" },
        { "value": "yellow", "label": "Vidutiniskai" },
        { "value": "red", "label": "Sunkiai" }
      ] }
    }
  ]
}
EOF

curl "${CURL_JSON_OPTS[@]}" -X POST "$BASE/api/activities" \
  -H 'content-type: application/json' \
  -b "$FAC_COOKIE_A" \
  --data @/tmp/org_isolation_activity.json \
  | tee /tmp/org_isolation_activity_response.json

ACTIVITY_ID="$(node -e 'const d=require("/tmp/org_isolation_activity_response.json"); console.log((d.activity&&d.activity.id)||"")')"
if [ -z "$ACTIVITY_ID" ]; then
  echo "Failed to create activity for A" >&2
  exit 1
fi
echo "Activity ID: $ACTIVITY_ID"

echo
echo "--- cross-org checks (B should be forbidden) ---"

code_groups=$(curl "${CURL_CODE_OPTS[@]}" -o /tmp/org_isolation_groups_b.json -w "%{http_code}" "$BASE/api/groups" -b "$FAC_COOKIE_B")
echo "B groups list HTTP $code_groups"

code_participants=$(curl "${CURL_CODE_OPTS[@]}" -o /tmp/org_isolation_participants_b.json -w "%{http_code}" "$BASE/api/groups/${GROUP_ID}/participants" -b "$FAC_COOKIE_B")
echo "B group participants HTTP $code_participants"

code_analytics=$(curl "${CURL_CODE_OPTS[@]}" -o /tmp/org_isolation_analytics_b.json -w "%{http_code}" "$BASE/api/activities/${ACTIVITY_ID}/analytics" -b "$FAC_COOKIE_B")
echo "B analytics HTTP $code_analytics"

code_export=$(curl "${CURL_CODE_OPTS[@]}" -o /tmp/org_isolation_export_b.json -w "%{http_code}" "$BASE/api/activities/${ACTIVITY_ID}/export?format=csv" -b "$FAC_COOKIE_B")
echo "B export HTTP $code_export"

echo
echo "Org isolation check complete."
