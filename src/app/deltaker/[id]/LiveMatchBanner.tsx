'use client'

import { useEffect, useState } from 'react'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

interface Match {
  date: string
  time: string
  home: string
  homeIso2: string
  away: string
  awayIso2: string
  isHome: boolean
}

interface LiveScore { home: string; away: string; homeGoals: number; awayGoals: number; minute: string }

function isLiveByTime(m: Match): boolean {
  const now = new Date()
  const [h, min] = m.time.split(':').map(Number)
  const kickoff = new Date(`${m.date}T${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}:00`)
  const diff = (now.getTime() - kickoff.getTime()) / 60000
  return diff >= 0 && diff < 130
}

export default function LiveMatchBanner({ matches }: { matches: Match[] }) {
  const [scores, setScores] = useState<LiveScore[]>([])

  useEffect(() => {
    const liveByTime = matches.filter(isLiveByTime)
    if (liveByTime.length === 0) return

    const poll = () => {
      fetch('/api/live-scores')
        .then(r => r.ok ? r.json() : { matches: [] })
        .then(({ matches: lms }: { matches: LiveScore[] }) => {
          if (!lms?.length) { setScores([]); return }
          // Behold kun kamper der brukerens lag deltar
          const teamSet = new Set(liveByTime.flatMap(m => [m.home, m.away]))
          setScores(lms.filter(s => teamSet.has(s.home) || teamSet.has(s.away)))
        })
        .catch(() => {})
    }
    poll()
    const t = setInterval(poll, 30_000)
    return () => clearInterval(t)
  }, [matches])

  if (scores.length === 0) return null

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: -44, marginBottom: 16 }}>
      {scores.map(s => (
        <div key={`${s.home}|${s.away}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '5px 12px', borderRadius: 20,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
        }}>
          <span className="live-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{s.home}</span>
          <span style={{ fontFamily: SPORT, fontSize: 15, fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>{s.homeGoals}–{s.awayGoals}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{s.away}</span>
          {s.minute && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{s.minute}</span>}
        </div>
      ))}
    </div>
  )
}
