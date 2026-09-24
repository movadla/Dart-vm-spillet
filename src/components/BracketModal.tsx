'use client'

import { useEffect } from 'react'
import { STAGE_LABELS } from '@/config/scoring'
import { getDrawSections, getPathToFinal, getSeedLabel, isFillerName } from '@/lib/bracketProjection'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

/**
 * Pop-up med hele runde 1-trekningen (8 seksjoner à 8 kamper) og spillerens
 * potensielle vei til finalen øverst. Lukkes med ✕, Escape eller klikk
 * utenfor — brukeren lander rett tilbake på valget sitt.
 */
export default function BracketModal({ playerName, color, onClose }: { playerName: string; color: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  const path = getPathToFinal(playerName)
  const sections = getDrawSections()

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Trekning for ${playerName}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, maxHeight: '88dvh', display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(180deg, #161b27 0%, #0f1219 100%)', border: '1px solid rgba(255,255,255,0.12)', borderBottom: 'none',
          borderRadius: '18px 18px 0 0', boxShadow: '0 -12px 40px rgba(0,0,0,0.5)', animation: 'slide-enter 0.3s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: SPORT, fontSize: 18, fontWeight: 900, textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>Trekningen</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
              Eksempel-trekning – byttes ut når PDC publiserer den ekte (medio november)
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 16, cursor: 'pointer', flexShrink: 0 }}
          >
            ✕
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '12px 16px 20px' }}>
          {/* Vei til finalen */}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
            Potensiell vei til finalen for {playerName}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            {path.map((s) => {
              const top16 = s.pdcRanking <= 16
              return (
                <div key={s.stage} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, background: top16 ? `${color}1f` : 'rgba(255,255,255,0.03)', border: `1px solid ${top16 ? `${color}55` : 'rgba(255,255,255,0.06)'}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', width: 88, flexShrink: 0 }}>{STAGE_LABELS[s.stage]}</span>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: top16 ? 800 : 500, color: top16 ? '#fff' : 'rgba(255,255,255,0.6)' }}>{s.opponent}</span>
                  <span style={{ fontFamily: SPORT, fontSize: 12, fontWeight: 900, color: top16 ? '#f3d576' : 'rgba(255,255,255,0.3)' }}>#{s.pdcRanking}</span>
                </div>
              )
            })}
          </div>

          {/* Hele runde 1 */}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
            Runde 1 — alle 64 kamper
          </div>
          {sections.map((sec) => (
            <div key={sec.index} style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: SPORT, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', padding: '4px 2px' }}>
                Seksjon {sec.index} <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>· {sec.topSeed} {getSeedLabel(sec.topSeed) ?? ''}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {sec.matches.map(([a, b], i) => {
                  const mine = a === playerName || b === playerName
                  const Name = ({ n }: { n: string }) => (
                    <span style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: n === playerName ? 800 : 500, color: n === playerName ? '#fff' : isFillerName(n) ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getSeedLabel(n) && <span style={{ color: 'rgba(255,255,255,0.35)', marginRight: 4 }}>{getSeedLabel(n)}</span>}{n}
                    </span>
                  )
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 6, background: mine ? `${color}26` : 'rgba(255,255,255,0.03)', boxShadow: mine ? `inset 0 0 0 1px ${color}66` : 'none' }}>
                      <Name n={a} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>vs</span>
                      <Name n={b} />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
