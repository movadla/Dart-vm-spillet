-- Kjør dette i Supabase Dashboard → SQL Editor
-- Aktiverer Row Level Security på alle tabeller
-- Kun match_results er lesbar for anon (offentlig kampdata, brukt av vm-info sin Kamper-fane)
-- Alt annet går via service role (Next.js API-routes og server-komponenter)
--
-- Et FERSKT oppsett trenger IKKE denne filen — schema.sql aktiverer RLS på
-- alt allerede. Denne er kun til å rette opp RLS på en database der det av
-- en eller annen grunn har blitt slått av igjen.

-- === Aktiver RLS ===
ALTER TABLE IF EXISTS participants          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS picks                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS match_results         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS magic_links           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leagues               ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS league_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS newsletter_signups    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rank_snapshot         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_login_attempts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rate_limit_hits       ENABLE ROW LEVEL SECURITY;

-- === Offentlige lesetilganger (anon-nøkkel fra browser) ===
-- match_results: kampscore vises på vm-info sin Kamper-fane
DROP POLICY IF EXISTS "anon read" ON match_results;
CREATE POLICY "anon read" ON match_results FOR SELECT TO anon USING (true);

-- === Alle andre tabeller: ingen anon-policy = blokkert ===
-- (participants, picks, magic_links, leagues, league_members,
--  newsletter_signups, rank_snapshot, admin_login_attempts,
--  rate_limit_hits er alle kun tilgjengelige via service role key
--  i Next.js API-routes og server-komponenter)
