'use client'

import { useState, useEffect, type CSSProperties } from 'react'
import Link from 'next/link'
import Flag from '@/components/Flag'
import { getIso2 } from '@/data/pots'
import { supabase } from '@/lib/supabase'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

const ADV_ORD: Record<string, number> = { group: 0, r32: 1, r16: 2, qf: 3, sf: 4, bronze: 5, silver: 6, gold: 7 }

export interface EnrichedPick {
  potNumber: number
  teamName: string
  flag: string
  odds: string
  pickPct: number
  fifaRanking: number
  vmGroup: string
  color: string
  matchPts: number
  advPts: number
  multiplier: number
  total: number
  stageLabel: string | null
  played: { home: string; homeGoals: number; away: string; awayGoals: number; date: string; time: string; group: string; stage: string }[]
  upcoming: { date: string; time: string; home: string; homeIso2: string; away: string; awayIso2: string; venue: string; group: string }[]
  knockoutUpcoming: string | null
  knockoutOpponent: { name: string; flag: string } | null
  knockoutDate?: string
  knockoutTime?: string
  knockoutChannel?: 'NRK1' | 'TV 2'
  isEliminated: boolean
  advStage: string | null
}

interface Props {
  picks: EnrichedPick[]
  totalPoints: number
  vmStarted: boolean
  pointsAccent?: 'gold' | 'green'
  pointsColWidth?: number
  alignPointsTop?: boolean
  stageBadgeColor?: string
  stageBadgeInline?: boolean
  hideTotal?: boolean
}

// Grønn gradient/glød — samme som «Snåsamannen 2026»-teksten.
const GREEN_TEXT: CSSProperties = {
  background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)',
  WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
  textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)',
}

function matchPoints(m: { home: string; homeGoals: number; away: string; awayGoals: number; stage: string }, teamName: string, multiplier: number) {
  const isHome = m.home === teamName
  const myGoals = isHome ? m.homeGoals : m.awayGoals
  const oppGoals = isHome ? m.awayGoals : m.homeGoals
  const win = myGoals > oppGoals
  const draw = myGoals === oppGoals
  const goalPts = myGoals
  const outcomePts = m.stage === 'group' ? (win ? 3 : draw ? 1 : 0) : 0
  return { myGoals, oppGoals, win, draw, goalPts, outcomePts, raw: goalPts + outcomePts, total: (goalPts + outcomePts) * multiplier }
}

function isMatchLive(date: string, time: string, nowMs: number): boolean {
  const cestMs = nowMs + 2 * 60 * 60 * 1000
  const cest = new Date(cestMs)
  const nowDate = cest.toISOString().slice(0, 10)
  if (date !== nowDate) return false
  const matchMin = parseInt(time.slice(0, 2)) * 60 + parseInt(time.slice(3, 5))
  const nowMin = cest.getUTCHours() * 60 + cest.getUTCMinutes()
  return nowMin >= matchMin && nowMin - matchMin < 130
}

