# AkaFlow Altyapı

## Coolify (önerilen)

Backend + frontend ayrı Coolify uygulamaları olarak deploy edilir.

| Servis | Base Directory | Port | Dockerfile |
|--------|----------------|------|------------|
| API | `backend` | 8000 | `backend/Dockerfile` |
| Panel | `frontend` | 3000 | `frontend/Dockerfile` |

Adım adım: [`BASLATMA.md`](../BASLATMA.md) → **Coolify Deploy**

## Docker Compose

```bash
# Sadece backend
docker compose up -d --build

# Backend + frontend birlikte
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Faz 4 (planlanan)

- n8n servisi
- Domain + HTTPS (Coolify otomatik Let's Encrypt)
- Secret'ları repo dışına taşıma
