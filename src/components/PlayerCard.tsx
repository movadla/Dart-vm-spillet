'use client'

import type { CSSProperties, ReactNode } from 'react'
import Flag from '@/components/Flag'
import type { Player } from '@/data/pots'
import { PLAYER_PHOTOS } from '@/data/playerPhotos'
import { PLAYER_STATS } from '@/data/playerStats'
import { SPORT } from '@/config/theme'
import { useLocale } from '@/lib/i18n/useLocale'
import { formatAvg, formatOdds } from '@/lib/format'

const GOLD = '#f3d576'
const LABEL_GOLD = 'rgba(243,213,118,0.75)'
// Én mal per pott (samme "is/krystall"-stil, kun hue-rotert til pottens
// farge — se TODO.md for fremgangsmåten). Malen for pott 3 er den
// opprinnelige blå originalen, uendret.
function templateSrc(potNumber: number): string {
  return `/cards/template-pot${potNumber}.webp`
}

// Delt skygge-verdi for ALL tekst/ikoner som kan ligge over spillerfotoet
// (navn, RANK-blokken) — tidligere hadde disse hver sin litt ulike
// shadow-verdi, noe som ga usystematisk lesbarhet. Brukes ikke på
// ODDS/SNITT (de ligger alltid på ren kort-bakgrunn, ikke over foto).
const SHADOW_OVER_PHOTO = '0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.6)'

// Etternavn dominerer (som på referansekortene), fornavn lite over. Første
// ord = fornavn, resten = etternavn, så "van Gerwen"/"De Decker"/"O'Connor"
// holdes samlet.
function splitName(name: string): { first: string; last: string } {
  const i = name.indexOf(' ')
  return i < 0 ? { first: '', last: name } : { first: name.slice(0, i), last: name.slice(i + 1) }
}
function initials(name: string): string {
  const parts = name.split(' ').filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
}

// Delt gull-gradient + bevel-skygge for de selvtegnede ikonene, så de får
// samme "opphøyde metall"-følelse som mynt-ikonet som er bakt inn i malen.
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

// "Tre piler" (form-/trend-ikon) for SNITT. Det opprinnelige globus-ikonet er
// fjernet med Python/OpenCV-inpainting fra originalmalen FØR den ble kopiert/
// fargelagt til alle 6 pott-variantene (template-pot1..6.webp) — bakgrunnen er en
// "is"-tekstur, ikke flat farge — se TODO.md hvis flere maler trenger samme
// behandling). Fylte former, ikke tynne streker: strek-versjonen ble lest
// som vimpler på kortstørrelse.
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

// Plassholder for spillere uten (CC-lisensiert) foto — 5 av 6 potter har
// ingen foto ennå, og et tomt is-felt så ut som en feil. Dartskive-ringer +
// initialer i samme gulltone gjør at kortet ser ferdig designet ut også uten
// bilde.
function PhotoPlaceholder({ name }: { name: string }) {
  const spokes = Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 10
    return { x1: 50 + 48 * Math.cos(a), y1: 50 + 48 * Math.sin(a), x2: 50 - 48 * Math.cos(a), y2: 50 - 48 * Math.sin(a) }
  })
  return (
    <div style={{
      position: 'absolute',
      left: ZONES.photo.left, right: ZONES.photo.right, top: ZONES.photo.top, bottom: ZONES.photo.bottom,
      display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
    }}>
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', width: '64%', aspectRatio: '1', opacity: 0.22, filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.6))' }} fill="none" stroke={GOLD} strokeWidth={0.9}>
        <circle cx="50" cy="50" r="48" />
        <circle cx="50" cy="50" r="38" />
        <circle cx="50" cy="50" r="24" />
        <circle cx="50" cy="50" r="10" />
        <circle cx="50" cy="50" r="3.5" fill={GOLD} stroke="none" />
        {spokes.map((s, i) => <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />)}
      </svg>
      <span style={{
        position: 'relative', fontFamily: SPORT, fontWeight: 900, lineHeight: 1,
        fontSize: 'clamp(18px, 26cqw, 52px)', letterSpacing: '0.02em', color: GOLD, opacity: 0.6,
        textShadow: SHADOW_OVER_PHOTO,
      }}>{initials(name)}</span>
    </div>
  )
}

// Ekte bakgrunnsmal (PNG, transparent utenfor skjoldformen) laget av brukeren —
// dette er selve kort-grafikken, ikke noe som tegnes med CSS/SVG. Koordinatene
// under er MÅLT direkte i malfilen med et Python-skript (gull-piksel-deteksjon,
// linjer/ikon-rader), ikke gjettet — se TODO.md for fremgangsmåten hvis malen
// byttes ut eller flere legges til per pott. Alle posisjoner er prosent av
// kortets bredde/høyde; kortet har LÅST aspect-ratio lik bildet, så tekst og
// form kan ikke komme i utakt.
const TEMPLATE_ASPECT = 1007 / 1562

