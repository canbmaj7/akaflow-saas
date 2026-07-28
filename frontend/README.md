# AkaFlow Frontend

Next.js yönetim paneli (Faz 2).

## Kurulum

```powershell
cd frontend
copy .env.example .env
# .env dosyasını Supabase değerleriyle doldurun
npm install
```

**Not:** `.env.local` placeholder içeriyorsa `.env` değerlerini ezer → `Failed to fetch`. Yalnızca `.env` kullanın veya `.env.local`'i gerçek değerlerle doldurun.

## Çalıştırma

Backend açık olmalı (`http://localhost:8000`):

```powershell
npm run dev
```

Panel: http://localhost:3000

Giriş: Supabase Auth kullanıcısı (ör. `test-a@example.com`).

## Ortam Değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key |
| `API_URL` | Backend proxy hedefi (opsiyonel lokal; Vercel'de zorunlu) |

API istekleri tarayıcıda `/api/v1/...` üzerinden gider; `next.config.ts` rewrite ile backend'e yönlendirilir (mixed-content çözümü).

## Vercel Deploy

Root Directory: **`frontend`**. Alternatif olarak Coolify ile tam self-host: [`BASLATMA.md`](../BASLATMA.md) → Coolify Deploy.

## Sayfalar

- `/login` — Supabase Auth giriş
- `/dashboard` — KPI + yaklaşan ödemeler
- `/students` — Öğrenci listesi + CRUD
- `/payments` — Ödeme grid + CRUD
- `/instructors` — Eğitmen listesi + CRUD

## Backend CORS

`backend/.env` içinde `CORS_ALLOWED_ORIGINS=http://localhost:3000` ve `CORS_ALLOWED_ORIGIN_REGEX=https://.*\.vercel\.app` olmalı.
