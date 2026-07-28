# AkaFlow — Başlatma Rehberi

## Ön koşullar

- Python 3.11+
- Node.js 20+
- Supabase projesi (yeni) — migration'lar uygulanmış

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
- API: http://localhost:8000/docs

## 4. Docker

```powershell
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Env dosyaları

| Dosya | Değişkenler |
|-------|-------------|
| `backend/.env` | SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, **SUPABASE_SECRET_KEY** (`sb_secret_...`, signup için zorunlu) |
| `frontend/.env.local` | NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY |

## Bellek bankası

Proje bağlamı: [`memory-bank/`](memory-bank/) — AGENTS.md kurallarına göre güncellenir.