const ZONES = {
  photo: { left: '6%', right: '6%', top: '3%', bottom: '44.1%' }, // ned til navn-skillelinjen (55.9%)
  // Venstre kolonne = nøyaktig utstrekningen til de to korte gullstrekene i
  // malen (målt: x 11,6–25,6 %). Flagg, globus+RANK og tallet midtstilles
  // alle i denne kolonnen, så de sitter symmetrisk på strekene og aldri
  // stikker inn i foto-feltet til høyre. RANK-blokken har kun ~17 % av
  // korthøyden (til navnet starter): ikon+etikett på én rad mellom linje 1
  // (30,7 %) og 2 (37,0 %), hero-tallet under linje 2.
  topCol: {
    left: '11.6%', width: '14%',
    flag: { bottom: '69.6%' }, // ned til linje 1
    iconLabelRow: { top: '31.8%' },
    valueRow: { top: '37.6%' }, // bunn ≈ 45,9 % — under etternavnets topp (46,4 %) i alle potter, målt live
  },
  name: { left: '8%', right: '8%', bottom: '45.5%' },
  statCols: [
    { left: '5%', width: '45%' },
    { left: '50%', width: '45%' },
  ],
  statLabel: { top: '71%' },
  statValue: { top: '76%' },
  // Nøyaktig posisjon til det opprinnelige (nå fjernede) globus-ikonet i
  // SNITT-kolonnen, målt med numpy connected-components. ArrowsIcon legges her.
  snittIcon: { left: '62.4%', top: '61.2%', width: '13.7%', height: '8.4%' },
} as const

function IconBadge({ zone, children }: { zone: { left: string; top: string; width: string; height: string }; children: ReactNode }) {
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
          line-height (1.5 × 16px = 24px "strut") som ellers blåser opp boksen
          langt utover tekstens synlige høyde — det var dét som fikk RANK-
          blokken til å overlappe navnet. */}
      <div style={{ position: 'absolute', left: zone.left, width: zone.width, top: labelTop, textAlign: 'center', lineHeight: 0 }}>
        <div style={{ fontSize: 'clamp(5.5px, 6.5cqw, 11px)', fontWeight: 700, letterSpacing: '0.06em', color: LABEL_GOLD, whiteSpace: 'nowrap', textShadow: shadow, lineHeight: 1.2 }}>{label}</div>
      </div>
      <div style={{ position: 'absolute', left: zone.left, width: zone.width, top: valueTop, textAlign: 'center', lineHeight: 0 }}>
        <div style={{ fontFamily: SPORT, fontSize: 'clamp(9px, 11cqw, 19px)', fontWeight: 900, color: GOLD, lineHeight: 1.2, whiteSpace: 'nowrap', textShadow: shadow }}>{value}</div>
      </div>
    </>
  )
}

