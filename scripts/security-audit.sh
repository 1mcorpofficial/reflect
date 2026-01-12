#!/bin/bash
set -euo pipefail

# Comprehensive security audit script
# Tests: CSRF, rate limits, audit logs, org isolation
# Usage: ./scripts/security-audit.sh [base-url] [port]
# Default: http://localhost:3005

BASE_URL="${1:-http://localhost:3005}"
PORT="${2:-3005}"
LOG_DIR="./logs/audit"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/security-audit-$DATE.txt"

mkdir -p "$LOG_DIR"

echo "=== Security Audit Script ===" | tee "$LOG_FILE"
echo "Base URL: $BASE_URL" | tee -a "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Check if server is running
if ! curl -s "$BASE_URL/api/health" > /dev/null 2>&1; then
  echo "ERROR: Server not running at $BASE_URL" | tee -a "$LOG_FILE"
  echo "Start server with: npm run dev -- --webpack -p $PORT" | tee -a "$LOG_FILE"
  exit 1
fi

echo "✓ Server is running" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Test 1: CSRF Protection
echo "=== Test 1: CSRF Protection ===" | tee -a "$LOG_FILE"
echo "Testing same-origin vs cross-origin requests..." | tee -a "$LOG_FILE"

# Same-origin (should work)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "Origin: $BASE_URL" \
  -d '{"email":"test@example.com","password":"test"}' 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "Same-origin POST /api/auth/login: $HTTP_CODE" | tee -a "$LOG_FILE"
if [ "$HTTP_CODE" != "401" ] && [ "$HTTP_CODE" != "200" ]; then
  echo "⚠ WARNING: Unexpected status code" | tee -a "$LOG_FILE"
fi

# Cross-origin (should be blocked or require CSRF token)
RESPONSE2=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "Origin: http://evil.local" \
  -d '{"email":"test@example.com","password":"test"}' 2>&1)
HTTP_CODE2=$(echo "$RESPONSE2" | tail -1)

echo "Cross-origin POST /api/auth/login: $HTTP_CODE2" | tee -a "$LOG_FILE"
if [ "$HTTP_CODE2" = "403" ]; then
  echo "✓ CSRF protection working (403 for cross-origin)" | tee -a "$LOG_FILE"
else
  echo "⚠ WARNING: CSRF protection may not be working (expected 403, got $HTTP_CODE2)" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"

# Test 2: Rate Limiting
echo "=== Test 2: Rate Limiting ===" | tee -a "$LOG_FILE"
echo "Testing rate limits (sending 15 requests quickly)..." | tee -a "$LOG_FILE"

RATE_LIMIT_HIT=0
for i in {1..15}; do
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -H "Origin: $BASE_URL" \
    -d '{"email":"test@example.com","password":"test"}' 2>&1)
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  
  if [ "$HTTP_CODE" = "429" ]; then
    RATE_LIMIT_HIT=1
    echo "✓ Rate limit triggered at request $i (429)" | tee -a "$LOG_FILE"
    break
  fi
done

if [ "$RATE_LIMIT_HIT" = "0" ]; then
  echo "⚠ WARNING: Rate limit not triggered after 15 requests" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"

# Test 3: Audit Log Coverage
echo "=== Test 3: Audit Log Coverage ===" | tee -a "$LOG_FILE"
echo "Checking if audit logs are created for state-changing operations..." | tee -a "$LOG_FILE"
echo "NOTE: This requires admin access to /api/admin/audit" | tee -a "$LOG_FILE"
echo "Manual verification needed: check audit logs after operations" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Test 4: Org Isolation
echo "=== Test 4: Org Isolation ===" | tee -a "$LOG_FILE"
echo "Running org-isolation test..." | tee -a "$LOG_FILE"

if [ -f "./scripts/org-isolation.sh" ]; then
  PORT="$PORT" ./scripts/org-isolation.sh 2>&1 | tee -a "$LOG_FILE"
else
  echo "⚠ org-isolation.sh not found, skipping" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"

# Test 5: Admin Endpoints Protection
echo "=== Test 5: Admin Endpoints Protection ===" | tee -a "$LOG_FILE"
echo "Testing admin endpoints without authentication..." | tee -a "$LOG_FILE"

ADMIN_ENDPOINTS=(
  "/api/admin/health"
  "/api/admin/audit"
  "/api/admin/orgs"
  "/api/admin/users"
)

for endpoint in "${ADMIN_ENDPOINTS[@]}"; do
  RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint" 2>&1)
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  
  if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "✓ $endpoint: Protected ($HTTP_CODE)" | tee -a "$LOG_FILE"
  else
    echo "⚠ $endpoint: Unexpected status ($HTTP_CODE)" | tee -a "$LOG_FILE"
  fi
done

echo "" | tee -a "$LOG_FILE"

# Summary
echo "=== Summary ===" | tee -a "$LOG_FILE"
echo "Audit completed: $(date)" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Next steps:" | tee -a "$LOG_FILE"
echo "1. Review log file for warnings" | tee -a "$LOG_FILE"
echo "2. Manually verify audit logs in database" | tee -a "$LOG_FILE"
echo "3. Test with real user sessions for full coverage" | tee -a "$LOG_FILE"
