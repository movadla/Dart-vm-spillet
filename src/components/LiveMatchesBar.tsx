'use client'

import { useEffect, useState } from 'react'
import Flag from '@/components/Flag'
import { getIso2 } from '@/data/pots'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

interface GoalEvent { scorer: string; minute: string; team: string; isPenalty: boolean; isOwnGoal: boolean }
interface LiveScore { home: string; away: string; homeGoals: number; awayGoals: number; minute: string; venue?: string; goals?: GoalEvent[] }

export default function LiveMatchesBar({ expandable }: { expandable?: boolean }) {
  const [scores, setScores] = useState<LiveScore[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const poll = () => {
      fetch('/api/live-scores')
        .then(r => r.ok ? r.json() : { matches: [] })
        .then(({ matches }: { matches: (LiveScore & { state?: string })[] }) =>
          setScores((matches ?? []).filter(m => !m.state || m.state === 'in'))
        )
        .catch(() => {})
    }
    poll()
    const t = setInterval(poll, 30_000)
    return () => clearInterval(t)
  }, [])

  if (scores.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', marginBottom: 20 }}>
      {scores.map(s => {
        const key = `${s.home}|${s.away}`
        const isOpen = expandable && expanded === key
        const hasDetails = expandable && ((s.goals?.length ?? 0) > 0 || !!s.venue)
        return (
          <div key={key} style={{ width: 'fit-content', maxWidth: '100%', minWidth: 200 }}>
            {/* Chip */}
            <div
              onClick={() => hasDetails && setExpanded(isOpen ? null : key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 14px',
                borderRadius: isOpen ? '16px 16px 0 0' : 16,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                cursor: hasDetails ? 'pointer' : 'default',
                whiteSpace: 'nowrap',
              }}
            >
              <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{s.home}</span>
              <span style={{ fontFamily: SPORT, fontSize: 17, fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>{s.homeGoals}–{s.awayGoals}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{s.away}</span>
              {s.minute && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{s.minute}</span>}
              <span style={{ fontFamily: SPORT, fontSize: 10, fontWeight: 900, color: '#ef4444', letterSpacing: '0.1em', lineHeight: 1 }}>LIVE</span>
              {hasDetails && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▾</span>
              )}
            </div>

            {/* Utvidet: stadion + målscorere */}
            {isOpen && (
              <div style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderTop: 'none',
                borderRadius: '0 0 14px 14px',
                padding: '8px 14px 10px',
                display: 'flex', flexDirection: 'column', gap: 5,
                minWidth: 200,
              }}>
                {s.venue && (
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginBottom: s.goals?.length ? 4 : 0 }}>
                    📍 {s.venue}
                  </div>
                )}
                {(s.goals ?? []).map((g, gi) => {
                  const suffix = g.isPenalty ? ' (str.)' : g.isOwnGoal ? ' (s.m.)' : ''
                  const isHome = g.team === s.home
                  return (
                    <div key={gi} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {isHome ? (
                        <>
                          <span style={{ fontFamily: SPORT, fontSize: 11, fontWeight: 700, color: '#ef4444', width: 22, textAlign: 'right', flexShrink: 0 }}>{g.minute}</span>
                          <Flag iso2={getIso2(g.team)} size={13} />
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>{g.scorer}{suffix}</span>
                          <span style={{ flex: 1 }} />
                        </>
                      ) : (
                        <>
                          <span style={{ flex: 1 }} />
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', textAlign: 'right' }}>{g.scorer}{suffix}</span>
                          <Flag iso2={getIso2(g.team)} size={13} />
                          <span style={{ fontFamily: SPORT, fontSize: 11, fontWeight: 700, color: '#ef4444', width: 22, textAlign: 'left', flexShrink: 0 }}>{g.minute}</span>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
