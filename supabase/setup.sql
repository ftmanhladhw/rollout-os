-- Supabase platform setup for Rollout OS.
--
-- Idempotent: safe to run repeatedly. Run it in the Supabase SQL editor AFTER
-- applying the Prisma migrations (`npm run db:migrate:deploy`).
--
-- Why this file exists (and is not a Prisma migration): Prisma owns the
-- `public` schema; the `auth` and `storage` schemas are Supabase-managed
-- platform config. One source of truth per config item — cross-schema
-- triggers and bucket provisioning live here, table DDL lives in migrations.

-- ---------------------------------------------------------------------------
-- 1. Auto-create a profile row for every new auth user.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. Private storage bucket for user file attachments.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Storage RLS policies: each user may only touch objects under their own
--    folder — paths must be `<auth.uid()>/...` (enforced by the app helper in
--    src/lib/supabase/storage.ts, and by these policies at the database).
-- ---------------------------------------------------------------------------

drop policy if exists "attachments_select_own" on storage.objects;
create policy "attachments_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "attachments_insert_own" on storage.objects;
create policy "attachments_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "attachments_update_own" on storage.objects;
create policy "attachments_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "attachments_delete_own" on storage.objects;
create policy "attachments_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
