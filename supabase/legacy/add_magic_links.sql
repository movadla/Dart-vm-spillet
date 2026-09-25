create table if not exists magic_links (
  token text primary key,
  participant_id uuid references participants(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz
);

create index if not exists magic_links_participant_idx on magic_links (participant_id);
