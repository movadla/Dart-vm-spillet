-- Fullstendig databaseoppsett for dart-vm-spillet — kjør HELE denne filen ÉN
-- gang i Supabase Dashboard → SQL Editor for et FERSKT prosjekt. Dekker alt
-- appen trenger (tabeller, constraints, indekser, RLS) i riktig rekkefølge —
-- du trenger ikke kjøre noen av de andre filene i denne mappen etterpå.
--
-- Har du i stedet en EKSISTERENDE database fra et tidligere cl-spillet/
-- vm-tipping-oppsett? IKKE kjør denne filen — bruk migrate_to_darts.sql og
-- de øvrige add_*.sql-/drop_*.sql-filene i denne mappen i stedet (de er kun
-- for å bringe en gammel database à jour trinnvis), se README.md.

create table participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  email_opt_out boolean not null default false,
  created_at timestamptz default now()
);

create table picks (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade,
  pot_number integer not null check (pot_number between 1 and 6),
  player_name text not null,
  created_at timestamptz default now(),
  unique (participant_id, pot_number)
);
create index picks_participant_idx on picks (participant_id);

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
create index match_results_player1_idx on match_results (player1);
create index match_results_player2_idx on match_results (player2);

create table magic_links (
  token text primary key,
  participant_id uuid references participants(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz
);
create index magic_links_participant_idx on magic_links (participant_id);

create table newsletter_signups (
  email text primary key,
  created_at timestamptz default now()
);

-- Daglig rang-snapshot for ▲/▼-piler (rang-endring siden i går). scope =
-- 'overall' eller en liga sin invite_code. Skrives daglig av /api/snapshot-ranks.
create table rank_snapshot (
  scope          text not null,
  participant_id uuid not null references participants(id) on delete cascade,
  rank_pos       int  not null,
  snapshot_date  date not null,
  primary key (scope, participant_id, snapshot_date)
);
create index rank_snapshot_scope_date_idx on rank_snapshot (scope, snapshot_date desc);

create table leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  created_by uuid references participants(id) on delete cascade,
  hidden_until_kickoff boolean not null default false,
  created_at timestamptz default now()
);

create table league_members (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references leagues(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  created_at timestamptz default now(),
  unique (league_id, participant_id)
);
create index league_members_league_idx on league_members (league_id);
create index league_members_participant_idx on league_members (participant_id);

-- Rate-limiting for /api/admin/login (per IP).
create table admin_login_attempts (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  created_at timestamptz default now()
);
create index admin_login_attempts_ip_created_idx on admin_login_attempts (ip, created_at);

-- Delt rate-limit-tabell for andre endepunkter (api/finn, api/tipp/update) —
-- "bucket" skiller bruksområdene i samme tabell.
create table rate_limit_hits (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  key text not null,
  created_at timestamptz default now()
);
create index rate_limit_hits_lookup_idx on rate_limit_hits (bucket, key, created_at);

-- === Row Level Security ===
-- Kun match_results er lesbar for anon (offentlig kampdata, brukt av
-- vm-info sin Kamper-fane). Alt annet går kun via service role key i
-- Next.js API-routes og server-komponenter.
alter table participants          enable row level security;
alter table picks                 enable row level security;
alter table match_results         enable row level security;
alter table magic_links           enable row level security;
alter table leagues               enable row level security;
alter table league_members        enable row level security;
alter table newsletter_signups    enable row level security;
alter table rank_snapshot         enable row level security;
alter table admin_login_attempts  enable row level security;
alter table rate_limit_hits       enable row level security;

create policy "anon read" on match_results for select to anon using (true);
