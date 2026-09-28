-- Fullstendig databaseoppsett for dart-vm-spillet — kjør HELE denne filen ÉN
-- gang i Supabase Dashboard → SQL Editor. Dekker alt appen trenger (skjema,
-- tabeller, constraints, indekser, tilganger, RLS) i riktig rekkefølge — du
-- trenger ikke kjøre noen av de andre filene i denne mappen etterpå.
--
-- Alt legges i et EGET Postgres-skjema ("dart_vm"), ikke i "public" — dette
-- er ment å kunne kjøres i SAMME Supabase-prosjekt som en annen app (f.eks.
-- vm-tipping) uten noen som helst risiko for å påvirke dens tabeller/data.
-- Skjemaer er fullstendig atskilte navnerom i Postgres.
--
-- ÉN manuell dashbord-innstilling kreves i tillegg (kan ikke settes fra SQL):
-- Project Settings → API → "Exposed schemas" → legg til «dart_vm» i listen
-- (ved siden av «public» som står der fra før). Uten dette avviser Supabase
-- sitt REST-API alle spørringer mot dart_vm, selv med riktige nøkler.
--
-- Har du i stedet en EKSISTERENDE dart-vm-spillet-database fra FØR dette
-- skjema-oppsettet (dvs. tabeller direkte i "public")? Ikke kjør denne filen
-- — bruk migrate_to_darts.sql og de øvrige add_*.sql-/drop_*.sql-filene i
-- denne mappen i stedet, se README.md.

create schema if not exists dart_vm;
set search_path to dart_vm;

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

-- Atomisk "sjekk og registrer" for rate_limit_hits. Den gamle applikasjons-
-- siden gjorde dette som to separate kall (tell rader, så sett inn én) — et
-- klassisk kappløp der to samtidige forespørsler begge kan lese antall <
-- grense FØR noen av dem har rukket å sette inn, og dermed slippe én for
-- mange gjennom. pg_advisory_xact_lock låser på en hash av bucket+key inntil
-- transaksjonen er ferdig, så samtidige kall for SAMME bucket+key kø-legges
-- i stedet for å race mot hverandre. Se src/lib/rateLimit.ts sin
-- tryRecordRateLimitHit().
-- Skjema/tabell fullt kvalifisert (dart_vm.*) i stedet for å stole på
-- search_path — denne funksjonen ble en gang limt inn og kjørt ALENE i en
-- fersk SQL Editor-fane (uten `set search_path to dart_vm` fra toppen av
-- denne fila) og havnet da i "public" ved en feil. Kvalifisert eksplisitt
-- her så det ikke kan skje igjen, uansett hvordan denne blokken kjøres.
create or replace function dart_vm.check_rate_limit(p_bucket text, p_key text, p_limit int, p_window_ms bigint)
returns boolean
language plpgsql
as $$
declare
  v_count int;
  v_window_start timestamptz := now() - (p_window_ms::text || ' milliseconds')::interval;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_bucket || ':' || p_key, 0));

  select count(*) into v_count from dart_vm.rate_limit_hits
    where bucket = p_bucket and key = p_key and created_at >= v_window_start;

  if v_count >= p_limit then
    return false;
  end if;

  insert into dart_vm.rate_limit_hits (bucket, key) values (p_bucket, p_key);
  return true;
end;
$$;

-- Audit-logg for admin-handlinger. Admin-autentisering er én delt hemmelighet
-- (ingen individuelle admin-kontoer), så loggen registrerer HVA som ble gjort
-- og NÅR, men ikke hvilken person — se src/lib/adminAudit.ts.
create table admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  detail jsonb,
  created_at timestamptz default now()
);
create index admin_audit_log_created_idx on admin_audit_log (created_at desc);

-- === Tilganger ===
-- Et NYTT skjema (i motsetning til "public") kommer ikke med noen
-- forhåndskonfigurerte tilganger for Supabase sine roller — uten disse ville
-- selv service_role-nøkkelen (som ellers går utenom RLS) blitt avvist av
-- PostgREST på ren manglende GRANT. RLS under er den reelle sikkerhets-
-- grensen for anon/authenticated; disse GRANT-ene tilsvarer bare det
-- "public"-skjemaet allerede har fra Supabase sin side.
grant usage on schema dart_vm to anon, authenticated, service_role;
grant all on all tables in schema dart_vm to anon, authenticated, service_role;
grant all on all sequences in schema dart_vm to anon, authenticated, service_role;
alter default privileges in schema dart_vm grant all on tables to anon, authenticated, service_role;
alter default privileges in schema dart_vm grant all on sequences to anon, authenticated, service_role;
-- Funksjoner trenger samme eksplisitte GRANT som tabeller over — PostgREST
-- avviser ellers check_rate_limit()-kallet fra service_role på ren manglende
-- tilgang, samme årsak som resten av denne seksjonen.
grant execute on function dart_vm.check_rate_limit(text, text, int, bigint) to anon, authenticated, service_role;

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
alter table admin_audit_log       enable row level security;

create policy "anon read" on match_results for select to anon using (true);
