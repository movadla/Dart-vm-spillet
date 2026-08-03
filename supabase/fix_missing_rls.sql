-- Aktiverer RLS på tabeller som manglet det (oppdaget 2026-06-12 via Supabase security alert).
-- Kjør i Supabase Dashboard → SQL Editor.
-- Ingen anon-policy trengs: begge tabeller aksesseres kun via service role.

ALTER TABLE IF EXISTS pin_attempts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rank_snapshot  ENABLE ROW LEVEL SECURITY;
