# AkaFlow Altyapı

## Coolify (önerilen — Faz 5)

Backend + frontend ayrı Coolify uygulamaları olarak deploy edilir.

| Servis | Build Context | Dockerfile | Port |
|--------|---------------|------------|------|
| API | repo kökü (`.`) | `backend/Dockerfile` | 8000 |
| Panel | `frontend/` | `frontend/Dockerfile` | 3000 |

### API env (Coolify secret)

```
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
CORS_ALLOWED_ORIGINS=https://panel.sizin-domain.com
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
GOOGLE_API_KEY
DATABASE_URL
REMINDER_DAYS_BEFORE=3
ENABLE_SCHEDULER=true
```

### Frontend env

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
API_URL=https://api.sizin-domain.com
```

Detaylı adımlar: [`BASLATMA.md`](../BASLATMA.md) → Coolify Deploy

## Docker Compose (lokal / staging)

```bash
# Sadece backend
docker compose up -d --build

# Backend + frontend birlikte
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Build context repo kökünden gelir; `models/` ve `data/` API image'ına kopyalanır.

## Güvenlik

- `.env` dosyaları repoda yok — Coolify/host secret store kullanın
- `DATABASE_URL` yalnızca backend'de; AI agent read-only SELECT yapar
- Production'da CORS origin'i panel domain'inize sabitleyin
