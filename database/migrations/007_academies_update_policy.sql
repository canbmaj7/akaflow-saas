create policy academies_update_own on public.academies
  for update using (id = public.current_academy_id())
  with check (id = public.current_academy_id());
