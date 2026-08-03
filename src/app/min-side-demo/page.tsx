import Link from 'next/link'
import { POTS, getIso2 } from '@/data/pots'
import { GROUP_SCHEDULE } from '@/data/schedule'
import { calcTeamPoints, isTeamEliminated, MatchResult, AdvancementRow } from '@/lib/scoring'
import { EnrichedPick } from '@/app/deltaker/[id]/PicksClient'
import { UpcomingMatch } from '@/app/deltaker/[id]/MinSideAccordions'
import DemoPoints from './DemoPoints'
import PicksClient from '@/app/deltaker/[id]/PicksClient'
import UpcomingMatchCard from '@/app/deltaker/[id]/UpcomingMatchCard'

// ─────────────────────────────────────────────────────────────────────────────
// DEMO-SIDE for Min side — kun for testing av utseende.
// Bruker eksempeldata og den EKTE beregningslogikken (scoring + kampoppsett),
// men henter ingenting fra databasen. Helt adskilt fra ekte /deltaker/[id].
//
// Scenario: VM har startet. Første kamp er spilt: Mexico 2–1 Sør-Afrika (gruppe A).
// ─────────────────────────────────────────────────────────────────────────────

const VM_STARTED = true

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'
const POT_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#06b6d4', '#ef4444', '#ec4899']

const DEMO_NAME = 'Demo Testesen'
const DEMO_RANK = 3
const DEMO_DELTA = 12 // «+X siden sist»

// Deltakerens 8 lag (ett per pott). Inkluderer Mexico (pott 4) og Sør-Afrika (pott 8).
const PICKS: { pot_number: number; team_name: string }[] = [
  { pot_number: 1, team_name: 'Frankrike' },
  { pot_number: 2, team_name: 'Brasil' },
  { pot_number: 3, team_name: 'Nederland' },
  { pot_number: 4, team_name: 'Mexico' },
  { pot_number: 5, team_name: 'Sveits' },
  { pot_number: 6, team_name: 'Tsjekkia' },
  { pot_number: 7, team_name: 'Bosnia-Hercegovina' },
  { pot_number: 8, team_name: 'Sør-Afrika' },
]

// Eksplisitte resultater (de første seks kampene).
const EXPLICIT_RESULTS: MatchResult[] = [
  { home_team: 'Mexico', away_team: 'Sør-Afrika', home_goals: 2, away_goals: 1, stage: 'group' },
  { home_team: 'Sør-Korea', away_team: 'Tsjekkia', home_goals: 2, away_goals: 0, stage: 'group' },
  { home_team: 'Canada', away_team: 'Bosnia-Hercegovina', home_goals: 0, away_goals: 1, stage: 'group' },
  { home_team: 'Qatar', away_team: 'Sveits', home_goals: 3, away_goals: 0, stage: 'group' },
  { home_team: 'USA', away_team: 'Paraguay', home_goals: 1, away_goals: 1, stage: 'group' },
  { home_team: 'Australia', away_team: 'Tyrkia', home_goals: 0, away_goals: 4, stage: 'group' },
]

// Deterministisk «tilfeldig» målscore basert på kamp-id (stabil mellom renders).
function seededGoals(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) }
  const r = ((h >>> 0) % 1000) / 1000
  if (r < 0.30) return 0
  if (r < 0.58) return 1
  if (r < 0.80) return 2
  if (r < 0.92) return 3
  return 4
}

