-- Kjør i Supabase Dashboard → SQL Editor
-- Lagrer målscorere per kamp (hentes fra football-data.org)

CREATE TABLE IF NOT EXISTS match_goals (
  id          serial      PRIMARY KEY,
  home_team   text        NOT NULL,
  away_team   text        NOT NULL,
  scorer      text        NOT NULL,
  minute      integer     NOT NULL,
  team        text        NOT NULL,
  goal_type   text        NOT NULL DEFAULT 'REGULAR' -- REGULAR | OWN_GOAL | PENALTY
);

CREATE INDEX IF NOT EXISTS match_goals_match ON match_goals (home_team, away_team);

-- RLS
ALTER TABLE match_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon read" ON match_goals;
CREATE POLICY "anon read" ON match_goals FOR SELECT TO anon USING (true);
