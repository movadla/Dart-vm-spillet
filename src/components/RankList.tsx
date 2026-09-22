'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import Flag from '@/components/Flag'
import KickButton from '@/app/liga/[code]/KickButton'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'
// Grønn pall-kaskade (#22c55e). 1.plass gløder, 2/3 avtar.
const RANK_COLORS = ['#4ade80', '#34d27a', '#2bb673']
const RANK_BORDER = ['rgba(34,197,94,0.9)', 'rgba(34,197,94,0.4)', 'rgba(34,197,94,0.22)']
const RANK_BG = ['linear-gradient(180deg, rgba(34,197,94,0.14) 0%, rgba(34,197,94,0.04) 100%)', 'rgba(34,197,94,0.035)', 'rgba(34,197,94,0.02)']
const RANK_GLOW = [
  'inset 0 0 0 1px rgba(74,222,128,0.3), inset 0 1px 8px rgba(74,222,128,0.2), 0 0 18px rgba(34,197,94,0.55), 0 0 48px rgba(34,197,94,0.32)',
  '0 0 12px rgba(34,197,94,0.15)',
  '',
]

export interface FlagEntry { iso2: string; eliminated: boolean; medal?: 'bronze' | 'silver' | 'gold' }

// Samme medaljefarger som brukes på deltaker-siden (PicksClient.tsx) — gull/sølv/bronse.
const MEDAL_COLORS: Record<'bronze' | 'silver' | 'gold', string> = {
  gold: '#fbbf24',
  silver: '#9ca3af',
  bronze: '#cd7c2f',
}

export interface RankEntry {
  id: string
  name: string
  flags: FlagEntry[]
  points: number
  matchesPlayed?: number
  rankDelta?: number // posisjonsendring siden i går: + = opp, − = ned, 0 = uendret
}

