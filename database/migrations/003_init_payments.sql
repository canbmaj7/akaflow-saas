create type public.payment_status as enum ('paid', 'pending', 'overdue');

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  amount numeric(10, 2) not null default 0,
  due_date date not null,
  status public.payment_status not null default 'pending',
  last_delay_days int not null default 0,
  reminder_sent boolean not null default false,
  -- ML feature kolonları
  total_fee numeric(10, 2),
  amount_paid numeric(10, 2),
  remaining_debt numeric(10, 2),
  installment_count int,
  payment_method text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_payments_academy on public.payments (academy_id);
create index idx_payments_student on public.payments (student_id);
create index idx_payments_due_date on public.payments (due_date);
create index idx_payments_status_due on public.payments (status, due_date);
