-- Stripe billing state, mirrored from Stripe (Stripe stays the source of truth).
alter table public.profiles add column stripe_subscription_id text unique;
alter table public.profiles add column subscription_status text;          -- Stripe's status: trialing, active, past_due, canceled, ...
alter table public.profiles add column subscribed_plan text check (subscribed_plan in ('standard', 'premium'));
alter table public.profiles add column current_period_end timestamptz;
alter table public.profiles add column cancel_at_period_end boolean not null default false;
alter table public.profiles add column trial_used boolean not null default false; -- one free trial per reader
-- One-time $4.99 add-ons: each adds one language to the reader's list.
alter table public.profiles add column extra_language_slots integer not null default 0;

-- One row per paid add-on checkout, so a purchase is counted once even when
-- both the return page and the webhook report it.
create table public.purchases (
  checkout_session_id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('language_slot')),
  amount_total integer,
  currency text,
  created_at timestamptz not null default now()
);
alter table public.purchases enable row level security;

-- Webhook events already handled (Stripe can deliver an event more than once).
create table public.stripe_events (
  id text primary key,
  type text not null,
  created_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;

-- Atomically add one language slot for a purchase (no-op if already recorded).
create function public.record_language_slot_purchase(p_session text, p_user uuid, p_amount integer, p_currency text)
returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.purchases (checkout_session_id, user_id, kind, amount_total, currency)
  values (p_session, p_user, 'language_slot', p_amount, p_currency);
  update public.profiles set extra_language_slots = extra_language_slots + 1 where id = p_user;
  return true;
exception when unique_violation then
  return false;
end;
$$;
revoke all on function public.record_language_slot_purchase(text, uuid, integer, text) from public, anon, authenticated;
grant execute on function public.record_language_slot_purchase(text, uuid, integer, text) to service_role;
