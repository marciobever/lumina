create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  display_name text not null,
  short_bio text,
  activities text[],
  tags text[],
  city text,
  country text,
  age int check (age >= 18),
  verified_over18 boolean default false,
  consent_published boolean default false,
  avatar_url text,
  hero_url text,
  status text not null default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists profile_photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  image_url text not null,
  width int,
  height int,
  alt text,
  sort_order int default 0,
  safe_score numeric,
  flagged boolean default false,
  created_at timestamptz default now()
);

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  title text not null,
  questions jsonb not null
);

create table if not exists profile_articles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,
  published_at timestamptz,
  status text default 'published'
);

-- índices
create index if not exists profiles_status_idx on profiles(status);
create index if not exists profiles_tags_idx on profiles using gin(tags);
create index if not exists profiles_acts_idx on profiles using gin(activities);

-- RLS público (somente leitura de publicados)
alter table profiles enable row level security;
create policy if not exists read_published_profiles
on profiles for select using (status = 'published');

alter table profile_photos enable row level security;
create policy if not exists read_photos_of_published_profiles
on profile_photos for select using (
  exists (select 1 from profiles p where p.id = profile_id and p.status = 'published')
);
