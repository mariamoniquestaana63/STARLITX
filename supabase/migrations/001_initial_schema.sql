-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  created_at timestamptz default now() not null
);

-- Characters table
create table if not exists public.characters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  class text not null check (class in ('warrior', 'mage', 'rogue', 'cleric')),
  level integer default 1 not null,
  experience integer default 0 not null,
  health integer not null,
  max_health integer not null,
  attack integer not null,
  defense integer not null,
  speed integer not null,
  current_floor integer default 1 not null,
  gold integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Demon kills (progression tracking)
create table if not exists public.demon_kills (
  id uuid default gen_random_uuid() primary key,
  character_id uuid references public.characters(id) on delete cascade not null,
  demon_number integer not null check (demon_number between 1 and 72),
  demon_name text not null,
  floor_cleared integer not null,
  killed_at timestamptz default now() not null,
  unique(character_id, demon_number)
);

-- Leaderboard view
create or replace view public.leaderboard as
  select
    p.username,
    c.name as character_name,
    c.class,
    c.level,
    c.current_floor,
    (select count(*) from public.demon_kills dk where dk.character_id = c.id) as demons_slain,
    c.created_at
  from public.characters c
  join public.profiles p on p.id = c.user_id
  where c.is_active = true
  order by c.current_floor desc, c.level desc;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.characters enable row level security;
alter table public.demon_kills enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Characters policies
create policy "Users can view own characters"
  on public.characters for select using (
    auth.uid() = user_id
  );

create policy "Users can insert own characters"
  on public.characters for insert with check (
    auth.uid() = user_id
  );

create policy "Users can update own characters"
  on public.characters for update using (
    auth.uid() = user_id
  );

-- Demon kills policies
create policy "Users can view own demon kills"
  on public.demon_kills for select using (
    character_id in (select id from public.characters where user_id = auth.uid())
  );

create policy "Users can insert own demon kills"
  on public.demon_kills for insert with check (
    character_id in (select id from public.characters where user_id = auth.uid())
  );

-- Leaderboard is public
grant select on public.leaderboard to anon, authenticated;

-- Trigger to update characters.updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger characters_updated_at
  before update on public.characters
  for each row execute function public.set_updated_at();

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