export default function RankList({ rows, vmStarted, kick, scrollToMe = true, backRef }: {
  rows: RankEntry[]
  vmStarted: boolean
  kick?: { leagueId: string; createdBy: string }
  scrollToMe?: boolean
  backRef?: string
}) {
  const [myId, setMyId] = useState<string | null>(null)
  const myRowRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    try { setMyId(localStorage.getItem('vm_participant_id')) } catch {}
  }, [])

  useEffect(() => {
    if (!scrollToMe || !myId || !myRowRef.current) return
    const myIndex = rows.findIndex(r => r.id === myId)
    if (myIndex < 4) return

    // Kom vi tilbake hit fra en deltaker-side? Gjenopprett scrollposisjon i stedet.
    const scrollKey = `rl_scroll_${window.location.pathname}`
    const savedPos = sessionStorage.getItem(scrollKey)
    if (savedPos !== null) {
      sessionStorage.removeItem(scrollKey)
      window.scrollTo({ top: parseInt(savedPos, 10), behavior: 'instant' })
      return
    }

    const timer = setTimeout(() => {
      myRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 400)
    return () => clearTimeout(timer)
  }, [myId, rows, scrollToMe])

  // Competition ranking: tied points → same rank number (1, 1, 3, 4 …)
  const displayRanks: number[] = []
  for (let i = 0; i < rows.length; i++) {
    if (i === 0) { displayRanks.push(1); continue }
    displayRanks.push(rows[i].points === rows[i - 1].points ? displayRanks[i - 1] : i + 1)
  }

  return (
    <div className="lb-rows">
      {rows.map(({ id, name, flags, points, matchesPlayed, rankDelta }, index) => {
        const isMe = id === myId
        const rank = displayRanks[index]
        const styleIdx = Math.min(rank - 1, 2)

        const isTop3 = rank <= 3
        const borderColor = isMe
          ? 'rgba(96,165,250,0.45)'
          : isTop3 ? RANK_BORDER[styleIdx] : 'rgba(255,255,255,0.12)'
        const bg = isMe
          ? 'linear-gradient(180deg, rgba(59,130,246,0.13) 0%, rgba(37,99,235,0.06) 100%)'
          : isTop3 ? RANK_BG[styleIdx] : 'linear-gradient(180deg, #161b27 0%, #12161f 100%)'

        return (
          <Link key={id} ref={isMe ? myRowRef : undefined} href={`/deltaker/${id}${backRef ? `?from=${backRef}` : ''}`} style={{ textDecoration: 'none', color: 'inherit' }}
            onClick={() => { try { sessionStorage.setItem(`rl_scroll_${window.location.pathname}`, String(window.scrollY)) } catch {} }}
          >
            <div className="lb-card" style={{
              background: bg,
              borderTop: rank === 1 && !isMe ? '2px solid rgba(34,197,94,0.8)' : `1px solid ${borderColor}`,
              borderRight: `1px solid ${borderColor}`,
              borderBottom: `1px solid ${borderColor}`,
              borderLeft: `1px solid ${borderColor}`,
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              boxShadow: isMe
                ? 'inset 0 1px 0 rgba(255,255,255,0.10), 0 0 0 1px rgba(96,165,250,0.2), 0 4px 20px rgba(59,130,246,0.15)'
                : isTop3
                  ? `inset 0 1px 0 rgba(255,255,255,0.10)${RANK_GLOW[styleIdx] ? `, ${RANK_GLOW[styleIdx]}` : ''}`
                  : 'inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)',
            }}>
              <div style={{
                width: 52, flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRight: `1px solid ${borderColor}`,
                padding: '9px 0',
              }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: isTop3 ? `${RANK_COLORS[styleIdx]}18` : 'rgba(255,255,255,0.05)', border: `1.5px solid ${isTop3 ? `${RANK_COLORS[styleIdx]}55` : 'rgba(255,255,255,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, color: isTop3 ? RANK_COLORS[styleIdx] : 'rgba(255,255,255,0.2)', lineHeight: 1 }}>{rank}</span>
                </div>
                {rankDelta != null && (
                  <span style={{ fontSize: 9, fontWeight: 800, lineHeight: 1, marginTop: 3, letterSpacing: '0.02em', color: rankDelta > 0 ? '#22c55e' : rankDelta < 0 ? '#ef4444' : 'rgba(255,255,255,0.25)' }}>
                    {rankDelta > 0 ? `▲${rankDelta}` : rankDelta < 0 ? `▼${Math.abs(rankDelta)}` : '–'}
                  </span>
                )}
              </div>

              <div style={{ flex: 1, padding: '7px 12px 5px', minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, paddingRight: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: isMe ? '#93c5fd' : '#fff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{name}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {kick && <KickButton leagueId={kick.leagueId} memberId={id} memberName={name} createdBy={kick.createdBy} />}
                    <div style={{ fontFamily: SPORT, fontSize: 20, fontWeight: 900, color: '#f0f2f5', lineHeight: 1, letterSpacing: '-0.5px' }}>{points}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'nowrap' }}>
                      {flags.map(({ iso2, eliminated, medal }, i) => {
                        const medalColor = medal ? MEDAL_COLORS[medal] : null
                        return (
                          <span key={i} style={{
                            display: 'inline-flex', opacity: vmStarted && eliminated ? 0.2 : 1, filter: vmStarted && eliminated ? 'grayscale(1)' : 'none',
                            border: medalColor ? `3px solid ${medalColor}` : '3px solid transparent',
                            background: medalColor ? `${medalColor}33` : 'none',
                            boxShadow: medalColor ? `0 0 6px ${medalColor}99` : 'none',
                            borderRadius: 5, padding: 1,
                          }}>
                            <Flag iso2={iso2} size={16} />
                          </span>
                        )
                      })}
                    </div>
                    {vmStarted && matchesPlayed != null && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', flexShrink: 0 }}>· {matchesPlayed} kamper</span>}
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', lineHeight: 1, flexShrink: 0 }}>→</span>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
