'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Flag from '@/components/Flag'
import { POTS } from '@/data/pots'
import { SCORING, STAGE_LABELS, type Stage } from '@/config/scoring'

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

const RESULT_PLAYER = findPick('Luke Littler').player
const RESULT_STAGE: Stage = 'qf'
const RESULT_OPPONENT = 'Gerwyn Price'
const RESULT_SETS_WON = 6
const RESULT_SET_PTS = RESULT_SETS_WON * SCORING.perSetWon
const RESULT_ADV_PTS = SCORING.perAdvancement
const RESULT_POINTS = RESULT_SET_PTS + RESULT_ADV_PTS

const LEADERBOARD_TOTAL = 34
const LEADERBOARD_RANK = 4
const LEADERBOARD_OF = 128

const LAST_PHASE = 3

/**
 * Manuelt styrt, fler-fase intro-sekvens for Dart-VM-spillet — bruker trykker seg
 * videre med «Neste»-knappen (ingen auto-advance).
 * Steg 1: de faktiske pottene → Steg 2: eksempel på poenggivende resultat →
 * Steg 3: eksempel på poengsum/leaderboard → Steg 4: CTA.
 * Brukes som intro på forsiden og gjenbrukt på vm-info-siden.
 */
export default function StepSlideshow({ onStart, onCtaReady, onSlide, ctaHref = '/tipp', ctaLabel = 'VELG SPILLERE →' }: Props) {
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState(0)
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

  useEffect(() => {
    onSlideRef.current?.(0)
  }, [])

  function goToPhase(next: number) {
    setPhase(next)
    onSlideRef.current?.(next)
    if (next === LAST_PHASE) onCtaReadyRef.current?.()
  }

  // Tell opp poengsummen når leaderboard-fasen vises
  useEffect(() => {
    if (phase !== 2) return
    setCount(0)
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
            <PhaseHeading eyebrow="Steg 1" title="De 6 pottene" />
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: 16, lineHeight: 1.5 }}>
              Du velger én spiller fra hver pott — fra ren duell øverst til det store feltet nederst.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
              {POTS.map((pot) => {
                const color = POT_COLORS[(pot.potNumber - 1) % POT_COLORS.length]
                const mult = SCORING.underdogMultiplier[pot.potNumber] ?? 1
                const example = pot.players[0]
                return (
                  <div
                    key={pot.potNumber}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      padding: '9px 12px',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 6px 16px rgba(0,0,0,0.2)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: SPORT, fontSize: 12, fontWeight: 900, color: '#000', background: color,
                        borderRadius: 7, width: 24, height: 24, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0,
                      }}
                    >
                      {pot.potNumber}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pot.name}
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pot.players.length} spillere · f.eks. {example.name}
                      </div>
                    </div>
                    <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 900, color: mult > 1 ? '#f59e0b' : 'rgba(255,255,255,0.35)', flexShrink: 0 }}>
                      ×{mult}
                    </span>
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
              1p per sett vunnet, 2p for kampseier — jo lenger de går, jo mer poeng.
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Flag iso2={RESULT_PLAYER.iso2} size={20} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {RESULT_PLAYER.name}
                </span>
                <span style={{ fontFamily: SPORT, fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>{RESULT_SETS_WON}–2</span>
                <span style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {RESULT_OPPONENT}
                </span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
                {STAGE_LABELS[RESULT_STAGE]}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                <span>{RESULT_SETS_WON} sett × 1p = {RESULT_SET_PTS}p</span>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>+</span>
                <span>kampseier = {RESULT_ADV_PTS}p</span>
                <span
                  className="multiplier-badge"
                  style={{
                    marginLeft: 'auto', fontFamily: SPORT, fontSize: 14, fontWeight: 900, color: '#f59e0b',
                    background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: 8, padding: '4px 10px', flexShrink: 0,
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

      {/* Manuell navigasjon */}
      {phase < LAST_PHASE && (
        <div style={{ display: 'flex', gap: 10 }}>
          {phase > 0 && (
            <button
              onClick={() => goToPhase(phase - 1)}
              style={{
                flexShrink: 0, padding: '14px 18px', background: 'transparent',
                color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 14, fontFamily: SPORT, fontSize: 14, fontWeight: 800,
                letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              Tilbake
            </button>
          )}
          <button
            onClick={() => goToPhase(phase + 1)}
            className="btn-hover"
            style={{
              flex: 1, padding: '14px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)',
              color: '#fff', fontFamily: SPORT, fontSize: 15, fontWeight: 900,
              letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 14,
              border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(220,38,38,0.35)',
            }}
          >
            Neste →
          </button>
        </div>
      )}

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
