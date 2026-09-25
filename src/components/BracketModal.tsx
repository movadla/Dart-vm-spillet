'use client'

import { useEffect } from 'react'
import { STAGE_LABELS } from '@/config/scoring'
import { getDrawSections, getPathToFinal, getSeedLabel, isFillerName } from '@/lib/bracketProjection'
import { SPORT } from '@/config/theme'

/**
 * Pop-up med spillerens potensielle vei til finalen og hele runde 1-
 * trekningen. Spillerens egen seksjon vises først og utbrettet; de sju andre
 * ligger sammenlagt bak en overskrift, så listen ikke er 64 rader lang.
 * Lukkes med ✕, Escape eller klikk utenfor.
 */
export default function BracketModal({ playerName, color, onClose }: { playerName: string; color: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  const path = getPathToFinal(playerName)
  const sections = getDrawSections()
  const ownIndex = sections.findIndex((s) => s.matches.some(([a, b]) => a === playerName || b === playerName))
  const ordered = ownIndex >= 0 ? [sections[ownIndex], ...sections.filter((_, i) => i !== ownIndex)] : sections

  const displayName = (n: string) => (isFillerName(n) ? 'Kvalifisert' : n)

  const Match = ({ a, b }: { a: string; b: string }) => {
    const mine = a === playerName || b === playerName
    const Name = ({ n }: { n: string }) => (
      <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: n === playerName ? 800 : 500, color: n === playerName ? '#fff' : isFillerName(n) ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {getSeedLabel(n) && <span style={{ color: 'rgba(255,255,255,0.45)', marginRight: 4 }}>{getSeedLabel(n)}</span>}{displayName(n)}
      </span>
    )
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 6, background: mine ? `${color}26` : 'rgba(255,255,255,0.03)', boxShadow: mine ? `inset 0 0 0 1px ${color}66` : 'none' }}>
        <Name n={a} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>vs</span>
        <Name n={b} />
      </div>
    )
  }

  const sectionTitle = (sec: (typeof sections)[number]) => (
    <span style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>
      Seksjon {sec.index} <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 700 }}>· {sec.topSeed} {getSeedLabel(sec.topSeed) ?? ''}</span>
    </span>
  )

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
          width: '100%', maxWidth: 480, maxHeight: '90dvh', display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(180deg, #161b27 0%, #0f1219 100%)',
          borderTop: '1px solid rgba(255,255,255,0.12)', borderLeft: '1px solid rgba(255,255,255,0.12)', borderRight: '1px solid rgba(255,255,255,0.12)', borderBottom: 'none',
          borderRadius: '18px 18px 0 0', boxShadow: '0 -12px 40px rgba(0,0,0,0.5)', animation: 'sheet-up 0.3s cubic-bezier(0.22,1,0.36,1) both',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: SPORT, fontSize: 20, fontWeight: 900, textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>Trekningen</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
              Eksempel-trekning – byttes ut når PDC publiserer den ekte (medio november)
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 15, cursor: 'pointer', flexShrink: 0 }}
          >
            ✕
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '12px 16px 20px' }}>
          {/* Vei til finalen — alle runder, topp 16 uthevet */}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
            Potensiell vei til finalen for {playerName}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 18 }}>
            {path.map((s) => {
              const top16 = s.pdcRanking <= 16
              return (
                <div key={s.stage} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, background: top16 ? `${color}1f` : 'rgba(255,255,255,0.03)', border: `1px solid ${top16 ? `${color}55` : 'rgba(255,255,255,0.06)'}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', width: 88, flexShrink: 0 }}>{STAGE_LABELS[s.stage]}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: top16 ? 800 : 500, color: top16 ? '#fff' : 'rgba(255,255,255,0.65)' }}>{s.opponent}</span>
                  <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 900, color: top16 ? '#f3d576' : 'rgba(255,255,255,0.4)', fontVariantNumeric: 'tabular-nums' }}>#{s.pdcRanking}</span>
                </div>
              )
            })}
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
            Runde 1 – din seksjon
          </div>
          {ordered.map((sec, i) =>
            i === 0 ? (
              <div key={sec.index} style={{ marginBottom: 14 }}>
                <div style={{ padding: '4px 2px 6px' }}>{sectionTitle(sec)}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {sec.matches.map(([a, b], j) => <Match key={j} a={a} b={b} />)}
                </div>
              </div>
            ) : (
              <details key={sec.index} style={{ marginBottom: 4 }}>
                <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ flex: 1 }}>{sectionTitle(sec)}</span>
                  <span aria-hidden="true" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>▾</span>
                </summary>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '6px 0 4px' }}>
                  {sec.matches.map(([a, b], j) => <Match key={j} a={a} b={b} />)}
                </div>
              </details>
            ),
          )}
        </div>
      </div>
    </div>
  )
}
