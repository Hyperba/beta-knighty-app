-- Migration: Add user preferences (newsletter, email notifications) and deletion request tracking
-- Run this against your existing database to apply the changes.

-- 1. Add preference columns to user_profiles
alter table public.user_profiles
  add column if not exists email_notifications boolean not null default true,
  add column if not exists newsletter_opt_in boolean not null default true,
  add column if not exists deletion_requested_at timestamptz default null;

-- 2. Index for admin queries on deletion requests
create index if not exists user_profiles_deletion_requested_idx
  on public.user_profiles (deletion_requested_at)
  where deletion_requested_at is not null;

-- 3. RPC: Update user notification preferences
create or replace function public.update_user_preferences(
  p_email_notifications boolean default null,
  p_newsletter_opt_in boolean default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return json_build_object('status', 'error', 'message', 'Not authenticated');
  end if;

  update public.user_profiles
  set
    email_notifications = coalesce(p_email_notifications, email_notifications),
    newsletter_opt_in = coalesce(p_newsletter_opt_in, newsletter_opt_in),
    updated_at = now()
  where id = auth.uid();

  return json_build_object('status', 'success');
end;
$$;

revoke all on function public.update_user_preferences(boolean, boolean) from public;
grant execute on function public.update_user_preferences(boolean, boolean) to authenticated;

-- 4. RPC: Request account deletion
create or replace function public.request_account_deletion()
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return json_build_object('status', 'error', 'message', 'Not authenticated');
  end if;

  update public.user_profiles
  set deletion_requested_at = now(), updated_at = now()
  where id = auth.uid();

  return json_build_object('status', 'success', 'message', 'Account scheduled for deletion');
end;
$$;

revoke all on function public.request_account_deletion() from public;
grant execute on function public.request_account_deletion() to authenticated;

-- 5. RPC: Cancel account deletion request
create or replace function public.cancel_account_deletion()
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return json_build_object('status', 'error', 'message', 'Not authenticated');
  end if;

  update public.user_profiles
  set deletion_requested_at = null, updated_at = now()
  where id = auth.uid();

  return json_build_object('status', 'success', 'message', 'Deletion request cancelled');
end;
$$;

revoke all on function public.cancel_account_deletion() from public;
grant execute on function public.cancel_account_deletion() to authenticated;

-- 6. RPC: Admin get deletion requests
create or replace function public.admin_get_deletion_requests()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_requests json;
begin
  if not public.is_admin() then
    return json_build_object('status', 'error', 'message', 'Unauthorized');
  end if;

  select json_agg(json_build_object(
    'id', up.id,
    'handle', up.handle,
    'display_name', up.display_name,
    'avatar_url', up.avatar_url,
    'tier', up.tier,
    'email', au.email,
    'deletion_requested_at', up.deletion_requested_at,
    'created_at', up.created_at
  ) order by up.deletion_requested_at desc)
  into v_requests
  from public.user_profiles up
  join auth.users au on au.id = up.id
  where up.deletion_requested_at is not null;

  return json_build_object(
    'status', 'success',
    'requests', coalesce(v_requests, '[]'::json),
    'total', (select count(*) from public.user_profiles where deletion_requested_at is not null)
  );
end;
$$;

revoke all on function public.admin_get_deletion_requests() from public;
grant execute on function public.admin_get_deletion_requests() to authenticated;

-- 7. Update admin newsletter listing to include user preference data
-- (Existing admin_list_newsletter_subscribers already works for the newsletter_subscribers table.
--  We add a new RPC to list registered users with their newsletter preference.)
create or replace function public.admin_get_user_newsletter_preferences(
  p_search text default '',
  p_page int default 1,
  p_per_page int default 50
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_users json;
  v_total bigint;
  v_offset int;
begin
  if not public.is_admin() then
    return json_build_object('status', 'error', 'message', 'Unauthorized');
  end if;

  v_offset := (p_page - 1) * p_per_page;

  select count(*) into v_total
  from public.user_profiles up
  join auth.users au on au.id = up.id
  where (p_search = '' or up.handle ilike '%' || p_search || '%'
    or up.display_name ilike '%' || p_search || '%'
    or au.email ilike '%' || p_search || '%');

  select json_agg(row_to_json(t)) into v_users
  from (
    select
      up.id,
      up.handle,
      up.display_name,
      up.avatar_url,
      up.tier,
      au.email,
      up.email_notifications,
      up.newsletter_opt_in,
      up.created_at
    from public.user_profiles up
    join auth.users au on au.id = up.id
    where (p_search = '' or up.handle ilike '%' || p_search || '%'
      or up.display_name ilike '%' || p_search || '%'
      or au.email ilike '%' || p_search || '%')
    order by up.created_at desc
    limit p_per_page offset v_offset
  ) t;

  return json_build_object(
    'status', 'success',
    'users', coalesce(v_users, '[]'::json),
    'total', v_total,
    'total_pages', ceil(v_total::float / p_per_page)
  );
end;
$$;

revoke all on function public.admin_get_user_newsletter_preferences(text, int, int) from public;
grant execute on function public.admin_get_user_newsletter_preferences(text, int, int) to authenticated;

-- 8. Storage buckets for build images and downloads
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('build-images', 'build-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('build-downloads', 'build-downloads', false, 52428800, array['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/octet-stream'])
on conflict (id) do nothing;

-- Storage policies for build-images (public read, admin write)
create policy "Public read access to build images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'build-images');

create policy "Admin upload to build images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'build-images' and public.is_admin());

create policy "Admin update build images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'build-images' and public.is_admin());

create policy "Admin delete build images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'build-images' and public.is_admin());

-- Storage policies for build-downloads (authenticated read with tier check via app, admin write)
create policy "Authenticated read access to build downloads"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'build-downloads');

create policy "Admin upload to build downloads"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'build-downloads' and public.is_admin());

create policy "Admin update build downloads"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'build-downloads' and public.is_admin());

create policy "Admin delete build downloads"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'build-downloads' and public.is_admin());