// Resten av gruppespillet (alle gjenstående kamper) med genererte resultater.
const explicitPairs = new Set<string>()
for (const m of EXPLICIT_RESULTS) {
  explicitPairs.add(`${m.home_team}|${m.away_team}`)
  explicitPairs.add(`${m.away_team}|${m.home_team}`)
}
// Styrte resultater så 6 av brukerens 8 lag går videre.
// Videre: Frankrike, Brasil, Nederland, Mexico, Tsjekkia, Bosnia. Ut: Sør-Afrika, Sveits.
const RESULT_OVERRIDE: Record<string, [number, number]> = {
  // Gruppe A — Mexico 1., Tsjekkia 2., Sør-Afrika sist
  m003: [2, 0], m004: [2, 0], m005: [2, 1], m006: [1, 0],
  // Gruppe B — Bosnia 1., Qatar 2., Sveits sist
  m009: [0, 2], m010: [0, 2], m011: [0, 1], m012: [2, 0],
  // Gruppe C — Brasil vinner alt
  m013: [2, 0], m016: [2, 0], m017: [0, 2],
  // Gruppe F — Nederland vinner alt
  m031: [2, 0], m033: [2, 0], m036: [0, 2],
  // Gruppe I — Frankrike vinner alt
  m049: [2, 0], m051: [2, 0], m053: [0, 2],
}
const GENERATED_RESULTS: MatchResult[] = GROUP_SCHEDULE
  .filter((m) => !explicitPairs.has(`${m.home}|${m.away}`))
  .map((m) => {
    const ov = RESULT_OVERRIDE[m.id]
    return {
      home_team: m.home,
      away_team: m.away,
      home_goals: ov ? ov[0] : seededGoals(m.id + 'H'),
      away_goals: ov ? ov[1] : seededGoals(m.id + 'A'),
      stage: 'group' as const,
    }
  })

const groupResults: MatchResult[] = [...EXPLICIT_RESULTS, ...GENERATED_RESULTS]

// ── Beregn hvem som går videre fra gruppespillet (kun gruppekamper) ──────────
// Topp 2 i hver gruppe + 8 beste treere = 32 lag videre (R32).
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
const advancers = new Set<string>()
const thirdPlaced: ReturnType<typeof teamStats>[] = []
for (const letter of Object.keys(groupsByLetter)) {
  const standings = groupsByLetter[letter].map(teamStats).sort(cmp)
  if (standings[0]) advancers.add(standings[0].team)
  if (standings[1]) advancers.add(standings[1].team)
  if (standings[2]) thirdPlaced.push(standings[2])
}
for (const t of thirdPlaced.sort(cmp).slice(0, 8)) advancers.add(t.team)

// ── Sluttspill: t.o.m. 1/8-finaler (R16) ────────────────────────────────────
// 3 av brukerens lag videre til kvartfinale (QF), resten ryker ut i 1/8 eller 1/16.
const PICKS6 = ['Frankrike', 'Brasil', 'Nederland', 'Mexico', 'Tsjekkia', 'Bosnia-Hercegovina']
const otherAdv = [...advancers].filter((t) => !PICKS6.includes(t))
let oppIdx = 0
const nextOpp = () => otherAdv[oppIdx++] ?? 'Motstander'

// reached = stage_reached (siste vunne runde). legs = [stage, mål for, mål mot] sett fra lagets side.
const KO_PATHS: { team: string; reached: string; legs: [string, number, number][] }[] = [
  { team: 'Frankrike', reached: 'r16', legs: [['r32', 2, 0], ['r16', 1, 0]] },          // videre → QF
  { team: 'Brasil', reached: 'r16', legs: [['r32', 2, 0], ['r16', 2, 1]] },             // videre → QF
  { team: 'Nederland', reached: 'r16', legs: [['r32', 3, 1], ['r16', 1, 0]] },          // videre → QF
  { team: 'Mexico', reached: 'r32', legs: [['r32', 2, 1], ['r16', 0, 2]] },             // ut i 1/8-finale
  { team: 'Tsjekkia', reached: 'group', legs: [['r32', 0, 1]] },                        // ut i 1/16-finale
  { team: 'Bosnia-Hercegovina', reached: 'group', legs: [['r32', 1, 2]] },              // ut i 1/16-finale
]
const KO_RESULTS: MatchResult[] = []
const koStage: Record<string, string> = {}
for (const path of KO_PATHS) {
  koStage[path.team] = path.reached
  for (const [stage, gf, ga] of path.legs) {
    KO_RESULTS.push({ home_team: path.team, away_team: nextOpp(), home_goals: gf, away_goals: ga, stage })
  }
}

const matchResults: MatchResult[] = [...groupResults, ...KO_RESULTS]
const advRows: AdvancementRow[] = [...advancers].map((team) => ({ team_name: team, stage_reached: koStage[team] ?? 'group' }))

const PICK_PCT: Record<number, number> = { 1: 41, 2: 33, 3: 19, 4: 12, 5: 9, 6: 6, 7: 4, 8: 7 }

