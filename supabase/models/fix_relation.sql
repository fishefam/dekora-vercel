-- 1) enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('admin','curator','user');
  end if;
  if not exists (select 1 from pg_type where typname = 'user_status') then
    create type user_status as enum ('active','inactive','suspended');
  end if;
end$$;

-- 2) profiles table (FK to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  avatar_url text,
  role user_role not null default 'user',
  status user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_active_at timestamptz
);

-- 3) updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- 4) backfill from auth.users (NOTE: use raw_* columns)
insert into public.profiles (id, full_name, email, avatar_url, role, status, created_at, updated_at, last_active_at)
select
  u.id,
  coalesce(
    (u.raw_user_meta_data ->> 'full_name'),
    (u.raw_user_meta_data ->> 'name')
  ) as full_name,
  u.email,
  coalesce(
    (u.raw_user_meta_data ->> 'avatar_url'),
    (u.raw_user_meta_data ->> 'avatar')
  ) as avatar_url,
  case lower(coalesce(u.raw_app_meta_data ->> 'role','user'))
    when 'admin' then 'admin'::user_role
    when 'curator' then 'curator'::user_role
    else 'user'::user_role
  end as role,
  'active'::user_status as status,
  coalesce(u.created_at, now()) as created_at,
  now() as updated_at,
  null::timestamptz as last_active_at
from auth.users u
on conflict (id) do nothing;

-- 5) (optional) enable RLS + simple policies
alter table public.profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='Profiles: user can view self') then
    create policy "Profiles: user can view self"
      on public.profiles for select
      using (auth.uid() = id);
  end if;

  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='Profiles: user can update self') then
    create policy "Profiles: user can update self"
      on public.profiles for update
      using (auth.uid() = id);
  end if;
end$$;
