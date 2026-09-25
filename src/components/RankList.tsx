'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import Flag from '@/components/Flag'
import KickButton from '@/app/liga/[code]/KickButton'
import { formatPoints } from '@/lib/format'
import { SPORT, CARD_GRADIENT } from '@/config/theme'
import { useLocale } from '@/lib/i18n/useLocale'

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

// Samme medaljefarger som på Min side — gull/sølv (PDC har ingen bronsefinale).
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
  rankDelta?: number // posisjonsendring siden i går: + = opp, − = ned, 0 = uendret
}

// Render kun de første PAGE_SIZE radene i DOM-en, med en "Vis flere"-knapp for
// resten — uten dette ble ALLE deltakere (potensielt tusenvis) rendret til DOM
// samtidig ved hver visning, tregt å scrolle/male på mobil. Egen persons rad
// blir alltid inkludert selv om den ligger lenger ned enn synlig-grensen, slik
// at scroll-til-meg (under) fortsatt fungerer uendret.
const PAGE_SIZE = 50

export default function RankList({ rows, vmStarted, kick, scrollToMe = true, backRef }: {
  rows: RankEntry[]
  vmStarted: boolean
  kick?: { leagueId: string; createdBy: string }
  scrollToMe?: boolean
  backRef?: string
}) {
  const { locale, dict } = useLocale()
  const [myId, setMyId] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const myRowRef = useRef<HTMLAnchorElement>(null)

  // Leses etter mount (ikke lazy useState-init) med vilje — localStorage finnes ikke under SSR,
  // så en lazy initializer ville gitt et hydration-mismatch mellom server og klient.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Competition ranking: tied points → same rank number (1, 1, 3, 4 …).
  // Regnes over HELE rows-listen, uansett hvor mange som faktisk rendres — en
  // deltakers rangnummer skal aldri avhenge av hvor langt ned siden er lastet.
  const displayRanks: number[] = []
  for (let i = 0; i < rows.length; i++) {
    if (i === 0) { displayRanks.push(1); continue }
    displayRanks.push(rows[i].points === rows[i - 1].points ? displayRanks[i - 1] : i + 1)
  }

  const myIndex = myId ? rows.findIndex(r => r.id === myId) : -1
  // Egen rad tas alltid med, selv om den ligger lenger ned enn PAGE_SIZE.
  const effectiveVisibleCount = Math.max(visibleCount, myIndex >= 0 ? myIndex + 1 : 0)
  const visibleRows = rows.slice(0, effectiveVisibleCount)
  const remaining = rows.length - effectiveVisibleCount

  return (
    <div className="lb-rows">
      {visibleRows.map(({ id, name, flags, points, rankDelta }, index) => {
        const isMe = id === myId
        const rank = displayRanks[index]
        const styleIdx = Math.min(rank - 1, 2)

        // Før VM har alle 0 p — ingen pall, ingen glød, bare påmeldingsrekkefølge.
        const isTop3 = vmStarted && rank <= 3
        const borderColor = isMe
          ? 'rgba(96,165,250,0.45)'
          : isTop3 ? RANK_BORDER[styleIdx] : 'rgba(255,255,255,0.12)'
        const bg = isMe
          ? 'linear-gradient(180deg, rgba(59,130,246,0.13) 0%, rgba(37,99,235,0.06) 100%)'
          : isTop3 ? RANK_BG[styleIdx] : CARD_GRADIENT

        return (
          <Link key={id} ref={isMe ? myRowRef : undefined} href={`/deltaker/${id}${backRef ? `?from=${backRef}` : ''}`} style={{ textDecoration: 'none', color: 'inherit' }}
            aria-label={vmStarted ? `${rank}. ${name}, ${formatPoints(points, locale)}${isMe ? ` (${dict.common.rankList.you})` : ''}` : `${name}${isMe ? ` (${dict.common.rankList.you})` : ''}`}
            onClick={() => { try { sessionStorage.setItem(`rl_scroll_${window.location.pathname}`, String(window.scrollY)) } catch {} }}
          >
            <div className="lb-card" style={{
              background: bg,
              borderTop: isTop3 && rank === 1 && !isMe ? '2px solid rgba(34,197,94,0.8)' : `1px solid ${borderColor}`,
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
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: isTop3 ? `${RANK_COLORS[styleIdx]}18` : 'rgba(255,255,255,0.05)', border: `1.5px solid ${isTop3 ? `${RANK_COLORS[styleIdx]}55` : 'rgba(255,255,255,0.14)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Før VM har ingen poeng — «1» på alle rader ville sett ut som en feil */}
                  <span style={{ fontFamily: SPORT, fontSize: 15, fontWeight: 900, color: isTop3 ? RANK_COLORS[styleIdx] : isMe ? '#93c5fd' : 'rgba(255,255,255,0.7)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{vmStarted ? rank : '–'}</span>
                </div>
                {rankDelta != null && (
                  <span aria-label={rankDelta > 0 ? dict.common.rankList.rankUp(rankDelta) : rankDelta < 0 ? dict.common.rankList.rankDown(Math.abs(rankDelta)) : dict.common.rankList.rankUnchanged} style={{ fontSize: 11, fontWeight: 800, lineHeight: 1, marginTop: 4, letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums', color: rankDelta > 0 ? '#4ade80' : rankDelta < 0 ? '#f87171' : isMe ? 'rgba(147,197,253,0.7)' : 'rgba(255,255,255,0.45)' }}>
                    {rankDelta > 0 ? `▲${rankDelta}` : rankDelta < 0 ? `▼${Math.abs(rankDelta)}` : '–'}
                  </span>
                )}
              </div>

              <div style={{ flex: 1, padding: '8px 12px 7px', minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: isMe ? '#93c5fd' : '#fff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                    {name}{isMe && <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(147,197,253,0.8)', marginLeft: 6 }}>{dict.common.rankList.you}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {kick && <KickButton leagueId={kick.leagueId} memberId={id} memberName={name} createdBy={kick.createdBy} />}
                    <div style={{ fontFamily: SPORT, fontSize: 20, fontWeight: 900, color: vmStarted ? '#f0f2f5' : 'rgba(255,255,255,0.4)', lineHeight: 1, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
                      {vmStarted ? formatPoints(points, locale) : '–'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'nowrap' }}>
                      {flags.map(({ iso2, eliminated, medal }, i) => {
                        const medalColor = medal ? MEDAL_COLORS[medal] : null
                        return (
                          <span key={i} style={{
                            display: 'inline-flex', opacity: vmStarted && eliminated ? 0.25 : 1, filter: vmStarted && eliminated ? 'grayscale(1)' : 'none',
                            border: medalColor ? `2px solid ${medalColor}` : '2px solid transparent',
                            background: medalColor ? `${medalColor}33` : 'none',
                            boxShadow: medalColor ? `0 0 6px ${medalColor}99` : 'none',
                            borderRadius: 5, padding: 1,
                          }}>
                            <Flag iso2={iso2} size={16} />
                          </span>
                        )
                      })}
                    </div>
                    {/* «4 av 6 igjen» sier mer om sjansene enn antall spilte kamper */}
                    {vmStarted && flags.length > 0 && (() => {
                      const left = flags.filter((f) => !f.eliminated).length
                      return <span style={{ fontSize: 12, color: left === 0 ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', flexShrink: 0 }}>· {left === 0 ? dict.common.rankList.allEliminated : dict.common.rankList.remaining(left, flags.length)}</span>
                    })()}
                  </div>
                  <span aria-hidden style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1, flexShrink: 0 }}>›</span>
                </div>
              </div>
            </div>
          </Link>
        )
      })}

      {remaining > 0 && (
        <button
          onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
          className="btn-hover"
          style={{
            display: 'block', width: '100%', padding: '13px', marginTop: 4,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 999, color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 700,
            letterSpacing: '0.04em', cursor: 'pointer', fontFamily: SPORT, textTransform: 'uppercase',
          }}
        >
          {dict.common.rankList.showMore(Math.min(remaining, PAGE_SIZE), remaining)}
        </button>
      )}
    </div>
  )
}
