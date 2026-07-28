create type public.student_status as enum ('active', 'inactive');
create type public.notify_target as enum ('student', 'parent');

create table public.students (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies (id) on delete cascade,
  name text not null,
  email text,
  parent_email text,
  notify_target public.notify_target not null default 'student',
  enrollment_date date,
  status public.student_status not null default 'active',
  -- ML feature kolonları (Seçenek A)
  course_type text,
  course_duration_weeks int,
  enrolled_weeks int,
  weekly_class_hours int,
  total_class_hours int,
  days_since_last_login int,
  logins_last_30_days int,
  ai_interactions_last_30_days int,
  homework_completion_rate numeric(5, 4),
  satisfaction_score numeric(3, 2),
  absence_hours numeric(10, 2),
  absence_rate numeric(5, 4),
  consecutive_absences int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_students_academy on public.students (academy_id);
