-- 1. Free preview day: new readers start on 'preview' (no card) and can read
--    their first day's stories with Premium features until the next morning.
--    The 7-day trial starts only when they add a card (billing, build step 6).
alter table public.profiles drop constraint profiles_plan_check;
alter table public.profiles
  add constraint profiles_plan_check check (plan in ('preview','trial','standard','premium','inactive'));
alter table public.profiles alter column plan set default 'preview';
alter table public.profiles alter column trial_ends_at drop not null;
alter table public.profiles alter column trial_ends_at drop default;
alter table public.profiles add column preview_ends_at timestamptz;

-- 2. Language slots: languages are never deleted. Active ones fill the plan's
--    slots; the rest are paused. Pausing one (a swap) is allowed once every 30 days.
alter table public.learning_languages add column active boolean not null default true;
alter table public.profiles add column last_language_swap_at timestamptz;

-- 3. Keep each story's excerpt so a new edition can be written later in the day
--    from the same 3 stories (e.g. for someone who signs up in the afternoon).
alter table public.stories add column description text;
alter table public.stories add column excerpt text;
