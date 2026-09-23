'use client'

import Flag from '@/components/Flag'
import type { Player } from '@/data/pots'
import { PLAYER_PHOTOS } from '@/data/playerPhotos'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'
const GOLD = '#f3d576'
const LABEL_GOLD = 'rgba(243,213,118,0.75)'

// Delt skygge-verdi for ALL tekst/ikoner som kan ligge over spillerfotoet
// (navn, RANK-blokken) — tidligere hadde disse hver sin litt ulike
// shadow-verdi, noe som ga usystematisk lesbarhet. Brukes ikke på
// ODDS/SNITT (de ligger alltid på ren kort-bakgrunn, ikke over foto).
const SHADOW_OVER_PHOTO = '0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.6)'

// Norsk komma-format ("101,23"), ikke punktum — se avg2026-kommentaren i
// pots.ts for status på tallene selv (fiktive foreløpig, kun to spillere).
function formatAvg(avg: number | undefined): string {
  return avg == null ? '—' : avg.toLocaleString('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Delt gull-gradient + bevel-skygge for de to selvtegnede ikonene, så de får
// samme "opphøyde metall"-følelse som mynt-ikonet som er bakt inn i malen
// (flate strekikoner skilte seg tidligere synlig ut fra den detaljerte
// malgrafikken).
function IconDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fff3d0" />
        <stop offset="45%" stopColor="#f3d576" />
        <stop offset="100%" stopColor="#c99a2e" />
      </linearGradient>
    </defs>
  )
}
const ICON_BEVEL = 'drop-shadow(0 1px 0.5px rgba(255,255,255,0.5)) drop-shadow(0 1.5px 1.5px rgba(0,0,0,0.65))'

// To små ikoner tegnet selv (ikke bakt inn i malen) — kan derfor plasseres/
// byttes fritt uten å røre selve bildefilen.
function GlobeIcon({ size }: { size: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ filter: ICON_BEVEL, overflow: 'visible' }}>
      <IconDefs id="globeGrad" />
      <g fill="none" stroke="url(#globeGrad)" strokeWidth={1.9} strokeLinecap="round">
        <circle cx="12" cy="12" r="8.5" />
        <line x1="3.5" y1="12" x2="20.5" y2="12" />
        <path d="M12 3.5c2.8 3 2.8 14 0 17" />
        <path d="M12 3.5c-2.8 3 -2.8 14 0 17" />
      </g>
    </svg>
  )
}

// "Tre piler" (form-/trend-ikon) — erstatter globus-ikonet som lå bakt inn i
// malen for SNITT-kolonnen. Selve globus-grafikken er fjernet fra
// template-1.webp med Python/OpenCV-inpainting (bakgrunnen der er en
// detaljert "is"-tekstur, ikke en flat farge, så en enkel fargeplugg hadde
// vist igjen som et synlig lappet felt — se TODO.md for fremgangsmåten
// hvis flere maler trenger samme behandling).
// Fylte (ikke bare konturerte) trekanter/stolper — en tidligere versjon med
// tynne strek-piler ble lest som vimpler/flagg på kortstørrelse i stedet for
// piler; fylte former beholder formen bedre ved liten visningsstørrelse.
function ArrowsIcon({ size }: { size: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ filter: ICON_BEVEL, overflow: 'visible' }}>
      <IconDefs id="arrowsGrad" />
      <g fill="url(#arrowsGrad)">
        <rect x="3.3" y="13" width="3.4" height="6" rx="0.6" />
        <path d="M2.7 12.4 5 8l2.3 4.4Z" />
        <rect x="10.3" y="9" width="3.4" height="10" rx="0.6" />
        <path d="M9.7 8.4 12 4l2.3 4.4Z" />
        <rect x="17.3" y="11" width="3.4" height="8" rx="0.6" />
        <path d="M16.7 10.4 19 6l2.3 4.4Z" />
      </g>
    </svg>
  )
}

