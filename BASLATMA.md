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

## Render Deploy (ücretsiz — backend API)

Kökte [`render.yaml`](render.yaml) var. **Dockerfile repo kökünde değil** — Render'da mutlaka şu ikisi ayarlanmalı:

| Alan | Değer |
|------|-------|
| Dockerfile Path | `backend/Dockerfile` |
| Docker Context | `.` (repo kökü) |

**Manuel Web Service:** Settings → Build → yukarıdaki path'ler. Root Directory boş kalsın.

**Blueprint:** New → Blueprint → repo → env değişkenlerini dashboard'dan doldur → Deploy.

Deploy sonrası: `https://akaflow-api.onrender.com/health`

`CORS_ALLOWED_ORIGINS` = Vercel panel URL'niz (ör. `https://akaflow-saas.vercel.app`)

## Coolify Deploy (Faz 5)

1. **API uygulaması**
   - Repo: `akaflow-saas`
   - Base Directory: `/`
   - Dockerfile: `backend/Dockerfile`
   - Port: 8000
   - Env: tüm `backend/.env` değişkenleri

2. **Frontend uygulaması**   - Base Directory: `frontend`
   - Dockerfile: `frontend/Dockerfile`
   - Port: 3000
   - **Build args** (build sırasında zorunlu — rewrite'lar build anında bake edilir):
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
     - `API_URL=https://api.sizin-domain.com`
   - **Runtime env** (AI asistan proxy route için):
     - `API_URL=https://api.sizin-domain.com`

3. Domain + HTTPS (Coolify otomatik Let's Encrypt)

4. Smoke test: signup → panel CRUD → dashboard churn → AI asistan

## Bellek bankası

Proje bağlamı: [`memory-bank/`](memory-bank/)
