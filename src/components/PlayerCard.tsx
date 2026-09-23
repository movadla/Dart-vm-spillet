'use client'

import Flag from '@/components/Flag'
import type { Player } from '@/data/pots'
import { PLAYER_PHOTOS } from '@/data/playerPhotos'

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
// v2, etter tilbakemelding om at omrisset fortsatt var for "butt/rundt" sammenlignet
// med referansen: "ørene" (vinge-spissene ca. 55–65 % ned) er nå tegnet med RETTE
// linjer inn/ut av spissen (L, ikke C) — det gir en skarp, kantet flarer-effekt i
// stedet for en myk pukkel, som er nærmere referansens tydelig spisse sidepigger.
// Bunn-spissen beholder en myk kurve, som i referansen.
const SHIELD_PATH = `
  M 40 3
  C 44 3 47 8 50 8
  C 53 8 56 3 60 3
  L 87 3
  C 92 3 95 6 95 11
  L 95 50
  L 100 63
  L 87 73
  C 80 88 66 96 50 100
  C 34 96 20 88 13 73
  L 0 63
  L 5 50
  L 5 11
  C 5 6 8 3 13 3
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
        <radialGradient id={`${gradientId}-accent`} cx="20%" cy="8%" r="80%">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="45%" stopColor={color} stopOpacity="0.1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        {/* Diagonal "lysstripe" over bakgrunnen, som den blå stripen i referansen */}
        <linearGradient id={`${gradientId}-streak`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="18%" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="30%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {/* Frost/marmor-korn — ekte prosedural støy (feTurbulence) i stedet for
            noen få gjettede radial-gradient-flekker, for en tekstur som faktisk
            ligner referansens is-/marmor-overflate på nært hold. */}
        <filter id={`${gradientId}-grain`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" />
        </filter>
      </defs>

      {/* Fler-lags gull/mørk-ramme — hver bane er litt mindre enn forrige og
          dekker den bortsett fra en tynn kant, som gir referansens "flere
          tynne ringer"-utseende i stedet for én tykk kant + én strek. */}
      <path d={SHIELD_PATH} fill="#fff7d6" transform="translate(50 50) scale(1.025) translate(-50 -50)" />
      <path d={SHIELD_PATH} fill={`url(#${gradientId}-frame)`} transform="translate(50 50) scale(1.0) translate(-50 -50)" />
      <path d={SHIELD_PATH} fill="#0a0c14" transform="translate(50 50) scale(0.975) translate(-50 -50)" />
      <path d={SHIELD_PATH} fill={`url(#${gradientId}-frame)`} transform="translate(50 50) scale(0.955) translate(-50 -50)" />
      <path d={SHIELD_PATH} fill="#05070d" transform="translate(50 50) scale(0.935) translate(-50 -50)" />

      {/* Selve kort-bunnen: fylling, korn-tekstur, fargeglød, lysstripe */}
      <path d={SHIELD_PATH} fill={`url(#${gradientId}-fill)`} transform="translate(50 50) scale(0.92) translate(-50 -50)" />
      <path d={SHIELD_PATH} fill="#fff" filter={`url(#${gradientId}-grain)`} opacity="0.6" transform="translate(50 50) scale(0.92) translate(-50 -50)" />
      <path d={SHIELD_PATH} fill={`url(#${gradientId}-accent)`} transform="translate(50 50) scale(0.92) translate(-50 -50)" />
      <path d={SHIELD_PATH} fill={`url(#${gradientId}-streak)`} transform="translate(50 50) scale(0.92) translate(-50 -50)" />
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
  const photo = PLAYER_PHOTOS[player.name]

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
        padding: '16% 21% 19%',
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

        {photo ? (
          /* Ekte spillerfoto, kun for spillere med en verifisert CC-lisens i
             PLAYER_PHOTOS (se den filen for hvorfor/hvordan). Del av vanlig
             flex-flyt (ikke absolutt posisjonert) med en fast aspect-ratio —
             et tidligere forsøk med prosent-posisjonering og maske-uttoning
             endte med at fotoet både overlappet navnet under OG stakk utenfor
             gullrammen øverst, siden en rettvinklet boks ikke automatisk
             respekterer den buede skjold-formen. I vanlig flyt dytter fotoet
             bare navnet naturlig nedover — kan ikke overlappe noe. */
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: '2%' }}>
            <div style={{ textAlign: 'left', paddingBottom: 6, flexShrink: 0 }}>
              <div style={{ fontFamily: SPORT, fontSize: 'clamp(26px, 10vw, 36px)', fontWeight: 900, color: GOLD, lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                {topNumber}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(243,213,118,0.85)', marginTop: 3 }}>{topLabel}</div>
            </div>
            <div style={{ flex: 1 }} />
            {/* eslint-disable-next-line @next/next/no-img-element -- ekstern fil i public/, next/image gir ingen gevinst her */}
            <img
              src={photo.src}
              alt=""
              aria-hidden="true"
              style={{
                width: '56%', maxWidth: 150, height: 'auto', objectFit: 'contain',
                filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.6))',
              }}
            />
          </div>
        ) : (
          /* Ingen lisensiert foto for denne spilleren — sirkulær flagg-medaljong
             i stedet for et tomt hjørne-vannmerke. */
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
        )}

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

        {/* Kreditering — påkrevd vilkår for CC-lisensen bildet er hentet under,
            ikke valgfritt pynt. Se src/data/playerPhotos.ts. */}
        {photo && (
          <a
            href={photo.creditUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              marginTop: 8, fontSize: 7, color: 'rgba(255,255,255,0.35)',
              textDecoration: 'none', alignSelf: 'center',
            }}
          >
            📷 {photo.credit}
          </a>
        )}
      </div>
    </button>
  )
}
