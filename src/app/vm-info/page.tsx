'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import SmartBackButton from '@/components/SmartBackButton'
import StepSlideshow from '@/components/StepSlideshow'
import { VM_GROUPS } from '@/data/vm-groups'
import { GROUP_SCHEDULE } from '@/data/schedule'
import { VENUES } from '@/data/venues'
import { KNOCKOUT_VENUES } from '@/data/knockout-venues'
import { POTS, getIso2 } from '@/data/pots'
import Flag from '@/components/Flag'
import { supabase } from '@/lib/supabase'
import { buildBracket, getKnockoutOpponent, type KnockoutBracket, type BracketMatch } from '@/lib/bracket'
import { calcTeamPoints, isTeamEliminated, type MatchResult, type AdvancementRow } from '@/lib/scoring'
import CountryMatchDetail from './CountryMatchDetail'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

interface GroupRow {
  name: string; played: number; w: number; d: number; l: number; gf: number; ga: number; pts: number
}

function calcGroupStandings(teams: string[], results: Record<string, { hg: number; ag: number }>): GroupRow[] {
  const s: Record<string, GroupRow> = {}
  for (const t of teams) s[t] = { name: t, played: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const a = teams[i], b = teams[j]
      const r = results[`${a}|${b}`] ?? results[`${b}|${a}`]
      if (!r) continue
      const home = results[`${a}|${b}`] ? a : b
      const away = home === a ? b : a
      const hg = results[`${home}|${away}`]!.hg
      const ag = results[`${home}|${away}`]!.ag
      s[home].played++; s[away].played++
      s[home].gf += hg; s[home].ga += ag
      s[away].gf += ag; s[away].ga += hg
      if (hg > ag)      { s[home].w++; s[home].pts += 3; s[away].l++ }
      else if (hg < ag) { s[away].w++; s[away].pts += 3; s[home].l++ }
      else              { s[home].d++; s[home].pts++; s[away].d++; s[away].pts++ }
    }
  }
  return teams.map(n => s[n]).sort((a, b) =>
    b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf
  )
}

const KICKOFF = new Date('2026-06-11T19:00:00Z')

interface EspnGoal { scorer: string; minute: string; team: string; isPenalty: boolean; isOwnGoal: boolean }
interface EspnMatch { homeGoals: number; awayGoals: number; minute: string; state: string; goals: EspnGoal[] }

const DAY_NAMES = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag']
const MONTH_NAMES = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember']

function formatMatchDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()}. ${MONTH_NAMES[d.getMonth()]}`
}

function groupByDate<T extends { date: string; time?: string }>(items: T[]): { date: string; label: string; items: T[] }[] {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const existing = map.get(item.date) ?? []
    map.set(item.date, [...existing, item])
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, items]) => ({
    date,
    label: formatMatchDate(date),
    items: items.slice().sort((a, b) => (a.time ?? '').localeCompare(b.time ?? '')),
  }))
}

const POT_COLORS = [
  '#d97706', '#2563eb', '#16a34a', '#ea580c',
  '#7c3aed', '#0891b2', '#dc2626', '#db2777',
]

// Kommende knockout-runde (samme som Min side) — brukes til å vise neste motstander.
const STAGE_SEQUENCE = ['group', 'r32', 'r16', 'qf', 'sf', 'final']
const KNOCKOUT_UPCOMING: Record<string, string> = {
  r32: '1/16-finale', r16: '1/8-finale', qf: 'Kvartfinale', sf: 'Semifinale', final: 'Finale',
}

type Tab = 'land' | 'vmguide' | 'regler'
const TABS: { id: Tab; label: string }[] = [
  { id: 'land',    label: 'Poengoversikt' },
  { id: 'vmguide', label: 'VM-guide'      },
  { id: 'regler',  label: 'Regler'        },
]

const ROUND_LABELS: Record<string, string> = {
  r32: '1/16-finale', r16: '1/8-finale', qf: 'Kvartfinale', sf: 'Semifinale', bronze: 'Bronsefinale', final: 'Finale',
}
// Which round the winners of each round feed into (bronze is a leaf — no next)
const NEXT_ROUND: Partial<Record<string, string>> = {
  r32: 'r16', r16: 'qf', qf: 'sf', sf: 'final',
}

function MatchCard({ m, large, upcoming, schedule, flat }: { m: BracketMatch; large?: boolean; upcoming?: boolean; schedule?: { date: string; time: string; channel?: 'NRK1' | 'TV 2' }; flat?: boolean }) {
  const played = m.homeGoals !== null
  const dim = upcoming && !played
  const fs = large ? 14 : 12
  const flagFs = large ? 20 : 18
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px',
      background: dim ? 'rgba(255,255,255,0.02)' : played ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)',
      borderRadius: flat ? 0 : 10,
      border: flat ? 'none' : `1px solid ${dim ? 'rgba(255,255,255,0.05)' : played ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)'}`,
    }}>
      <span style={{ flexShrink: 0, opacity: dim ? 0.5 : 1 }}><Flag iso2={getIso2(m.home?.name ?? '')} size={flagFs} /></span>
      <span style={{ flex: 1, fontSize: fs, fontWeight: m.winner?.name === m.home?.name ? 800 : 400, color: m.winner?.name === m.home?.name ? '#fff' : dim ? 'rgba(255,255,255,0.35)' : played ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {m.home?.name ?? 'TBD'}
      </span>
      {played ? (
        <span style={{ fontFamily: SPORT, fontSize: large ? 20 : 16, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', flexShrink: 0 }}>
          {m.homeGoals}–{m.awayGoals}
        </span>
      ) : (
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)', display: 'block', fontWeight: 700, letterSpacing: '0.05em' }}>VS</span>
          {schedule && (
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.32)', display: 'block', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {schedule.date.slice(8, 10)}.{schedule.date.slice(5, 7)} {schedule.time}
            </span>
          )}
          {schedule?.channel && (
            <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: '0.03em', color: schedule.channel === 'NRK1' ? '#6db3f2' : '#f0883e', display: 'block' }}>{schedule.channel}</span>
          )}
        </div>
      )}
      <span style={{ flex: 1, fontSize: fs, fontWeight: m.winner?.name === m.away?.name ? 800 : 400, color: m.winner?.name === m.away?.name ? '#fff' : dim ? 'rgba(255,255,255,0.35)' : played ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>
        {m.away?.name ?? 'TBD'}
      </span>
      <span style={{ flexShrink: 0, opacity: dim ? 0.5 : 1 }}><Flag iso2={getIso2(m.away?.name ?? '')} size={flagFs} /></span>
    </div>
  )
}

