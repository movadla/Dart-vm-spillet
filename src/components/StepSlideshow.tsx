'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

interface Props {
  onStart?: () => void
  onCtaReady?: () => void
  onSlide?: (slide: number) => void
  ctaHref?: string
  ctaLabel?: string
}

const STEPS = [
  {
    emoji: '🎯',
    title: 'Velg 5 dartspillere',
    desc: 'Én spiller fra hvert av de 5 nivåene – fra toppseedet til wildcard.',
  },
  {
    emoji: '🏹',
    title: 'Følg dem gjennom dart-VM',
    desc: 'Spillerne dine kjemper seg gjennom sluttspillet i PDC World Championship.',
  },
  {
    emoji: '🏆',
    title: 'Poeng for hver runde',
    desc: 'Du scorer poeng for hver runde spillerne dine vinner – jo lenger de går, jo mer poeng.',
  },
]

/**
 * Enkel, statisk hero-seksjon som introduserer Dart-VM-spillet.
 * Brukes både som intro på forsiden og gjenbrukt på vm-info-siden.
 */
export default function StepSlideshow({ onStart, onCtaReady, onSlide, ctaHref = '/tipp', ctaLabel = 'VELG SPILLERE →' }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40)
    // Det finnes bare én "visning" nå – signaliser at den er klar med en gang,
    // slik at foreldrekomponenter som venter på siste steg (f.eks. skjule "hopp over") fungerer som før.
    onSlide?.(3)
    onCtaReady?.()
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Merkevare-header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
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

      {/* Tre enkle steg */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        {STEPS.map(step => (
          <div
            key={step.title}
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
              background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: '16px 18px',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 20px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }} aria-hidden="true">{step.emoji}</div>
            <div>
              <div style={{ fontFamily: SPORT, fontSize: 17, fontWeight: 900, textTransform: 'uppercase', color: '#fff', letterSpacing: '0.01em', marginBottom: 4 }}>
                {step.title}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)', lineHeight: 1.55 }}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      {onStart ? (
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
          }}
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
