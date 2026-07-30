alter table public.students
  add column if not exists age int,
  add column if not exists education_level text;
