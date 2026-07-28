create extension if not exists "uuid-ossp";

create table public.academies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  admin_email text not null,
  student_limit int not null default 50,
  package_name text not null default 'starter',
  trial_ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.academy_users (
  user_id uuid not null references auth.users (id) on delete cascade,
  academy_id uuid not null references public.academies (id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  primary key (user_id, academy_id)
);

create index idx_academy_users_academy on public.academy_users (academy_id);
