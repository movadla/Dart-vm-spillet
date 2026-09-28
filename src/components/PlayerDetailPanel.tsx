'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import Flag from '@/components/Flag'
import type { Player } from '@/data/pots'
import { POTS } from '@/data/pots'
import { PLAYER_STATS } from '@/data/playerStats'
import { getPathToFinal } from '@/lib/bracketProjection'
import { calcPlayerPoints, getPlayerMatches, type MatchResult } from '@/lib/scoring'
import type { Stage } from '@/config/scoring'
import { formatAvg, formatPercent, formatPoints } from '@/lib/format'
import { lastName } from '@/components/TeamTile'
import { SPORT } from '@/config/theme'
import { useLocale } from '@/lib/i18n/useLocale'

// Braketten trengs sjelden — lastes først når noen åpner den.
const BracketModal = dynamic(() => import('@/components/BracketModal'), { ssr: false })

const ALL_PLAYERS = POTS.flatMap((p) => p.players)
function iso2For(name: string): string {
  return ALL_PLAYERS.find((p) => p.name === name)?.iso2 ?? ''
}

// ── Byggeklosser — bevisst stort sprang mellom SectionTitle (seksjon) og
// FieldLabel (felt), så de aldri leses som samme nivå (se AGENTS.md). ──
function SectionTitle({ children, tag }: { children: ReactNode; tag?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '18px 0 8px' }}>
      <span style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, letterSpacing: '0.03em', textTransform: 'uppercase', color: '#fff' }}>{children}</span>
      {tag}
      <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
    </div>
  )
}
function FieldLabel({ children }: { children: ReactNode }) {
  return <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>{children}</span>
}
function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 10px', minWidth: 0 }}>
      <div style={{ marginBottom: 5 }}><FieldLabel>{label}</FieldLabel></div>
      <div style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{children}</div>
    </div>
  )
}

/**
 * Spillerpanelet — bunnark åpnet fra «Detaljer» (tippe-flyten) eller ved å
 * trykke en spiller på Min side. Bevisst nøkternt: kun det som faktisk
 * trengs for en rask, oversiktlig lesning. Kamper (neste + tidligere, med
 * poeng) står øverst, så STATISTIKK og INFO. Lukkes med sveip ned (arket
 * følger fingeren), klikk utenfor, Escape eller knappene nederst.
 */
export default function PlayerDetailPanel({ player, color, open, onClose, onNext, nextLabel, matchResults = [], potNumber = 1 }: {
  player: Player
  color: string
  open: boolean
  onClose: () => void
  onNext: () => void
  nextLabel: string
  /** Registrerte kamper — gir «Neste kamp»/«Tidligere kamper» ekte innhold. Tomt før VM-start. */
  matchResults?: MatchResult[]
  /** Potten spilleren er valgt fra — avgjør multiplikatoren for poeng per kamp. */
  potNumber?: number
}) {
  const { locale, dict } = useLocale()
  const [bracketOpen, setBracketOpen] = useState(false)
  const [dragY, setDragY] = useState(0)
  const dragStart = useRef<number | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)

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
  // Kamper — liste over spilte kamper med poengene spilleren faktisk fikk i hver av dem.
  const myMatches = getPlayerMatches(player.name, matchResults)

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
        aria-label={dict.deltaker.playerDetailPanel.dialogAriaLabel(player.name)}
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
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={dict.deltaker.playerDetailPanel.close}
              style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 15, cursor: 'pointer', flexShrink: 0 }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Innhold — krysstoner når spilleren byttes mens arket er åpent */}
        <div ref={bodyRef} key={player.name} style={{ padding: '2px 16px 6px', overflowY: 'auto', animation: 'slide-enter 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
          {/* Tidligere kamper — poengene spilleren faktisk fikk i hver av dem.
              «Neste kamp» er fjernet herfra: runde 1 vises allerede øverst i
              «Potensiell vei til finalen» under. */}
          {myMatches.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              <SectionTitle>{dict.deltaker.playerDetailPanel.matches}</SectionTitle>
              <div style={{ margin: '2px 0 4px' }}><FieldLabel>{dict.deltaker.playerDetailPanel.previousMatches}</FieldLabel></div>
              {myMatches.map((m, k) => {
                const isP1 = m.player1 === player.name
                const mySets = isP1 ? m.sets1 : m.sets2
                const oppSets = isP1 ? m.sets2 : m.sets1
                const opp = isP1 ? m.player2 : m.player1
                const won = m.winner ? m.winner === player.name : mySets > oppSets
                const pts = calcPlayerPoints({ player_name: player.name, pot_number: potNumber }, [m]).total
                return (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: k < myMatches.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <span style={{ width: 68, flexShrink: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
                      {dict.players.stages[(m.stage ?? 'r1') as Stage] ?? m.stage}
                    </span>
                    <span style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, width: 32, flexShrink: 0, color: won ? '#4ade80' : '#f87171', fontVariantNumeric: 'tabular-nums' }}>
                      {mySets}–{oppSets}
                    </span>
                    <Flag iso2={iso2For(opp)} size={13} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastName(opp)}</span>
                    <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 900, flexShrink: 0, color: pts > 0 ? '#4ade80' : 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}>
                      {formatPoints(pts, locale)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <SectionTitle>{dict.deltaker.playerDetailPanel.stats}</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <Stat label={dict.deltaker.playerDetailPanel.worldRanking}>{player.pdcRanking}</Stat>
            <Stat label={dict.deltaker.playerDetailPanel.avg}>{formatAvg(stats?.avg, locale)}</Stat>
            <Stat label={dict.deltaker.playerDetailPanel.checkoutPercent}>
              {stats?.checkoutPercent != null ? formatPercent(stats.checkoutPercent, locale, 1) : '—'}
            </Stat>
          </div>

          {/* Potensiell vei til finalen — vertikal liste, alle 5 runder t.o.m.
              finalen (ikke bare topp 3), med fullt navn og PDC-rangering. */}
          <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ marginBottom: 8 }}>
              <FieldLabel>{dict.deltaker.playerDetailPanel.potentialPathTitle(player.name)}</FieldLabel>
            </div>
            {path.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {path.map((s) => (
                  <div key={s.stage} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: `${color}14`, border: `1px solid ${color}44` }}>
                    <span style={{ width: 96, flexShrink: 0, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
                      {dict.players.stages[s.stage]}
                    </span>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.opponent}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#fbbf24', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                      #{s.pdcRanking}
                    </span>
                  </div>
                ))}
              </div>
            ) : <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{dict.deltaker.playerDetailPanel.noTop16}</div>}
            <button type="button" onClick={() => setBracketOpen(true)} style={{ display: 'block', marginTop: 10, background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              {dict.deltaker.playerDetailPanel.seeFullDraw}
            </button>
          </div>
        </div>

        {/* Bunn: lukk / gå videre */}
        <div style={{ display: 'flex', gap: 10, padding: '12px 16px 14px', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flexShrink: 0, padding: '14px 18px', background: 'transparent', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, fontFamily: SPORT, fontSize: 14, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            {dict.deltaker.playerDetailPanel.close}
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
