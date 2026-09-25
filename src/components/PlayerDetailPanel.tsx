'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import Flag from '@/components/Flag'
import type { Player } from '@/data/pots'
import { POTS } from '@/data/pots'
import { PLAYER_STATS } from '@/data/playerStats'
import { PLAYER_PHOTOS } from '@/data/playerPhotos'
import { getPathToFinal, getNextMatch } from '@/lib/bracketProjection'
import { calcPlayerPoints, getPlayerMatches, isPlayerChampion, isPlayerEliminated, type MatchResult } from '@/lib/scoring'
import type { Stage } from '@/config/scoring'
import { getScheduleLabel } from '@/config/schedule'
import { formatAvg, formatPoints } from '@/lib/format'
import { lastName } from '@/components/TeamTile'
import { SPORT } from '@/config/theme'
import { useLocale } from '@/lib/i18n/useLocale'
import { translateBestAchievement, translateNationality } from '@/lib/i18n/translatePlayer'

// Braketten trengs sjelden — lastes først når noen åpner den.
const BracketModal = dynamic(() => import('@/components/BracketModal'), { ssr: false })

const STAGE_INDEX: Record<string, number> = { r1: 0, r2: 1, r3: 2, r4: 3, qf: 4, sf: 5, final: 6 }

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
function ExampleTag() {
  const { dict } = useLocale()
  return (
    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 4, padding: '2px 5px', whiteSpace: 'nowrap' }}>
      {dict.deltaker.playerDetailPanel.exampleTag}
    </span>
  )
}
function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 10px', minWidth: 0 }}>
      <div style={{ marginBottom: 5 }}><FieldLabel>{label}</FieldLabel></div>
      <div style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{children}</div>
    </div>
  )
}
function InfoRow({ label, children, last = false }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '9px 0', borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
      <span style={{ width: 140, flexShrink: 0, paddingTop: 2, whiteSpace: 'nowrap' }}><FieldLabel>{label}</FieldLabel></span>
      <div style={{ flex: 1, minWidth: 0, fontSize: 14, color: '#fff', lineHeight: 1.4, textAlign: 'right' }}>{children}</div>
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
  const photo = PLAYER_PHOTOS[player.name]
  const path = getPathToFinal(player.name)
    .filter((s) => s.stage !== 'final')
    .sort((a, b) => a.pdcRanking - b.pdcRanking)
    .slice(0, 3)
    .sort((a, b) => STAGE_INDEX[a.stage] - STAGE_INDEX[b.stage])
  const eksempeldataTag = stats && !stats.verified ? (
    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#f59e0b', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 4, padding: '2px 5px', whiteSpace: 'nowrap' }}>
      {dict.deltaker.playerDetailPanel.exampleDataTag}
    </span>
  ) : undefined

  // Kamper — det første som vises: neste kamp (ekte og avgjort, eller samme
  // favoritt-eksempel som «vei til finalen» inntil runden er spilt), med
  // dato/klokkeslett når PDC har kunngjort det, og en liste over spilte
  // kamper med poengene spilleren faktisk fikk i hver av dem.
  const champion = isPlayerChampion(player.name, matchResults)
  const eliminated = !champion && isPlayerEliminated(player.name, matchResults)
  const next = !champion && !eliminated ? getNextMatch(player.name, matchResults) : null
  const nextSchedule = next ? getScheduleLabel(next.stage as Stage, locale) : null
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
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>
                {translateNationality(dict.players, player.nationality)} · {player.seedNumber != null ? dict.deltaker.playerDetailPanel.seedLabel(player.seedNumber) : dict.deltaker.playerDetailPanel.unseeded}
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
          <SectionTitle>{dict.deltaker.playerDetailPanel.matches}</SectionTitle>

          {/* Neste kamp — alltid først: dette er det man vil vite */}
          <div style={{ background: `${color}14`, border: `1px solid ${color}44`, borderRadius: 12, padding: '9px 12px', marginBottom: 8 }}>
            <div style={{ marginBottom: 5 }}><FieldLabel>{dict.deltaker.playerDetailPanel.nextMatch}</FieldLabel></div>
            {champion ? (
              <span style={{ fontSize: 14, fontWeight: 800, color: '#fbbf24', letterSpacing: '0.02em' }}>{dict.players.champion} 🏆</span>
            ) : eliminated ? (
              <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{dict.deltaker.playerDetailPanel.outOfTournament}</span>
            ) : next ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {dict.players.stages[next.stage as Stage]}
                  </span>
                  <span aria-hidden style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>·</span>
                  {next.opponent && !next.isFiller ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      <Flag iso2={iso2For(next.opponent)} size={15} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastName(next.opponent)}</span>
                    </span>
                  ) : (
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                      {next.isFiller ? dict.common.qualifiedFillerLabel : dict.deltaker.playerDetailPanel.notDecided}
                    </span>
                  )}
                  {!next.confirmed && <span style={{ marginLeft: 'auto' }}><ExampleTag /></span>}
                </div>
                {nextSchedule?.dateKnown && (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                    {nextSchedule.dateLabel} · {nextSchedule.timeLabel}
                  </div>
                )}
              </>
            ) : (
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>—</span>
            )}
          </div>

          {/* Tidligere kamper — poengene spilleren faktisk fikk i hver av dem */}
          {myMatches.length > 0 && (
            <div style={{ marginBottom: 6 }}>
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

          <SectionTitle tag={eksempeldataTag}>{dict.deltaker.playerDetailPanel.stats}</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Stat label={dict.deltaker.playerDetailPanel.worldRanking}>{player.pdcRanking}</Stat>
            <Stat label={dict.deltaker.playerDetailPanel.avg}>{formatAvg(stats?.avg, locale)}</Stat>
          </div>

          <SectionTitle tag={eksempeldataTag}>{dict.deltaker.playerDetailPanel.info}</SectionTitle>
          <InfoRow label={dict.deltaker.playerDetailPanel.bestAchievement}>{stats?.bestAchievement ? translateBestAchievement(dict.players, player.name, stats.bestAchievement) : '—'}</InfoRow>

          {/* Vei til finalen — alltid nøyaktig 3 kolonner på én rad, aldri
              tekst i to linjer: egen (ikke InfoRow-etikett-kolonnen, som gir
              for lite bredde til tre bokser side ved side). */}
          <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <FieldLabel>{dict.deltaker.playerDetailPanel.pathToFinal}</FieldLabel>
              <ExampleTag />
            </div>
            {path.length ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {path.map((s) => (
                  <div key={s.stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', borderRadius: 10, background: `${color}14`, border: `1px solid ${color}44`, minWidth: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
                      {dict.deltaker.playerDetailPanel.shortStage[s.stage]}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, maxWidth: '100%' }}>
                      <Flag iso2={iso2For(s.opponent)} size={13} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastName(s.opponent)}</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{dict.deltaker.playerDetailPanel.noTop16}</div>}
            <button type="button" onClick={() => setBracketOpen(true)} style={{ display: 'block', marginTop: 8, background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              {dict.deltaker.playerDetailPanel.seeFullDraw}
            </button>
          </div>

          {photo && (
            <InfoRow label={dict.deltaker.playerDetailPanel.photo} last>
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
