#!/usr/bin/env bash
set -euo pipefail

# Simple API smoke test script
# Usage: ./scripts/test-api.sh [BASE_URL]

BASE_URL="${1:-http://localhost:3000}"
FAC_EMAIL="${TEST_FAC_EMAIL:-demo@reflectus.local}"
FAC_PASS="${TEST_FAC_PASS:-demo1234}"
GROUP_ID=""
ACTIVITY_ID=""

echo "Testing API at $BASE_URL"
echo ""

# Test 1: Health check
echo "1. Health check..."
HEALTH=$(curl -sS "$BASE_URL/api/health" || echo "FAIL")
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  echo "   ✅ Health check passed"
else
  echo "   ❌ Health check failed"
  exit 1
fi

# Test 2: Facilitator login
echo "2. Facilitator login..."
LOGIN_RESPONSE=$(curl -sS -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -c /tmp/test_cookie.txt \
  -d "{\"email\":\"$FAC_EMAIL\",\"password\":\"$FAC_PASS\"}" || echo "FAIL")

if echo "$LOGIN_RESPONSE" | grep -q '"user"'; then
  echo "   ✅ Login successful"
else
  echo "   ❌ Login failed"
  exit 1
fi

# Test 3: Get groups (requires auth)
echo "3. Get groups..."
GROUPS_RESPONSE=$(curl -sS -b /tmp/test_cookie.txt "$BASE_URL/api/groups" || echo "FAIL")
if echo "$GROUPS_RESPONSE" | grep -q '"groups"'; then
  echo "   ✅ Groups endpoint works"
  # Extract first group ID if available
  GROUP_ID=$(echo "$GROUPS_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || true)
else
  echo "   ⚠️  Groups endpoint returned unexpected response (may be empty)"
fi

# Test 4: Analytics (if we have activity)
if [ -n "$GROUP_ID" ]; then
  echo "4. Get activities..."
  ACTIVITIES_RESPONSE=$(curl -sS -b /tmp/test_cookie.txt "$BASE_URL/api/groups/$GROUP_ID/activities" || echo "FAIL")
  if echo "$ACTIVITIES_RESPONSE" | grep -q '"activities"'; then
    echo "   ✅ Activities endpoint works"
    ACTIVITY_ID=$(echo "$ACTIVITIES_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || true)
    
    if [ -n "$ACTIVITY_ID" ]; then
      echo "5. Analytics endpoint..."
      ANALYTICS=$(curl -sS -b /tmp/test_cookie.txt "$BASE_URL/api/activities/$ACTIVITY_ID/analytics" || echo "FAIL")
      if echo "$ANALYTICS" | grep -q '"activityId"'; then
        echo "   ✅ Analytics endpoint works (no 500)"
      else
        echo "   ⚠️  Analytics endpoint returned unexpected response"
      fi

      echo "6. Export PDF..."
      PDF_STATUS=$(curl -s -o /tmp/test_export.pdf -w "%{http_code}" \
        -b /tmp/test_cookie.txt \
        "$BASE_URL/api/activities/$ACTIVITY_ID/export?format=pdf")
      if [ "$PDF_STATUS" = "200" ] || [ "$PDF_STATUS" = "403" ]; then
        echo "   ✅ PDF export responded ($PDF_STATUS)"
      else
        echo "   ❌ PDF export failed ($PDF_STATUS)"
        exit 1
      fi

      echo "7. Export XLSX..."
      XLSX_STATUS=$(curl -s -o /tmp/test_export.xlsx -w "%{http_code}" \
        -b /tmp/test_cookie.txt \
        "$BASE_URL/api/activities/$ACTIVITY_ID/export?format=xlsx")
      if [ "$XLSX_STATUS" = "200" ] || [ "$XLSX_STATUS" = "403" ]; then
        echo "   ✅ XLSX export responded ($XLSX_STATUS)"
      else
        echo "   ❌ XLSX export failed ($XLSX_STATUS)"
        exit 1
      fi

      echo "8. Responses list..."
      RESP_STATUS=$(curl -s -o /tmp/test_responses.json -w "%{http_code}" \
        -b /tmp/test_cookie.txt \
        "$BASE_URL/api/activities/$ACTIVITY_ID/responses")
      if [ "$RESP_STATUS" = "200" ] || [ "$RESP_STATUS" = "403" ]; then
        echo "   ✅ Responses list responded ($RESP_STATUS)"
      else
        echo "   ❌ Responses list failed ($RESP_STATUS)"
        exit 1
      fi
    fi
  fi
fi

# Cleanup
rm -f /tmp/test_cookie.txt /tmp/test_export.pdf /tmp/test_export.xlsx /tmp/test_responses.json

echo ""
echo "✅ All tests passed!"
