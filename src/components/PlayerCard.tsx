'use client'

import Flag from '@/components/Flag'
import type { Player } from '@/data/pots'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'
const GOLD = '#f3d576'

// Skjold-/vimpel-silhuetten fra referansekortet («Ultimate Darts»), tegnet som en
// SVG-bane med ekte kurver (i stedet for clip-path polygon med rette linjer) — det
// gir en mye jevnere, avrundet kontur som ligner referansen langt bedre enn en
// polygon-tilnærming kan.
//
// VIKTIG designvalg etter to runder med reelle klippe-/overlapp-bugs: banen tegnes
// nå BAK innholdet som ren dekorasjon, og selve tekst-innholdet klippes ALDRI av
// den. Tidligere versjoner brukte clip-path på selve innholds-diven, som krevde at
// jeg traff et eksakt piksel-budsjett for hvor mye plass navn+statistikk trengte —
// og det budsjettet stemte på min 929px brede test-fane i Chrome, men stemte IKKE
// på brukerens faktiske iPhone (trolig pga. andre skrift-metrikker/fallback-font i
// Safari), som gjorde at én rad med statistikk enten limte seg sammen eller falt
// helt bort. Ved å bare TEGNE formen og gi innholdet raus, fast padding innenfor
// den — aldri klippe selve teksten — kan ikke den bug-klassen oppstå igjen, uansett
// skrift/nettleser/skjermbredde.
const SHIELD_PATH = `
  M 40 3
  C 44 3 47 8 50 8
  C 53 8 56 3 60 3
  L 88 3
  C 93 3 96 6 96 11
  L 96 53
  C 96 58 99 60 100 65
  C 100 69 94 70 90 74
  C 87 77 85 79 84 82
  C 78 90 65 96 50 100
  C 35 96 22 90 16 82
  C 15 79 13 77 10 74
  C 6 70 0 69 0 65
  C 1 60 4 58 4 53
  L 4 11
  C 4 6 7 3 12 3
  Z
`

const FRAME_GOLD_STOPS = [
  ['0%', '#fff7d6'], ['12%', '#f3d576'], ['32%', '#b8860b'],
  ['50%', '#8a660a'], ['68%', '#b8860b'], ['88%', '#f3d576'], ['100%', '#fff7d6'],
] as const

function ShieldBackground({ color, gradientId }: { color: string; gradientId: string }) {
  return (
    <svg
      viewBox="0 0 100 100" preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
    >
      <defs>
        <linearGradient id={`${gradientId}-frame`} x1="0%" y1="0%" x2="100%" y2="100%">
          {FRAME_GOLD_STOPS.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}
        </linearGradient>
        <linearGradient id={`${gradientId}-fill`} x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#1a2036" />
          <stop offset="45%" stopColor="#0a0d18" />
          <stop offset="100%" stopColor="#030408" />
        </linearGradient>
        <radialGradient id={`${gradientId}-accent`} cx="20%" cy="10%" r="75%">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="45%" stopColor={color} stopOpacity="0.08" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Gull-ramme (litt større bane, ligger bak) */}
      <path d={SHIELD_PATH} fill={`url(#${gradientId}-frame)`} transform="translate(50 50) scale(1.018) translate(-50 -50)" />
      {/* Mørk pinstripe */}
      <path d={SHIELD_PATH} fill="#0a0c14" transform="translate(50 50) scale(0.99) translate(-50 -50)" />
      {/* Selve kort-bunnen */}
      <path d={SHIELD_PATH} fill={`url(#${gradientId}-fill)`} transform="translate(50 50) scale(0.965) translate(-50 -50)" />
      <path d={SHIELD_PATH} fill={`url(#${gradientId}-accent)`} transform="translate(50 50) scale(0.965) translate(-50 -50)" />
    </svg>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(243,213,118,0.65)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ fontFamily: SPORT, fontSize: 16, fontWeight: 900, color: GOLD, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
    </div>
  )
}

