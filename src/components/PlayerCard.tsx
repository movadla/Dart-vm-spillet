'use client'

import Flag from '@/components/Flag'
import type { Player } from '@/data/pots'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

// Syntetisk "styrke"-tall (65–97) avledet lineært fra PDC-ranking, kun til bruk
// på det FIFA Ultimate Team-inspirerte kortet. Ikke en offisiell PDC-metrikk —
// bare en visuell stand-in for et "rating"-tall til kortet ligner ekte FUT-kort.
function ratingFromRanking(pdcRanking: number): number {
  return Math.max(65, 97 - Math.round((pdcRanking - 1) * 0.5))
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.65)' }}>{label}</div>
      <div style={{ fontFamily: SPORT, fontSize: 12, fontWeight: 900, color: '#fff', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
    </div>
  )
}

export function PlayerCard({
  player, color, colorDark, selected, onClick,
}: {
  player: Player
  color: string
  colorDark: string
  selected: boolean
  onClick: () => void
}) {
  const rating = ratingFromRanking(player.pdcRanking)
  const surname = player.name.trim().split(' ').slice(-1)[0].toUpperCase()
  const tierLabel = player.seedNumber ? `SEED ${player.seedNumber}` : 'UBESEEDET'

  return (
    <button
      role="radio"
      aria-checked={selected}
      aria-label={player.name}
      onClick={onClick}
      style={{
        position: 'relative',
        width: '100%',
        // Fast høyde i stedet for å la CSS Grid auto-sizing regne den ut fra
        // innholdet i denne flex-kolonnen — grid-auto-rows: auto målte konsekvent
        // for lav radhøyde for flex-kolonne-barn her og klippet/overlappet kortene.
        height: 158,
        clipPath: 'polygon(16% 0%, 84% 0%, 100% 12%, 100% 100%, 0% 100%, 0% 12%)',
        background: `linear-gradient(160deg, ${color} 0%, ${colorDark} 65%, ${colorDark} 100%)`,
        border: `1px solid ${selected ? '#fff' : 'rgba(255,255,255,0.25)'}`,
        boxShadow: selected
          ? `0 0 0 2px ${color}, 0 6px 22px ${color}88`
          : '0 2px 8px rgba(0,0,0,0.35)',
        padding: '8px 6px 6px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        color: '#fff',
        textAlign: 'center',
        transform: selected ? 'translateY(-2px)' : 'none',
        transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
        overflow: 'hidden',
      }}
    >
      {/* Diagonal "glans"-stripe — typisk FUT-kort-detalj */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.16) 50%, transparent 60%)',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: SPORT, fontSize: 20, fontWeight: 900, lineHeight: 1, textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>{rating}</div>
          <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.75)', marginTop: 2, whiteSpace: 'nowrap' }}>{tierLabel}</div>
        </div>
        {selected && (
          <div style={{
            width: 16, height: 16, borderRadius: '50%', background: '#fff', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 9, fontWeight: 900, color, lineHeight: 1 }}>✓</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0', zIndex: 1 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 70%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Flag iso2={player.iso2} size={30} />
        </div>
      </div>

      <div style={{
        fontFamily: SPORT, fontSize: 11.5, fontWeight: 900, textTransform: 'uppercase',
        letterSpacing: '0.01em', lineHeight: 1.1, zIndex: 1,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {surname}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-around', zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.3)', marginTop: 4, paddingTop: 4,
      }}>
        <Stat label="RANK" value={`#${player.pdcRanking}`} />
        <Stat label="ODDS" value={player.odds} />
      </div>
    </button>
  )
}
