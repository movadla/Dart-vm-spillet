'use client'

import Flag from '@/components/Flag'
import type { Player } from '@/data/pots'
import { PLAYER_PHOTOS } from '@/data/playerPhotos'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'
const GOLD = '#f3d576'

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
  // Samme to soner som satt-tallet/etiketten brukte tidligere (før det ble
  // fjernet som duplikat av RANKING-statistikken), gjenbrukt til flagg +
  // snitt 2026 etter ønske om at den tomme sonen skulle fylles med noe nyttig.
  topFlag: { left: '11.3%', width: '14.3%', bottom: '69.6%' }, // ned til linje 1 (30.9%)
  topAvg: { left: '11.3%', width: '14.3%', top: '31%', bottom: '62.9%' }, // mellom linje 1 og 2
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
} as const

function StatCol({ zone, label, value }: { zone: { left: string; width: string }; label: string; value: string }) {
  return (
    <>
      <div style={{ position: 'absolute', left: zone.left, width: zone.width, top: ZONES.statLabel.top, textAlign: 'center' }}>
        <div style={{ fontSize: 'clamp(5.5px, 6.5cqw, 8.5px)', fontWeight: 700, letterSpacing: '0.04em', color: 'rgba(243,213,118,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      </div>
      <div style={{ position: 'absolute', left: zone.left, width: zone.width, top: ZONES.statValue.top, textAlign: 'center' }}>
        <div style={{ fontFamily: SPORT, fontSize: 'clamp(9px, 11cqw, 15px)', fontWeight: 900, color: GOLD, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
      </div>
    </>
  )
}

export function PlayerCard({
  player, color, selected, onClick,
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
    <div style={{ width: '100%' }}>
    <button
      role="radio"
      aria-checked={selected}
      aria-label={player.name}
      onClick={onClick}
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
        transition: 'filter 0.15s',
      }}
    >
      {selected && (
        <div style={{
          position: 'absolute', top: '2%', right: '4%', zIndex: 3,
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
        // eslint-disable-next-line @next/next/no-img-element -- ekstern fil i public/, next/image gir ingen gevinst her
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
          }}
        />
      )}

      {/* Flagg øverst til venstre + snitt 2026 under — ingen ekte snitt-data
          for noen spiller ennå (vises som "—"), se TODO.md. */}
      <div style={{
        position: 'absolute', left: ZONES.topFlag.left, width: ZONES.topFlag.width, bottom: ZONES.topFlag.bottom,
        display: 'flex', justifyContent: 'flex-start',
      }}>
        <Flag iso2={player.iso2} size={22} />
      </div>
      <div style={{
        // Ingen "width" her — sonen (14.3 % av kortbredden) er for smal til
        // å romme "SNITT —" uansett skriftstørrelse, så teksten får (som
        // "SEED"-teksten gjorde før den ble fjernet) flyte fritt til høyre i
        // stedet for å bli klippet av en ellipsis. Den ligger over fotoet
        // (senere i DOM-rekkefølgen = tegnes oppå), med tekst-skygge for
        // lesbarhet — ingen kollisjon siden navnet/andre elementer sitter
        // lenger ned på kortet.
        position: 'absolute', left: ZONES.topAvg.left, top: ZONES.topAvg.top,
        textAlign: 'left', zIndex: 1,
      }}>
        <div style={{
          fontFamily: SPORT, fontSize: 'clamp(7px, 8cqw, 11px)', fontWeight: 900, color: GOLD,
          lineHeight: 1.1, whiteSpace: 'nowrap',
          textShadow: '0 1px 4px rgba(0,0,0,0.85), 0 1px 2px rgba(0,0,0,0.85)',
        }}>
          SNITT —
        </div>
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
        textAlign: 'center', zIndex: 1,
      }}>
        <div style={{
          fontFamily: SPORT, fontSize: 'clamp(8px, 9.5cqw, 13px)', fontWeight: 900, textTransform: 'uppercase',
          color: GOLD, lineHeight: 1.1, letterSpacing: '0.01em',
          textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.6)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {player.name}
        </div>
      </div>

      {/* Statistikk — mynt-ikonet er ODDS, globus-ikonet er RANKING (ekte
          data begge). Sete-tallet øverst til venstre er fjernet — det var
          samme tall som RANKING her, bare duplisert. Uten "#" foran tallet
          etter tilbakemelding. */}
      <StatCol zone={ZONES.statCols[0]} label="ODDS" value={player.odds} />
      <StatCol zone={ZONES.statCols[1]} label="RANKING" value={`${player.pdcRanking}`} />
    </button>

    {/* Kreditering som en vanlig bildetekst UNDER selve kortet, i stedet for
        tekst lagt oppå kort-grafikken — ba brukeren om etter at den så ut
        som rotete "bakgrunnstekst" oppå kortet. Fortsatt påkrevd av
        CC-lisensen bildet er hentet under (se playerPhotos.ts), bare flyttet. */}
    {photo && (
      <a
        href={photo.creditUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block', textAlign: 'center', marginTop: 3,
          fontSize: 8, color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
        }}
      >
        📷 {photo.credit}
      </a>
    )}
    </div>
  )
}
