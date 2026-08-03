create table pin_attempts (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade,
  attempted_at timestamptz default now()
);

create index on pin_attempts (participant_id, attempted_at);
