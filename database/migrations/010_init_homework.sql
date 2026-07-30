create table public.homework (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  title text not null default 'Ödev',
  due_date date not null,
  status text not null check (status in ('completed', 'not_completed', 'late')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_homework_academy on public.homework (academy_id);
create index idx_homework_student on public.homework (student_id);
create unique index idx_homework_student_due on public.homework (student_id, due_date);

alter table public.homework enable row level security;

create policy homework_academy_isolation_select on public.homework
  for select using (academy_id = public.current_academy_id());
create policy homework_academy_isolation_insert on public.homework
  for insert with check (academy_id = public.current_academy_id());
create policy homework_academy_isolation_update on public.homework
  for update using (academy_id = public.current_academy_id())
  with check (academy_id = public.current_academy_id());
create policy homework_academy_isolation_delete on public.homework
  for delete using (academy_id = public.current_academy_id());

grant select, insert, update, delete on public.homework to authenticated;
