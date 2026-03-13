-- Migration: Auto-create user profile on auth.users insert
-- This prevents race conditions where profile creation happens before auth user is committed

-- Function to create profile automatically when auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_handle text;
  v_display_name text;
  v_email text;
begin
  -- Skip if profile already exists
  if exists(select 1 from public.user_profiles where id = new.id) then
    return new;
  end if;

  -- Get email from new user
  v_email := coalesce(new.email, '');

  -- Generate handle from email
  v_handle := public.generate_unique_handle(v_email);

  -- Get display name from metadata or email
  v_display_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(v_email, '@', 1)
  );

  -- Ensure display name is not empty
  if v_display_name is null or trim(v_display_name) = '' then
    v_display_name := 'User';
  end if;

  -- Insert profile
  insert into public.user_profiles (id, handle, display_name)
  values (new.id, v_handle, v_display_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger on auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Grant necessary permissions
grant usage on schema public to postgres, service_role;
grant execute on function public.handle_new_user() to postgres, service_role;
