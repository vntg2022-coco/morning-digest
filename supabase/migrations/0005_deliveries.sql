-- Morning email: one row per reader per local day, so a reader is never
-- emailed twice for the same morning even if the cron runs again.
create table public.deliveries (
  user_id uuid not null references public.profiles (id) on delete cascade,
  local_date date not null,          -- the reader's calendar date when it was sent
  content_date date not null,        -- which day's stories the email pointed to
  email_id text,                     -- Resend message id
  status text not null default 'sent' check (status in ('sent', 'failed', 'skipped')),
  error text,
  created_at timestamptz not null default now(),
  primary key (user_id, local_date)
);
alter table public.deliveries enable row level security;
-- Server only (service_role has privileges via default grants from 0002).

-- Readers can turn the morning email off (Settings, or the link in each email).
alter table public.profiles add column email_enabled boolean not null default true;
grant update (email_enabled) on public.profiles to authenticated;
