'use client'

import { useState, useEffect } from 'react'
import Flag from '@/components/Flag'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

interface Match {
  id: string
  date: string
  time: string
  home: string
  homeIso2: string
  away: string
  awayIso2: string
  isHome: boolean
  channel?: 'NRK1' | 'TV 2'
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

export default function UpcomingMatchCard({ matches }: { matches: Match[] }) {
  const [expanded, setExpanded] = useState(false)
  const [hover, setHover] = useState(false)
  const [nowMs, setNowMs] = useState<number | null>(null)

  useEffect(() => {
    setNowMs(Date.now())
    const t = setInterval(() => setNowMs(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])

  if (matches.length === 0) return null

  const DEFAULT_SHOW = 2
  const hasMore = matches.length > DEFAULT_SHOW
  const visible = expanded ? matches : matches.slice(0, DEFAULT_SHOW)

  return (
    <div style={{
      background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.12)',
      overflow: 'hidden',
      marginBottom: 10,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)',
    }}>
      {visible.map((m, i) => {
        const [, mo, d] = m.date.split('-')
        return (
          <div key={m.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: `8px 16px ${i === visible.length - 1 && (!hasMore || expanded) ? 12 : 8}px`,
            borderTop: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700, width: 34, flexShrink: 0 }}>{d}.{mo}</div>
            <span style={{ flexShrink: 0, filter: m.isHome ? 'none' : 'grayscale(0.3)', opacity: m.isHome ? 1 : 0.6 }}><Flag iso2={m.homeIso2} size={m.isHome ? 22 : 18} /></span>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              {m.isHome && <span style={{ color: '#dc2626', fontSize: 8, flexShrink: 0 }}>●</span>}
              <span style={{ fontSize: 13, fontWeight: m.isHome ? 800 : 400, color: m.isHome ? '#fff' : 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home}</span>
            </div>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 600, flexShrink: 0 }}>–</span>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: !m.isHome ? 800 : 400, color: !m.isHome ? '#fff' : 'rgba(255,255,255,0.4)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.away}</span>
              {!m.isHome && <span style={{ color: '#dc2626', fontSize: 8, flexShrink: 0 }}>●</span>}
            </div>
            <span style={{ flexShrink: 0, filter: !m.isHome ? 'none' : 'grayscale(0.3)', opacity: !m.isHome ? 1 : 0.6 }}><Flag iso2={m.awayIso2} size={!m.isHome ? 22 : 18} /></span>
            <div style={{ width: 44, textAlign: 'right', flexShrink: 0 }}>
              {nowMs && isMatchLive(m.date, m.time, nowMs) ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                  <span className="live-dot" style={{ width: 6, height: 6, background: '#ef4444', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontFamily: SPORT, fontSize: 12, fontWeight: 900, color: '#ef4444', letterSpacing: '0.08em' }}>LIVE</span>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600, lineHeight: 1.2 }}>{m.time}</div>
                  {m.channel && <div style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1.2, marginTop: 1, color: m.channel === 'NRK1' ? '#6db3f2' : '#f0883e' }}>{m.channel}</div>}
                </>
              )}
            </div>
          </div>
        )
      })}

      {hasMore && (
        <button
          onClick={() => setExpanded(e => !e)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            display: 'block', width: '100%', padding: '10px 16px',
            background: hover ? 'rgba(255,255,255,0.09)' : expanded ? 'transparent' : 'rgba(255,255,255,0.04)',
            borderTop: '1px solid rgba(255,255,255,0.07)', border: 'none',
            borderTopStyle: 'solid', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
            color: hover ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            fontFamily: SPORT, letterSpacing: '0.08em', textTransform: 'uppercase',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          {expanded ? 'Vis færre ↑' : `+ ${matches.length - DEFAULT_SHOW} kamper til ↓`}
        </button>
      )}
    </div>
  )
}