export function PlayerCard({
  player, color, selected, potName, multiplier, onClick,
}: {
  player: Player
  color: string
  colorDark: string
  selected: boolean
  potName: string
  multiplier: number
  onClick: () => void
}) {
  const topLabel = player.seedNumber ? 'SEED' : 'RANK'
  const topNumber = player.seedNumber ?? player.pdcRanking
  const gradientId = `pc-${player.name.replace(/[^a-z0-9]/gi, '')}`

  return (
    <button
      role="radio"
      aria-checked={selected}
      aria-label={player.name}
      onClick={onClick}
      style={{
        position: 'relative', display: 'block', width: 'min(300px, 100%)', margin: '0 auto',
        border: 'none', background: 'none', padding: 0, cursor: 'pointer',
        filter: selected ? `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 3px #fff)` : 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))',
        transition: 'filter 0.15s',
      }}
    >
      <ShieldBackground color={color} gradientId={gradientId} />

      {/* Innholdet ligger OVENPÅ bakgrunn-banen og klippes aldri av den — se
          kommentar på SHIELD_PATH for hvorfor. Raus, fast padding holder teksten
          visuelt trygt innenfor silhuetten uten å stole på et sprøtt pikselbudsjett.
          Ingen fast height/aspect-ratio her — kortet får naturlig høyde fra
          innholdet sitt, og SVG-bakgrunnen strekker seg for å matche (se
          preserveAspectRatio="none" på ShieldBackground). Det unngår dødt
          tomrom OG unngår klipping — begge deler som har vært reelle bugs. */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        padding: '13% 17% 16%',
        color: '#fff', textAlign: 'center',
      }}>
        {selected && (
          <div style={{
            position: 'absolute', top: '11%', right: '15%', zIndex: 3,
            width: 24, height: 24, borderRadius: '50%', background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #fff', boxShadow: '0 0 8px rgba(0,0,0,0.5)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', lineHeight: 1 }}>✓</span>
          </div>
        )}

        {/* "Foto"-felt: ingen lisensierte spillerbilder tilgjengelig ennå (og skal
            ikke være det uten avklart bildebruksrett — se README/TODO). Sirkulær
            flagg-medaljong i stedet for et tomt hjørne-vannmerke. */}
        <div style={{ position: 'relative', textAlign: 'left', marginBottom: '8%' }}>
          <div style={{
            position: 'absolute', right: 0, top: '-8%', width: '30%', aspectRatio: '1',
            borderRadius: '50%', overflow: 'hidden',
            background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
            border: `1px solid ${GOLD}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Flag iso2={player.iso2} size={44} />
          </div>
          <div style={{ fontFamily: SPORT, fontSize: 'clamp(28px, 11vw, 40px)', fontWeight: 900, color: GOLD, lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            {topNumber}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(243,213,118,0.85)', marginTop: 4 }}>{topLabel}</div>
        </div>

        {/* Navn */}
        <div style={{
          fontFamily: SPORT, fontSize: 'clamp(18px, 7vw, 26px)', fontWeight: 900, textTransform: 'uppercase',
          color: GOLD, lineHeight: 1.15, letterSpacing: '0.02em',
          textShadow: '0 2px 5px rgba(0,0,0,0.5)',
        }}>
          {player.name}
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: '10px 0' }} />

        {/* Statistikk — to kolonner med tre stablede rader, som i referansekortet,
            med én vertikal skillelinje i midten. Alt er ekte data unntatt SNITT,
            som venter på et reelt tall (se TODO.md). */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <StatCell label="ODDS" value={player.odds} />
            <StatCell label="POTT" value={potName.replace(/^\S+\s/, '')} />
            <StatCell label="SNITT" value="—" />
          </div>
          <div style={{ width: 1, background: 'rgba(243,213,118,0.3)', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <StatCell label="RANK" value={`#${player.pdcRanking}`} />
            <StatCell label="MULTI" value={`×${multiplier}`} />
            <StatCell label="NASJON" value={player.nationality} />
          </div>
        </div>
      </div>
    </button>
  )
}
