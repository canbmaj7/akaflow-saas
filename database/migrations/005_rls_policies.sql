alter table public.academies enable row level security;
alter table public.academy_users enable row level security;
alter table public.students enable row level security;
alter table public.payments enable row level security;
alter table public.attendance enable row level security;

create or replace function public.current_academy_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select au.academy_id
  from public.academy_users au
  where au.user_id = auth.uid()
  limit 1;
$$;

create policy academies_select_own on public.academies
  for select using (id = public.current_academy_id());

create policy academy_users_select_self on public.academy_users
  for select using (user_id = auth.uid());

create policy students_academy_isolation_select on public.students
  for select using (academy_id = public.current_academy_id());
create policy students_academy_isolation_insert on public.students
  for insert with check (academy_id = public.current_academy_id());
create policy students_academy_isolation_update on public.students
  for update using (academy_id = public.current_academy_id())
  with check (academy_id = public.current_academy_id());
create policy students_academy_isolation_delete on public.students
  for delete using (academy_id = public.current_academy_id());

create policy payments_academy_isolation_select on public.payments
  for select using (academy_id = public.current_academy_id());
create policy payments_academy_isolation_insert on public.payments
  for insert with check (academy_id = public.current_academy_id());
create policy payments_academy_isolation_update on public.payments
  for update using (academy_id = public.current_academy_id())
  with check (academy_id = public.current_academy_id());
create policy payments_academy_isolation_delete on public.payments
  for delete using (academy_id = public.current_academy_id());

create policy attendance_academy_isolation_select on public.attendance
  for select using (academy_id = public.current_academy_id());
create policy attendance_academy_isolation_insert on public.attendance
  for insert with check (academy_id = public.current_academy_id());
create policy attendance_academy_isolation_update on public.attendance
  for update using (academy_id = public.current_academy_id())
  with check (academy_id = public.current_academy_id());
create policy attendance_academy_isolation_delete on public.attendance
  for delete using (academy_id = public.current_academy_id());
