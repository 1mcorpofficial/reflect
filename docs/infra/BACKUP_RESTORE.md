# Backup and Restore Guide

**Data:** 2026-01-11  
**Status:** Production-ready baseline

---

## Overview

This guide covers backing up and restoring the Reflectus PostgreSQL database.

---

## Backup

### Method 1: pg_dump (Custom Format - Recommended)

**Advantages:**
- Compressed
- Fast restore
- Selective restore (tables, schemas)

**Command:**
```bash
# Backup
docker compose -f docker-compose.prod.yml exec db pg_dump \
  -U postgres \
  -Fc \
  -f /tmp/backup_$(date +%Y%m%d_%H%M%S).dump \
  reflectus

# Copy from container
docker compose -f docker-compose.prod.yml cp db:/tmp/backup_YYYYMMDD_HHMMSS.dump ./backups/
```

**Or directly to host:**
```bash
docker compose -f docker-compose.prod.yml exec -T db pg_dump \
  -U postgres \
  -Fc \
  reflectus > backups/backup_$(date +%Y%m%d_%H%M%S).dump
```

### Method 2: pg_dump (Plain SQL)

**Advantages:**
- Human-readable
- Easy to edit
- Works with any PostgreSQL version

**Command:**
```bash
docker compose -f docker-compose.prod.yml exec -T db pg_dump \
  -U postgres \
  -Fp \
  reflectus > backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

### Method 3: Volume Backup

**For complete database state:**
```bash
# Stop database
docker compose -f docker-compose.prod.yml stop db

# Backup volume
docker run --rm \
  -v reflectus-app_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/postgres_data_$(date +%Y%m%d_%H%M%S).tar.gz /data

# Start database
docker compose -f docker-compose.prod.yml start db
```

---

## Restore

### Method 1: pg_restore (Custom Format)

```bash
# Copy backup to container
docker compose -f docker-compose.prod.yml cp backups/backup_YYYYMMDD_HHMMSS.dump db:/tmp/

# Restore
docker compose -f docker-compose.prod.yml exec db pg_restore \
  -U postgres \
  -d reflectus \
  -c \
  /tmp/backup_YYYYMMDD_HHMMSS.dump
```

**Or directly from host:**
```bash
cat backups/backup_YYYYMMDD_HHMMSS.dump | \
  docker compose -f docker-compose.prod.yml exec -T db pg_restore \
    -U postgres \
    -d reflectus \
    -c
```

### Method 2: psql (Plain SQL)

```bash
cat backups/backup_YYYYMMDD_HHMMSS.sql | \
  docker compose -f docker-compose.prod.yml exec -T db psql \
    -U postgres \
    -d reflectus
```

### Method 3: Volume Restore

```bash
# Stop database
docker compose -f docker-compose.prod.yml stop db

# Remove old volume
docker volume rm reflectus-app_postgres_data

# Restore volume
docker run --rm \
  -v reflectus-app_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  alpine sh -c "cd /data && tar xzf /backup/postgres_data_YYYYMMDD_HHMMSS.tar.gz"

# Start database
docker compose -f docker-compose.prod.yml start db
```

---

## Automated Backup Script

Create `scripts/backup.sh`:

```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="backup_${DATE}.dump"

mkdir -p "$BACKUP_DIR"

echo "Creating backup: $FILENAME"

docker compose -f docker-compose.prod.yml exec -T db pg_dump \
  -U postgres \
  -Fc \
  reflectus > "$BACKUP_DIR/$FILENAME"

# Compress (optional)
gzip "$BACKUP_DIR/$FILENAME"

echo "Backup created: $BACKUP_DIR/${FILENAME}.gz"

# Rotate backups (keep last 7 days)
find "$BACKUP_DIR" -name "backup_*.dump.gz" -mtime +7 -delete

echo "Backup rotation complete"
```

**Make executable:**
```bash
chmod +x scripts/backup.sh
```

**Cron job (daily at 2 AM):**
```bash
0 2 * * * cd /path/to/reflectus-app && ./scripts/backup.sh
```

---

## Backup Rotation Strategy

### Recommended Retention

- **Daily backups:** Keep last 7 days
- **Weekly backups:** Keep last 4 weeks
- **Monthly backups:** Keep last 12 months

### Implementation

```bash
# Daily (keep 7 days)
find backups/ -name "backup_*.dump.gz" -mtime +7 -delete

# Weekly (keep 4 weeks)
find backups/ -name "backup_weekly_*.dump.gz" -mtime +28 -delete

# Monthly (keep 12 months)
find backups/ -name "backup_monthly_*.dump.gz" -mtime +365 -delete
```

---

## Encryption

### Encrypt Backup

```bash
# Create encrypted backup
gpg --symmetric --cipher-algo AES256 \
  backups/backup_YYYYMMDD_HHMMSS.dump

# Decrypt
gpg --decrypt backups/backup_YYYYMMDD_HHMMSS.dump.gpg > backup.dump
```

### Store Encrypted Backups

- **Local:** Encrypted filesystem
- **Cloud:** S3 with encryption, encrypted volumes
- **Offsite:** Encrypted external drives

---

## Testing Restore

**Always test restore procedure:**

```bash
# Create test database
docker compose -f docker-compose.prod.yml exec db psql \
  -U postgres \
  -c "CREATE DATABASE reflectus_test;"

# Restore to test database
cat backups/backup_YYYYMMDD_HHMMSS.dump | \
  docker compose -f docker-compose.prod.yml exec -T db pg_restore \
    -U postgres \
    -d reflectus_test \
    -c

# Verify
docker compose -f docker-compose.prod.yml exec db psql \
  -U postgres \
  -d reflectus_test \
  -c "SELECT COUNT(*) FROM \"User\";"

# Cleanup
docker compose -f docker-compose.prod.yml exec db psql \
  -U postgres \
  -c "DROP DATABASE reflectus_test;"
```

---

## Disaster Recovery

### Complete Restore Procedure

1. **Stop application:**
   ```bash
   docker compose -f docker-compose.prod.yml down
   ```

2. **Restore database:**
   ```bash
   # See restore methods above
   ```

3. **Run migrations (if needed):**
   ```bash
   docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
   ```

4. **Start application:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

5. **Verify:**
   ```bash
   curl http://localhost:3000/api/health
   ```

---

## Notes

- Always backup before major updates
- Test restore procedure regularly
- Store backups offsite
- Encrypt sensitive backups
- Document backup schedule and retention policy
