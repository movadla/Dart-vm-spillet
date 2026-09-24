'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import Flag from '@/components/Flag'
import type { Player } from '@/data/pots'
import { PLAYER_STATS } from '@/data/playerStats'
import { getPathToFinal, type PathStep } from '@/lib/bracketProjection'
import { POTS } from '@/data/pots'
import { formatAvg, formatPercent } from '@/lib/format'
import { lastName } from '@/components/TeamTile'

// Braketten trengs sjelden — lastes først når noen åpner den.
const BracketModal = dynamic(() => import('@/components/BracketModal'), { ssr: false })

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

// «% valgt» vises først når det er nok deltakere til at tallet betyr noe —
// 3 av 5 = 60 % ville lest som en sterk anbefaling. Under grensen vises «—».
const MIN_PARTICIPANTS_FOR_SHARE = 10

const SHORT_STAGE: Record<PathStep['stage'], string> = {
  r1: '1. runde', r2: '2. runde', r3: '3. runde', r4: '4. runde', qf: 'kvart', sf: 'semi', final: 'finale',
}
const STAGE_INDEX: Record<PathStep['stage'], number> = { r1: 0, r2: 1, r3: 2, r4: 3, qf: 4, sf: 5, final: 6 }

interface PickShare { total: number; counts: Record<string, number> }
let pickSharePromise: Promise<PickShare> | null = null
function loadPickShare(): Promise<PickShare> {
  if (!pickSharePromise) {
    pickSharePromise = fetch('/api/pick-share')
      .then((r) => (r.ok ? r.json() : { total: 0, counts: {} }))
      .catch(() => ({ total: 0, counts: {} }))
  }
  return pickSharePromise
}

const ALL_PLAYERS = POTS.flatMap((p) => p.players)
function iso2For(name: string): string {
  return ALL_PLAYERS.find((p) => p.name === name)?.iso2 ?? ''
}

