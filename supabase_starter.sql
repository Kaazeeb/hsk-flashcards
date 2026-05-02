-- Supabase schema for the HSK flashcards app.
--
-- Current model:
-- - app_sync_documents stores setup documents such as vocab, card flag bundle,
--   named sets and set order.
-- - app_review_events stores append-only review/progress events, including
--   text Smart FSRS and image-card Smart FSRS events.
-- - browser code uses only the public anon key; RLS isolates rows by user_id.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_sync_documents (
  user_id uuid not null references auth.users(id) on delete cascade,
  namespace text not null,
  doc_id text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, namespace, doc_id),
  constraint app_sync_documents_payload_is_object check (jsonb_typeof(payload) = 'object')
);

create index if not exists app_sync_documents_user_namespace_idx
  on public.app_sync_documents (user_id, namespace, updated_at desc);

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
  on public.app_review_events (user_id, set_id, occurred_at desc);
create index if not exists app_review_events_user_epoch_expr_idx
  on public.app_review_events (user_id, ((payload->>'epochId')), occurred_at asc, created_at asc)
  where kind <> 'review_reset';
create index if not exists app_review_events_user_image_deck_idx
  on public.app_review_events (user_id, set_id, occurred_at asc, created_at asc)
  where kind = 'image_smart_fsrs';

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
alter table public.app_sync_documents enable row level security;
alter table public.app_review_events enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.app_sync_documents to authenticated;
grant select, insert on public.app_review_events to authenticated;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists app_sync_documents_select_own on public.app_sync_documents;
create policy app_sync_documents_select_own on public.app_sync_documents for select using (auth.uid() = user_id);
drop policy if exists app_sync_documents_insert_own on public.app_sync_documents;
create policy app_sync_documents_insert_own on public.app_sync_documents for insert with check (auth.uid() = user_id);
drop policy if exists app_sync_documents_update_own on public.app_sync_documents;
create policy app_sync_documents_update_own on public.app_sync_documents for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists app_sync_documents_delete_own on public.app_sync_documents;
create policy app_sync_documents_delete_own on public.app_sync_documents for delete using (auth.uid() = user_id);

drop policy if exists app_review_events_select_own on public.app_review_events;
create policy app_review_events_select_own on public.app_review_events for select using (auth.uid() = user_id);
drop policy if exists app_review_events_insert_own on public.app_review_events;
create policy app_review_events_insert_own on public.app_review_events for insert with check (auth.uid() = user_id);

-- Review events are append-only in normal operation.
drop policy if exists app_review_events_update_own on public.app_review_events;
drop policy if exists app_review_events_delete_own on public.app_review_events;
