create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  date date not null,
  status text not null check (status in ('present', 'absent', 'late')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_attendance_academy on public.attendance (academy_id);
create index idx_attendance_student on public.attendance (student_id);
create unique index idx_attendance_student_date on public.attendance (student_id, date);