function KnockoutBracketView({ bracket, qualifiedTeams, scheduleMap }: { bracket: KnockoutBracket | null; qualifiedTeams: { name: string; flag: string }[]; scheduleMap?: Record<string, { date: string; time: string; channel?: 'NRK1' | 'TV 2' }> }) {
  if (!bracket) return <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>Laster bracket…</div>

  const bracketHasMatches = (['r32', 'r16', 'qf', 'sf', 'final'] as const).some(s => bracket[s].some(m => m.home || m.away))
  if (!bracketHasMatches && qualifiedTeams.length > 0) {
    return (
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 12 }}>
          Kvalifisert til sluttspillet
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {qualifiedTeams.map(t => (
            <div key={t.name} style={{ ...CARD, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Flag iso2={getIso2(t.name)} size={18} />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.2 }}>{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (!bracketHasMatches) {
    return <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>Sluttspillet har ikke startet ennå</div>
  }

  const champion = bracket.final[0]?.winner
  const stages = (['final', 'bronze', 'sf', 'qf', 'r16', 'r32'] as const).filter(s => bracket[s].some(m => m.home || m.away))

  return (
    <>
      {champion && (
        <div style={{ ...CARD, padding: '16px 18px', marginBottom: 20, background: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)', border: '1px solid rgba(245,158,11,0.35)', textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🏆</div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,158,11,0.8)', marginBottom: 8 }}>Verdensmester</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Flag iso2={getIso2(champion.name)} size={30} />
            <span style={{ fontFamily: SPORT, fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '0.04em' }}>{champion.name}</span>
          </div>
        </div>
      )}

      {stages.map((stage, si) => {
        const matches = bracket[stage]
        const isFinal = stage === 'final' || stage === 'bronze'
        const upcoming = matches.every(m => m.homeGoals === null) && matches.some(m => m.home || m.away)

        // Group matches in pairs (two matches feed into one slot in next round)
        const pairSize = isFinal ? 1 : 2
        const pairs: BracketMatch[][] = []
        for (let i = 0; i < matches.length; i += pairSize) {
          pairs.push(matches.slice(i, i + pairSize))
        }

        return (
          <div key={stage} style={{ marginBottom: 4 }}>
            {/* Round header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, marginTop: si > 0 ? 16 : 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: upcoming ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
                {ROUND_LABELS[stage]}
              </div>
              <div style={{ flex: 1, height: 1, background: upcoming ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)' }} />
              {upcoming && (
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', flexShrink: 0 }}>Kommende</div>
              )}
            </div>

            {/* Match pairs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pairs.map((pair, pi) => {
                const getSched = (m: BracketMatch) => scheduleMap
                  ? (scheduleMap[m.home?.name ?? ''] ?? scheduleMap[m.away?.name ?? ''] ?? undefined)
                  : undefined
                return (
                  <div key={pi} style={{
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.1)',
                    overflow: 'hidden',
                  }}>
                    <MatchCard m={pair[0]} large={isFinal} upcoming={pair[0].homeGoals === null} schedule={getSched(pair[0])} flat />
                    {pair.length === 2 && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 14px', background: 'rgba(0,0,0,0.3)' }}>
                          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                          <span style={{ fontSize: 7, fontWeight: 800, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.16em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>vinner møtes</span>
                          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                        </div>
                        <MatchCard m={pair[1]} large={isFinal} upcoming={pair[1].homeGoals === null} schedule={getSched(pair[1])} flat />
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}

const MATCH_ROWS: [string, string][] = [
  ['Seier (gruppespill)', '+3p'],
  ['Uavgjort (gruppespill)', '+1p'],
  ['Mål scoret (hele turneringen)', '+1p per mål'],
  ['Videre fra gruppe', '+5p'],
]

const ADVANCEMENT_ROWS: [string, string][] = [
  ['Vinner 1/16-finale', '+10p'],
  ['Vinner 1/8-finale', '+15p'],
  ['Vinner kvartfinale', '+20p'],
  ['Bronsemedalje', '+15p'],
  ['Sølvmedalje', '+20p'],
  ['Gullmedalje', '+40p'],
]

const CARD: React.CSSProperties = {
  background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)',
  padding: '16px 18px',
}

const LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.38)',
  marginBottom: 14,
}

export default function VmInfoPage() {
  // Etter kickoff: Poengoversikt som standard. Før: Regler (forklarer spillet).
  const [activeTab, setActiveTab] = useState<Tab>(() => (KICKOFF <= new Date() ? 'land' : 'regler'))
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)
  const [expandedVenue, setExpandedVenue] = useState<string | null>(null)
  const [expandedVenueMatches, setExpandedVenueMatches] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [bracket, setBracket] = useState<KnockoutBracket | null>(null)
  const [qualifiedTeams, setQualifiedTeams] = useState<{ name: string; flag: string }[]>([])
  const [groupResults, setGroupResults] = useState<Record<string, { hg: number; ag: number }>>({})
  const [matchGoals, setMatchGoals] = useState<Record<string, { scorer: string; minute: number; team: string; goal_type: string }[]>>({})
  const [espnMatches, setEspnMatches] = useState<Record<string, EspnMatch>>({})
  const [landMatches, setLandMatches] = useState<MatchResult[]>([])
  const [landAdv, setLandAdv] = useState<AdvancementRow[]>([])
  const [landFilter, setLandFilter] = useState<number | 'all'>('all')
  const [expandedLand, setExpandedLand] = useState<string | null>(null)
  const [pickCounts, setPickCounts] = useState<Record<string, number>>({})
  const [totalPickers, setTotalPickers] = useState(0)
  const [koScheduleMap, setKoScheduleMap] = useState<Record<string, { date: string; time: string; channel?: 'NRK1' | 'TV 2' }>>({})
  const rulesRef = useRef<HTMLDivElement>(null)
  const allTeams = POTS.flatMap(p => p.teams)

  // Påmelding stenger ved kickoff — CTA-lenker peker til Min side i stedet for stengt /tipp.
  const isLive = KICKOFF <= new Date()
  const ctaHref = participantId ? `/deltaker/${participantId}` : isLive ? '/finn' : '/tipp'
  const ctaLabel = participantId ? 'Din side →' : isLive ? 'Min side →' : 'Velg lag →'

  function toggleSection(id: string) {
    setExpandedSection(prev => prev === id ? null : id)
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vm_participant_id')
      if (saved) setParticipantId(saved)
    } catch {}
  }, [])

  useEffect(() => {
    if (activeTab !== 'vmguide') return
    Promise.all([
      supabase.from('match_results').select('home_team, away_team, home_goals, away_goals, stage, winner'),
      supabase.from('advancement').select('team_name').eq('stage_reached', 'group'),
      fetch('/api/upcoming-matches').then(r => r.ok ? r.json() : { matches: [] }),
    ]).then(([{ data: matchData }, { data: advData }, schedData]) => {
      if (matchData) setBracket(buildBracket(matchData as Parameters<typeof buildBracket>[0], allTeams))
      if (advData) {
        const teams = advData.map(r => allTeams.find(t => t.name === r.team_name)).filter(Boolean) as { name: string; flag: string }[]
        setQualifiedTeams(teams)
      }
      if (schedData?.matches) {
        const map: Record<string, { date: string; time: string; channel?: 'NRK1' | 'TV 2' }> = {}
        for (const m of schedData.matches as { home: string; away: string; date: string; time: string; channel?: 'NRK1' | 'TV 2' }[]) {
          if (m.home !== 'TBD') map[m.home] = { date: m.date, time: m.time, channel: m.channel }
          if (m.away !== 'TBD') map[m.away] = { date: m.date, time: m.time, channel: m.channel }
        }
        setKoScheduleMap(map)
      }
    })
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab !== 'vmguide') return
    Promise.all([
      supabase.from('match_results').select('home_team, away_team, home_goals, away_goals').eq('stage', 'group'),
      supabase.from('match_goals').select('home_team, away_team, scorer, minute, team, goal_type'),
    ]).then(([{ data: resData }, { data: goalsData }]) => {
      if (resData) {
        const map: Record<string, { hg: number; ag: number }> = {}
        for (const r of resData) map[`${r.home_team}|${r.away_team}`] = { hg: r.home_goals, ag: r.away_goals }
        setGroupResults(map)
      }
      if (goalsData) {
        const map: Record<string, { scorer: string; minute: number; team: string; goal_type: string }[]> = {}
        for (const g of goalsData) {
          const key = `${g.home_team}|${g.away_team}`
          if (!map[key]) map[key] = []
          map[key].push({ scorer: g.scorer, minute: g.minute, team: g.team, goal_type: g.goal_type })
        }
        setMatchGoals(map)
      }
    })
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'land') return
    Promise.all([
      supabase.from('match_results').select('home_team, away_team, home_goals, away_goals, stage, winner'),
      supabase.from('advancement').select('team_name, stage_reached'),
      supabase.from('picks').select('participant_id, team_name'),
    ]).then(([{ data: matchData }, { data: advData }, { data: picksData }]) => {
      if (matchData) setLandMatches(matchData as MatchResult[])
      if (advData) setLandAdv(advData as AdvancementRow[])
      if (picksData) {
        const counts: Record<string, number> = {}
        for (const p of picksData) counts[p.team_name] = (counts[p.team_name] ?? 0) + 1
        const unique = new Set(picksData.map((p: { participant_id: string }) => p.participant_id)).size
        setPickCounts(counts)
        setTotalPickers(unique)
      }
    })
  }, [activeTab])

  useEffect(() => {
    const fetchEspn = () =>
      fetch('/api/live-scores')
        .then(r => r.ok ? r.json() : { matches: [] })
        .then(({ matches }: { matches: (EspnMatch & { home: string; away: string })[] }) => {
          if (!matches?.length) return
          const map: Record<string, EspnMatch> = {}
          for (const m of matches) map[`${m.home}|${m.away}`] = { homeGoals: m.homeGoals, awayGoals: m.awayGoals, minute: m.minute, state: m.state, goals: m.goals }
          setEspnMatches(map)
        })
        .catch(() => {})
    fetchEspn()
    const t = setInterval(fetchEspn, 30_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('regler') === '1') {
      setTimeout(() => rulesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    }
    const tab = params.get('tab')
    if (tab === 'sluttspill' || tab === 'kamper' || tab === 'grupper' || tab === 'stadioner') {
      setActiveTab('vmguide')
      setExpandedSection(tab)
    } else if (tab === 'nivaer') {
      setActiveTab('regler')
      setExpandedSection('nivaer')
    } else if (tab === 'vmguide' || tab === 'regler' || tab === 'land') {
      setActiveTab(tab)
    }
  }, [])

  return (
    <div className="page-bg" style={{ minHeight: '100vh', color: '#fff', padding: '32px 16px 56px', position: 'relative' }}>

      {/* Snåsamannen — flyter fritt, klipper ikke mot boksene */}
      <img src="/snåsamannen.png" alt="" style={{ position: 'absolute', right: -10, top: 0, width: 260, opacity: 0.38, pointerEvents: 'none', zIndex: 0, filter: 'brightness(1.0) saturate(0.7) contrast(1.05)', maskImage: 'radial-gradient(ellipse 62% 42% at 56% 23%, black 0%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 62% 42% at 56% 23%, black 0%, transparent 100%)' }} />

      {/* Brand banner — nav + VM-SPILLET */}
      <div style={{ position: 'relative', height: 150, overflow: 'hidden', marginBottom: 16, pointerEvents: 'none', zIndex: 1 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'auto' }}>
          <SmartBackButton />
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 4 }}>
          <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.3, paddingTop: 4, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)' }}>
            — Snåsamannen 2026 —
          </div>
          <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: 52, letterSpacing: '-1px', lineHeight: 1 }}>
            <span style={{ color: 'rgba(255,255,255,0.38)' }}>VM-</span>
            <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, padding: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '9px 4px',
              background: activeTab === tab.id ? '#dc2626' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.45)',
              border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.02em',
              boxShadow: activeTab === tab.id ? '0 2px 8px rgba(220,38,38,0.35)' : 'none',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── REGLER ── */}
      {activeTab === 'regler' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          <div ref={rulesRef} style={CARD}>
            <div style={LABEL}>Kort fortalt</div>
            {([
              'Du velger ett lag fra hvert av 8 seedingnivåer',
              'Hvert nivå er basert på vinnerodds',
              'Valgene kan endres frem til VM starter',
              'Du får poeng basert på dine lags resultater',
            ] as string[]).map((t, i) => (
              <div key={t} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', padding: '9px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                {t}
              </div>
            ))}
          </div>

          <div style={CARD}>
            <div style={LABEL}>Poeng</div>
            {([...MATCH_ROWS, ...ADVANCEMENT_ROWS] as [string, string][]).map(([label, val], i) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{label}</span>
                <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>{val}</span>
              </div>
            ))}
          </div>

          <div style={CARD}>
            <div style={LABEL}>Multiplikator</div>
            {([
              ['Nivå 5', '×2', '#f59e0b'],
              ['Nivå 6', '×2', '#f59e0b'],
              ['Nivå 7', '×3', '#ef4444'],
              ['Nivå 8', '×3', '#ef4444'],
            ] as [string, string, string][]).map(([label, val, col], i) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{label}</span>
                <span style={{ fontSize: 20, color: col, fontWeight: 900, fontFamily: SPORT }}>{val}</span>
              </div>
            ))}
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 10, lineHeight: 1.5 }}>
              Alle poeng for lag fra nivå 5–8 ganges med faktoren.
            </div>
          </div>

          {/* Nivåer (utvidbar) */}
          <div style={{ ...CARD, padding: 0, overflow: 'hidden' }}>
            <button
              className="pick-row"
              onClick={() => toggleSection('nivaer')}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <span style={{ fontFamily: SPORT, fontSize: 17, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em', flex: 1, textAlign: 'left' }}>Nivåer</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>8 nivåer</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', transform: expandedSection === 'nivaer' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', display: 'inline-block', lineHeight: 1 }}>▾</span>
            </button>
            {expandedSection === 'nivaer' && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 14px' }}>
                {POTS.map((pot) => {
                  const color = POT_COLORS[pot.potNumber - 1]
                  return (
                    <div key={pot.potNumber} style={{ borderRadius: 14, overflow: 'hidden', background: '#111', border: `1px solid ${color}30` }}>
                      <div style={{ background: color, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)' }}>
                        <span style={{ fontFamily: SPORT, fontSize: 32, fontWeight: 900, color: 'rgba(0,0,0,0.4)', lineHeight: 1 }}>{pot.potNumber}</span>
                        <div style={{ fontFamily: SPORT, fontSize: 18, fontWeight: 900, color: 'rgba(0,0,0,0.65)', textTransform: 'uppercase', lineHeight: 1 }}>Nivå {pot.potNumber}</div>
                      </div>
                      {pot.teams.map((team, i) => (
                        <div key={team.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: i < pot.teams.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                          <Flag iso2={team.iso2} size={20} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{team.name}</span>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Slik fungerer det — animasjon (utvidbar) */}
          <div style={{ ...CARD, padding: 0, overflow: 'hidden' }}>
            <button
              className="pick-row"
              onClick={() => toggleSection('animasjon')}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <span style={{ fontFamily: SPORT, fontSize: 17, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em', flex: 1, textAlign: 'left' }}>Slik fungerer det</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>Animasjon</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', transform: expandedSection === 'animasjon' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', display: 'inline-block', lineHeight: 1 }}>▾</span>
            </button>
            {expandedSection === 'animasjon' && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 14px' }}>
                <StepSlideshow ctaHref={ctaHref} ctaLabel={ctaLabel} />
              </div>
            )}
          </div>

          <Link href={ctaHref} className="cta-btn" style={{ display: 'block', padding: '15px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontFamily: SPORT, fontSize: 20, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 14, textDecoration: 'none', textAlign: 'center', boxShadow: '0 4px 20px rgba(220,38,38,0.35)' }}>
            {ctaLabel}
          </Link>

        </div>
      )}

      {/* ── VM-GUIDE ── */}
      {activeTab === 'vmguide' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Trekkspill-knapp */}
          {(
            [
              { id: 'grupper', label: 'VM-gruppene', count: `${VM_GROUPS.length} grupper` },
              { id: 'kamper',  label: 'Gruppekamper', count: `${GROUP_SCHEDULE.length} kamper` },
              { id: 'sluttspill', label: 'Sluttspill', count: 'Utslagsrunder' },
              { id: 'stadioner', label: 'Stadioner', count: `${VENUES.length} arenaer` },
            ] as { id: string; label: string; count: string }[]
          ).map(({ id, label, count }) => {
            const open = expandedSection === id
            return (
              <div key={id} style={{ ...CARD, padding: 0, overflow: 'hidden' }}>
                <button
                  className="pick-row"
                  onClick={() => toggleSection(id)}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <span style={{ fontFamily: SPORT, fontSize: 17, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em', flex: 1, textAlign: 'left' }}>{label}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>{count}</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', display: 'inline-block', lineHeight: 1 }}>▾</span>
                </button>

                {open && id === 'grupper' && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px' }}>
                    {VM_GROUPS.map((group) => {
                      const standings = calcGroupStandings(group.teams, groupResults)
                      const GCOLS = '18px 1fr 20px 20px 20px 20px 30px 26px'
                      return (
                        <div key={group.letter} style={{ borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          {/* Group header */}
                          <div style={{ padding: '8px 14px 7px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontFamily: SPORT, fontSize: 12, fontWeight: 900, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em', flex: 1 }}>Gruppe {group.letter}</span>
                          </div>
                          {/* Column headers */}
                          <div style={{ display: 'grid', gridTemplateColumns: GCOLS, gap: '0 4px', padding: '4px 14px 3px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <div /><div />
                            {['K', 'V', 'U', 'T'].map(h => (
                              <div key={h} style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.22)', textAlign: 'center', textTransform: 'uppercase' }}>{h}</div>
                            ))}
                            <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.22)', textAlign: 'center', textTransform: 'uppercase' }}>+/−</div>
                            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.22)', textAlign: 'right', textTransform: 'uppercase' }}>P</div>
                          </div>
                          {/* Team rows */}
                          {standings.map((row, i) => {
                            const team = POTS.flatMap(p => p.teams).find(t => t.name === row.name)
                            const gd = row.gf - row.ga
                            return (
                              <div key={row.name} style={{
                                display: 'grid',
                                gridTemplateColumns: GCOLS,
                                gap: '0 4px',
                                alignItems: 'center',
                                padding: '9px 14px',
                                borderBottom: i < group.teams.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                              }}>
                                <span style={{ fontFamily: SPORT, fontSize: 12, fontWeight: 900, color: 'rgba(255,255,255,0.28)', textAlign: 'right' }}>{i + 1}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                  <Flag iso2={team?.iso2 ?? ''} size={18} />
                                  <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</span>
                                </div>
                                <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.38)', textAlign: 'center' }}>{row.played}</span>
                                <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>{row.w}</span>
                                <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>{row.d}</span>
                                <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>{row.l}</span>
                                <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 700, color: gd > 0 ? '#4ade80' : gd < 0 ? 'rgba(255,100,100,0.7)' : 'rgba(255,255,255,0.4)', textAlign: 'center' }}>{gd > 0 ? `+${gd}` : gd}</span>
                                <span style={{ fontFamily: SPORT, fontSize: 17, fontWeight: 900, color: '#fff', textAlign: 'right', lineHeight: 1 }}>{row.pts}</span>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                )}

                {open && id === 'kamper' && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {groupByDate(GROUP_SCHEDULE).map(({ date, label: dayLabel, items: dayMatches }) => (
                      <div key={date}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>{dayLabel}</div>
                          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {dayMatches.map((match) => {
                            const homeTeam = POTS.flatMap((p) => p.teams).find((t) => t.name === match.home)
                            const awayTeam = POTS.flatMap((p) => p.teams).find((t) => t.name === match.away)
                            const dbResult = groupResults[`${match.home}|${match.away}`]
                            const espn = espnMatches[`${match.home}|${match.away}`]
                            const isLiveNow = espn?.state === 'in'
                            const played = !!dbResult || espn?.state === 'post'
                            const hg = dbResult?.hg ?? espn?.homeGoals ?? 0
                            const ag = dbResult?.ag ?? espn?.awayGoals ?? 0
                            return (
                              <div key={match.id} className={isLiveNow ? 'live-banner' : ''} onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)} style={{ background: isLiveNow ? 'rgba(239,68,68,0.06)' : played ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isLiveNow ? 'rgba(239,68,68,0.3)' : played ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 10, padding: '9px 12px', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <span style={{ fontSize: 9, fontWeight: 800, color: isLiveNow ? 'rgba(239,68,68,0.7)' : 'rgba(255,255,255,0.28)', letterSpacing: '0.06em', width: 30, flexShrink: 0 }}>GR.{match.group}</span>
                                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', minWidth: 0 }}>
                                    <span style={{ fontSize: 12, fontWeight: played && hg > ag ? 800 : 500, color: played && ag > hg ? 'rgba(255,255,255,0.3)' : '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.home}</span>
                                    <span style={{ flexShrink: 0, opacity: played && ag > hg ? 0.4 : 1 }}><Flag iso2={homeTeam?.iso2 ?? ''} size={16} /></span>
                                  </div>
                                  <div style={{ width: 56, textAlign: 'center', flexShrink: 0 }}>
                                    {isLiveNow ? (
                                      <div>
                                        <div style={{ fontFamily: SPORT, fontSize: 16, fontWeight: 900, color: '#ef4444', letterSpacing: '-0.5px', lineHeight: 1 }}>{hg}–{ag}</div>
                                        {espn.minute && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 1 }}>{espn.minute}</div>}
                                      </div>
                                    ) : played ? (
                                      <span style={{ fontFamily: SPORT, fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>{hg}–{ag}</span>
                                    ) : (
                                      <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>{match.time}</span>
                                    )}
                                  </div>
                                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                                    <span style={{ flexShrink: 0, opacity: played && hg > ag ? 0.4 : 1 }}><Flag iso2={awayTeam?.iso2 ?? ''} size={16} /></span>
                                    <span style={{ fontSize: 12, fontWeight: played && ag > hg ? 800 : 500, color: played && hg > ag ? 'rgba(255,255,255,0.3)' : '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.away}</span>
                                  </div>
                                  <div style={{ width: 32, flexShrink: 0, textAlign: 'right' }}>
                                    {isLiveNow ? (
                                      <span className="live-dot" style={{ display: 'inline-block', width: 7, height: 7, background: '#ef4444', borderRadius: '50%' }} />
                                    ) : match.channel ? (
                                      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.03em', color: match.channel === 'NRK1' ? '#6db3f2' : '#f0883e' }}>{match.channel}</span>
                                    ) : null}
                                  </div>
                                </div>
                                {expandedMatch === match.id && (() => {
                                  const venueInfo = VENUES.find(v => match.venue.startsWith(v.name))
                                  const stadiumName = venueInfo?.name ?? match.venue.split(',')[0]
                                  const city = venueInfo?.city ?? match.venue.split(',').slice(1).join(',').trim()
                                  const country = venueInfo?.country ?? '—'
                                  const homeTeamInfo = POTS.flatMap(p => p.teams).find(t => t.name === match.home)
                                  const awayTeamInfo = POTS.flatMap(p => p.teams).find(t => t.name === match.away)
                                  // Målscorere: ESPN prioriteres (live + nylig ferdig), Supabase som fallback
                                  const espnGoals = espn?.goals ?? []
                                  const dbGoals = (matchGoals[`${match.home}|${match.away}`] ?? []).slice().sort((a, b) => a.minute - b.minute)
                                  const localTime = venueInfo ? (() => {
                                    const [h, m] = match.time.split(':').map(Number)
                                    const utcH = h - 2
                                    const localH = ((utcH + venueInfo.utcOffset) % 24 + 24) % 24
                                    return `${String(localH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${venueInfo.tzLabel}`
                                  })() : null
                                  return (
                                    <div style={{ marginTop: 7, paddingTop: 7, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                      {/* Venue — én linje øverst */}
                                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, fontSize: 10, color: 'rgba(255,255,255,0.28)', marginBottom: 2 }}>
                                        <span style={{ fontWeight: 600 }}>{stadiumName}</span>
                                        <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                                        <span>{city}, {country}</span>
                                        {localTime && <><span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span><span style={{ fontWeight: 600 }}>🕐 {localTime}</span></>}
                                      </div>
                                      {espnGoals.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 4 }}>
                                          {espnGoals.map((g, gi) => {
                                            const teamInfo = POTS.flatMap(p => p.teams).find(t => t.name === g.team)
                                            const suffix = g.isPenalty ? ' (str.)' : g.isOwnGoal ? ' (e.m.)' : ''
                                            return (
                                              <div key={gi} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <span style={{ fontFamily: SPORT, fontSize: 10, fontWeight: 700, color: isLiveNow ? '#ef4444' : 'rgba(255,255,255,0.35)', width: 22, textAlign: 'right', flexShrink: 0 }}>{g.minute}</span>
                                                <span style={{ flexShrink: 0 }}><Flag iso2={teamInfo?.iso2 ?? ''} size={12} /></span>
                                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{g.scorer}{suffix}</span>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )}
                                      {espnGoals.length === 0 && dbGoals.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 4 }}>
                                          {dbGoals.map((g, gi) => {
                                            const teamInfo = POTS.flatMap(p => p.teams).find(t => t.name === g.team)
                                            const suffix = g.goal_type === 'OWN_GOAL' ? ' (e.m.)' : g.goal_type === 'PENALTY' ? ' (str.)' : ''
                                            return (
                                              <div key={gi} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <span style={{ fontFamily: SPORT, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', width: 22, textAlign: 'right', flexShrink: 0 }}>{g.minute}'</span>
                                                <span style={{ flexShrink: 0 }}><Flag iso2={teamInfo?.iso2 ?? ''} size={12} /></span>
                                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{g.scorer}{suffix}</span>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )}
                                      {(homeTeamInfo?.wikipedia || awayTeamInfo?.wikipedia) && (
                                        <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                                          {homeTeamInfo?.wikipedia && (
                                            <a href={homeTeamInfo.wikipedia} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontWeight: 600 }}>
                                              <Flag iso2={homeTeamInfo.iso2} size={12} />
                                              {match.home} ↗
                                            </a>
                                          )}
                                          {awayTeamInfo?.wikipedia && (
                                            <a href={awayTeamInfo.wikipedia} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontWeight: 600 }}>
                                              <Flag iso2={awayTeamInfo.iso2} size={12} />
                                              {match.away} ↗
                                            </a>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })()}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {open && id === 'stadioner' && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {[...VENUES].sort((a, b) => b.capacity - a.capacity).map((venue, i) => {
                      const vOpen = expandedVenue === venue.name
                      const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.city}`)}`
                      return (
                        <div key={venue.name} style={{ borderBottom: i < VENUES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                          <button
                            className="pick-row"
                            onClick={() => setExpandedVenue(vOpen ? null : venue.name)}
                            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', textAlign: 'left' }}
                          >
                            <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: '#fff' }}>{venue.name}</div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{venue.capacity.toLocaleString('no-NO')}</div>
                              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>plasser</div>
                            </div>
                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', transform: vOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', display: 'inline-block', lineHeight: 1, flexShrink: 0 }}>▾</span>
                          </button>
                          {vOpen && (
                            <div style={{ padding: '0 18px 14px' }}>
                              {([
                                ['Land', venue.country],
                                ['By', venue.city],
                                ['Byggeår', String(venue.founded)],
                                ['Bruker', venue.tenant],
                              ] as [string, string][]).map(([label, value]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{label}</span>
                                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600, textAlign: 'right' }}>{value}</span>
                                </div>
                              ))}
                              {/* Kamper på dette stadionet */}
                              {(() => {
                                const groupMatches = GROUP_SCHEDULE.filter(m => m.venue.startsWith(venue.name)).sort((a, b) => a.date.localeCompare(b.date))
                                const knockoutMatches = KNOCKOUT_VENUES.filter(m => m.venue === venue.name).sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
                                const total = groupMatches.length + knockoutMatches.length
                                if (total === 0) return null
                                const vmOpen = expandedVenueMatches === venue.name
                                return (
                                  <div style={{ marginTop: 10 }}>
                                    <button
                                      className="pick-row"
                                      onClick={() => setExpandedVenueMatches(vmOpen ? null : venue.name)}
                                      style={{ width: '100%', background: vmOpen ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}
                                    >
                                      <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>Kamper på {venue.name}</span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{total}</span>
                                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', transform: vmOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block', lineHeight: 1 }}>▾</span>
                                      </div>
                                    </button>
                                    {vmOpen && (
                                      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {groupMatches.map(m => {
                                          const [, mo, d] = m.date.split('-')
                                          const homeTeam = POTS.flatMap(p => p.teams).find(t => t.name === m.home)
                                          const awayTeam = POTS.flatMap(p => p.teams).find(t => t.name === m.away)
                                          return (
                                            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 4px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', width: 28, flexShrink: 0 }}>Gr.{m.group}</span>
                                              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', flexShrink: 0, whiteSpace: 'nowrap' }}>{d}.{mo} {m.time}</span>
                                              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', minWidth: 0 }}>
                                                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home}</span>
                                                <Flag iso2={homeTeam?.iso2 ?? ''} size={14} />
                                              </div>
                                              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>–</span>
                                              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                                                <Flag iso2={awayTeam?.iso2 ?? ''} size={14} />
                                                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.away}</span>
                                              </div>
                                            </div>
                                          )
                                        })}
                                        {knockoutMatches.map((m, ki) => {
                                          const [, mo, d] = (m.date ?? '').split('-')
                                          const dateStr = m.date ? `${d}.${mo}` : 'TBA'
                                          const roundColor = m.round === 'final' ? '#fbbf24' : m.round === 'sf' ? '#a78bfa' : m.round === 'bronze' ? '#cd7c2f' : m.round === 'qf' ? '#60a5fa' : 'rgba(255,255,255,0.35)'
                                          return (
                                            <div key={ki} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 4px', borderBottom: ki < knockoutMatches.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                              <span style={{ fontSize: 9, fontWeight: 800, color: roundColor, letterSpacing: '0.03em', flexShrink: 0, whiteSpace: 'nowrap', width: 28 }}>
                                                {m.round === 'final' ? 'FINALE' : m.round === 'sf' ? 'SF' : m.round === 'bronze' ? 'BRO' : m.round === 'qf' ? 'QF' : m.round === 'r16' ? '1/8' : '1/16'}
                                              </span>
                                              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', flexShrink: 0, whiteSpace: 'nowrap' }}>{dateStr}{m.time ? ` ${m.time}` : ''}</span>
                                              <span style={{ fontSize: 11, fontWeight: 700, color: roundColor, flex: 1 }}>{m.label}</span>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )
                              })()}
                              <a
                                className="guide-btn"
                                href={maps}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}
                              >
                                📍 Åpne i Google Maps
                              </a>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {open && id === 'sluttspill' && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 14px' }}>
                    <KnockoutBracketView bracket={bracket} qualifiedTeams={qualifiedTeams} scheduleMap={koScheduleMap} />
                  </div>
                )}

              </div>
            )
          })}
        </div>
      )}

      {/* ── LAND ── */}
      {activeTab === 'land' && (() => {
        const landRows = POTS.flatMap((pot) =>
          pot.teams.map((t) => {
            const r = calcTeamPoints({ team_name: t.name, pot_number: pot.potNumber }, landMatches, landAdv)
            const played = landMatches.filter(m => m.home_team === t.name || m.away_team === t.name).length
            return {
              name: t.name, iso2: t.iso2, pot: pot.potNumber, fifaRanking: t.fifaRanking,
              eliminated: isTeamEliminated(t.name, landAdv, landMatches, isLive),
              played,
              ...r,
            }
          })
        ).sort((a, b) => b.total - a.total || b.played - a.played || a.fifaRanking - b.fifaRanking)

        const visibleRows = landFilter === 'all' ? landRows : landRows.filter((r) => r.pot === landFilter)
        const filterBtn = (active: boolean, activeColor: string): React.CSSProperties => ({
          padding: '9px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 700, letterSpacing: '0.02em',
          background: active ? activeColor : 'rgba(255,255,255,0.05)',
          color: active ? '#fff' : 'rgba(255,255,255,0.45)',
          boxShadow: active ? `0 2px 8px ${activeColor}55` : 'none',
          transition: 'background 0.15s, color 0.15s',
        })

        const today = new Date().toISOString().slice(0, 10)
        const playedPairs = new Set(landMatches.flatMap((m) => [`${m.home_team}|${m.away_team}`, `${m.away_team}|${m.home_team}`]))
        const STAGE_SORT: Record<string, number> = { group: 0, r32: 1, r16: 2, qf: 3, sf: 4, bronze: 5, final: 6 }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={CARD}>
              <div style={LABEL}>Poeng per land</div>

              {/* Nivåfilter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                <button onClick={() => setLandFilter('all')} style={filterBtn(landFilter === 'all', '#dc2626')}>Alle</button>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <button key={n} onClick={() => setLandFilter(n)} style={filterBtn(landFilter === n, POT_COLORS[n - 1])}>Nivå {n}</button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Kolonneoverskrifter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px 4px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 26, textAlign: 'right', flexShrink: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)' }}>Pos.</div>
                <div style={{ width: 22, flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)' }}>Land</div>
                <div style={{ width: 26, textAlign: 'center', flexShrink: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)' }}>Nivå</div>
                <div style={{ width: 22, flexShrink: 0 }} />
                <div style={{ width: 52, textAlign: 'right', flexShrink: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)' }}>% valgt</div>
                <div style={{ width: 48, textAlign: 'right', flexShrink: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)' }}>Poeng</div>
                <div style={{ width: 14, flexShrink: 0 }} />
              </div>

              {visibleRows.map((row, i) => {
                const color = POT_COLORS[row.pot - 1]
                const lOpen = expandedLand === row.name
                return (
                  <div key={row.name} style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${lOpen ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`, background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)', transition: 'border-color 0.15s' }}>
                    <div
                      className="pick-row"
                      onClick={() => setExpandedLand(lOpen ? null : row.name)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', cursor: 'pointer' }}
                    >
                        <span style={{ fontFamily: SPORT, fontSize: 15, fontWeight: 900, color: 'rgba(255,255,255,0.3)', width: 26, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ opacity: row.eliminated ? 0.35 : 1, filter: row.eliminated ? 'grayscale(1)' : 'none', flexShrink: 0, display: 'inline-flex', width: 22 }}>
                          <Flag iso2={row.iso2} size={22} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: row.eliminated ? 'rgba(255,255,255,0.4)' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>{row.name}</div>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${color}20`, border: `1.5px solid ${color}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 900, color, lineHeight: 1 }}>{row.pot}</span>
                        </div>
                        <div style={{ width: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {row.multiplier > 1 && (
                            <span style={{ fontSize: 10, fontWeight: 800, color: row.multiplier === 2 ? '#f59e0b' : '#ef4444', letterSpacing: '0.02em' }}>×{row.multiplier}</span>
                          )}
                        </div>
                        <div style={{ width: 52, flexShrink: 0, textAlign: 'right' }}>
                          {totalPickers > 0 && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
                              {Math.round((pickCounts[row.name] ?? 0) / totalPickers * 100)}%
                            </span>
                          )}
                        </div>
                        <div style={{ width: 48, flexShrink: 0, textAlign: 'right' }}>
                          <div style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.5px',
                            ...(row.total > 0
                              ? { background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 14px rgba(34,197,94,0.4)' }
                              : row.played > 0
                                ? { color: 'rgba(74,222,128,0.55)' }
                                : { color: 'rgba(255,255,255,0.15)' })
                          }}>{row.total}</div>
                        </div>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', transform: lOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', display: 'inline-block', lineHeight: 1, flexShrink: 0, width: 14, textAlign: 'center' }}>▾</span>
                      </div>
                      {lOpen && (() => {
                        const team = row.name
                        const played = landMatches
                          .filter((m) => m.home_team === team || m.away_team === team)
                          .map((m) => {
                            const sched = GROUP_SCHEDULE.find((s) => s.home === m.home_team && s.away === m.away_team)
                            const stage = m.stage ?? 'group'
                            return { home: m.home_team, homeGoals: m.home_goals, away: m.away_team, awayGoals: m.away_goals, date: sched?.date ?? '', group: stage === 'group' ? (sched?.group ?? '') : '', stage }
                          })
                          .sort((a, b) => (STAGE_SORT[a.stage] ?? 0) - (STAGE_SORT[b.stage] ?? 0) || a.date.localeCompare(b.date))
                        const upcoming = GROUP_SCHEDULE
                          .filter((s) => (s.home === team || s.away === team) && s.date >= today && !playedPairs.has(`${s.home}|${s.away}`))
                          .map((s) => ({ date: s.date, time: s.time, home: s.home, away: s.away, group: s.group }))

                        const advStage = landAdv.find((a) => a.team_name === team)?.stage_reached ?? null
                        let knockoutUpcoming: string | null = null
                        if (advStage && STAGE_SEQUENCE.includes(advStage)) {
                          const nextStage = STAGE_SEQUENCE[STAGE_SEQUENCE.indexOf(advStage) + 1]
                          if (nextStage && KNOCKOUT_UPCOMING[nextStage]) {
                            const hasNextMatch = landMatches.some((m) => (m.home_team === team || m.away_team === team) && m.stage === nextStage)
                            if (!hasNextMatch) knockoutUpcoming = KNOCKOUT_UPCOMING[nextStage]
                          }
                        }
                        const knockoutOpponent = knockoutUpcoming ? getKnockoutOpponent(team, advStage, landMatches, allTeams) : null

                        return (
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2px 10px 6px' }}>
                            <CountryMatchDetail
                              teamName={team}
                              multiplier={row.multiplier}
                              color={color}
                              advStage={advStage}
                              played={played}
                              upcoming={upcoming}
                              knockoutUpcoming={knockoutUpcoming}
                              knockoutOpponent={knockoutOpponent}
                            />
                          </div>
                        )
                      })()}
                    </div>
                  )
                })}
              </div>
          </div>
        )
      })()}

    </div>
  )
}
