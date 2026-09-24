'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Flag from '@/components/Flag'
import BracketModal from '@/components/BracketModal'
import type { Player } from '@/data/pots'
import { PLAYER_STATS } from '@/data/playerStats'
import { getPathToFinal, type PathStep } from '@/lib/bracketProjection'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

// «% valgt» vises først når det er nok deltakere til at tallet betyr noe —
// 3 av 5 = 60 % ville lest som en sterk anbefaling. Under grensen vises «—».
const MIN_PARTICIPANTS_FOR_SHARE = 10

// Korte rundenavn til de tre boksene i «Vei til finalen».
const SHORT_STAGE: Record<PathStep['stage'], string> = {
  r1: '1. runde', r2: '2. runde', r3: '3. runde', r4: '4. runde', qf: 'kvart', sf: 'semi', final: 'finale',
}
const STAGE_INDEX: Record<PathStep['stage'], number> = { r1: 0, r2: 1, r3: 2, r4: 3, qf: 4, sf: 5, final: 6 }

interface PickShare { total: number; counts: Record<string, number> }
// Én henting per sidevisning, delt mellom alle paneler (bruker bytter spiller ofte).
let pickSharePromise: Promise<PickShare> | null = null
function loadPickShare(): Promise<PickShare> {
  if (!pickSharePromise) {
    pickSharePromise = fetch('/api/pick-share')
      .then((r) => (r.ok ? r.json() : { total: 0, counts: {} }))
      .catch(() => ({ total: 0, counts: {} }))
  }
  return pickSharePromise
}

function lastName(name: string): string {
  const i = name.indexOf(' ')
  return i < 0 ? name : name.slice(i + 1)
}

function Label({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>{children}</div>
}

/**
 * Kompakt faktapanel for valgt spiller i tippe-flyten (skal være synlig uten
 * skrolling under kortene): ranking / snitt / % valgt som tre små ruter,
 * beste prestasjon på én linje, og de tre vanskeligste motstanderne på veien
 * til finalen som tre bokser — pluss knapp som åpner braketten i en pop-up.
 */
export default function PlayerDetailPanel({ player, color }: { player: Player; color: string }) {
  const [share, setShare] = useState<PickShare | null>(null)
  const [bracketOpen, setBracketOpen] = useState(false)

  useEffect(() => {
    let alive = true
    loadPickShare().then((s) => { if (alive) setShare(s) })
    return () => { alive = false }
  }, [])

  const stats = PLAYER_STATS[player.name]
  const avg = stats?.avg ?? player.avg2026

  // De tre best rangerte mulige motstanderne før finalen (finalen utelates —
  // det er jo veien TIL finalen), vist i runde-rekkefølge.
  const path = getPathToFinal(player.name)
    .filter((s) => s.stage !== 'final')
    .sort((a, b) => a.pdcRanking - b.pdcRanking)
    .slice(0, 3)
    .sort((a, b) => STAGE_INDEX[a.stage] - STAGE_INDEX[b.stage])

  const shareText = share && share.total >= MIN_PARTICIPANTS_FOR_SHARE
    ? `${Math.round(((share.counts[player.name] ?? 0) / share.total) * 100)} %`
    : '—'

  const tile = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 8px', minWidth: 0 } as const

  return (
    <div style={{ marginTop: 8, padding: '9px 10px 9px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}33` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <Flag iso2={player.iso2} size={16} />
        <div style={{ flex: 1, minWidth: 0, fontFamily: SPORT, fontSize: 13, fontWeight: 900, textTransform: 'uppercase', color: '#fff', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {player.name}
        </div>
        {stats && !stats.verified && (
          <span title="Snitt og beste prestasjon er eksempeldata som ikke er kontrollert ennå" style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 999, padding: '2px 6px', flexShrink: 0 }}>
            Eksempeldata
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
        <div style={tile}>
          <Label>Verdensranking</Label>
          <div style={{ fontFamily: SPORT, fontSize: 16, fontWeight: 900, color: '#fff', lineHeight: 1 }}>#{player.pdcRanking}</div>
        </div>
        <div style={tile}>
          <Label>Snitt</Label>
          <div style={{ fontFamily: SPORT, fontSize: 16, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
            {avg != null ? avg.toLocaleString('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
          </div>
        </div>
        <div style={tile}>
          <Label>% valgt</Label>
          <div style={{ fontFamily: SPORT, fontSize: 16, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{shareText}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
        <Label>Beste prestasjon</Label>
        <div style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 700, color: '#fff', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {stats?.bestAchievement ?? '—'}
        </div>
      </div>

      <Label>Vei til finalen</Label>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(path.length, 1)}, 1fr)`, gap: 6, marginBottom: 8 }}>
        {path.length ? path.map((s) => (
          <div key={s.stage} style={{ ...tile, textAlign: 'center', borderColor: `${color}55`, background: `${color}14` }}>
            <div style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 900, color: '#fff', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastName(s.opponent)}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>({SHORT_STAGE[s.stage]})</div>
          </div>
        )) : (
          <div style={{ ...tile, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Ingen rangerte motstandere før finalen</div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setBracketOpen(true)}
        style={{ display: 'block', width: '100%', textAlign: 'center', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 8, padding: '7px 4px', cursor: 'pointer' }}
      >
        Se bracketen →
      </button>

      {bracketOpen && <BracketModal playerName={player.name} color={color} onClose={() => setBracketOpen(false)} />}
    </div>
  )
}