const playedPairs = new Set<string>()
for (const m of matchResults) {
  playedPairs.add(`${m.home_team}|${m.away_team}`)
  playedPairs.add(`${m.away_team}|${m.home_team}`)
}

// Bygg enrichedPicks med EKTE logikk (samme som /deltaker/[id]).
const enrichedPicks: EnrichedPick[] = PICKS.map((pick) => {
  const pot = POTS.find((p) => p.potNumber === pick.pot_number)
  const team = pot?.teams.find((t) => t.name === pick.team_name)
  const { matchPts, advPts, multiplier, total } = calcTeamPoints(pick, matchResults, advRows)
  const advStage = advRows.find((a) => a.team_name === pick.team_name)?.stage_reached ?? null
  const isEliminated = isTeamEliminated(pick.team_name, advRows, matchResults, true)
  const stageLabel =
    advStage === 'gold' ? 'Gullmedalje'
    : advStage === 'silver' ? 'Sølvmedalje'
    : advStage === 'bronze' ? 'Bronsemedalje'
    : isEliminated ? null
    : advStage === 'sf' ? 'I finalen'
    : advStage === 'qf' ? 'Videre → SF'
    : advStage === 'r16' ? 'Videre → QF'
    : advStage === 'r32' ? 'Videre → 1/8'
    : advStage === 'group' ? 'Videre → 1/16'
    : null

  const played = matchResults
    .filter((m) => m.home_team === pick.team_name || m.away_team === pick.team_name)
    .map((m) => {
      const s = GROUP_SCHEDULE.find(
        (sc) =>
          (sc.home === m.home_team && sc.away === m.away_team) ||
          (sc.home === m.away_team && sc.away === m.home_team),
      )
      return {
        home: m.home_team, homeGoals: m.home_goals,
        away: m.away_team, awayGoals: m.away_goals,
        date: s?.date ?? '9999-99-99', time: s?.time ?? '', group: s?.group ?? '', stage: m.stage ?? 'group',
      }
    })

  const upcoming = GROUP_SCHEDULE
    .filter((m) => (m.home === pick.team_name || m.away === pick.team_name) && !playedPairs.has(`${m.home}|${m.away}`))
    .map((m) => ({
      date: m.date, time: m.time,
      home: m.home, homeIso2: getIso2(m.home),
      away: m.away, awayIso2: getIso2(m.away),
      venue: m.venue, group: m.group,
    }))

  return {
    potNumber: pick.pot_number,
    teamName: pick.team_name,
    flag: team?.flag ?? '🏳',
    odds: team?.odds ?? '–',
    pickPct: PICK_PCT[pick.pot_number] ?? 10,
    fifaRanking: team?.fifaRanking ?? 0,
    vmGroup: team?.vmGroup ?? '–',
    color: POT_COLORS[pick.pot_number - 1],
    matchPts, advPts, multiplier, total,
    stageLabel,
    played,
    upcoming,
    knockoutUpcoming: null,
    knockoutOpponent: null,
    isEliminated,
    advStage,
  }
})

const totalPoints = enrichedPicks.reduce((s, p) => s + p.total, 0)

// Eksempel-kamper for å vise «Neste kamper»-seksjonen (illustrativt).
const exampleUpcoming: UpcomingMatch[] = [
  { id: 'demo-u1', date: '2026-07-15', time: '21:00', home: 'Frankrike', homeIso2: getIso2('Frankrike'), away: 'Spania', awayIso2: getIso2('Spania'), isHome: true },
  { id: 'demo-u2', date: '2026-07-16', time: '18:00', home: 'Brasil', homeIso2: getIso2('Brasil'), away: 'Argentina', awayIso2: getIso2('Argentina'), isHome: true },
]

