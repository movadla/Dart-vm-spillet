'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import Flag from '@/components/Flag'
import type { Player } from '@/data/pots'
import { POTS } from '@/data/pots'
import { PLAYER_STATS } from '@/data/playerStats'
import { PLAYER_PHOTOS } from '@/data/playerPhotos'
import { getPathToFinal, type PathStep } from '@/lib/bracketProjection'
import { formatAvg, formatOdds, formatPercent } from '@/lib/format'
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

// ── Byggeklosser: to tydelig adskilte blokker, STATISTIKK (tall) og INFO (tekst) ──
function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 8px' }}>
      <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
    </div>
  )
}
function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 10px', minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 5 }}>{label}</div>
      <div style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{children}</div>
    </div>
  )
}
function InfoRow({ label, children, last = false }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '9px 0', borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
      <span style={{ width: 132, flexShrink: 0, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', paddingTop: 2 }}>{label}</span>
      <div style={{ flex: 1, minWidth: 0, fontSize: 14, color: '#fff', lineHeight: 1.4, textAlign: 'right' }}>{children}</div>
    </div>
  )
}

/**
 * Spillerpanelet i tippe-flyten som bunnark. Åpnes fra «Detaljer»-knappen
 * (trykk på kort er kun valg). To blokker: STATISTIKK (2×2 store tall) og
 * INFO (etikett/verdi-rader). Lukkes med sveip ned (arket følger fingeren),
 * klikk utenfor, Escape eller knappene nederst; «Neste» går rett videre.
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
  const [dragY, setDragY] = useState(0)
  const dragStart = useRef<number | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)

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
  const photo = PLAYER_PHOTOS[player.name]
  const path = getPathToFinal(player.name)
    .filter((s) => s.stage !== 'final')
    .sort((a, b) => a.pdcRanking - b.pdcRanking)
    .slice(0, 3)
    .sort((a, b) => STAGE_INDEX[a.stage] - STAGE_INDEX[b.stage])

  const shareText = share && share.total >= MIN_PARTICIPANTS_FOR_SHARE
    ? formatPercent(((share.counts[player.name] ?? 0) / share.total) * 100)
    : '—'

  // Sveip ned: arket følger fingeren når innholdet står øverst; slipp > 90 px lukker.
  function onTouchStart(e: React.TouchEvent) {
    if (bodyRef.current && bodyRef.current.scrollTop > 0) return
    dragStart.current = e.touches[0].clientY
  }
  function onTouchMove(e: React.TouchEvent) {
    if (dragStart.current == null) return
    const dy = e.touches[0].clientY - dragStart.current
    if (dy > 0) setDragY(dy)
  }
  function onTouchEnd() {
    const dy = dragY
    dragStart.current = null
    setDragY(0)
    if (dy > 90) onClose()
  }

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
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          width: '100%', maxWidth: 480, maxHeight: '90dvh', display: 'flex', flexDirection: 'column',
          // Longhand-kanter (ikke `border` + `borderBottom`): React advarer når
          // shorthand og longhand blandes og fargen endres mens arket er åpent
          // («Neste spiller» på Min side bytter spiller uten å lukke arket).
          background: 'linear-gradient(180deg, #171c28 0%, #0f1219 100%)',
          borderTop: `1px solid ${color}55`, borderLeft: `1px solid ${color}55`, borderRight: `1px solid ${color}55`, borderBottom: 'none',
          borderRadius: '18px 18px 0 0', boxShadow: `0 -12px 40px rgba(0,0,0,0.5), 0 -1px 0 ${color}66`,
          animation: dragY ? 'none' : 'sheet-up 0.32s cubic-bezier(0.22,1,0.36,1) both',
          transform: `translateY(${dragY}px)`, transition: dragY ? 'none' : 'transform 0.25s cubic-bezier(0.22,1,0.36,1)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Håndtak + header */}
        <div style={{ padding: '8px 16px 10px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)', margin: '0 auto 10px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Flag iso2={player.iso2} size={20} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, textTransform: 'uppercase', color: '#fff', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {player.name}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>
                {player.nationality} · {player.seedNumber != null ? `Seed ${player.seedNumber}` : 'Useedet'}
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
        </div>

        {/* Innhold — krysstoner når spilleren byttes mens arket er åpent */}
        <div ref={bodyRef} key={player.name} style={{ padding: '2px 16px 6px', overflowY: 'auto', animation: 'slide-enter 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
          <SectionTitle>Statistikk</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Stat label="Verdensranking">#{player.pdcRanking}</Stat>
            <Stat label="Snitt">{formatAvg(stats?.avg)}</Stat>
            <Stat label="Odds">{formatOdds(player.odds)}</Stat>
            <Stat label="% valgt">
              {share === null
                ? <span className="skeleton" style={{ display: 'inline-block', width: 40, height: 18, borderRadius: 4 }} />
                : shareText}
            </Stat>
          </div>
          {stats && !stats.verified && (
            <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 8, lineHeight: 1.4 }}>
              Eksempeldata – snitt og beste prestasjon er ikke kontrollert mot PDC ennå.
            </div>
          )}

          <SectionTitle>Info</SectionTitle>
          <InfoRow label="Beste prestasjon">{stats?.bestAchievement ?? '—'}</InfoRow>
          <InfoRow label="Vei til finalen">
            {path.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6 }}>
                {path.map((s) => (
                  <span key={s.stage} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 999, background: `${color}1f`, border: `1px solid ${color}66`, fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                    <Flag iso2={iso2For(s.opponent)} size={13} />
                    {lastName(s.opponent)}
                    <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>({SHORT_STAGE[s.stage]})</span>
                  </span>
                ))}
              </div>
            ) : <span style={{ color: 'rgba(255,255,255,0.6)' }}>Ingen topp 16 før finalen</span>}
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 5 }}>
              Hvis favorittene vinner · eksempel-trekning ·{' '}
              <button type="button" onClick={() => setBracketOpen(true)} style={{ background: 'none', border: 'none', padding: 0, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Se hele trekningen →
              </button>
            </div>
          </InfoRow>
          {photo && (
            <InfoRow label="Foto" last>
              <a href={photo.creditUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                {photo.credit}
              </a>
            </InfoRow>
          )}
        </div>

        {/* Bunn: lukk / gå videre */}
        <div style={{ display: 'flex', gap: 10, padding: '12px 16px 14px', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flexShrink: 0, padding: '14px 18px', background: 'transparent', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, fontFamily: SPORT, fontSize: 14, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }}
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
