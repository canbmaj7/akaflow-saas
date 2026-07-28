-- Demo seed: Supabase SQL Editor (postgres rolü) ile çalıştırın.
-- Önce Authentication'dan kullanıcıları oluşturun, UUID'leri aşağıya yazın.

-- insert into public.academies (id, name, admin_email, student_limit, package_name, trial_ends_at)
-- values
--   ('11111111-1111-1111-1111-111111111111', 'Demo Akademi A', 'test-a@example.com', 50, 'starter', now() + interval '14 days'),
--   ('22222222-2222-2222-2222-222222222222', 'Demo Akademi B', 'test-b@example.com', 50, 'starter', now() + interval '14 days');

-- insert into public.academy_users (user_id, academy_id, role)
-- values
--   ('USER_A_UUID', '11111111-1111-1111-1111-111111111111', 'admin'),
--   ('USER_B_UUID', '22222222-2222-2222-2222-222222222222', 'admin');
