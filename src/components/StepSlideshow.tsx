'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Flag from '@/components/Flag'
import { POTS } from '@/data/pots'
import { STAGE_ORDER, SCORING, type Stage } from '@/config/scoring'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

interface Props {
  onStart?: () => void
  onCtaReady?: () => void
  onSlide?: (slide: number) => void
  ctaHref?: string
  ctaLabel?: string
}

// ── Eksempeldata til intro-sekvensen (illustrerer spillmekanikken, ikke ekte VM-resultater) ──
const POT_COLORS = ['#dc2626', '#d97706', '#2563eb', '#16a34a', '#ea580c', '#7c3aed']

function findPick(name: string) {
  const pot = POTS.find((p) => p.players.some((pl) => pl.name === name))
  const player = pot?.players.find((pl) => pl.name === name)
  if (!pot || !player) throw new Error(`Fant ikke eksempelspiller: ${name}`)
  return { potNumber: pot.potNumber, player }
}

const EXAMPLE_PICKS = ['Luke Littler', 'Rob Cross', 'Gabriel Clemens'].map(findPick)

function cumulativePoints(stage: Stage): number {
  const idx = STAGE_ORDER.indexOf(stage)
  return STAGE_ORDER.slice(0, idx + 1).reduce((sum, s) => sum + SCORING.advancement[s], 0)
}

const RESULT_PLAYER = EXAMPLE_PICKS[0].player
const RESULT_STAGE: Stage = 'qf'
const RESULT_OPPONENT = 'Gerwyn Price'
const RESULT_POINTS = cumulativePoints(RESULT_STAGE)

const LEADERBOARD_TOTAL = 112
const LEADERBOARD_RANK = 4
const LEADERBOARD_OF = 128

// ── Fasetiming (ms fra mount) ──
const PICK_REVEAL_TIMES = [250, 700, 1150]
const PHASE_TIMES = [2200, 4200, 6200] // når fase 1, 2, 3 starter

/**
 * Animert, fler-fase intro-sekvens for Dart-VM-spillet.
 * Steg 1: eksempel på spillervalg → Steg 2: eksempel på poenggivende resultat →
 * Steg 3: eksempel på poengsum/leaderboard → Steg 4: CTA.
 * Brukes som intro på forsiden og gjenbrukt på vm-info-siden.
 */
