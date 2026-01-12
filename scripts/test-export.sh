#!/bin/bash
set -euo pipefail

# Export runtime test script
# Tests PDF/XLSX export endpoints
# Usage: ./scripts/test-export.sh [base-url] [activity-id] [cookie]
# Example: ./scripts/test-export.sh http://localhost:3005 <activity-id> "reflectus_session=..."

BASE_URL="${1:-http://localhost:3005}"
ACTIVITY_ID="${2:-}"
COOKIE="${3:-}"
LOG_DIR="./logs/proof"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$LOG_DIR"

echo "=== Export Runtime Test ===" | tee "$LOG_DIR/export-test-$DATE.txt"
echo "Base URL: $BASE_URL" | tee -a "$LOG_DIR/export-test-$DATE.txt"
echo "Activity ID: $ACTIVITY_ID" | tee -a "$LOG_DIR/export-test-$DATE.txt"
echo "Started: $(date)" | tee -a "$LOG_DIR/export-test-$DATE.txt"
echo "" | tee -a "$LOG_DIR/export-test-$DATE.txt"

if [ -z "$ACTIVITY_ID" ]; then
  echo "ERROR: Activity ID required" | tee -a "$LOG_DIR/export-test-$DATE.txt"
  echo "Usage: $0 <base-url> <activity-id> <cookie>" | tee -a "$LOG_DIR/export-test-$DATE.txt"
  exit 1
fi

if [ -z "$COOKIE" ]; then
  echo "WARNING: No cookie provided, tests may fail with 401" | tee -a "$LOG_DIR/export-test-$DATE.txt"
fi

# Test PDF export
echo "=== Testing PDF Export ===" | tee -a "$LOG_DIR/export-test-$DATE.txt"
PDF_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
  "$BASE_URL/api/activities/$ACTIVITY_ID/export?format=pdf" \
  -H "Cookie: $COOKIE" \
  -o "$LOG_DIR/export-test-$DATE.pdf" 2>&1)
PDF_HTTP_CODE=$(echo "$PDF_RESPONSE" | tail -1)
PDF_BODY=$(echo "$PDF_RESPONSE" | head -n -1)

echo "PDF Export HTTP Code: $PDF_HTTP_CODE" | tee -a "$LOG_DIR/export-test-$DATE.txt"
if [ "$PDF_HTTP_CODE" = "200" ]; then
  PDF_SIZE=$(stat -f%z "$LOG_DIR/export-test-$DATE.pdf" 2>/dev/null || stat -c%s "$LOG_DIR/export-test-$DATE.pdf" 2>/dev/null || echo "unknown")
  echo "✓ PDF Export OK (size: $PDF_SIZE bytes)" | tee -a "$LOG_DIR/export-test-$DATE.txt"
  file "$LOG_DIR/export-test-$DATE.pdf" | tee -a "$LOG_DIR/export-test-$DATE.txt"
else
  echo "✗ PDF Export Failed" | tee -a "$LOG_DIR/export-test-$DATE.txt"
  echo "Response: $PDF_BODY" | tee -a "$LOG_DIR/export-test-$DATE.txt"
fi

echo "" | tee -a "$LOG_DIR/export-test-$DATE.txt"

# Test XLSX export
echo "=== Testing XLSX Export ===" | tee -a "$LOG_DIR/export-test-$DATE.txt"
XLSX_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
  "$BASE_URL/api/activities/$ACTIVITY_ID/export?format=xlsx" \
  -H "Cookie: $COOKIE" \
  -o "$LOG_DIR/export-test-$DATE.xlsx" 2>&1)
XLSX_HTTP_CODE=$(echo "$XLSX_RESPONSE" | tail -1)
XLSX_BODY=$(echo "$XLSX_RESPONSE" | head -n -1)

echo "XLSX Export HTTP Code: $XLSX_HTTP_CODE" | tee -a "$LOG_DIR/export-test-$DATE.txt"
if [ "$XLSX_HTTP_CODE" = "200" ]; then
  XLSX_SIZE=$(stat -f%z "$LOG_DIR/export-test-$DATE.xlsx" 2>/dev/null || stat -c%s "$LOG_DIR/export-test-$DATE.xlsx" 2>/dev/null || echo "unknown")
  echo "✓ XLSX Export OK (size: $XLSX_SIZE bytes)" | tee -a "$LOG_DIR/export-test-$DATE.txt"
  file "$LOG_DIR/export-test-$DATE.xlsx" | tee -a "$LOG_DIR/export-test-$DATE.txt"
else
  echo "✗ XLSX Export Failed" | tee -a "$LOG_DIR/export-test-$DATE.txt"
  echo "Response: $XLSX_BODY" | tee -a "$LOG_DIR/export-test-$DATE.txt"
fi

echo "" | tee -a "$LOG_DIR/export-test-$DATE.txt"

# Summary
echo "=== Summary ===" | tee -a "$LOG_DIR/export-test-$DATE.txt"
echo "Test completed: $(date)" | tee -a "$LOG_DIR/export-test-$DATE.txt"
echo "Log file: $LOG_DIR/export-test-$DATE.txt" | tee -a "$LOG_DIR/export-test-$DATE.txt"
if [ "$PDF_HTTP_CODE" = "200" ] && [ "$XLSX_HTTP_CODE" = "200" ]; then
  echo "✅ All exports working" | tee -a "$LOG_DIR/export-test-$DATE.txt"
else
  echo "⚠ Some exports failed" | tee -a "$LOG_DIR/export-test-$DATE.txt"
fi