function Label({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>{children}</div>
}

const BIG: React.CSSProperties = { fontFamily: SPORT, fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }

/**
 * Spillerpanelet i tippe-flyten som bunnark: glir opp over kortene når en
 * spiller velges, alltid fullt synlig uansett skjermstørrelse, og lukkes med
 * sveip ned, klikk utenfor, Escape eller knappene nederst («Neste» går rett
 * videre). Innhold: ranking / snitt / % valgt, beste prestasjon, de tre
 * vanskeligste motstanderne på veien til finalen, og brakett-pop-up.
 */
export default function PlayerDetailPanel({ player, color, open, onClose, onNext, nextLabel }: {
  player: Player
  color: string
  open: boolean
  onClose: () => void
  onNext: () => void
  nextLabel: string
}) {
  const [share, setShare] = useState<PickShare | null>(null)
  const [bracketOpen, setBracketOpen] = useState(false)
  const [showDataNote, setShowDataNote] = useState(false)
  const touchStartY = useRef<number | null>(null)

  useEffect(() => {
    let alive = true
    loadPickShare().then((s) => { if (alive) setShare(s) })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !bracketOpen) onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open, bracketOpen, onClose])

  if (!open) return null

  const stats = PLAYER_STATS[player.name]
  const path = getPathToFinal(player.name)
    .filter((s) => s.stage !== 'final')
    .sort((a, b) => a.pdcRanking - b.pdcRanking)
    .slice(0, 3)
    .sort((a, b) => STAGE_INDEX[a.stage] - STAGE_INDEX[b.stage])

  const shareText = share && share.total >= MIN_PARTICIPANTS_FOR_SHARE
    ? formatPercent(((share.counts[player.name] ?? 0) / share.total) * 100)
    : '—'

  const tile: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 10px', minWidth: 0 }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 250, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'backdrop-in 0.25s ease both' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Om ${player.name}`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY }}
        onTouchEnd={(e) => {
          const start = touchStartY.current
          touchStartY.current = null
          if (start != null && e.changedTouches[0].clientY - start > 70) onClose()
        }}
        style={{
          width: '100%', maxWidth: 480, maxHeight: '88dvh', display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(180deg, #171c28 0%, #0f1219 100%)', border: `1px solid ${color}55`, borderBottom: 'none',
          borderRadius: '18px 18px 0 0', boxShadow: `0 -12px 40px rgba(0,0,0,0.5), 0 -1px 0 ${color}66`,
          animation: 'sheet-up 0.32s cubic-bezier(0.22,1,0.36,1) both',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Håndtak + header */}
        <div style={{ padding: '8px 16px 0', flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.25)', margin: '0 auto 10px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flag iso2={player.iso2} size={18} />
            <div style={{ flex: 1, minWidth: 0, fontFamily: SPORT, fontSize: 20, fontWeight: 900, textTransform: 'uppercase', color: '#fff', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {player.name}
            </div>
            {stats && !stats.verified && (
              <button
                type="button"
                onClick={() => setShowDataNote((v) => !v)}
                aria-expanded={showDataNote}
                style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.45)', borderRadius: 999, padding: '4px 8px', cursor: 'pointer', flexShrink: 0 }}
              >
                Eksempeldata
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Lukk"
              style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 15, cursor: 'pointer', flexShrink: 0 }}
            >
              ✕
            </button>
          </div>
          {showDataNote && (
            <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.45, color: 'rgba(255,255,255,0.7)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '8px 10px' }}>
              Snitt og beste prestasjon er foreløpige eksempeltall som ikke er kontrollert mot PDC ennå.
            </div>
          )}
        </div>

        {/* Innhold — krysstoner når spilleren byttes mens arket er åpent */}
        <div key={player.name} style={{ padding: '12px 16px 4px', overflowY: 'auto', animation: 'slide-enter 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div style={tile}>
              <Label>Ranking</Label>
              <div style={BIG}>#{player.pdcRanking}</div>
            </div>
            <div style={tile}>
              <Label>Snitt</Label>
              <div style={BIG}>{formatAvg(stats?.avg)}</div>
            </div>
            <div style={tile}>
              <Label>% valgt</Label>
              {share === null
                ? <span className="skeleton" style={{ display: 'inline-block', width: 36, height: 16, borderRadius: 4 }} />
                : <div style={BIG}>{shareText}</div>}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
            <Label>Beste prestasjon</Label>
            <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: '#fff', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {stats?.bestAchievement ?? '—'}
            </div>
          </div>

          <Label>Vei til finalen</Label>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(path.length, 1)}, 1fr)`, gap: 8, marginBottom: 6 }}>
            {path.length ? path.map((s) => (
              <div key={s.stage} style={{ ...tile, textAlign: 'center', borderColor: `${color}66`, background: `${color}18` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <Flag iso2={iso2For(s.opponent)} size={13} />
                  <span style={{ fontFamily: SPORT, fontSize: 15, fontWeight: 900, color: '#fff', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastName(s.opponent)}</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>({SHORT_STAGE[s.stage]})</div>
              </div>
            )) : (
              <div style={{ ...tile, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Ingen rangerte motstandere før finalen</div>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 12 }}>
            Topp 16 du kan møte hvis favorittene vinner · eksempel-trekning
          </div>

          <button
            type="button"
            onClick={() => setBracketOpen(true)}
            style={{ display: 'block', width: '100%', textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 10, padding: '10px 4px', cursor: 'pointer' }}
          >
            Se bracketen →
          </button>
        </div>

        {/* Bunn: lukk / gå videre */}
        <div style={{ display: 'flex', gap: 10, padding: '12px 16px 14px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flexShrink: 0, padding: '14px 18px', background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, fontFamily: SPORT, fontSize: 14, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Lukk
          </button>
          <button
            type="button"
            onClick={onNext}
            className="btn-hover"
            style={{ flex: 1, padding: '14px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontFamily: SPORT, fontSize: 15, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 12, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(220,38,38,0.35)' }}
          >
            {nextLabel}
          </button>
        </div>

        {bracketOpen && <BracketModal playerName={player.name} color={color} onClose={() => setBracketOpen(false)} />}
      </div>
    </div>
  )
}