export default function PicksClient({ picks, totalPoints, vmStarted, pointsAccent = 'gold', pointsColWidth, alignPointsTop, stageBadgeColor, stageBadgeInline, hideTotal }: Props) {
  const [open, setOpen] = useState<string | null>(null)
  const [openMatch, setOpenMatch] = useState<string | null>(null)
  const [nowMs, setNowMs] = useState<number | null>(null)
  const [finishedMatches, setFinishedMatches] = useState<Set<string>>(new Set())
  const [liveScores, setLiveScores] = useState<Record<string, { homeGoals: number; awayGoals: number; minute: string }>>({})
  const accentGreen = pointsAccent === 'green'

  useEffect(() => {
    setNowMs(Date.now())
    const t = setInterval(() => setNowMs(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])

  // Sjekk om «live»-kamper har fått resultat + hent live-score fra ESPN (kjøres hvert 30s)
  useEffect(() => {
    if (nowMs == null) return
    const liveMatches = picks.flatMap(p =>
      p.upcoming.filter(m => isMatchLive(m.date, m.time, nowMs))
    )
    if (liveMatches.length === 0) return
    // Sjekk DB for ferdige kamper
    Promise.all(
      liveMatches.map(m =>
        supabase.from('match_results').select('id').eq('home_team', m.home).eq('away_team', m.away).maybeSingle()
          .then(({ data }) => data ? `${m.home}|${m.away}` : null)
      )
    ).then(keys => {
      const found = new Set(keys.filter(Boolean) as string[])
      if (found.size > 0) setFinishedMatches(prev => new Set([...prev, ...found]))
    })
    // Hent live-score fra ESPN (stille feil — aldri blokkerende)
    fetch('/api/live-scores')
      .then(r => r.ok ? r.json() : { matches: [] })
      .then(({ matches }) => {
        if (!matches?.length) return
        const map: Record<string, { homeGoals: number; awayGoals: number; minute: string }> = {}
        for (const m of matches) map[`${m.home}|${m.away}`] = { homeGoals: m.homeGoals, awayGoals: m.awayGoals, minute: m.minute }
        setLiveScores(map)
      })
      .catch(() => {})
  }, [nowMs]) // eslint-disable-line react-hooks/exhaustive-deps

  if (picks.length === 0) {
    return (
      <div style={{ background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', padding: '20px', color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
        Ingen picks registrert.
      </div>
    )
  }

  return (
    <>
      <div style={{ background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', marginBottom: 12, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)' }}>
      {picks.map((pick, idx) => {
        const isOpen = open === pick.teamName
        const isLast = idx === picks.length - 1
        const isLive = nowMs != null && pick.upcoming.some(m => isMatchLive(m.date, m.time, nowMs) && !finishedMatches.has(`${m.home}|${m.away}`))
        const liveMatch = isLive ? pick.upcoming.find(m => nowMs != null && isMatchLive(m.date, m.time, nowMs) && !finishedMatches.has(`${m.home}|${m.away}`)) : undefined
        const liveBonus = (() => {
          if (!liveMatch) return 0
          const ls = liveScores[`${liveMatch.home}|${liveMatch.away}`]
          if (!ls) return 0
          const myGoals = liveMatch.home === pick.teamName ? ls.homeGoals : ls.awayGoals
          const oppGoals = liveMatch.home === pick.teamName ? ls.awayGoals : ls.homeGoals
          const goalPts = myGoals
          const outcomePts = liveMatch.group
            ? (myGoals > oppGoals ? 3 : myGoals === oppGoals ? 1 : 0)
            : 0
          return (goalPts + outcomePts) * pick.multiplier
        })()
        const displayTotal = pick.total + liveBonus
        const medalColor = pick.stageLabel === 'Gullmedalje' ? '#fbbf24'
          : pick.stageLabel === 'Sølvmedalje' ? '#9ca3af'
          : pick.stageLabel === 'Bronsemedalje' ? '#cd7c2f'
          : null
        const accentColor = pick.isEliminated ? 'rgba(255,255,255,0.08)' : (medalColor ?? pick.color)
        const accentBorder = pick.isEliminated ? 'rgba(255,255,255,0.06)' : `${medalColor ?? pick.color}99`
        const advOrd = ADV_ORD[pick.advStage ?? ''] ?? -1

        return (
          <div key={pick.potNumber}>
            {/* Lukket rad */}
            <div
              className="pick-row"
              onClick={() => setOpen(isOpen ? null : pick.teamName)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px 12px 10px',
                borderBottom: (!isLast || isOpen) ? '1px solid rgba(255,255,255,0.05)' : 'none',
                cursor: 'pointer',
              }}
            >
              {/* Flagg + navn — grås ut ved eliminering */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, opacity: pick.isEliminated ? 0.2 : 1, filter: pick.isEliminated ? 'grayscale(1)' : 'none' }}>
                {/* Nivå-badge */}
                <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 900, color: accentColor, lineHeight: 1, flexShrink: 0, minWidth: 12, textAlign: 'center' }}>{pick.potNumber}</span>
                <Flag iso2={getIso2(pick.teamName)} size={24} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.2, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pick.teamName}</span>
                    {pick.multiplier > 1 && (
                      <span style={{
                        fontFamily: SPORT, fontSize: 12, fontWeight: 900, flexShrink: 0,
                        color: pick.multiplier === 2 ? '#f59e0b' : '#ef4444',
                        background: pick.multiplier === 2 ? 'rgba(245,158,11,0.12)' : 'rgba(220,38,38,0.12)',
                        border: `1px solid ${pick.multiplier === 2 ? 'rgba(245,158,11,0.35)' : 'rgba(220,38,38,0.35)'}`,
                        borderRadius: 4, padding: '2px 7px', letterSpacing: '0.02em', lineHeight: 1.4,
                      }}>×{pick.multiplier}</span>
                    )}
                    {stageBadgeInline && pick.stageLabel && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0, whiteSpace: 'nowrap',
                        color: medalColor ?? stageBadgeColor ?? pick.color,
                        background: medalColor ? `${medalColor}18` : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${medalColor ? `${medalColor}40` : 'rgba(255,255,255,0.12)'}`,
                        borderRadius: 4, padding: '2px 6px',
                      }}>{pick.stageLabel}</span>
                    )}
                  </div>
                  {!stageBadgeInline && pick.stageLabel && (
                    <div style={{ marginTop: 3 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
                        color: medalColor ?? stageBadgeColor ?? pick.color,
                        background: medalColor ? `${medalColor}18` : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${medalColor ? `${medalColor}40` : 'rgba(255,255,255,0.12)'}`,
                        borderRadius: 4, padding: '2px 6px',
                      }}>
                        {pick.stageLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {vmStarted ? (
                <div style={{ textAlign: 'right', flexShrink: 0, minWidth: pointsColWidth, alignSelf: alignPointsTop ? 'flex-start' : undefined, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                  <div className={isLive ? 'live-pts' : undefined} style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, lineHeight: 1,
                    ...(isLive
                      ? { color: '#f59e0b' }
                      : displayTotal > 0
                          ? (accentGreen ? GREEN_TEXT : { color: '#f59e0b' })
                          : pick.played.length > 0
                            ? { color: 'rgba(74,222,128,0.55)' }
                            : { color: 'rgba(255,255,255,0.1)' }) }}>
                    {displayTotal}p
                  </div>
                  {isLive && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span className="live-dot" style={{ width: 5, height: 5, background: '#ef4444', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontFamily: SPORT, fontSize: 10, fontWeight: 900, color: '#ef4444', letterSpacing: '0.08em', lineHeight: 1 }}>spiller nå</span>
                    </div>
                  )}
                </div>
              ) : (
                <span style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, color: 'rgba(255,255,255,0.12)', lineHeight: 1, flexShrink: 0 }}>–</span>
              )}

            </div>

            {/* Utvidet innhold */}
            {isOpen && (
              <div style={{ padding: '12px 16px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: !isLast ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>

                {/* Spilte kamper */}
                {pick.played.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 7 }}>Spilte kamper</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {pick.played.map((m, i) => {
                        const key = `${pick.teamName}-${i}`
                        const mOpen = openMatch === key
                        const mp = matchPoints(m, pick.teamName, pick.multiplier)
                        const dateParts = m.group ? m.date.split('-') : ['', '', '']
                        const [, mo, d] = dateParts
                        const STAGE_ROUND: Record<string, string> = { r32: '1/16', r16: '1/8', qf: 'QF', sf: 'SF', final: 'Finale', bronze: 'Bronse' }
                        const roundLabel = m.group ? `Gr.${m.group}` : (STAGE_ROUND[m.stage] ?? m.stage)
                        const isLastGroupMatch = m.stage === 'group' && !pick.played.slice(i + 1).some(pm => pm.stage === 'group')
                        let stageBonus: number | null = null
                        let stageBonusLabel = ''
                        if (isLastGroupMatch && advOrd >= 0) { stageBonus = 5; stageBonusLabel = 'Videre fra gruppe' }
                        else if (m.stage === 'r32' && advOrd >= ADV_ORD['r32']) { stageBonus = 10; stageBonusLabel = 'Videre til 1/8-finale' }
                        else if (m.stage === 'r16' && advOrd >= ADV_ORD['r16']) { stageBonus = 15; stageBonusLabel = 'Videre til QF' }
                        else if (m.stage === 'qf' && advOrd >= ADV_ORD['qf']) { stageBonus = 20; stageBonusLabel = 'Videre til SF' }
                        else if (m.stage === 'bronze') {
                          const isHomeB = m.home === pick.teamName
                          const myG = isHomeB ? m.homeGoals : m.awayGoals
                          const oppG = isHomeB ? m.awayGoals : m.homeGoals
                          if (myG > oppG) { stageBonus = 15; stageBonusLabel = 'Bronsemedalje' }
                        } else if (m.stage === 'final') {
                          if (pick.stageLabel === 'Gullmedalje') { stageBonus = 40; stageBonusLabel = 'Gullmedalje' }
                          else if (pick.stageLabel === 'Sølvmedalje') { stageBonus = 20; stageBonusLabel = 'Sølvmedalje' }
                        }

                        return (
                          <div key={i}>
                            <div
                              className="pick-row"
                              onClick={(e) => { e.stopPropagation(); setOpenMatch(mOpen ? null : key) }}
                              style={{ cursor: 'pointer', borderRadius: 8, padding: '5px 8px', background: mOpen ? 'rgba(255,255,255,0.04)' : 'transparent', transition: 'background 0.15s' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', width: 32, flexShrink: 0 }}>{roundLabel}</span>
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', flexShrink: 0, whiteSpace: 'nowrap' }}>{d}/{mo}{m.time ? ` ${m.time}` : ''}</span>
                                <span style={{ flex: 1, textAlign: 'right', fontWeight: m.home === pick.teamName ? 700 : 400, color: m.home === pick.teamName ? '#fff' : 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home}</span>
                                <span style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', width: 38, textAlign: 'center', flexShrink: 0 }}>{m.homeGoals}–{m.awayGoals}</span>
                                <span style={{ flex: 1, fontWeight: m.away === pick.teamName ? 700 : 400, color: m.away === pick.teamName ? '#fff' : 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.away}</span>
                                <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 900, color: mp.total > 0 ? '#f59e0b' : 'rgba(255,255,255,0.2)', width: 24, textAlign: 'right', flexShrink: 0 }}>
                                  {mp.total > 0 ? `+${mp.total}` : '0'}
                                </span>
                              </div>
                              {mOpen && (
                                <div style={{ marginTop: 5, paddingTop: 5, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                                  {mp.goalPts > 0 && <div>{mp.myGoals} mål × 1p = <span style={{ color: '#f59e0b' }}>+{mp.goalPts}p</span></div>}
                                  {mp.outcomePts > 0 && <div>{mp.win ? 'Seier' : 'Uavgjort'}: <span style={{ color: '#f59e0b' }}>+{mp.outcomePts}p</span></div>}
                                  {mp.raw === 0 && <div style={{ color: 'rgba(255,255,255,0.25)' }}>Tap — ingen poeng</div>}
                                  {mp.raw > 0 && pick.multiplier > 1 && (
                                    <div style={{ marginTop: 2, color: pick.color, fontWeight: 700 }}>
                                      ({mp.goalPts}+{mp.outcomePts}) × {pick.multiplier} = <span style={{ color: '#f59e0b' }}>{mp.total}p</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            {/* Stage advancement bonus — always visible */}
                            {stageBonus !== null && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 8px 4px', marginTop: 1, borderRadius: 6, background: 'rgba(34,197,94,0.06)', borderLeft: '2px solid rgba(34,197,94,0.3)' }}>
                                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', flex: 1 }}>{stageBonusLabel}</span>
                                <span style={{ fontFamily: SPORT, fontSize: 12, fontWeight: 900, color: '#f59e0b' }}>
                                  {pick.multiplier > 1
                                    ? `${stageBonus} × ${pick.multiplier} = +${stageBonus * pick.multiplier}p`
                                    : `+${stageBonus}p`}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                </div>
                )}

                {/* Kommende kamper */}
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 7 }}>Kommende kamper</div>
                  {pick.upcoming.length === 0 && !pick.knockoutUpcoming ? (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>Ingen planlagte kamper</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {pick.upcoming.map((m, i) => {
                        const [, mo, d] = m.date.split('-')
                        const roundLabel = m.group ? `Gr.${m.group}` : '–'
                        const matchIsLive = nowMs != null && isMatchLive(m.date, m.time, nowMs) && !finishedMatches.has(`${m.home}|${m.away}`)
                        const ls = liveScores[`${m.home}|${m.away}`]
                        const myGoals = ls ? (m.home === pick.teamName ? ls.homeGoals : ls.awayGoals) : 0
                        const oppGoals = ls ? (m.home === pick.teamName ? ls.awayGoals : ls.homeGoals) : 0
                        const goalPts = myGoals * pick.multiplier
                        const rawOutcome = m.group ? (myGoals > oppGoals ? 3 : myGoals === oppGoals ? 1 : 0) : 0
                        const outcomePts = rawOutcome * pick.multiplier
                        const outcomeLabel = myGoals > oppGoals ? 'seier' : 'uavgjort'
                        return (
                          <div key={i}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', width: 32, flexShrink: 0 }}>{roundLabel}</span>
                              <span style={{ fontSize: 11, color: matchIsLive ? '#ef4444' : 'rgba(255,255,255,0.55)', flexShrink: 0, whiteSpace: 'nowrap' }}>{d}/{mo} {m.time}</span>
                              <span style={{ flex: 1, textAlign: 'right', fontWeight: m.home === pick.teamName ? 700 : 400, color: m.home === pick.teamName ? '#fff' : 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home}</span>
                              {matchIsLive && ls ? (
                                <span style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, color: '#ef4444', letterSpacing: '-0.5px', width: 38, textAlign: 'center', flexShrink: 0 }}>{ls.homeGoals}–{ls.awayGoals}</span>
                              ) : (
                                <span style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, color: 'rgba(255,255,255,0.15)', width: 38, textAlign: 'center', flexShrink: 0 }}>–</span>
                              )}
                              <span style={{ flex: 1, fontWeight: m.away === pick.teamName ? 700 : 400, color: m.away === pick.teamName ? '#fff' : 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.away}</span>
                              {matchIsLive && ls?.minute && (
                                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>{ls.minute}</span>
                              )}
                            </div>
                            {matchIsLive && ls && (goalPts > 0 || outcomePts > 0) && (
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 2 }}>
                                {goalPts > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b' }}>+{goalPts}p for {myGoals} mål</span>}
                                {outcomePts > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b' }}>+{outcomePts}p for {outcomeLabel}</span>}
                              </div>
                            )}
                          </div>
                        )
                      })}
                      {pick.knockoutUpcoming && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', flexShrink: 0 }}>{pick.knockoutUpcoming}</span>
                          {pick.knockoutDate && (
                            <>
                              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 9 }}>·</span>
                              <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                                {pick.knockoutDate.slice(8, 10)}.{pick.knockoutDate.slice(5, 7)}{pick.knockoutTime && pick.knockoutTime !== '00:00' ? ` ${pick.knockoutTime}` : ''}
                              </span>
                            </>
                          )}
                          {pick.knockoutChannel && (
                            <>
                              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 9 }}>·</span>
                              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.03em', color: pick.knockoutChannel === 'NRK1' ? '#6db3f2' : '#f0883e', flexShrink: 0 }}>{pick.knockoutChannel}</span>
                            </>
                          )}
                          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 9 }}>·</span>
                          {pick.knockoutOpponent ? (
                            <>
                              <Flag iso2={getIso2(pick.knockoutOpponent.name)} size={14} />
                              <span style={{ color: 'rgba(255,255,255,0.55)' }}>{pick.knockoutOpponent.name}</span>
                            </>
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Motstander fastsettes snart</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 14, marginLeft: -16, marginRight: -16, marginBottom: -16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <Link href="/vm-info" className="pick-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 16px', textDecoration: 'none' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.01em' }}>Se poengoversikt for alle lag</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>→</span>
                  </Link>
                </div>

              </div>
            )}
          </div>
        )
      })}

      {/* Totalsum */}
      {!hideTotal && (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Totalt</span>
          {!vmStarted && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>Poeng telles fra 11. juni</div>}
        </div>
        {vmStarted
          ? <span style={{ fontFamily: SPORT, fontSize: 28, fontWeight: 900, lineHeight: 1, ...(accentGreen ? GREEN_TEXT : { color: '#f59e0b' }) }}>{totalPoints}p</span>
          : <span style={{ fontFamily: SPORT, fontSize: 28, fontWeight: 900, color: 'rgba(255,255,255,0.1)', lineHeight: 1 }}>–</span>
        }
      </div>
      )}
    </div>
    </>
  )
}
