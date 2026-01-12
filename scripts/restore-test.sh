#!/bin/bash
set -euo pipefail

# Restore test script for Reflectus PostgreSQL database
# Usage: ./scripts/restore-test.sh <backup-file>
# Example: ./scripts/restore-test.sh backups/backup_20260112_120000.dump.gz

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup-file> [docker-compose-file]"
  echo "Example: $0 backups/backup_20260112_120000.dump.gz"
  exit 1
fi

BACKUP_FILE="$1"
COMPOSE_FILE="${2:-docker-compose.prod.yml}"
TEST_DB="reflectus_test_restore"

echo "=== Reflectus Database Restore Test ==="
echo "Backup file: $BACKUP_FILE"
echo "Test database: $TEST_DB"
echo ""

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file '$BACKUP_FILE' not found"
  exit 1
fi

# Check if docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Error: Compose file '$COMPOSE_FILE' not found"
  exit 1
fi

# Check if database container is running
if ! docker compose -f "$COMPOSE_FILE" ps db | grep -q "Up"; then
  echo "Error: Database container is not running"
  echo "Start it with: docker compose -f $COMPOSE_FILE up -d db"
  exit 1
fi

# Decompress if needed
TEMP_BACKUP="$BACKUP_FILE"
if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo "Decompressing backup..."
  TEMP_BACKUP="${BACKUP_FILE%.gz}"
  gunzip -c "$BACKUP_FILE" > "$TEMP_BACKUP"
  trap "rm -f $TEMP_BACKUP" EXIT
fi

# Create test database
echo "Creating test database: $TEST_DB"
docker compose -f "$COMPOSE_FILE" exec -T db psql -U postgres -c "DROP DATABASE IF EXISTS $TEST_DB;" || true
docker compose -f "$COMPOSE_FILE" exec -T db psql -U postgres -c "CREATE DATABASE $TEST_DB;"

# Restore backup
echo "Restoring backup to test database..."
cat "$TEMP_BACKUP" | \
  docker compose -f "$COMPOSE_FILE" exec -T db pg_restore \
    -U postgres \
    -d "$TEST_DB" \
    -c \
    --no-owner \
    --no-privileges

if [ $? -eq 0 ]; then
  echo "✓ Restore completed"
  
  # Verify restore
  echo "Verifying restore..."
  USER_COUNT=$(docker compose -f "$COMPOSE_FILE" exec -T db psql -U postgres -d "$TEST_DB" -t -c "SELECT COUNT(*) FROM \"User\";" | tr -d ' ')
  ACTIVITY_COUNT=$(docker compose -f "$COMPOSE_FILE" exec -T db psql -U postgres -d "$TEST_DB" -t -c "SELECT COUNT(*) FROM \"Activity\";" | tr -d ' ')
  
  echo "✓ Users in restored database: $USER_COUNT"
  echo "✓ Activities in restored database: $ACTIVITY_COUNT"
  echo ""
  echo "✓ Restore test completed successfully"
  
  # Cleanup
  echo "Cleaning up test database..."
  docker compose -f "$COMPOSE_FILE" exec -T db psql -U postgres -c "DROP DATABASE $TEST_DB;"
  echo "✓ Test database removed"
else
  echo "✗ Restore failed"
  # Cleanup on failure
  docker compose -f "$COMPOSE_FILE" exec -T db psql -U postgres -c "DROP DATABASE IF EXISTS $TEST_DB;" || true
  exit 1
fi
