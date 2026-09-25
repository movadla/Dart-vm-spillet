-- leagues/league_members hadde INGEN create table noe sted i migrasjonene —
-- begge fantes kun som forutsetninger i applikasjonskoden (api/league/*,
-- admin/leagues/*) og i IF EXISTS-referanser i enable_rls.sql. Mot en fersk
-- database ville derfor HELE liga-funksjonen feile med "relation does not
-- exist" ved første kall. Unique-constrainten på (league_id, participant_id)
-- er i tillegg påkrevd for at upserten i api/league/join skal fungere i det
-- hele tatt (Supabase sin onConflict krever en matchende constraint).

create table if not exists leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null,
  created_by uuid references participants(id) on delete cascade,
  hidden_until_kickoff boolean not null default false,
  created_at timestamptz default now()
);

alter table leagues
  add constraint leagues_invite_code_unique unique (invite_code);

create table if not exists league_members (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references leagues(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  created_at timestamptz default now()
);

alter table league_members
  add constraint league_members_unique unique (league_id, participant_id);

create index if not exists league_members_league_idx on league_members (league_id);
create index if not exists league_members_participant_idx on league_members (participant_id);
