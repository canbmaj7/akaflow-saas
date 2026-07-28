grant usage on schema public to anon, authenticated;

grant select on public.academies to authenticated;
grant select on public.academy_users to authenticated;

grant select, insert, update, delete on public.students to authenticated;
grant select, insert, update, delete on public.payments to authenticated;
grant select, insert, update, delete on public.attendance to authenticated;

grant usage on type public.student_status to authenticated;
grant usage on type public.notify_target to authenticated;
grant usage on type public.payment_status to authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
