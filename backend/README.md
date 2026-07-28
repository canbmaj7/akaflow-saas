# AkaFlow Backend

FastAPI tabanlı AkaFlow API (Faz 1).

## Kurulum (Windows — Activate.ps1 gerekmez)

PowerShell execution policy hatası alıyorsan venv'i **aktive etmeden** şöyle çalıştır:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
copy .env.example .env
# .env dosyasını Supabase değerleriyle doldurun
```

## Çalıştırma

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Alternatif (execution policy izin veriyorsa):

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

API: http://localhost:8000  
Swagger: http://localhost:8000/docs

## Ortam Değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `SUPABASE_URL` | Supabase proje URL |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_...`) |
| `CORS_ALLOWED_ORIGINS` | Virgülle ayrılmış origin listesi |
| `CORS_ALLOWED_ORIGIN_REGEX` | Vercel preview regex |

## Smoke Test

```powershell
# Health (auth gerekmez)
curl http://localhost:8000/health

# JWT al (Supabase Auth)
curl -X POST "https://YOUR_PROJECT.supabase.co/auth/v1/token?grant_type=password" `
  -H "apikey: YOUR_PUBLISHABLE_KEY" `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test-a@example.com\",\"password\":\"YOUR_PASSWORD\"}'

# Öğrenci listesi
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:8000/api/v1/students

# Öğrenci oluştur
curl -X POST http://localhost:8000/api/v1/students `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"full_name\":\"Test Öğrenci\",\"monthly_fee\":1500}'
```

## Testler

```powershell
pytest
```

Entegrasyon testleri (`@pytest.mark.integration`) için `.env` içinde test kullanıcı bilgileri gerekir:

```
TEST_USER_A_EMAIL=test-a@example.com
TEST_USER_A_PASSWORD=...
TEST_USER_B_EMAIL=test-b@example.com
TEST_USER_B_PASSWORD=...
```

Migration ve seed: [`../database/README.md`](../database/README.md)
