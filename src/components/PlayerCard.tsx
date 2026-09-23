'use client'

import Flag from '@/components/Flag'
import type { Player } from '@/data/pots'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'
const GOLD = '#f0c953'

// Skjold-/vimpel-formen fra referansekortet («Ultimate Darts»): rett fasong med
// et lite hakk øverst i midten, "vinger" som flarer ut ca. 60 % ned på hver
// side, og en spiss bunn. Holder seg bred (14–86 %) helt til 72 % høyde slik at
// all tekst (navn, stats) får plass før spissen smalner inn — kun den vesle
// logo-signaturen helt nederst sitter i selve spissen. Rene rette linjer
// (clip-path polygon støtter ikke avrundede hjørner per punkt) — nær nok til
// referansen for UI-bruk.
const SHIELD_CLIP = 'polygon(40% 2%, 50% 6%, 60% 2%, 86% 2%, 86% 50%, 100% 62%, 84% 72%, 50% 100%, 16% 72%, 0% 62%, 14% 50%, 14% 2%)'

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '3px 2px' }}>
      <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(240,201,83,0.7)' }}>{label}</div>
      <div style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 900, color: GOLD, lineHeight: 1.3 }}>{value}</div>
    </div>
  )
}

export function PlayerCard({
  player, color, colorDark, selected, potName, onClick,
}: {
  player: Player
  color: string
  colorDark: string
  selected: boolean
  potName: string
  onClick: () => void
}) {
  const topLabel = player.seedNumber ? 'SEED' : 'PDC-RANKING'
  const topNumber = player.seedNumber ?? player.pdcRanking

  return (
    <button
      role="radio"
      aria-checked={selected}
      aria-label={player.name}
      onClick={onClick}
      style={{
        display: 'block', width: '100%', maxWidth: 340, margin: '0 auto',
        border: 'none', background: 'none', padding: 0, cursor: 'pointer',
        filter: selected ? `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 2px #fff)` : 'none',
        transition: 'filter 0.15s',
      }}
    >
      {/* Gull-ramme: ytre lag i skjoldformen, med indre lag (innholdet) inset via padding */}
      <div style={{
        clipPath: SHIELD_CLIP,
        background: 'linear-gradient(160deg, #f5d989 0%, #d4af37 45%, #9c7a24 100%)',
        padding: 4,
      }}>
        <div style={{
          clipPath: SHIELD_CLIP,
          background: `linear-gradient(165deg, ${colorDark} 0%, #05070d 65%)`,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          padding: '9% 17% 6%',
          color: '#fff',
          textAlign: 'center',
        }}>
          {/* Valgt-merke */}
          {selected && (
            <div style={{
              position: 'absolute', top: '9%', right: '11%', zIndex: 2,
              width: 22, height: 22, borderRadius: '50%', background: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #fff',
            }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: '#fff', lineHeight: 1 }}>✓</span>
            </div>
          )}

          {/* "Foto"-felt: ingen lisensierte spillerbilder tilgjengelig ennå — stort
              transparent flagg + vignett som plassholder-kunst i stedet. */}
          <div style={{ position: 'relative', height: 66, marginBottom: 6, textAlign: 'left' }}>
            <div style={{ position: 'absolute', right: '-6%', top: '-10%', opacity: 0.28, transform: 'scale(1.6)' }}>
              <Flag iso2={player.iso2} size={64} />
            </div>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(100deg, rgba(0,0,0,0.55) 45%, transparent 75%)',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontFamily: SPORT, fontSize: 26, fontWeight: 900, color: GOLD, lineHeight: 1, textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
                {topNumber}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: GOLD, marginTop: 2 }}>{topLabel}</div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Flag iso2={player.iso2} size={20} />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>ODDS {player.odds}</span>
              </div>
            </div>
          </div>

          {/* Navn */}
          <div style={{
            fontFamily: SPORT, fontSize: 24, fontWeight: 900, textTransform: 'uppercase',
            color: GOLD, lineHeight: 1.1, letterSpacing: '0.01em',
            textShadow: '0 2px 4px rgba(0,0,0,0.4)',
          }}>
            {player.name}
          </div>
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: '8px 0' }} />

          {/* Pott-tilhørighet (erstatter "walk-on song"-raden — vi har ikke ekte
              inngangslåt-data, men beholder samme visuelle rytme) */}
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(240,201,83,0.85)', fontStyle: 'italic', marginBottom: 6 }}>
            🎯 {potName}
          </div>

          {/* To-kolonners statistikk, som i referansekortet */}
          <div style={{ display: 'flex', borderTop: `1px solid rgba(240,201,83,0.3)`, paddingTop: 4 }}>
            <div style={{ flex: 1, borderRight: '1px solid rgba(240,201,83,0.3)' }}>
              <StatCell label="VINNERODDS" value={player.odds} />
              <StatCell label="SNITT 2026" value="—" />
            </div>
            <div style={{ flex: 1 }}>
              <StatCell label="PDC-RANKING" value={`#${player.pdcRanking}`} />
              <StatCell label="STØRSTE HINDER" value="—" />
            </div>
          </div>

          {/* Egen app-signatur i stedet for tredjeparts "Ultimate Darts"-logo — holdt
              som et lite, smalt ikon siden denne raden sitter helt nede i skjoldspissen,
              der bred tekst ville blitt klippet av kort-fasongen. */}
          <div style={{
            marginTop: 8, fontSize: 13, color: 'rgba(240,201,83,0.55)', lineHeight: 1,
          }}>
            🎯
          </div>
        </div>
      </div>
    </button>
  )
}