export default function StepSlideshow({ onStart, onCtaReady, onSlide, ctaHref = '/tipp', ctaLabel = 'VELG SPILLERE →' }: Props) {
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState(0)
  const [revealedPicks, setRevealedPicks] = useState(0)
  const [count, setCount] = useState(0)

  const onSlideRef = useRef(onSlide)
  const onCtaReadyRef = useRef(onCtaReady)
  onSlideRef.current = onSlide
  onCtaReadyRef.current = onCtaReady

  // Fade inn hele komponenten
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40)
    return () => clearTimeout(t)
  }, [])

  // Styr faseoverganger + spillerpick-stagger. Kjøres kun én gang på mount.
  useEffect(() => {
    onSlideRef.current?.(0)
    const timers: ReturnType<typeof setTimeout>[] = []

    PICK_REVEAL_TIMES.forEach((t, i) => {
      timers.push(setTimeout(() => setRevealedPicks(i + 1), t))
    })
    PHASE_TIMES.forEach((t, i) => {
      const nextPhase = i + 1
      timers.push(
        setTimeout(() => {
          setPhase(nextPhase)
          onSlideRef.current?.(nextPhase)
          if (nextPhase === 3) onCtaReadyRef.current?.()
        }, t)
      )
    })

    return () => timers.forEach(clearTimeout)
  }, [])

  // Tell opp poengsummen i leaderboard-fasen
  useEffect(() => {
    if (phase !== 2) return
    const steps = 24
    const stepTime = 900 / steps
    let i = 0
    const interval = setInterval(() => {
      i += 1
      const eased = 1 - Math.pow(1 - i / steps, 3)
      setCount(Math.round(eased * LEADERBOARD_TOTAL))
      if (i >= steps) clearInterval(interval)
    }, stepTime)
    return () => clearInterval(interval)
  }, [phase])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Merkevare-header */}
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <div
          style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            marginBottom: 6,
            background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)',
          }}
        >
          — PDC World Championship —
        </div>
        <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: 36, letterSpacing: '-1px', lineHeight: 1 }}>
          <span style={{ color: 'rgba(255,255,255,0.38)' }}>DART-VM-</span>
          <span
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            SPILLET
          </span>
        </div>
      </div>

      {/* Faseprikker */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              width: i === phase ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i <= phase ? '#dc2626' : 'rgba(255,255,255,0.15)',
              transition: 'width 0.35s cubic-bezier(0.22,1,0.36,1), background 0.35s ease',
            }}
          />
        ))}
      </div>

      {/* Faseinnhold */}
      <div style={{ minHeight: 268, marginBottom: 24 }}>
        {phase === 0 && (
          <div>
            <PhaseHeading eyebrow="Eksempel · steg 1" title="Velg 6 dartspillere" />
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: 16, lineHeight: 1.5 }}>
              Én spiller fra hvert av de 6 nivåene – fra toppseedet til wildcard.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {EXAMPLE_PICKS.map((pick, i) => {
                const color = POT_COLORS[pick.potNumber - 1]
                if (i >= revealedPicks) return <div key={pick.player.name} style={{ height: 52 }} />
                return (
                  <div
                    key={pick.player.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      padding: '11px 14px',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 20px rgba(0,0,0,0.25)',
                      animation: 'slide-enter 0.45s cubic-bezier(0.22,1,0.36,1) both',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: SPORT,
                        fontSize: 12,
                        fontWeight: 900,
                        color: '#000',
                        background: color,
                        borderRadius: 7,
                        width: 26,
                        height: 26,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {pick.potNumber}
                    </span>
                    <Flag iso2={pick.player.iso2} size={20} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pick.player.name}
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{pick.player.nationality}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>#{pick.player.pdcRanking}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {phase === 1 && (
          <div style={{ animation: 'slide-enter 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
            <PhaseHeading eyebrow="Eksempel · steg 2" title="Følg dem gjennom dart-VM" />
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: 16, lineHeight: 1.5 }}>
              Spillerne dine kjemper seg gjennom sluttspillet i PDC World Championship.
            </div>
            <div
              style={{
                background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: '18px 18px 16px',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 20px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Flag iso2={RESULT_PLAYER.iso2} size={20} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {RESULT_PLAYER.name}
                </span>
                <span style={{ fontFamily: SPORT, fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>6–2</span>
                <span style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {RESULT_OPPONENT}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                  Kvartfinale
                </span>
                <span
                  className="multiplier-badge"
                  style={{
                    fontFamily: SPORT,
                    fontSize: 14,
                    fontWeight: 900,
                    color: '#f59e0b',
                    background: 'rgba(245,158,11,0.12)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: 8,
                    padding: '4px 10px',
                  }}
                >
                  +{RESULT_POINTS}p
                </span>
              </div>
            </div>
          </div>
        )}

        {phase === 2 && (
          <div style={{ animation: 'slide-enter 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
            <PhaseHeading eyebrow="Eksempel · steg 3" title="Poeng for hver runde" />
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: 16, lineHeight: 1.5 }}>
              Du scorer poeng for hver runde spillerne dine vinner – jo lenger de går, jo mer poeng.
            </div>
            <div
              style={{
                background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 16,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 20px rgba(0,0,0,0.25)',
                display: 'flex',
                overflow: 'hidden',
              }}
            >
              <div style={{ flex: 1, padding: '16px 18px 14px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 4 }}>
                  Poeng
                </div>
                <div style={{ fontFamily: SPORT, fontSize: 40, fontWeight: 900, color: '#f59e0b', lineHeight: 1, letterSpacing: '-1.5px', fontVariantNumeric: 'tabular-nums' }}>
                  {count}
                </div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.07)', alignSelf: 'stretch' }} />
              <div style={{ padding: '16px 18px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(251,191,36,0.5)', marginBottom: 2 }}>
                  Plassering
                </div>
                <div style={{ fontFamily: SPORT, fontSize: 40, fontWeight: 900, color: '#fbbf24', lineHeight: 1, letterSpacing: '-1.5px' }}>
                  #{LEADERBOARD_RANK}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', marginTop: 2 }}>av {LEADERBOARD_OF}</div>
              </div>
            </div>
          </div>
        )}

        {phase === 3 && (
          <div style={{ textAlign: 'center', animation: 'slide-enter 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
            <div style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, textTransform: 'uppercase', color: '#fff', marginBottom: 8 }}>
              Klar til å sette laget?
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55, marginBottom: 6 }}>
              Velg dine 6 spillere og følg dem gjennom hele sluttspillet i PDC World Championship.
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      {phase === 3 &&
        (onStart ? (
          <button
            onClick={onStart}
            className="cta-pulse"
            style={{
              display: 'block',
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)',
              color: '#fff',
              fontFamily: SPORT,
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              borderRadius: 14,
              border: 'none',
              cursor: 'pointer',
              animation: 'slide-enter 0.5s cubic-bezier(0.22,1,0.36,1) both',
            }}
          >
            {ctaLabel}
          </button>
        ) : (
          <Link
            href={ctaHref}
            className="cta-btn cta-pulse"
            style={{
              display: 'block',
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)',
              color: '#fff',
              fontFamily: SPORT,
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              borderRadius: 14,
              textAlign: 'center',
              textDecoration: 'none',
              animation: 'slide-enter 0.5s cubic-bezier(0.22,1,0.36,1) both',
            }}
          >
            {ctaLabel}
          </Link>
        ))}
    </div>
  )
}

function PhaseHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 4 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>
        {eyebrow}
      </div>
      <div style={{ fontFamily: SPORT, fontSize: 19, fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}>{title}</div>
    </div>
  )
}
