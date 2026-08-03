create table participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  pin text not null,
  phone text,
  vipps_confirmed boolean default false,
  created_at timestamptz default now()
);

create table picks (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade,
  pot_number integer not null check (pot_number between 1 and 8),
  team_name text not null,
  created_at timestamptz default now()
);

create table match_results (
  id uuid primary key default gen_random_uuid(),
  home_team text not null,
  away_team text not null,
  home_goals integer not null,
  away_goals integer not null,
  stage text not null default 'group',
  played_at timestamptz default now()
);

create table advancement (
  team_name text primary key,
  stage_reached text not null
);
