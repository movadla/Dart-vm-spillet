-- Delt rate-limit-tabell for endepunkter som ikke hadde noen begrensning i
-- det hele tatt: /api/finn (e-post → deltaker-oppslag, ellers scriptbart for
-- e-post-enumerering) og /api/tipp/update (lagre picks). "bucket" skiller
-- bruksområdene fra hverandre i samme tabell, i stedet for én ny tabell per
-- endepunkt (se admin_login_attempts/pin_attempts for det eldre mønsteret).
create table if not exists rate_limit_hits (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  key text not null,
  created_at timestamptz default now()
);

create index if not exists rate_limit_hits_lookup_idx
  on rate_limit_hits (bucket, key, created_at);

-- Gamle rader trengs aldri utover det lengste rate-limit-vinduet i bruk —
-- rydd manuelt ved behov, f.eks.:
-- delete from rate_limit_hits where created_at < now() - interval '7 days';
