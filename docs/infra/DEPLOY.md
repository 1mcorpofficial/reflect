# Deployment Guide

**Data:** 2026-01-11  
**Status:** Production-ready baseline

---

## Overview

This guide covers deploying Reflectus using Docker Compose.

---

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- At least 2GB RAM
- PostgreSQL 16+ (or use Docker image)

---

## Quick Start

### 1. Environment Setup

Copy and edit environment variables:

```bash
cp env.example .env.production
```

Edit `.env.production`:

```env
# Database
POSTGRES_USER=reflectus
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=reflectus
POSTGRES_PORT=5432

# App
APP_PORT=3000
AUTH_SECRET=<generate-strong-secret>
ADMIN_EMAILS=admin@example.com,admin2@example.com

# Database URL (for app)
DATABASE_URL=postgresql://reflectus:<password>@db:5432/reflectus
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 2. Build and Start

```bash
# Build and start
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f app

# Check health
curl http://localhost:3000/api/health
```

### 3. Database Migrations

```bash
# Run migrations
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# (Optional) Seed database
docker compose -f docker-compose.prod.yml exec app npm run db:seed
```

---

## Production Considerations

### Security

1. **Secrets Management:**
   - Never commit `.env.production` to Git
   - Use environment variables or secret management (e.g., Docker secrets, Kubernetes secrets)
   - Rotate `AUTH_SECRET` periodically

2. **Network:**
   - Use reverse proxy (nginx, Traefik) in front of app
   - Enable HTTPS/TLS
   - Restrict database port (don't expose 5432 publicly)

3. **Database:**
   - Use strong passwords
   - Enable SSL/TLS for database connections
   - Regular backups (see `BACKUP_RESTORE.md`)

### Reverse Proxy (nginx example)

```nginx
server {
    listen 80;
    server_name reflectus.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL/TLS

Use Let's Encrypt with Certbot:

```bash
certbot --nginx -d reflectus.example.com
```

---

## Monitoring

### Health Checks

- Endpoint: `GET /api/health`
- Returns: `{ status: "ok", db: "ok", timestamp }`
- Used by Docker healthcheck and load balancers

### Logs

```bash
# App logs
docker compose -f docker-compose.prod.yml logs -f app

# Database logs
docker compose -f docker-compose.prod.yml logs -f db

# All logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## Updates

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

### Rollback

```bash
# Stop current version
docker compose -f docker-compose.prod.yml down

# Checkout previous version
git checkout <previous-commit>

# Rebuild and start
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Troubleshooting

### App won't start

1. Check logs: `docker compose -f docker-compose.prod.yml logs app`
2. Verify environment variables: `docker compose -f docker-compose.prod.yml exec app env`
3. Check database connection: `docker compose -f docker-compose.prod.yml exec app npx prisma db pull`

### Database connection errors

1. Verify database is healthy: `docker compose -f docker-compose.prod.yml ps`
2. Check DATABASE_URL format
3. Verify network: `docker compose -f docker-compose.prod.yml exec app ping db`

### Health check failing

1. Check if app is running: `curl http://localhost:3000/api/health`
2. Check database connection in app logs
3. Verify migrations: `docker compose -f docker-compose.prod.yml exec app npx prisma migrate status`

---

## Backup Strategy

See `BACKUP_RESTORE.md` for detailed backup/restore procedures.

---

## Notes

- App runs as non-root user (nextjs:nodejs)
- Database data persists in Docker volume `postgres_data`
- Health checks run every 30s
- App restarts automatically on failure (unless-stopped)