export default function MinSideDemoPage() {
  return (
    <div className="page-bg" style={{ minHeight: '100vh', color: '#fff', padding: '32px 16px 56px', position: 'relative' }}>
      <img src="/snåsamannen.png" alt="" style={{ position: 'absolute', right: -10, top: 0, width: 260, opacity: 0.32, pointerEvents: 'none', zIndex: 0, filter: 'brightness(1.0) saturate(0.7) contrast(1.05)', maskImage: 'radial-gradient(ellipse 62% 58% at 56% 34%, black 0%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 62% 58% at 56% 34%, black 0%, transparent 100%)' }} />

      {/* DEMO-merke */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: 12 }}>
        <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fbbf24', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.35)', borderRadius: 100, padding: '4px 12px' }}>
          Demo — 1/8-finaler spilt (3 lag videre til QF)
        </span>
      </div>

      {/* Brand banner */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 60, zIndex: 1 }}>
        <Link href="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.02em' }}>← Startside</Link>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', lineHeight: 1.3, paddingTop: 4, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)' }}>
            — Snåsamannen 2026 —
          </div>
          <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: 32, letterSpacing: '-0.5px', lineHeight: 1, whiteSpace: 'nowrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.38)' }}>VM-</span>
            <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
          </div>
        </div>
        <Link href="/vm-info?fra=minside" className="back-btn">Info →</Link>
      </div>

      {/* Navn */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18))' }} />
        <div style={{ fontFamily: SPORT, fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.3, paddingTop: 4, background: 'linear-gradient(180deg, #ffffff 0%, #86efac 55%, rgba(34,197,94,0.8) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap', textShadow: '0 0 20px rgba(34,197,94,0.2), 0 0 6px rgba(34,197,94,0.25)' }}>{DEMO_NAME}</div>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.18))' }} />
      </div>

      {/* MINE LAG (øverst) — totalpoeng OVER lagene */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)', flexShrink: 0 }}>Mine lag</div>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1))' }} />
        </div>
        {/* Totalpoeng OVER lagene: tallet til høyre (i 64px-kolonne = pointsColWidth),
            «siden i går»-badgen til venstre — samme størrelse (fontSize 9) og x som stage-merkene. */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', marginBottom: 8, background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', flexShrink: 0 }}>Totalpoeng</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span style={{ flexShrink: 0, fontSize: 9, fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.28)', borderRadius: 4, padding: '2px 6px', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>+{DEMO_DELTA} siden i går</span>
            <div style={{ width: 64, textAlign: 'right', flexShrink: 0 }}><DemoPoints value={totalPoints} /></div>
          </div>
        </div>
        <PicksClient picks={enrichedPicks} totalPoints={totalPoints} vmStarted={VM_STARTED} pointsAccent="green" pointsColWidth={64} alignPointsTop stageBadgeColor="#4ade80" stageBadgeInline hideTotal />
      </div>

      {/* LIGAER (under) */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', flexShrink: 0 }}>Ligaer</div>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1))' }} />
        </div>
        <div style={{ background: 'linear-gradient(180deg, #1a2030 0%, #151924 100%)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.22)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
          <div style={{ padding: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Overall leaderboard — pinnet (jordklode bak teksten) */}
              <Link href="/leaderboard" className="lb-card" style={{ background: 'linear-gradient(180deg, #1c2030 0%, #14181f 100%)', border: '1px solid rgba(251,191,36,0.28)', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px 11px 16px', textDecoration: 'none', gap: 8, minWidth: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Overall leaderboard</span>
                  <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>🌍</span>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontFamily: SPORT, fontSize: 20, fontWeight: 900, color: '#fbbf24', lineHeight: 1, letterSpacing: '-0.5px' }}>{DEMO_RANK}<span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/87</span></span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>›</span>
                </div>
              </Link>
              {/* Vanlig venneliga */}
              <div className="lb-card" style={{ background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px 11px 16px', gap: 8, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Kontorligaen</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontFamily: SPORT, fontSize: 20, fontWeight: 900, color: '#fbbf24', lineHeight: 1, letterSpacing: '-0.5px' }}>2<span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/14</span></span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>›</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NESTE KAMPER (under ligaer) */}
      <div style={{ marginTop: 36, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)', flexShrink: 0 }}>Neste kamper</div>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1))' }} />
        </div>
        <UpcomingMatchCard matches={exampleUpcoming} />
      </div>

      <div style={{ marginTop: 28, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
        Demo med eksempeldata. 1/8-finaler spilt. Endringer her påvirker ikke den ekte Min side.
      </div>
    </div>
  )
}