// Ekte bakgrunnsmal (PNG, transparent utenfor skjoldformen) laget av brukeren —
// dette er nå selve kort-grafikken, ikke noe jeg tegner med CSS/SVG. Koordinatene
// under er MÅLT direkte i denne konkrete filen (1007×1562px) med et Python-skript
// (fant gull-fargede piksler og lokaliserte linjer/ikon-rader), ikke gjettet — se
// TODO.md for fremgangsmåten hvis malen byttes ut eller flere legges til per pott.
// Alle posisjoner under er prosent av kortets bredde/høyde, så de skalerer riktig
// uansett skjermstørrelse (kortet har en LÅST aspect-ratio som matcher bildet,
// så − i motsetning til de SVG-tegnede forsøkene før dette − kan ikke tekst og
// form komme i utakt med hverandre; formen er nå et fast bilde, ikke noe som
// strekkes for å matche variabelt innhold).
const TEMPLATE_ASPECT = 1007 / 1562

const ZONES = {
  photo: { left: '6%', right: '6%', top: '3%', bottom: '44.1%' }, // ned til navn-skillelinjen (55.9%)
  topFlag: { left: '11.3%', width: '14.3%', bottom: '69.6%' }, // ned til linje 1 (30.9%)
  // RANK-blokken har KUN 17,4 % av korthøyden å bruke på (fra streken under
  // flagget til navnet starter, målt live: navn topper på 47,8 %) — for lite
  // til tre fulle rader i samme skala som ODDS/SNITT nederst (som har ~29 %
  // å boltre seg på). Derfor: ikon+etikett på én rad, tall på raden under
  // (samme gull-fargetoner/skygge som resten av kortet, men egen, kompakt
  // oppsett — ikke StatCol/IconBadge-gjenbruk, siden plassen rett og slett
  // ikke tillater samme oppskrift).
  topRank: {
    left: '11.3%',
    iconLabelRow: { top: '32%' },
    valueRow: { top: '39%' },
  },
  name: { left: '8%', right: '8%', bottom: '45.5%' },
  // v2 av malen (fra brukeren): kun 2 ikoner bakt inn (mynt/globus) i stedet
  // for 4 — løser CSS-maskerings-problemet fra forrige versjon helt (der
  // gull-ikonene for RANKING/9-DARTERS fortsatt skinte gjennom masken).
  // Samme grunnfil/koordinater ellers (målt på nytt for å være sikker).
  statCols: [
    { left: '5%', width: '45%' },
    { left: '50%', width: '45%' },
  ],
  statLabel: { top: '71%' },
  statValue: { top: '76%' },
  // Nøyaktig posisjon til det opprinnelige (nå fjernede) globus-ikonet i
  // SNITT-kolonnen, målt med Python/numpy (gull-piksel-deteksjon +
  // connected-components) i denne konkrete malfilen. ArrowsIcon legges her.
  snittIcon: { left: '62.4%', top: '61.2%', width: '13.7%', height: '8.4%' },
} as const

function IconBadge({ zone, children }: { zone: { left: string; top: string; width: string; height: string }; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'absolute', left: zone.left, top: zone.top, width: zone.width, height: zone.height,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </div>
  )
}

function StatCol({
  zone, labelTop, valueTop, label, value, shadow,
}: {
  zone: { left: string; width: string }
  labelTop: string
  valueTop: string
  label: string
  value: string
  shadow?: string
}) {
  return (
    <>
      {/* lineHeight:0 på wrapper-diven fjerner Tailwind-preflightens arvede
          line-height (1.5 × 16px = 24px "strut") som ellers blåser opp
          boksen langt utover selve tekstens synlige høyde — oppdaget da
          RANK-blokken (se lenger ned) overlappet navnet selv om tallet
          "så" langt unna ut visuelt. */}
      <div style={{ position: 'absolute', left: zone.left, width: zone.width, top: labelTop, textAlign: 'center', lineHeight: 0 }}>
        <div style={{ fontSize: 'clamp(5.5px, 6.5cqw, 8.5px)', fontWeight: 700, letterSpacing: '0.04em', color: LABEL_GOLD, whiteSpace: 'nowrap', textShadow: shadow, lineHeight: 1.2 }}>{label}</div>
      </div>
      <div style={{ position: 'absolute', left: zone.left, width: zone.width, top: valueTop, textAlign: 'center', lineHeight: 0 }}>
        <div style={{ fontFamily: SPORT, fontSize: 'clamp(9px, 11cqw, 15px)', fontWeight: 900, color: GOLD, lineHeight: 1.2, whiteSpace: 'nowrap', textShadow: shadow }}>{value}</div>
      </div>
    </>
  )
}

