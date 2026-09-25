'use client'

// Fremdriftsindikator (prikker + STEG n AV 6 + flagg for fullførte steg) og
// konfetti-effekten på bekreftelsesskjermen — skilt ut fra tipp/page.tsx.

import { POTS } from '@/data/pots'
import Flag from '@/components/Flag'
import SmartBackButton from '@/components/SmartBackButton'
import { POT_COLORS } from '@/config/potColors'
import { useLocale } from '@/lib/i18n/useLocale'

const POT_COUNT = POTS.length

const CONFETTI_PIECES = [
  { color: '#dc2626', left: 8,  size: 8, delay: 0,    rect: false },
  { color: '#fbbf24', left: 22, size: 6, delay: 0.12, rect: true  },
  { color: '#3b82f6', left: 38, size: 9, delay: 0.22, rect: false },
  { color: '#22c55e', left: 52, size: 7, delay: 0.07, rect: true  },
  { color: '#dc2626', left: 67, size: 8, delay: 0.17, rect: false },
  { color: '#fbbf24', left: 82, size: 6, delay: 0.28, rect: true  },
  { color: '#8b5cf6', left: 14, size: 7, delay: 0.33, rect: false },
  { color: '#3b82f6', left: 58, size: 9, delay: 0.38, rect: true  },
  { color: '#22c55e', left: 88, size: 6, delay: 0.42, rect: false },
  { color: '#ec4899', left: 44, size: 8, delay: 0.48, rect: true  },
  { color: '#fbbf24', left: 74, size: 7, delay: 0.52, rect: false },
  { color: '#dc2626', left: 30, size: 5, delay: 0.58, rect: true  },
]

export function Confetti() {
  return (
    <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, height: 0, overflow: 'visible', pointerEvents: 'none', zIndex: 50 }}>
      {CONFETTI_PIECES.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', top: -10, left: `${p.left}%`,
          width: p.size, height: p.rect ? p.size * 1.6 : p.size,
          background: p.color,
          borderRadius: p.rect ? 2 : '50%',
          animation: `confetti-fall 3s ${p.delay}s ease-in both`,
        }} />
      ))}
    </div>
  )
}

export function ProgressDots({ step, multiplier = 1, picks = {}, onGuide, onStep, onTogglePoeng, poengActive }: {
  step: number
  /** Pottens multiplikator — vises i steg-linjen («Steg 3 av 6 · ×2») */
  multiplier?: number
  /** Valgene så langt — fullførte steg viser flagget til spilleren du valgte */
  picks?: Record<number, string>
  onGuide?: () => void
  onStep?: (s: number) => void
  onTogglePoeng?: () => void
  poengActive?: boolean
}) {
  const { dict } = useLocale()
  return (
    <div style={{ marginBottom: 20 }}>
      {/* Fullførte steg viser flagget til spilleren du valgte (og er klikkbare
          for å gå tilbake), aktivt steg er en farget strek, kommende er prikker.
          Alle har 20 px trykkflate. */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 4 }}>
        {POTS.map((pot, i) => {
          const c = POT_COLORS[i % POT_COLORS.length]
          const done = i < step - 1
          const active = i === step - 1
          const pickedName = picks[pot.potNumber]
          const picked = pickedName ? pot.players.find((p) => p.name === pickedName) : undefined
          return (
            <button
              key={i}
              type="button"
              onClick={done ? () => onStep?.(i + 1) : undefined}
              disabled={!done}
              aria-label={done ? dict.tipp.progressDots.stepAriaLabelDone(i + 1, pickedName ?? '') : dict.tipp.progressDots.stepAriaLabelPending(i + 1)}
              style={{ padding: '6px 4px', background: 'none', border: 'none', cursor: done ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
            >
              {done && picked ? (
                <span style={{ width: 18, height: 18, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 2px ${c}`, background: '#000' }}>
                  <Flag iso2={picked.iso2} size={18} />
                </span>
              ) : (
                <span style={{ display: 'block', height: 8, width: active ? 22 : 8, borderRadius: 4, background: active ? c : 'rgba(255,255,255,0.2)', transition: 'width 0.25s ease, background 0.25s ease' }} />
              )}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SmartBackButton />
        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', fontVariantNumeric: 'tabular-nums' }}>
          {dict.tipp.progressDots.stepOf(step, POT_COUNT)}
          {multiplier > 1 && <span style={{ color: multiplier === 2 ? '#f59e0b' : '#ef4444', marginLeft: 6 }}>· ×{multiplier}</span>}
        </div>
        {/* Guide og Poeng samlet i én liten, sammensatt pille i stedet for to
            separate knapper — mindre visuell konkurranse med «STEG X AV 6»,
            som er det viktigste å lese i denne raden. */}
        <div style={{ display: 'flex', alignItems: 'stretch', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, overflow: 'hidden' }}>
          {onGuide && (
            <button onClick={onGuide} className="btn-hover" aria-label={dict.tipp.progressDots.guide} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px 8px', letterSpacing: '0.04em' }}>{dict.tipp.progressDots.guide}</button>
          )}
          {onGuide && onTogglePoeng && <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />}
          {onTogglePoeng && (
            <button
              onClick={onTogglePoeng}
              className="btn-hover"
              aria-pressed={poengActive}
              style={{ fontSize: 10, fontWeight: 700, color: poengActive ? '#fff' : 'rgba(255,255,255,0.7)', background: poengActive ? 'rgba(255,255,255,0.18)' : 'none', border: 'none', cursor: 'pointer', padding: '5px 8px', letterSpacing: '0.04em' }}
            >
              {dict.tipp.progressDots.points}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
