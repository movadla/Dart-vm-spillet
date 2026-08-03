import SmartBackButton from '@/components/SmartBackButton'
import { POTS, getIso2 } from '@/data/pots'
import { GROUP_SCHEDULE } from '@/data/schedule'
import { calcParticipantPoints, isTeamEliminated, MatchResult, AdvancementRow } from '@/lib/scoring'
import RankList, { RankEntry } from '@/components/RankList'

// ─────────────────────────────────────────────────────────────────────────────
// DEMO-SIDE for en liga — kun for testing av utseende.
// 15 deltakere med tilfeldige lagvalg, etter 10 spilte gruppekamper.
// Deterministisk seedet (stabilt mellom renders). Henter ingenting fra databasen.
// ─────────────────────────────────────────────────────────────────────────────

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

const NAMES = [
  'Ola Nordmann', 'Kari Hansen', 'Torgeir F. Vangsvik', 'Elin Fiskum', 'Bjørn Aamodt',
  'Ingrid Solheim', 'Lars Petter Hauge', 'Marte Lønning', 'Geir Ove Tangen', 'Silje Bråten',
  'Håkon Eide', 'Nina Sæther', 'Per Kristian Moe', 'Astrid Vik', 'Morten Dahl',
]

// FNV-1a hash → uint (deterministisk «tilfeldighet»)
function seed(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
function seededGoals(str: string): number {
  const r = (seed(str) % 1000) / 1000
  if (r < 0.30) return 0
  if (r < 0.58) return 1
  if (r < 0.80) return 2
  if (r < 0.92) return 3
  return 4
}

// Alle gruppekamper spilt.
const groupResults: MatchResult[] = GROUP_SCHEDULE.map((m) => ({
  home_team: m.home, away_team: m.away,
  home_goals: seededGoals(m.id + 'H'), away_goals: seededGoals(m.id + 'A'),
  stage: 'group' as const,
}))

// Gruppetabeller → 32 videre (topp 2 + 8 beste treere).
function teamStats(team: string) {
  let pts = 0, gf = 0, ga = 0
  for (const m of groupResults) {
    if (m.home_team === team) { gf += m.home_goals; ga += m.away_goals; pts += m.home_goals > m.away_goals ? 3 : m.home_goals === m.away_goals ? 1 : 0 }
    else if (m.away_team === team) { gf += m.away_goals; ga += m.home_goals; pts += m.away_goals > m.home_goals ? 3 : m.away_goals === m.home_goals ? 1 : 0 }
  }
  return { team, pts, gd: gf - ga, gf }
}
const groupsByLetter: Record<string, string[]> = {}
for (const t of POTS.flatMap((p) => p.teams)) (groupsByLetter[t.vmGroup] ??= []).push(t.name)
const cmp = (a: { pts: number; gd: number; gf: number }, b: { pts: number; gd: number; gf: number }) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf
const advancers: string[] = []
const thirds: ReturnType<typeof teamStats>[] = []
for (const letter of Object.keys(groupsByLetter)) {
  const standings = groupsByLetter[letter].map(teamStats).sort(cmp)
  if (standings[0]) advancers.push(standings[0].team)
  if (standings[1]) advancers.push(standings[1].team)
  if (standings[2]) thirds.push(standings[2])
}
for (const t of thirds.sort(cmp).slice(0, 8)) advancers.push(t.team)

// Spill én knockout-runde (ingen uavgjort).
function playRound(teams: string[], stage: string): { results: MatchResult[]; winners: string[] } {
  const results: MatchResult[] = []
  const winners: string[] = []
  for (let i = 0; i + 1 < teams.length; i += 2) {
    let hg = seededGoals(teams[i] + stage + 'H'), ag = seededGoals(teams[i + 1] + stage + 'A')
    if (hg === ag) hg += 1
    results.push({ home_team: teams[i], away_team: teams[i + 1], home_goals: hg, away_goals: ag, stage })
    winners.push(hg > ag ? teams[i] : teams[i + 1])
  }
  return { results, winners }
}
const r32 = playRound(advancers, 'r32')       // 16 vinnere
const r16 = playRound(r32.winners, 'r16')      // 8 vinnere (i kvartfinale)

const matchResults: MatchResult[] = [...groupResults, ...r32.results, ...r16.results]
const r32Set = new Set(r32.winners)
const r16Set = new Set(r16.winners)
const advRows: AdvancementRow[] = advancers.map((team) => ({
  team_name: team,
  stage_reached: r16Set.has(team) ? 'r16' : r32Set.has(team) ? 'r32' : 'group',
}))

// 15 deltakere, hver med ett lag per pott (seedet valg).
const rows: RankEntry[] = NAMES.map((name, i) => {
  const picks = POTS.map((pot) => {
    const team = pot.teams[seed(`${i}-${pot.potNumber}`) % pot.teams.length]
    return { pot_number: pot.potNumber, team_name: team.name }
  })
  const points = calcParticipantPoints(picks, matchResults, advRows)
  // Sum av hvert lags kamper (innbyrdes kamp mellom to egne lag telles 2 ganger → alltid 24 etter gruppespill).
  const matchesPlayed = picks.reduce((sum, pk) =>
    sum + matchResults.filter((mt) => mt.home_team === pk.team_name || mt.away_team === pk.team_name).length, 0)
  const flags = picks.map((pk) => ({ iso2: getIso2(pk.team_name), eliminated: isTeamEliminated(pk.team_name, advRows, matchResults, true) }))
  return { id: `demo-${i}`, name, flags, points, matchesPlayed }
}).sort((a, b) => b.points - a.points)

// Seedet posisjonsendring siden i går (demo). + = opp, − = ned, 0 = uendret.
// Klemmes så ingen «flytter opp» forbi 1.plass eller ned forbi siste.
const rowsWithDelta: RankEntry[] = rows.map((r, i) => {
  const s = seed(r.id + 'delta') % 7 // 0..6
  let delta = s === 0 ? 0 : s <= 3 ? s : -(s - 3) // 0 / +1..+3 / −1..−3
  delta = Math.max(-(rows.length - 1 - i), Math.min(i, delta))
  return { ...r, rankDelta: delta }
})

export default function LigaDemoPage() {
  return (
    <div className="page-bg" style={{ minHeight: '100vh', color: '#fff', padding: '32px 16px 56px', position: 'relative' }}>
      <img src="/snåsamannen.png" alt="" style={{ position: 'absolute', right: -10, top: 0, width: 260, opacity: 0.32, pointerEvents: 'none', zIndex: 0, filter: 'brightness(1.0) saturate(0.7) contrast(1.05)', maskImage: 'radial-gradient(ellipse 62% 42% at 56% 23%, black 0%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 62% 42% at 56% 23%, black 0%, transparent 100%)' }} />

      {/* DEMO-merke */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: 12 }}>
        <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fbbf24', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.35)', borderRadius: 100, padding: '4px 12px' }}>
          Demo — liga med 15 deltakere, etter 1/8-finaler
        </span>
      </div>

      {/* Brand banner */}
      <div style={{ position: 'relative', height: 150, marginBottom: 16, pointerEvents: 'none', zIndex: 1 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'auto' }}>
          <SmartBackButton />
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.3, paddingTop: 4, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)' }}>
            — Snåsamannen 2026 —
          </div>
          <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: 52, letterSpacing: '-1px', lineHeight: 1 }}>
            <span style={{ color: 'rgba(255,255,255,0.38)' }}>VM-</span>
            <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
          </div>
        </div>
      </div>

      {/* Liga-navn */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Liga</div>
        <div style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.05, textAlign: 'center', letterSpacing: '0.06em' }}>
          <span style={{ color: 'rgba(255,255,255,0.22)' }}>— </span>
          <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Kontorligaen</span>
          <span style={{ color: 'rgba(255,255,255,0.22)' }}> —</span>
        </div>
      </div>

      <RankList rows={rowsWithDelta} vmStarted scrollToMe={false} />

      <div style={{ marginTop: 28, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
        Demo med eksempeldata (15 deltakere, t.o.m. 1/8-finaler). Klikk på rader fører ingensteds her.
      </div>
    </div>
  )
}
