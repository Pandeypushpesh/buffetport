# Docker Guide

Complete guide for running the portfolio website with Docker and Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

### Production Build

1. **Create `.env` file** in project root:
```bash
cp .env.example .env
# Edit .env and add your SMTP credentials
```

2. **Build and start services:**
```bash
docker-compose up -d
```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Development Mode

1. **Start development services:**
```bash
docker-compose -f docker-compose.dev.yml up
```

2. **Access the application:**
   - Frontend: http://localhost:5173 (with hot reload)
   - Backend: http://localhost:5000 (with hot reload)

## Docker Commands

### Build Images

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache
docker-compose build --no-cache
```

### Start Services

```bash
# Start in detached mode
docker-compose up -d

# Start with logs
docker-compose up

# Start specific service
docker-compose up backend
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100
```

### Execute Commands

```bash
# Run command in backend container
docker-compose exec backend npm test

# Access shell in container
docker-compose exec backend sh
docker-compose exec frontend sh
```

### Rebuild After Changes

```bash
# Rebuild and restart
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
```

## Environment Variables

### Using .env File

Create `.env` file in project root:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# Optional
SENDER_NAME=Your Name
EMAIL_SUBJECT=Your Requested Resume
```

### Using Environment Variables Directly

```bash
SMTP_HOST=smtp.gmail.com SMTP_USER=email@example.com docker-compose up
```

## Production Deployment

### Build for Production

```bash
# Build production images
docker-compose build

# Tag and push to registry (example)
docker tag portfolio-backend:latest your-registry/portfolio-backend:latest
docker push your-registry/portfolio-backend:latest
```

### Production docker-compose.yml

For production, you may want to:
1. Remove development volumes
2. Use specific image tags
3. Add resource limits
4. Configure logging
5. Set up health checks

Example production configuration:

```yaml
services:
  backend:
    image: your-registry/portfolio-backend:latest
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Check container status
docker-compose ps

# Restart service
docker-compose restart backend
```

### Port Already in Use

```bash
# Change ports in docker-compose.yml
ports:
  - "3001:80"  # Instead of 3000:80
```

### Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Or run with sudo (not recommended)
sudo docker-compose up
```

### Clear Everything and Start Fresh

```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker-compose rm -f

# Remove volumes
docker volume prune

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

## Health Checks

Both services include health checks:

```bash
# Check health status
docker-compose ps

# Manual health check
curl http://localhost:5000/api/health
curl http://localhost:3000/health
```

## Volume Mounts

### Development

- Source code is mounted for hot reload
- `node_modules` excluded via anonymous volume
- Changes reflect immediately

### Production

- Only resume file mounted (read-only)
- No source code mounting
- Optimized for performance

## Networking

Services communicate via `portfolio-network`:

- Frontend can reach backend at `http://backend:5000`
- Backend can reach frontend at `http://frontend:80`
- External access via published ports

## Resource Usage

### Check Resource Usage

```bash
# Container stats
docker stats

# Specific container
docker stats portfolio-backend
```

### Set Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
```

## Backup and Restore

### Backup Resume File

```bash
# Copy resume from container
docker cp portfolio-backend:/app/assets/resume.pdf ./backup-resume.pdf
```

### Restore Resume File

```bash
# Copy resume to container
docker cp ./resume.pdf portfolio-backend:/app/assets/resume.pdf
docker-compose restart backend
```

## Multi-Stage Builds

Frontend uses multi-stage build:
- Stage 1: Build with Node.js
- Stage 2: Serve with Nginx (smaller image)

This reduces final image size significantly.

## Security Best Practices

1. **Don't commit `.env` files**
2. **Use secrets management** for production
3. **Run as non-root user** (if needed)
4. **Keep images updated**
5. **Scan for vulnerabilities:**
   ```bash
   docker scan portfolio-backend
   ```

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Build and Push
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build images
        run: docker-compose build
      - name: Push to registry
        run: |
          docker push your-registry/portfolio-backend:latest
          docker push your-registry/portfolio-frontend:latest
```

## Useful Commands Reference

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Restart service
docker-compose restart backend

# Scale service (if needed)
docker-compose up -d --scale backend=2

# Execute command
docker-compose exec backend npm test

# Remove everything
docker-compose down -v --rmi all
```

