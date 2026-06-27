-- Supabase schema for HSK Flashcards v2.0.0.
--
-- Current browser code uses:
-- - auth.users / profiles for identity metadata;
-- - app_review_events for append-only progress and FSRS review events;
-- - app_card_visibility_bits for per-user Learn/Practice visibility.
--
-- The public anon key is safe in the browser only because RLS below requires
-- auth.uid() to match the row owner on every read/write.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_review_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null,
  kind text not null,
  card_id text not null,
  set_id text,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (user_id, event_id),
  constraint app_review_events_payload_is_object check (jsonb_typeof(payload) = 'object')
);

create index if not exists app_review_events_user_kind_idx
  on public.app_review_events (user_id, kind, occurred_at desc);
create index if not exists app_review_events_user_card_idx
  on public.app_review_events (user_id, card_id, occurred_at desc);
create index if not exists app_review_events_user_set_card_idx
  on public.app_review_events (user_id, set_id, card_id, occurred_at desc);
create index if not exists app_review_events_user_occurred_created_idx
  on public.app_review_events (user_id, occurred_at asc, created_at asc);
create index if not exists app_review_events_user_set_occurred_idx
  on public.app_review_events (user_id, set_id, occurred_at asc, created_at asc);
create index if not exists app_review_events_user_epoch_expr_idx
  on public.app_review_events (user_id, ((payload->>'epochId')), occurred_at asc, created_at asc)
  where kind <> 'review_reset';
create index if not exists app_review_events_user_image_deck_idx
  on public.app_review_events (user_id, set_id, occurred_at asc, created_at asc)
  where kind = 'image_smart_fsrs';
create index if not exists app_review_events_user_sentence_deck_idx
  on public.app_review_events (user_id, set_id, occurred_at asc, created_at asc)
  where kind = 'sentence_smart_fsrs';

-- Compact visibility rows. Column names intentionally mirror the browser payload:
-- u = user id, d = stable built-in deck key, m = mode key (0 learn, 1 practice),
-- z = default visible flag, n = card count, x = base64 exception bitset, t = updated at.
create table if not exists public.app_card_visibility_bits (
  u uuid not null references auth.users(id) on delete cascade,
  d integer not null,
  m smallint not null,
  z boolean not null default true,
  n integer not null default 0,
  x text not null default '',
  t timestamptz not null default now(),
  primary key (u, d, m),
  constraint app_card_visibility_bits_mode_valid check (m in (0, 1)),
  constraint app_card_visibility_bits_card_count_nonnegative check (n >= 0),
  constraint app_card_visibility_bits_base64_text check (x ~ '^[A-Za-z0-9+/=]*$')
);

create index if not exists app_card_visibility_bits_user_deck_idx
  on public.app_card_visibility_bits (u, d, m);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();

alter table public.profiles enable row level security;
alter table public.app_review_events enable row level security;
alter table public.app_card_visibility_bits enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert on public.app_review_events to authenticated;
grant select, insert, update, delete on public.app_card_visibility_bits to authenticated;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists app_review_events_select_own on public.app_review_events;
create policy app_review_events_select_own on public.app_review_events for select using (auth.uid() = user_id);
drop policy if exists app_review_events_insert_own on public.app_review_events;
create policy app_review_events_insert_own on public.app_review_events for insert with check (auth.uid() = user_id);

-- Review events are append-only in normal app operation.
drop policy if exists app_review_events_update_own on public.app_review_events;
drop policy if exists app_review_events_delete_own on public.app_review_events;

drop policy if exists app_card_visibility_bits_select_own on public.app_card_visibility_bits;
create policy app_card_visibility_bits_select_own on public.app_card_visibility_bits for select using (auth.uid() = u);
drop policy if exists app_card_visibility_bits_insert_own on public.app_card_visibility_bits;
create policy app_card_visibility_bits_insert_own on public.app_card_visibility_bits for insert with check (auth.uid() = u);
drop policy if exists app_card_visibility_bits_update_own on public.app_card_visibility_bits;
create policy app_card_visibility_bits_update_own on public.app_card_visibility_bits for update using (auth.uid() = u) with check (auth.uid() = u);
drop policy if exists app_card_visibility_bits_delete_own on public.app_card_visibility_bits;
create policy app_card_visibility_bits_delete_own on public.app_card_visibility_bits for delete using (auth.uid() = u);
