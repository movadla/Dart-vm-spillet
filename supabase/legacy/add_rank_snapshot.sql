-- Daglig rang-snapshot for piler ▲/▼ (rang-endring siden i går).
-- scope = 'overall' (hele leaderboardet) eller en liga-invite_code (f.eks. '4B86F9').
-- Skrives daglig av /api/snapshot-ranks. Kjør denne i Supabase SQL editor.

create table if not exists rank_snapshot (
  scope          text not null,
  participant_id uuid not null references participants(id) on delete cascade,
  rank_pos       int  not null,
  snapshot_date  date not null,
  primary key (scope, participant_id, snapshot_date)
);

create index if not exists rank_snapshot_scope_date_idx
  on rank_snapshot (scope, snapshot_date desc);
