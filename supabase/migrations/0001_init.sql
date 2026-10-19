-- Good Morning Digest: initial schema.
--
-- Access model: the browser (publishable key) may only read and edit the
-- signed-in user's own profile and settings. Daily content, article picks and
-- the vocab list are read and written by our server (secret key), which
-- enforces plan rules (Standard: 1 article a day, no vocab list).

-- ─── Users ────────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  native_lang text check (native_lang in ('en','zh','hi','es','fr','ru','pt','ur','id','de','ja','ko')),
  timezone text not null default 'America/New_York',
  delivery_time time not null default '06:00',
  -- trial → standard | premium after the 7-day trial; 'inactive' when unpaid or cancelled.
  plan text not null default 'trial' check (plan in ('trial','standard','premium','inactive')),
  trial_ends_at timestamptz not null default (now() + interval '7 days'),
  stripe_customer_id text unique,
  onboarded_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.learning_languages (
  user_id uuid not null references public.profiles (id) on delete cascade,
  lang text not null check (lang in ('en','zh','hi','es','fr','ru','pt','ur','id','de','ja','ko')),
  level text not null default 'intermediate' check (level in ('beginner','intermediate','advanced')),
  -- true when bought as a one-time add-on beyond the plan's included languages.
  purchased boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, lang)
);

-- Create a profile row whenever someone signs up.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Daily content (written by the cron job) ─────────────────────────────

create table public.stories (
  id bigint generated always as identity primary key,
  date date not null,
  position smallint not null check (position between 1 and 3),
  topic text not null,
  title text not null,
  source text not null,
  url text not null,
  published_at timestamptz,
  unique (date, position)
);

-- One story retold in one learning language at one level.
create table public.articles (
  id bigint generated always as identity primary key,
  story_id bigint not null references public.stories (id) on delete cascade,
  lang text not null,
  level text not null check (level in ('beginner','intermediate','advanced')),
  headline jsonb not null,   -- { text, words: [{ surface, lemma }] }
  sentences jsonb not null,  -- [{ text, words: [...] }]
  glossary jsonb not null,   -- [{ lemma, reading, part_of_speech, example }]
  created_at timestamptz not null default now(),
  unique (story_id, lang, level)
);

-- An article translated into one native language.
create table public.translations (
  article_id bigint not null references public.articles (id) on delete cascade,
  native_lang text not null,
  headline text not null,
  sentences jsonb not null,  -- [string], one per source sentence
  glossary jsonb not null,   -- { lemma: { meaning, example_translation } }
  created_at timestamptz not null default now(),
  primary key (article_id, native_lang)
);

-- ─── Reading activity ────────────────────────────────────────────────────

-- Standard plan: the one story a reader chose for a day and language.
create table public.article_picks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  lang text not null,
  story_id bigint not null references public.stories (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, date, lang)
);

-- Premium: words the reader tapped.
create table public.vocab (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  lang text not null,
  lemma text not null,
  reading text,
  meaning text,
  example text,
  example_translation text,
  article_id bigint references public.articles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, lang, lemma)
);

create index on public.learning_languages (lang, level);
create index on public.vocab (user_id, created_at desc);

-- ─── Row level security ─────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.learning_languages enable row level security;
alter table public.stories enable row level security;
alter table public.articles enable row level security;
alter table public.translations enable row level security;
alter table public.article_picks enable row level security;
alter table public.vocab enable row level security;

-- The project does not auto-expose new tables, so grant only what the browser needs.
grant select, update (native_lang, timezone, delivery_time, onboarded_at) on public.profiles to authenticated;
grant select, update (level) on public.learning_languages to authenticated;
grant select on public.article_picks, public.vocab to authenticated;

create policy "read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "read own languages" on public.learning_languages
  for select to authenticated using ((select auth.uid()) = user_id);
-- Adding and removing languages goes through the server, which checks the plan limit.
create policy "change own language level" on public.learning_languages
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "read own picks" on public.article_picks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "read own vocab" on public.vocab
  for select to authenticated using ((select auth.uid()) = user_id);

-- stories, articles and translations have no browser policies: only the
-- server (secret key, which bypasses RLS) reads them, so plan limits hold.
