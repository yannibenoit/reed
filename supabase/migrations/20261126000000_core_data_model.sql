-- US-003: Core data model (#3)
-- One source of truth for articles, tags, reading events and goals.
-- Every table is scoped by user_id and protected by row-level security.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.article_status as enum ('unread', 'in_progress', 'read', 'archived');
create type public.content_state as enum ('pending', 'ready', 'unavailable');
create type public.reading_mode as enum ('read', 'listen');
create type public.goal_review_decision as enum ('pending', 'accepted', 'kept', 'locked', 'expired');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: per-user settings (time zone for daily stats, reader prefs)
-- ---------------------------------------------------------------------------
create table public.profiles (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  time_zone    text not null default 'UTC',
  reader_prefs jsonb not null default '{}'::jsonb,
  show_thumbnails boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- articles
-- ---------------------------------------------------------------------------
create table public.articles (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  url               text not null,
  canonical_url     text not null,
  title             text,
  source_domain     text,
  author            text,
  content_html      text,
  content_text      text,
  word_count        integer check (word_count is null or word_count >= 0),
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes >= 1),
  status            public.article_status not null default 'unread',
  content_state     public.content_state not null default 'pending',
  unavailable_reason text,
  manual_read       boolean not null default false,
  saved_at          timestamptz not null default now(),
  resaved_at        timestamptz,
  read_at           timestamptz,
  archived_at       timestamptz,
  updated_at        timestamptz not null default now(),
  -- lets child tables use composite FKs so a row can never point at another user's article
  unique (id, user_id)
);

create unique index articles_user_canonical_url_key on public.articles (user_id, canonical_url);
create index articles_user_status_saved_idx on public.articles (user_id, status, saved_at desc);

-- ---------------------------------------------------------------------------
-- tags (flat, case-insensitive unique per user, max 40 chars)
-- ---------------------------------------------------------------------------
create table public.tags (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null check (name = btrim(name) and char_length(name) between 1 and 40),
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index tags_user_name_key on public.tags (user_id, lower(name));

create table public.article_tags (
  article_id uuid not null,
  tag_id     uuid not null,
  user_id    uuid not null,
  created_at timestamptz not null default now(),
  primary key (article_id, tag_id),
  foreign key (article_id, user_id) references public.articles (id, user_id) on delete cascade,
  foreign key (tag_id, user_id) references public.tags (id, user_id) on delete cascade
);

create index article_tags_tag_idx on public.article_tags (tag_id);

-- ---------------------------------------------------------------------------
-- reading_sessions: raw truth for analytics.
-- article_id is set to NULL when the article is deleted (US-018) so past stats don't change.
-- client_id makes offline-queued uploads idempotent.
-- ---------------------------------------------------------------------------
create table public.reading_sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  article_id     uuid,
  client_id      uuid not null,
  mode           public.reading_mode not null default 'read',
  device         text,
  started_at     timestamptz not null,
  ended_at       timestamptz not null,
  active_seconds integer not null default 0 check (active_seconds >= 0),
  created_at     timestamptz not null default now(),
  check (ended_at >= started_at),
  unique (user_id, client_id),
  foreign key (article_id, user_id) references public.articles (id, user_id) on delete set null (article_id)
);

create index reading_sessions_user_started_idx on public.reading_sessions (user_id, started_at);
create index reading_sessions_article_idx on public.reading_sessions (article_id);

-- ---------------------------------------------------------------------------
-- reading_progress: one row per user+article (position LWW, max_scroll_pct max-wins)
-- ---------------------------------------------------------------------------
create table public.reading_progress (
  article_id      uuid not null,
  user_id         uuid not null,
  scroll_pct      numeric(5, 2) not null default 0 check (scroll_pct between 0 and 100),
  max_scroll_pct  numeric(5, 2) not null default 0 check (max_scroll_pct between 0 and 100),
  listen_position integer,
  opened_at       timestamptz,
  last_read_at    timestamptz,
  device          text,
  updated_at      timestamptz not null default now(),
  primary key (article_id, user_id),
  foreign key (article_id, user_id) references public.articles (id, user_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- highlights (anchored by text offset + surrounding text)
-- ---------------------------------------------------------------------------
create table public.highlights (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null,
  article_id   uuid not null,
  text         text not null check (char_length(text) > 0),
  start_offset integer not null check (start_offset >= 0),
  end_offset   integer not null,
  prefix       text not null default '',
  suffix       text not null default '',
  created_at   timestamptz not null default now(),
  check (end_offset > start_offset),
  foreign key (article_id, user_id) references public.articles (id, user_id) on delete cascade
);

create index highlights_user_created_idx on public.highlights (user_id, created_at desc);
create index highlights_article_idx on public.highlights (article_id);

-- ---------------------------------------------------------------------------
-- goals: current daily goal and its settings (one row per user)
-- rest_days uses ISO weekdays (1 = Monday … 7 = Sunday)
-- ---------------------------------------------------------------------------
create table public.goals (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  minutes        integer not null default 10 check (minutes between 5 and 60),
  locked         boolean not null default false,
  review_weekday smallint not null default 1 check (review_weekday between 1 and 7),
  rest_days      smallint[] not null default '{}' check (rest_days <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]),
  updated_at     timestamptz not null default now()
);

-- goal_reviews: each weekly review and the user's answer (US-032/US-033)
create table public.goal_reviews (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  period_start     date not null,
  period_end       date not null,
  average_minutes  numeric(6, 2) not null,
  days_hit         smallint not null,
  days_counted     smallint not null,
  current_minutes  integer not null,
  proposed_minutes integer,
  decision         public.goal_review_decision not null default 'pending',
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null default now() + interval '48 hours',
  decided_at       timestamptz,
  unique (user_id, period_start)
);

-- ---------------------------------------------------------------------------
-- daily_stats: derived per local date; rebuildable from reading_sessions
-- ---------------------------------------------------------------------------
create table public.daily_stats (
  user_id           uuid not null references auth.users (id) on delete cascade,
  date              date not null,
  read_minutes      numeric(7, 2) not null default 0,
  listen_minutes    numeric(7, 2) not null default 0,
  articles_opened   integer not null default 0,
  articles_read     integer not null default 0,
  articles_saved    integer not null default 0,
  articles_archived integer not null default 0,
  goal_minutes      integer not null,
  goal_hit          boolean not null default false,
  is_rest_day       boolean not null default false,
  updated_at        timestamptz not null default now(),
  primary key (user_id, date)
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger articles_updated_at before update on public.articles
  for each row execute function public.set_updated_at();
create trigger reading_progress_updated_at before update on public.reading_progress
  for each row execute function public.set_updated_at();
create trigger goals_updated_at before update on public.goals
  for each row execute function public.set_updated_at();
create trigger daily_stats_updated_at before update on public.daily_stats
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- New user bootstrap: profile + default 10 min goal (US-031)
-- ---------------------------------------------------------------------------
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id) values (new.id);
  insert into public.goals (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row-level security: a user can only read/write their own rows
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'articles', 'tags', 'article_tags', 'reading_sessions',
    'reading_progress', 'highlights', 'goals', 'goal_reviews', 'daily_stats'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated '
      'using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      t
    );
  end loop;
end;
$$;

-- daily_stats is derived server-side: clients may read it but not write it.
drop policy "own rows" on public.daily_stats;
create policy "read own rows" on public.daily_stats for select to authenticated
  using ((select auth.uid()) = user_id);
