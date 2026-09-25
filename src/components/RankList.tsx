'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import Flag from '@/components/Flag'
import KickButton from '@/app/liga/[code]/KickButton'
import { formatPoints } from '@/lib/format'
import { SPORT, CARD_GRADIENT } from '@/config/theme'
import { useLocale } from '@/lib/i18n/useLocale'
import { PLAYER_PHOTOS } from '@/data/playerPhotos'
import { POT_COLORS, POT_COLORS_DARK } from '@/config/potColors'

// Gull/sølv/bronse-pall (samme farger som MEDAL_COLORS under) — IKKE grønt.
// Grønt er reservert for rankDelta-pilene («▲ flyttet opp»), et helt annet
// signal (retning på endring) enn selve plasseringen. Delte gjorde de to
// tingene vanskelige å skille fra hverandre ved et raskt blikk, og var
// dessuten et rent fargesignal uten annen forsterkning — dårlig for
// fargesvaksynede. 1. plass gløder tydeligst, 2./3. avtar.
const RANK_COLORS = ['#fbbf24', '#9ca3af', '#cd7c2f']
const RANK_BORDER = ['rgba(251,191,36,0.9)', 'rgba(156,163,175,0.5)', 'rgba(205,124,47,0.35)']
const RANK_BG = ['linear-gradient(180deg, rgba(251,191,36,0.14) 0%, rgba(251,191,36,0.04) 100%)', 'rgba(156,163,175,0.05)', 'rgba(205,124,47,0.04)']
const RANK_GLOW = [
  'inset 0 0 0 1px rgba(253,224,71,0.35), inset 0 1px 8px rgba(251,191,36,0.2), 0 0 18px rgba(251,191,36,0.5), 0 0 48px rgba(251,191,36,0.28)',
  '0 0 12px rgba(156,163,175,0.18)',
  '',
]

export interface FlagEntry { iso2: string; eliminated: boolean; medal?: 'bronze' | 'silver' | 'gold'; playerName: string; potNumber: number }

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
              borderTop: isTop3 && rank === 1 && !isMe ? '2px solid rgba(251,191,36,0.85)' : `1px solid ${borderColor}`,
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
                {/* 32px/18px (var 28px/15px) — tallet så lite og litt malplassert ut i
                    sirkelen, spesielt étsifrede plasseringer. */}
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: isTop3 ? `${RANK_COLORS[styleIdx]}18` : 'rgba(255,255,255,0.05)', border: `1.5px solid ${isTop3 ? `${RANK_COLORS[styleIdx]}55` : 'rgba(255,255,255,0.14)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Før VM har ingen poeng — «1» på alle rader ville sett ut som en feil */}
                  <span style={{ fontFamily: SPORT, fontSize: 18, fontWeight: 900, color: isTop3 ? RANK_COLORS[styleIdx] : isMe ? '#93c5fd' : 'rgba(255,255,255,0.7)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{vmStarted ? rank : '–'}</span>
                </div>
                {rankDelta != null && (
                  <span aria-label={rankDelta > 0 ? dict.common.rankList.rankUp(rankDelta) : rankDelta < 0 ? dict.common.rankList.rankDown(Math.abs(rankDelta)) : dict.common.rankList.rankUnchanged} style={{ fontSize: 13, fontWeight: 800, lineHeight: 1, marginTop: 5, letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums', color: rankDelta > 0 ? '#4ade80' : rankDelta < 0 ? '#f87171' : isMe ? 'rgba(147,197,253,0.7)' : 'rgba(255,255,255,0.45)' }}>
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
                      {flags.map(({ iso2, eliminated, medal, playerName, potNumber }, i) => {
                        const medalColor = medal ? MEDAL_COLORS[medal] : null
                        const photo = PLAYER_PHOTOS[playerName]
                        const potColor = POT_COLORS[(potNumber - 1) % POT_COLORS.length]
                        const potColorDark = POT_COLORS_DARK[(potNumber - 1) % POT_COLORS_DARK.length]
                        const dimmed = vmStarted && eliminated
                        return (
                          <span key={i} style={{
                            // Bittesmå versjoner av lagbrikkene (foto på pott-farge) i
                            // stedet for flagg — flagget forteller ingenting om HVEM man
                            // har valgt, bare nasjonalitet. Samme demping som TeamTile
                            // («dimmed» på Min side) for utslåtte spillere.
                            display: 'inline-flex', alignItems: 'flex-end', justifyContent: 'center',
                            width: 18, height: 22, position: 'relative', overflow: 'hidden',
                            opacity: dimmed ? 0.45 : 1, filter: dimmed ? 'grayscale(0.8)' : 'none',
                            border: medalColor ? `2px solid ${medalColor}` : '1px solid rgba(255,255,255,0.18)',
                            background: `radial-gradient(ellipse 80% 70% at 50% 35%, ${potColor} 0%, ${potColorDark} 100%)`,
                            boxShadow: medalColor ? `0 0 6px ${medalColor}99` : 'none',
                            borderRadius: 5,
                          }}>
                            {photo ? (
                              // eslint-disable-next-line @next/next/no-img-element -- statisk fil i public/, bittesmå og mange på én gang
                              <img src={photo.src} alt="" loading="lazy" decoding="async" style={{ position: 'absolute', inset: '4% 2% 0', width: '96%', height: '96%', objectFit: 'contain', objectPosition: 'bottom' }} />
                            ) : (
                              <Flag iso2={iso2} size={12} />
                            )}
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