export function PlayerCard({
  player, color, colorDark, selected, dimmed = false, index = 0, potNumber, onClick,
}: {
  player: Player
  color: string
  colorDark: string
  selected: boolean
  // true når en ANNEN spiller i potten er valgt — kortet dempes så valget
  // leses umiddelbart, uten å måtte lete etter glød/hakemerke.
  dimmed?: boolean
  // brukes kun til forskjøvet inntonings-animasjon når potten lastes
  index?: number
  // Velger riktig pott-fargede mal (templateSrc under) — erstatter den
  // tidligere "potName"-propen, som ble tatt imot men aldri faktisk brukt
  // noe sted i komponenten.
  potNumber: number
  onClick: () => void
}) {
  const { locale, dict } = useLocale()
  const photo = PLAYER_PHOTOS[player.name]
  const { first, last } = splitName(player.name)
  const longSurname = last.length > 10
  const template = templateSrc(potNumber)

  const buttonStyle = {
    position: 'relative', display: 'block', width: '100%',
    aspectRatio: `${TEMPLATE_ASPECT}`,
    // containerType gjør at "cqw"-enhetene skalerer mot KORTETS EGEN bredde,
    // ikke skjermens (vw) — vw ga for stor navnetekst i grid med mange
    // kolonner.
    containerType: 'inline-size',
    border: 'none', padding: 0, cursor: 'pointer', background: 'transparent',
    backgroundImage: `url(${template})`,
    backgroundSize: '100% 100%',
    // Pott-fargen eksponeres som CSS-variabel så valgt/hover/dempet-tilstandene
    // kan ligge i globals.css (.player-card--*) med ordentlige transitions.
    '--card-color': color,
  } as CSSProperties

  return (
    <div className="card-enter" style={{ width: '100%', position: 'relative', animationDelay: `${index * 70}ms` }}>
    <button
      role="radio"
      aria-checked={selected}
      aria-label={dict.common.playerCard.ariaLabel(player.name, player.pdcRanking, formatOdds(player.odds, locale))}
      onClick={onClick}
      className={`player-card${selected ? ' player-card--selected' : ''}${dimmed ? ' player-card--dimmed' : ''}`}
      style={buttonStyle}
    >
      {/* Baklys i pottens farge bak spilleren/initialene — løfter figuren fra
          is-teksturen og gir hver pott sin egen fargeidentitet allerede før
          de pott-fargede malene finnes. */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        left: ZONES.photo.left, right: ZONES.photo.right, top: ZONES.photo.top, bottom: ZONES.photo.bottom,
        background: `radial-gradient(ellipse 55% 48% at 50% 42%, ${color} 0%, transparent 70%)`,
        opacity: 0.32, mixBlendMode: 'screen', pointerEvents: 'none',
      }} />

      {/* Spillerfoto — kun for spillere med verifisert CC-lisens i PLAYER_PHOTOS.
          object-fit: contain (ikke cover) siden utklippet allerede har transparent
          bakgrunn og ikke skal beskjæres/forvrenges. */}
      {photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- ekstern fil i public/, next/image gir ingen gevinst her */}
          <img
            src={photo.src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            style={{
              position: 'absolute',
              left: ZONES.photo.left, right: ZONES.photo.right, top: ZONES.photo.top, bottom: ZONES.photo.bottom,
              width: `calc(100% - ${ZONES.photo.left} - ${ZONES.photo.right})`,
              height: `calc(100% - ${ZONES.photo.top} - ${ZONES.photo.bottom})`,
              objectFit: 'contain', objectPosition: 'bottom',
              // Litt mer kontrast/farge + en myk kantskygge på selve utklippet
              // (drop-shadow følger alfa-kanten) — skiller figuren fra den
              // blå bakgrunnen i stedet for at den ser flat/innbakt ut.
              filter: 'contrast(1.08) saturate(1.12) drop-shadow(0 6px 10px rgba(0,0,0,0.55))',
              // Bildets rektangulære kant er hard i venstre/høyre/nedre retning —
              // maske som toner mot transparent på de tre sidene. Toppen tones
              // ikke (hodet går naturlig ut i transparent der).
              maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%), linear-gradient(to top, transparent 0%, black 12%, black 100%)',
              maskComposite: 'intersect',
            }}
          />
          {/* Vignett som toner fotokantene mot pottens mørke farge. Maskert til
              en ellipse som selv toner ut — uten masken ble hjørnene av
              foto-rektangelet fylt med solid colorDark (rødbrunt over den blå
              malen) og tegnet et synlig rektangel rundt spilleren. */}
          <div aria-hidden="true" style={{
            position: 'absolute',
            left: ZONES.photo.left, right: ZONES.photo.right, top: ZONES.photo.top, bottom: ZONES.photo.bottom,
            background: `radial-gradient(ellipse 60% 56% at 50% 44%, transparent 50%, ${colorDark} 100%)`,
            // closest-side: masken når 100 % (= transparent) nøyaktig ved
            // boksens nærmeste kanter. En ellipse i %-radier gikk UTENFOR boksen
            // og lot vignetten stå ~70 % synlig langs kantene → rektangel.
            maskImage: 'radial-gradient(ellipse closest-side at 50% 44%, black 40%, transparent 100%)',
            opacity: 0.45, pointerEvents: 'none',
          }} />
        </>
      ) : (
        <PhotoPlaceholder name={player.name} />
      )}

      {/* Venstre kolonne (midtstilt på gullstrekene): innrammet flagg over
          linje 1, globus+RANK mellom linjene, hero-tall under linje 2.
          Alle størrelser i cqw så blokken alltid holder seg innenfor
          kolonnens 14 % — «RANK» brøt tidligere inn i foto-feltet. */}
      <div style={{
        position: 'absolute', left: ZONES.topCol.left, width: ZONES.topCol.width, bottom: ZONES.topCol.flag.bottom, zIndex: 1,
        display: 'flex', justifyContent: 'center', lineHeight: 0,
      }}>
        <span className="card-flag" style={{
          display: 'inline-flex', width: '12cqw', lineHeight: 0, borderRadius: 3, overflow: 'hidden',
          border: '1px solid rgba(243,213,118,0.6)', boxShadow: '0 1px 3px rgba(0,0,0,0.6)',
        }}>
          <Flag iso2={player.iso2} size={22} />
        </span>
      </div>
      <div style={{
        position: 'absolute', left: ZONES.topCol.left, width: ZONES.topCol.width, top: ZONES.topCol.iconLabelRow.top, zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8cqw',
      }}>
        <GlobeIcon size="5cqw" />
        <span style={{
          fontFamily: SPORT, fontWeight: 700, whiteSpace: 'nowrap', lineHeight: 1,
          fontSize: '3.9cqw', letterSpacing: '0.03em', color: LABEL_GOLD,
          textShadow: SHADOW_OVER_PHOTO,
        }}>{dict.common.playerCard.rank}</span>
      </div>
      <div style={{
        position: 'absolute', left: ZONES.topCol.left, width: ZONES.topCol.width, top: ZONES.topCol.valueRow.top, zIndex: 1,
        lineHeight: 0, textAlign: 'center',
      }}>
        <span style={{
          fontFamily: SPORT, fontWeight: 900, whiteSpace: 'nowrap', lineHeight: 0.95,
          fontSize: 'clamp(10px, 12.5cqw, 23px)', color: GOLD,
          textShadow: SHADOW_OVER_PHOTO,
        }}>{player.pdcRanking}</span>
      </div>

      {/* Mørk stripe bak navneblokken, kun over foto — uten den blir navnet
          vanskelig å lese der det krysser lyse deler av drakten. */}
      {photo && (
        <div aria-hidden="true" style={{
          position: 'absolute', left: 0, right: 0, bottom: `calc(${ZONES.name.bottom} - 3%)`, height: '17%',
          background: 'linear-gradient(0deg, rgba(3,4,10,0.6) 18%, rgba(3,4,10,0.2) 65%, transparent 100%)',
        }} />
      )}

      {/* Navn — fornavn lite over, etternavn stort (som på referansekortene).
          Lange etternavn får et trinn mindre skrift i stedet for ellipsis. */}
      <div style={{
        position: 'absolute', left: ZONES.name.left, right: ZONES.name.right, bottom: ZONES.name.bottom,
        textAlign: 'center', zIndex: 1, lineHeight: 0,
      }}>
        {first && (
          <div style={{
            fontFamily: SPORT, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap',
            fontSize: 'clamp(5px, 5.5cqw, 10px)', letterSpacing: '0.14em', color: LABEL_GOLD, lineHeight: 1.1,
            textShadow: SHADOW_OVER_PHOTO, marginBottom: '0.5cqw',
          }}>
            {first}
          </div>
        )}
        <div style={{
          fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase',
          fontSize: longSurname ? 'clamp(8px, 9.5cqw, 17px)' : 'clamp(10px, 12.5cqw, 22px)',
          color: GOLD, lineHeight: 1, letterSpacing: '0.01em',
          textShadow: SHADOW_OVER_PHOTO,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {last}
        </div>
      </div>

      {/* Statistikk — mynt-ikonet (bakt inn i malen) er ODDS (ekte data).
          SNITT bruker ArrowsIcon; snittet hentes fra playerStats.ts (samme
          kilde som spillerpanelet). Ingen tekst-skygge her (ren kort-bakgrunn,
          ikke foto). */}
      <IconBadge zone={ZONES.snittIcon}>
        <ArrowsIcon size="clamp(10px, 9cqw, 16px)" />
      </IconBadge>
      <StatCol zone={ZONES.statCols[0]} labelTop={ZONES.statLabel.top} valueTop={ZONES.statValue.top} label={dict.common.playerCard.odds} value={formatOdds(player.odds, locale)} />
      <StatCol zone={ZONES.statCols[1]} labelTop={ZONES.statLabel.top} valueTop={ZONES.statValue.top} label={dict.common.playerCard.avg} value={formatAvg(PLAYER_STATS[player.name]?.avg, locale)} />

      {/* Folie-glans: en svak diagonal lysstripe over hele kortet, maskert med
          selve mal-bildet så den følger skjoldformen (ikke rektangelet), og
          sveiper over på hover (.card-sheen i globals.css). */}
      <div aria-hidden="true" className="card-sheen" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
        maskImage: `url(${template})`, maskSize: '100% 100%', maskRepeat: 'no-repeat',
        background: 'linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.14) 47%, rgba(255,255,255,0.05) 52%, transparent 62%)',
        backgroundSize: '250% 100%', backgroundPosition: '70% 0',
      }} />

      {/* Ingen hake: glød + skalering (.player-card--selected) og demping av de
          andre kortene er tydelig nok, og haken traff aldri skjoldformen. */}
    </button>

    {/* Foto-krediteringen (påkrevd av CC-lisensen, se playerPhotos.ts) vises
        i spillerpanelet («Foto: …») — «i»-knappen på kortet var det eneste
        trykkbare som IKKE valgte spilleren, og folk bommet på den. */}
    </div>
  )
}