export function PlayerCard({
  player, color, colorDark, selected, onClick,
}: {
  player: Player
  color: string
  colorDark: string
  selected: boolean
  potName: string
  multiplier: number
  onClick: () => void
}) {
  const photo = PLAYER_PHOTOS[player.name]

  return (
    <div style={{ width: '100%', position: 'relative' }}>
    <button
      role="radio"
      aria-checked={selected}
      aria-label={player.name}
      onClick={onClick}
      className="player-card"
      style={{
        position: 'relative', display: 'block', width: '100%',
        aspectRatio: `${TEMPLATE_ASPECT}`,
        // containerType gjør at "cqw"-enhetene under skalerer mot KORTETS EGEN
        // bredde, ikke skjermens (vw) — det var bugen som gjorde navneteksten
        // for stor: 6vw regner ut fra viewport-bredden uansett hvor smalt
        // kortet selv er i et grid med mange kolonner.
        containerType: 'inline-size',
        border: 'none', padding: 0, cursor: 'pointer',
        backgroundImage: 'url(/cards/template-1.webp)',
        backgroundSize: '100% 100%',
        filter: selected ? `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 3px #fff)` : 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))',
      }}
    >
      {selected && (
        // top/right justert 2026-09-23: lå tidligere delvis UTENFOR selve
        // skjold-grafikken (i det transparente hjørnet over den buede
        // toppkanten) — verifisert med pikselsjekk mot malen, ikke gjettet.
        <div style={{
          position: 'absolute', top: '15%', right: '4%', zIndex: 3,
          width: '7%', aspectRatio: '1', borderRadius: '50%', background: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid #fff', boxShadow: '0 0 8px rgba(0,0,0,0.5)',
        }}>
          <span style={{ fontSize: '60%', fontWeight: 900, color: '#fff', lineHeight: 1 }}>✓</span>
        </div>
      )}

      {/* Spillerfoto — kun for spillere med verifisert CC-lisens i PLAYER_PHOTOS.
          object-fit: contain (ikke cover) siden utklippet allerede har transparent
          bakgrunn og ikke skal beskjæres/forvrenges. */}
      {photo && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- ekstern fil i public/, next/image gir ingen gevinst her */}
          <img
            src={photo.src}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: ZONES.photo.left, right: ZONES.photo.right, top: ZONES.photo.top, bottom: ZONES.photo.bottom,
              width: `calc(100% - ${ZONES.photo.left} - ${ZONES.photo.right})`,
              height: `calc(100% - ${ZONES.photo.top} - ${ZONES.photo.bottom})`,
              objectFit: 'contain', objectPosition: 'bottom',
              // Bildets egen (rektangulære) kant er hard/synlig i venstre, høyre og
              // nedre retning (utklippet er ikke rundt hele figuren) — myker opp med
              // en maske som toner ut mot transparent på de tre sidene. Toppen er
              // bevisst IKKE tonet (spilleren/hodet går naturlig ut i transparent der).
              maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%), linear-gradient(to top, transparent 0%, black 12%, black 100%)',
              maskComposite: 'intersect',
            }}
          />
          {/* Ekte vignett OVER fotoet (ikke bare transparent maske) — toner
              kantene mot pottens egen mørke farge (colorDark) i stedet for
              rent gjennomsiktig, så overgangen til kort-bakgrunnen ser
              tilsiktet ut fremfor at figuren "løses opp". */}
          <div style={{
            position: 'absolute',
            left: ZONES.photo.left, right: ZONES.photo.right, top: ZONES.photo.top, bottom: ZONES.photo.bottom,
            background: `radial-gradient(ellipse 65% 60% at 50% 42%, transparent 55%, ${colorDark} 100%)`,
            opacity: 0.5, pointerEvents: 'none',
          }} />
        </>
      )}

      {/* Flagg øverst til venstre. Under: RANK-blokk, samme gullfarger/skygge
          som resten av kortet (GlobeIcon gjenbrukt fra SNITT-kolonnen), men
          kompakt to-rads oppsett — se kommentaren ved ZONES.topRank for
          hvorfor. */}
      <div style={{
        position: 'absolute', left: ZONES.topFlag.left, width: ZONES.topFlag.width, bottom: ZONES.topFlag.bottom,
        display: 'flex', justifyContent: 'flex-start',
      }}>
        <Flag iso2={player.iso2} size={22} />
      </div>
      <div style={{
        position: 'absolute', left: ZONES.topRank.left, top: ZONES.topRank.iconLabelRow.top,
        display: 'flex', alignItems: 'center', gap: 2,
      }}>
        <GlobeIcon size="clamp(7px, 7cqw, 10px)" />
        <span style={{
          fontFamily: SPORT, fontWeight: 700, whiteSpace: 'nowrap', lineHeight: 1,
          fontSize: 'clamp(4.5px, 5cqw, 7px)', letterSpacing: '0.04em', color: LABEL_GOLD,
          textShadow: SHADOW_OVER_PHOTO,
        }}>RANK</span>
      </div>
      <div style={{ position: 'absolute', left: ZONES.topRank.left, top: ZONES.topRank.valueRow.top, lineHeight: 0 }}>
        <span style={{
          fontFamily: SPORT, fontWeight: 900, whiteSpace: 'nowrap', lineHeight: 1,
          fontSize: 'clamp(7px, 7.5cqw, 10px)', color: GOLD,
          textShadow: SHADOW_OVER_PHOTO,
        }}>{player.pdcRanking}</span>
      </div>

      {/* Svak mørk stripe rett bak navnet, kun når det ligger over et foto —
          uten den blir navnet vanskelig å lese der det krysser lyse/fargerike
          deler av spillerdrakten (f.eks. den gule glidelåsen på Littler). */}
      {photo && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: `calc(${ZONES.name.bottom} - 3%)`, height: '13%',
          background: 'linear-gradient(0deg, rgba(3,4,10,0.55) 20%, rgba(3,4,10,0.15) 70%, transparent 100%)',
        }} />
      )}

      {/* Navn — ligger over bunnen av foto-vinduet, som i referansen */}
      <div style={{
        position: 'absolute', left: ZONES.name.left, right: ZONES.name.right, bottom: ZONES.name.bottom,
        textAlign: 'center', zIndex: 1, lineHeight: 0,
      }}>
        <div style={{
          fontFamily: SPORT, fontSize: 'clamp(8px, 9.5cqw, 13px)', fontWeight: 900, textTransform: 'uppercase',
          color: GOLD, lineHeight: 1.1, letterSpacing: '0.01em',
          textShadow: SHADOW_OVER_PHOTO,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {player.name}
        </div>
      </div>

      {/* Statistikk — mynt-ikonet (bakt inn i malen) er ODDS (ekte data).
          SNITT bruker nå ArrowsIcon (tegnet i kode, se over) i stedet for
          det opprinnelige, nå fjernede globus-ikonet — fiktive tall
          foreløpig for de fleste spillere, se avg2026 i pots.ts. Ingen
          tekst-skygge her (ligger alltid på ren kort-bakgrunn, ikke foto). */}
      <IconBadge zone={ZONES.snittIcon}>
        <ArrowsIcon size="clamp(10px, 9cqw, 16px)" />
      </IconBadge>
      <StatCol zone={ZONES.statCols[0]} labelTop={ZONES.statLabel.top} valueTop={ZONES.statValue.top} label="ODDS" value={player.odds} />
      <StatCol zone={ZONES.statCols[1]} labelTop={ZONES.statLabel.top} valueTop={ZONES.statValue.top} label="SNITT" value={formatAvg(player.avg2026)} />
    </button>

    {/* Foto-kreditering — påkrevd av CC-lisensen (se playerPhotos.ts), men
        skjult bak en liten "i"-knapp (details/summary, ingen JS) i stedet
        for alltid synlig bildetekst, etter ønske om at den skal være minst
        mulig synlig i det daglige. */}
    {photo && (
      <details className="card-credit" style={{ position: 'absolute', bottom: 3, right: 3, zIndex: 2 }}>
        <summary style={{
          width: 14, height: 14, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.3)',
          color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: 700, fontStyle: 'italic', fontFamily: 'Georgia, serif',
        }} aria-label="Foto-kreditering">i</summary>
        <a
          href={photo.creditUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            // maxWidth (ikke nowrap) — en lang kreditering (nowrap) stakk
            // tidligere langt utenfor kortets venstre kant og kunne
            // overlappe nabokortet i et grid med flere kolonner.
            position: 'absolute', bottom: 18, right: 0, maxWidth: 108, width: 'max-content',
            display: 'block', fontSize: 9, color: '#fff', textDecoration: 'none',
            background: 'rgba(0,0,0,0.75)', padding: '3px 6px', borderRadius: 4,
          }}
        >
          📷 {photo.credit}
        </a>
      </details>
    )}
    </div>
  )
}
