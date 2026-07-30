# AkaFlow — Veritabanı

Supabase PostgreSQL migration ve seed dosyaları.

## Yeni Supabase Projesi

1. [Supabase Dashboard](https://supabase.com/dashboard) → **New Project**
2. **Project Settings → API Keys**:
   - `Project URL` → `SUPABASE_URL`
   - **Publishable key** → `SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** (`sb_secret_...`) → `SUPABASE_SECRET_KEY` (sadece backend, gizli tut)
3. SQL Editor'de sırayla çalıştır:

| Sıra | Dosya |
|------|-------|
| 1 | `migrations/001_init_academies.sql` |
| 2 | `migrations/002_init_students.sql` |
| 3 | `migrations/003_init_payments.sql` |
| 4 | `migrations/004_init_attendance.sql` |
| 5 | `migrations/005_rls_policies.sql` |
| 6 | `migrations/006_grants.sql` |
| 7 | `migrations/007_academies_update_policy.sql` |
| 8 | `migrations/008_student_churn_columns.sql` |
| 9 | `migrations/009_student_birth_date.sql` |
| 10 | `migrations/010_init_homework.sql` |

## Demo Seed

1. Authentication → iki test kullanıcısı oluştur
2. `seeds/demo_academy.sql` adımlarını uygula

## RLS Doğrulama

İki farklı kullanıcı JWT'si ile `/api/v1/students` — akademiler birbirinin verisini görmemeli.
