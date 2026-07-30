# AkaFlow — Başlatma Rehberi

## Ön koşullar

- Python 3.11+
- Node.js 20+
- Supabase projesi (Frankfurt önerilir) — migration'lar uygulanmış

## 1. Veritabanı

[`database/README.md`](database/README.md) — migration 001–006 sırayla SQL Editor'de çalıştırın.

## 2. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
copy .env.example .env
# .env doldur
.\.venv\Scripts\python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## 3. Frontend

```powershell
cd frontend
npm install
copy .env.example .env.local
# NEXT_PUBLIC_SUPABASE_* doldur
npm run dev
```

- Landing: http://localhost:3000
- Panel: http://localhost:3000/dashboard
- AI Asistan: http://localhost:3000/assistant
- API: http://localhost:8000/docs

## 4. Docker

```powershell
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Env dosyaları

| Dosya | Değişkenler |
|-------|-------------|
| `backend/.env` | SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, **SUPABASE_SECRET_KEY** |
| `backend/.env` | SMTP_* (Faz 3 hatırlatma), GOOGLE_API_KEY + DATABASE_URL (Faz 4 AI) |
| `frontend/.env.local` | NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY |

### DATABASE_URL (AI agent)

Supabase → Project Settings → Database → Connection string (URI, pooler):

```
postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

## Coolify Deploy (Faz 5)

1. **API uygulaması**
   - Repo: `akaflow-saas`
   - Base Directory: `/`
   - Dockerfile: `backend/Dockerfile`
   - Port: 8000
   - Env: tüm `backend/.env` değişkenleri

2. **Frontend uygulaması**
   - Base Directory: `frontend`
   - Dockerfile: `frontend/Dockerfile`
   - Port: 3000
   - Build args: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - Runtime env: `API_URL=https://api.sizin-domain.com`

3. Domain + HTTPS (Coolify otomatik Let's Encrypt)

4. Smoke test: signup → panel CRUD → dashboard churn → AI asistan

## Bellek bankası

Proje bağlamı: [`memory-bank/`](memory-bank/)
