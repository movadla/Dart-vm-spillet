'use client'

import { useState } from 'react'
import Flag from '@/components/Flag'
import { getIso2 } from '@/data/pots'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'
const ADV_ORD: Record<string, number> = { group: 0, r32: 1, r16: 2, qf: 3, sf: 4, bronze: 5, silver: 6, gold: 7 }

export interface PlayedMatch { home: string; homeGoals: number; away: string; awayGoals: number; date: string; group: string; stage: string }
export interface UpcomingMatch { date: string; time: string; home: string; away: string; group: string }

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

function stageLabelFor(advStage: string | null): string | null {
  if (advStage === 'gold') return 'Gullmedalje'
  if (advStage === 'silver') return 'Sølvmedalje'
  if (advStage === 'bronze') return 'Bronsemedalje'
  return null
}

// Samme «spilte kamper med poeng + kommende kamper»-visning som på Min side (PicksClient),
// men frittstående så den kan brukes for et hvilket som helst land i poengoversikten.
export default function CountryMatchDetail({ teamName, multiplier, color, advStage, played, upcoming, knockoutUpcoming = null, knockoutOpponent = null }: {
  teamName: string
  multiplier: number
  color: string
  advStage: string | null
  played: PlayedMatch[]
  upcoming: UpcomingMatch[]
  knockoutUpcoming?: string | null
  knockoutOpponent?: { name: string; flag: string } | null
}) {
  const [openMatch, setOpenMatch] = useState<string | null>(null)
  const advOrd = ADV_ORD[advStage ?? ''] ?? -1
  const stageLabel = stageLabelFor(advStage)

  return (
    <div style={{ padding: '4px 4px 10px' }}>
      {/* Spilte kamper */}
      {played.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 7 }}>Spilte kamper</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {played.map((m, i) => {
              const key = `${teamName}-${i}`
              const mOpen = openMatch === key
              const mp = matchPoints(m, teamName, multiplier)
              const dateParts = m.group ? m.date.split('-') : ['', '', '']
              const [, mo, d] = dateParts
              const STAGE_ROUND: Record<string, string> = { r32: '1/16', r16: '1/8', qf: 'QF', sf: 'SF', final: 'Finale', bronze: 'Bronse' }
              const roundLabel = m.group ? `Gr.${m.group}` : (STAGE_ROUND[m.stage] ?? m.stage)
              const isLastGroupMatch = m.stage === 'group' && !played.slice(i + 1).some(pm => pm.stage === 'group')
              let stageBonus: number | null = null
              let stageBonusLabel = ''
              if (isLastGroupMatch && advOrd >= 0) { stageBonus = 5; stageBonusLabel = 'Videre fra gruppe' }
              else if (m.stage === 'r32' && advOrd >= ADV_ORD['r32']) { stageBonus = 10; stageBonusLabel = 'Videre til 1/8-finale' }
              else if (m.stage === 'r16' && advOrd >= ADV_ORD['r16']) { stageBonus = 15; stageBonusLabel = 'Videre til QF' }
              else if (m.stage === 'qf' && advOrd >= ADV_ORD['qf']) { stageBonus = 20; stageBonusLabel = 'Videre til SF' }
              else if (m.stage === 'bronze') {
                const isHomeB = m.home === teamName
                const myG = isHomeB ? m.homeGoals : m.awayGoals
                const oppG = isHomeB ? m.awayGoals : m.homeGoals
                if (myG > oppG) { stageBonus = 15; stageBonusLabel = 'Bronsemedalje' }
              } else if (m.stage === 'final') {
                if (stageLabel === 'Gullmedalje') { stageBonus = 40; stageBonusLabel = 'Gullmedalje' }
                else if (stageLabel === 'Sølvmedalje') { stageBonus = 20; stageBonusLabel = 'Sølvmedalje' }
              }

              return (
                <div key={i}>
                  <div className="pick-row" onClick={() => setOpenMatch(mOpen ? null : key)} style={{ cursor: 'pointer', borderRadius: 8, padding: '5px 8px', background: mOpen ? 'rgba(255,255,255,0.04)' : 'transparent', transition: 'background 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', flexShrink: 0, minWidth: 30 }}>{roundLabel}</span>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{d}/{mo}</span>
                      <span style={{ flex: 1, fontWeight: m.home === teamName ? 700 : 400, color: m.home === teamName ? '#fff' : 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home}</span>
                      <span style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', flexShrink: 0 }}>{m.homeGoals}–{m.awayGoals}</span>
                      <span style={{ flex: 1, textAlign: 'right', fontWeight: m.away === teamName ? 700 : 400, color: m.away === teamName ? '#fff' : 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.away}</span>
                      <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 900, color: mp.total > 0 ? '#f59e0b' : 'rgba(255,255,255,0.2)', flexShrink: 0, minWidth: 24, textAlign: 'right' }}>{mp.total > 0 ? `+${mp.total}` : '0'}</span>
                    </div>
                    {mOpen && (
                      <div style={{ marginTop: 5, paddingTop: 5, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                        {mp.goalPts > 0 && <div>{mp.myGoals} mål × 1p = <span style={{ color: '#f59e0b' }}>+{mp.goalPts}p</span></div>}
                        {mp.outcomePts > 0 && <div>{mp.win ? 'Seier' : 'Uavgjort'}: <span style={{ color: '#f59e0b' }}>+{mp.outcomePts}p</span></div>}
                        {mp.raw === 0 && <div style={{ color: 'rgba(255,255,255,0.25)' }}>Tap — ingen poeng</div>}
                        {mp.raw > 0 && multiplier > 1 && (
                          <div style={{ marginTop: 2, color, fontWeight: 700 }}>({mp.goalPts}+{mp.outcomePts}) × {multiplier} = <span style={{ color: '#f59e0b' }}>{mp.total}p</span></div>
                        )}
                      </div>
                    )}
                  </div>
                  {stageBonus !== null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 8px 4px', marginTop: 1, borderRadius: 6, background: 'rgba(34,197,94,0.06)', borderLeft: '2px solid rgba(34,197,94,0.3)' }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', flex: 1 }}>{stageBonusLabel}</span>
                      <span style={{ fontFamily: SPORT, fontSize: 12, fontWeight: 900, color: '#f59e0b' }}>{multiplier > 1 ? `${stageBonus} × ${multiplier} = +${stageBonus * multiplier}p` : `+${stageBonus}p`}</span>
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
        {upcoming.length === 0 && !knockoutUpcoming ? (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>Ingen planlagte kamper</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcoming.map((m, i) => {
              const [, mo, d] = m.date.split('-')
              const roundLabel = m.group ? `Gr.${m.group}` : '–'
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', flexShrink: 0, minWidth: 30 }}>{roundLabel}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', flexShrink: 0 }}>{d}/{mo} {m.time}</span>
                  <span style={{ flex: 1, fontWeight: m.home === teamName ? 700 : 400, color: m.home === teamName ? '#fff' : 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home}</span>
                  <span style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, color: 'rgba(255,255,255,0.15)', flexShrink: 0 }}>–</span>
                  <span style={{ flex: 1, textAlign: 'right', fontWeight: m.away === teamName ? 700 : 400, color: m.away === teamName ? '#fff' : 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.away}</span>
                </div>
              )
            })}
            {knockoutUpcoming && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', flexShrink: 0 }}>{knockoutUpcoming}</span>
                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 9 }}>·</span>
                {knockoutOpponent ? (
                  <>
                    <Flag iso2={getIso2(knockoutOpponent.name)} size={14} />
                    <span style={{ color: 'rgba(255,255,255,0.55)' }}>{knockoutOpponent.name}</span>
                  </>
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Motstander fastsettes snart</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
