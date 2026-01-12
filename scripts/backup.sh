#!/bin/bash
set -euo pipefail

# Backup script for Reflectus PostgreSQL database
# Usage: ./scripts/backup.sh [docker-compose-file]
# Default: docker-compose.prod.yml

COMPOSE_FILE="${1:-docker-compose.prod.yml}"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="backup_${DATE}.dump"

mkdir -p "$BACKUP_DIR"

echo "=== Reflectus Database Backup ==="
echo "Creating backup: $FILENAME"
echo "Using compose file: $COMPOSE_FILE"
echo ""

# Check if docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Error: Compose file '$COMPOSE_FILE' not found"
  exit 1
fi

# Create backup using pg_dump
if docker compose -f "$COMPOSE_FILE" ps db | grep -q "Up"; then
  echo "Database container is running, creating backup..."
  docker compose -f "$COMPOSE_FILE" exec -T db pg_dump \
    -U postgres \
    -Fc \
    reflectus > "$BACKUP_DIR/$FILENAME"
  
  if [ $? -eq 0 ]; then
    echo "✓ Backup created: $BACKUP_DIR/$FILENAME"
    
    # Compress backup
    echo "Compressing backup..."
    gzip "$BACKUP_DIR/$FILENAME"
    echo "✓ Compressed: $BACKUP_DIR/${FILENAME}.gz"
    
    # Rotate backups (keep last 7 days)
    echo "Rotating backups (keeping last 7 days)..."
    find "$BACKUP_DIR" -name "backup_*.dump.gz" -mtime +7 -delete
    echo "✓ Backup rotation complete"
    
    # Show backup size
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/${FILENAME}.gz" | cut -f1)
    echo "Backup size: $BACKUP_SIZE"
    echo ""
    echo "✓ Backup completed successfully"
  else
    echo "✗ Backup failed"
    exit 1
  fi
else
  echo "Error: Database container is not running"
  echo "Start it with: docker compose -f $COMPOSE_FILE up -d db"
  exit 1
fi
