-- Kjør dette i Supabase Dashboard → SQL Editor
-- Aktiverer Row Level Security på alle tabeller
-- Kun match_results og advancement er lesbare for anon (offentlige data)
-- Alt annet går via service role (Next.js API-routes og server-komponenter)

-- === Aktiver RLS ===
ALTER TABLE IF EXISTS participants      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS picks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS match_results     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS advancement       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS magic_links       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leagues           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS league_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS newsletter_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pin_send_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pin_attempts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rank_snapshot     ENABLE ROW LEVEL SECURITY;

-- === Offentlige lesetilganger (anon-nøkkel fra browser) ===
-- match_results: kampscore vises på forsiden og vm-info
DROP POLICY IF EXISTS "anon read" ON match_results;
CREATE POLICY "anon read" ON match_results FOR SELECT TO anon USING (true);

-- advancement: lagavansement vises på vm-info
DROP POLICY IF EXISTS "anon read" ON advancement;
CREATE POLICY "anon read" ON advancement FOR SELECT TO anon USING (true);

-- === Alle andre tabeller: ingen anon-policy = blokkert ===
-- (participants, picks, magic_links, leagues, league_members,
--  newsletter_signups, pin_send_log, pin_attempts, rank_snapshot
--  er alle kun tilgjengelige via service role key i Next.js API-routes
--  og server-komponenter)
