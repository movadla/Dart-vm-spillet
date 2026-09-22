create table participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  pin text not null,
  phone text,
  created_at timestamptz default now()
);

create table picks (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade,
  pot_number integer not null check (pot_number between 1 and 6),
  player_name text not null,
  created_at timestamptz default now()
);

create table match_results (
  id uuid primary key default gen_random_uuid(),
  player1 text not null,
  player2 text not null,
  sets1 integer not null,
  sets2 integer not null,
  stage text not null default 'r1',
  winner text,
  played_at timestamptz default now()
);
