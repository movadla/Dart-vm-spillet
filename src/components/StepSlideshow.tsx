'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { POTS, type Player } from '@/data/pots'
import { SCORING, STAGE_LABELS } from '@/config/scoring'
import { POT_COLORS, POT_COLORS_DARK } from '@/config/potColors'
import { PlayerCard } from '@/components/PlayerCard'
import Flag from '@/components/Flag'
import { PLAYER_PHOTOS } from '@/data/playerPhotos'
import TeamBuildAnimation, { EXAMPLE_TEAM } from '@/components/TeamBuildAnimation'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

interface Props {
  onStart?: () => void
  onCtaReady?: () => void
  onSlide?: (slide: number) => void
  ctaHref?: string
  ctaLabel?: string
}

// ── Eksempeldata til intro-sekvensen (illustrerer spillmekanikken, ikke ekte VM-resultater) ──
function findPick(name: string) {
  const pot = POTS.find((p) => p.players.some((pl) => pl.name === name))
  const player = pot?.players.find((pl) => pl.name === name)
  if (!pot || !player) throw new Error(`Fant ikke eksempelspiller: ${name}`)
  return { potNumber: pot.potNumber, player }
}

const EXAMPLE_PICK = findPick('Luke Littler')
// Motstanderen i eksempelet trekkes tilfeldig blant de useedede (seedNumber
// null) ved mount — de har ingen foto, så kortet viser initial-plassholderen,
// som passer fint for «en tilfeldig useeded spiller».
const UNSEEDED: Player[] = POTS.flatMap((p) => p.players).filter((p) => p.seedNumber == null)
const EXAMPLE_SETS_WON = 3
const EXAMPLE_SETS_LOST = 1
const EXAMPLE_SET_PTS = EXAMPLE_SETS_WON * SCORING.perSetWon
const EXAMPLE_WIN_PTS = SCORING.perAdvancement
const EXAMPLE_TOTAL = EXAMPLE_SET_PTS + EXAMPLE_WIN_PTS

const LAST_PHASE = 2
/** Siste slide (0-indeksert) — tipp/page.tsx skjuler «Hopp over» der, siden
 * CTA-en («Velg spillere») ligger på den sliden. */
export const INTRO_LAST_SLIDE = LAST_PHASE

const CTA_STYLE: React.CSSProperties = {
  flex: 1, display: 'block', padding: '16px',
  background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)',
  color: '#fff', fontFamily: SPORT, fontSize: 18, fontWeight: 900,
  letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 14,
  border: 'none', cursor: 'pointer',
  animation: 'slide-enter 0.5s cubic-bezier(0.22,1,0.36,1) both',
}

/**
 * Manuelt styrt, fler-fase intro-sekvens for Dart-VM-spillet — bruker trykker
 * seg videre med «Neste»-knappen, sveiper, eller piltastene (ingen
 * auto-advance). Fase 0: lagbygging-animasjonen → fase 1: eksempelkamp med
 * poeng → fase 2: «Min side»/ligaer, med CTA («Velg spillere») nederst i
 * stedet for «Neste» — det finnes ingen egen CTA-slide.
 * Brukes som intro på forsiden og gjenbrukt på vm-info-siden — og som ETT av
 * de 6 stegene i selve tippe-flyten (tipp/page.tsx), som har sin egen
 * «STEG 1 AV 6»-header utenfor denne komponenten. Derfor har PhaseHeading
 * under bevisst IKKE «Steg N»-nummerering i eyebrow-tekstene — to parallelle
 * tellesystemer på skjermen samtidig var forvirrende for en ny bruker.
 */
export default function StepSlideshow({ onStart, onCtaReady, onSlide, ctaHref = '/tipp', ctaLabel = 'VELG SPILLERE →' }: Props) {
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState(0)

  const onSlideRef = useRef(onSlide)
  const onCtaReadyRef = useRef(onCtaReady)
  useEffect(() => {
    onSlideRef.current = onSlide
    onCtaReadyRef.current = onCtaReady
  })

  // Touch-sveip mellom fasene — fantes ikke før (kun «Neste»-knappen), uventet
  // begrensning i en ellers mobil-først app. Nesten-vertikale bevegelser
  // ignoreres med vilje, slik at vanlig sideskrolling ikke feiltolkes som sveip.
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const dx = e.changedTouches[0].clientX - start.x
    const dy = e.changedTouches[0].clientY - start.y
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    if (dx < 0 && phase < LAST_PHASE) goToPhase(phase + 1)
    else if (dx > 0 && phase > 0) goToPhase(phase - 1)
  }

  // Venstre/høyre piltast — fantes ingen tastaturnavigasjon i det hele tatt før.
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight' && phase < LAST_PHASE) { e.preventDefault(); goToPhase(phase + 1) }
    else if (e.key === 'ArrowLeft' && phase > 0) { e.preventDefault(); goToPhase(phase - 1) }
  }

  // Fade inn hele komponenten
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    onSlideRef.current?.(0)
  }, [])

  function goToPhase(next: number) {
    setPhase(next)
    onSlideRef.current?.(next)
    if (next === LAST_PHASE) onCtaReadyRef.current?.()
  }

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Merkevare-header */}
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <div
          style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            marginBottom: 6,
            background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)',
          }}
        >
          — PDC World Championship —
        </div>
        <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: 36, letterSpacing: '-1px', lineHeight: 1 }}>
          <span style={{ color: 'rgba(255,255,255,0.38)' }}>DART-VM-</span>
          <span
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            SPILLET
          </span>
        </div>
      </div>

      {/* Faseprikker — var før rene dekorative <span>, ikke klikkbare og uten
          noen ARIA-semantikk. Nå ekte tabs: klikkbare (hopp direkte til en
          fase) og navigerbare med piltaster når en prikk har fokus. Den
          aktive prikken bruker dot-fill-animasjonen (fantes ferdig i
          globals.css, men var aldri koblet til noe). */}
      <div role="tablist" aria-label="Steg i introduksjonen" style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            role="tab"
            type="button"
            aria-selected={i === phase}
            aria-controls="step-slideshow-panel"
            tabIndex={i === phase ? 0 : -1}
            onClick={() => goToPhase(i)}
            onKeyDown={handleKeyDown}
            style={{
              position: 'relative', overflow: 'hidden', padding: 0, border: 'none', cursor: 'pointer',
              width: i === phase ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i <= phase ? '#dc2626' : 'rgba(255,255,255,0.15)',
              transition: 'width 0.35s cubic-bezier(0.22,1,0.36,1), background 0.35s ease',
            }}
          >
            {i === phase && (
              <span key={phase} style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.35, animation: 'dot-fill 0.35s ease-out both' }} />
            )}
          </button>
        ))}
      </div>

      {/* Faseinnhold — aria-live så skjermlesere får med seg fasebytte, og
          tabIndex+onKeyDown for pil-tastnavigasjon når selve panelet har
          fokus (i tillegg til prikkene over). onTouchStart/End gir
          touch-sveip, som ikke fantes i det hele tatt før. */}
      <div
        id="step-slideshow-panel"
        role="tabpanel"
        aria-live="polite"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ minHeight: 268, marginBottom: 24 }}
      >
        {phase === 0 && <IntroPhase />}

        {phase === 1 && <ExamplePhase />}

        {phase === 2 && <ProgressPhase />}
      </div>

      {/* Manuell navigasjon — på siste fase erstattes «Neste» av selve CTA-en
          («Velg spillere»), men den lille Tilbake-knappen beholdes. */}
      <div style={{ display: 'flex', gap: 10 }}>
        {phase > 0 && (
          <button
            onClick={() => goToPhase(phase - 1)}
            style={{
              flexShrink: 0, padding: '14px 18px', background: 'transparent',
              color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 14, fontFamily: SPORT, fontSize: 14, fontWeight: 800,
              letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            Tilbake
          </button>
        )}
        {phase < LAST_PHASE ? (
          <button
            onClick={() => goToPhase(phase + 1)}
            className="btn-hover"
            style={{
              flex: 1, padding: '14px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)',
              color: '#fff', fontFamily: SPORT, fontSize: 15, fontWeight: 900,
              letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 14,
              border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(220,38,38,0.35)',
            }}
          >
            Neste →
          </button>
        ) : onStart ? (
          <button onClick={onStart} className="cta-pulse" style={CTA_STYLE}>
            {ctaLabel}
          </button>
        ) : (
          <Link href={ctaHref} className="cta-btn cta-pulse" style={{ ...CTA_STYLE, textAlign: 'center', textDecoration: 'none' }}>
            {ctaLabel}
          </Link>
        )}
      </div>
    </div>
  )
}

// Fase 0 i tre trinn, så folk rekker å lese: overskrift → undertekst →
// selve animasjonen (som tar plass fra start, så ingenting hopper).
// Egen komponent slik at trinnene starter på nytt hver gang bruker lander
// på fase 0 igjen (den (re)monteres sammen med fasen).
const INTRO_SUBTITLE_AT = 1300
const INTRO_ANIMATION_AT = 2700

function IntroPhase() {
  const [subtitleVisible, setSubtitleVisible] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSubtitleVisible(true)
      return
    }
    const t = setTimeout(() => setSubtitleVisible(true), INTRO_SUBTITLE_AT)
    return () => clearTimeout(t)
  }, [])

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 10, animation: 'slide-enter 0.6s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{ fontFamily: SPORT, fontSize: 24, fontWeight: 900, textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>
          Slik fungerer det
        </div>
      </div>
      <div
        style={{
          fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 22, lineHeight: 1.5,
          opacity: subtitleVisible ? 1 : 0,
          transform: subtitleVisible ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        Velg 6 spillere – én fra hvert nivå
      </div>
      <TeamBuildAnimation startDelay={INTRO_ANIMATION_AT} />
    </div>
  )
}

// Fase 1 som en trinnvis fortelling (samme mønster som IntroPhase): tekst →
// tekst → runde → kampoppsett med ekte kort → resultat → poengrader → sum.
// Steg-nummer og tidspunkt (ms fra mount):
const EXAMPLE_STEPS = [0, 1300, 2700, 3400, 5400, 6600, 7300, 8100] // steg 0..7
const EXAMPLE_CARD_WIDTH = 92

function ExamplePhase() {
  const [step, setStep] = useState(0)
  const [opponent, setOpponent] = useState<Player>(UNSEEDED[0])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpponent(UNSEEDED[Math.floor(Math.random() * UNSEEDED.length)])
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStep(EXAMPLE_STEPS.length - 1)
      return
    }
    const timers = EXAMPLE_STEPS.slice(1).map((t, i) => setTimeout(() => setStep(i + 1), t))
    return () => timers.forEach(clearTimeout)
  }, [])

  const reveal = (from: number, extra?: React.CSSProperties): React.CSSProperties => ({
    opacity: step >= from ? 1 : 0,
    transform: step >= from ? 'translateY(0)' : 'translateY(6px)',
    transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
    ...extra,
  })

  const opponentPot = POTS.find((p) => p.players.includes(opponent))?.potNumber ?? 6

  return (
    <div className="team-demo" style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: SPORT, fontSize: 24, fontWeight: 900, textTransform: 'uppercase', color: '#fff', lineHeight: 1, marginBottom: 10, animation: 'slide-enter 0.6s cubic-bezier(0.22,1,0.36,1) both' }}>
        Følg spillerne dine gjennom VM
      </div>
      <div style={reveal(1, { fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: 18 })}>
        Sank poeng basert på deres prestasjoner
      </div>

      <div style={reveal(2, { fontFamily: SPORT, fontSize: 13, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#f3d576', marginBottom: 10 })}>
        {STAGE_LABELS.r1}
      </div>

      {/* Kampoppsett: Littler-kortet vs. en tilfeldig useeded — «VS» byttes
          ut med resultatet når det kommer */}
      <div style={reveal(3, { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 14 })} aria-hidden="true">
        <div style={{ width: EXAMPLE_CARD_WIDTH, flexShrink: 0, pointerEvents: 'none' }}>
          <PlayerCard
            player={EXAMPLE_PICK.player}
            color={POT_COLORS[(EXAMPLE_PICK.potNumber - 1) % POT_COLORS.length]}
            colorDark={POT_COLORS_DARK[(EXAMPLE_PICK.potNumber - 1) % POT_COLORS_DARK.length]}
            selected={step >= 4}
            index={0}
            potNumber={EXAMPLE_PICK.potNumber}
            multiplier={1}
            onClick={() => {}}
          />
        </div>
        <div style={{ width: 64, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {step >= 4 ? (
            <div key="score" style={{ fontFamily: SPORT, fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums', animation: 'flag-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>
              {EXAMPLE_SETS_WON}–{EXAMPLE_SETS_LOST}
            </div>
          ) : (
            <div key="vs" style={{ fontFamily: SPORT, fontSize: 18, fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>VS</div>
          )}
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', opacity: step >= 4 ? 1 : 0, transition: 'opacity 0.4s ease' }}>sett</div>
        </div>
        <div style={{ width: EXAMPLE_CARD_WIDTH, flexShrink: 0, pointerEvents: 'none' }}>
          <PlayerCard
            player={opponent}
            color={POT_COLORS[(opponentPot - 1) % POT_COLORS.length]}
            colorDark={POT_COLORS_DARK[(opponentPot - 1) % POT_COLORS_DARK.length]}
            selected={false}
            dimmed={step >= 4}
            index={1}
            potNumber={opponentPot}
            multiplier={1}
            onClick={() => {}}
          />
        </div>
      </div>

      {/* Poengrader — én og én, så summen */}
      <div style={{ maxWidth: 260, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={reveal(5, { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.7)', padding: '0 4px' })}>
          <span>Seier</span>
          <span style={{ fontFamily: SPORT, fontWeight: 900, color: '#fff', fontSize: 15 }}>{EXAMPLE_WIN_PTS}p</span>
        </div>
        <div style={reveal(6, { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.7)', padding: '0 4px' })}>
          <span>Sett vunnet</span>
          <span style={{ fontFamily: SPORT, fontWeight: 900, color: '#fff', fontSize: 15 }}>{EXAMPLE_SET_PTS}p</span>
        </div>
        <div style={reveal(7, { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(243,213,118,0.3)', paddingTop: 8, marginTop: 2, padding: '8px 4px 0' })}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Totalt</span>
          <span
            className={step >= 7 ? 'multiplier-badge' : undefined}
            style={{
              fontFamily: SPORT, fontSize: 18, fontWeight: 900, color: '#f59e0b',
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)',
              borderRadius: 8, padding: '4px 12px',
            }}
          >
            +{EXAMPLE_TOTAL}p
          </span>
        </div>
      </div>
    </div>
  )
}

// Fase 2: «Min side» med laget og poeng → «egne ligaer» → en liga-tabell der
// laget ditt klatrer fra 10. til 3. plass (poengene øker trinnvis, tabellen
// re-sorteres og radene glir på plass via `top`-transition).
const PROGRESS_STEPS = [0, 1300, 3300, 4600, 5700, 6500, 7300, 8100] // steg 0..7
const LEAGUE_RIVALS = [
  { name: 'Team 180', points: 41 },
  { name: 'Bullseye-gjengen', points: 38 },
  { name: 'Triple 20', points: 36 },
  { name: 'Dartmestrene', points: 33 },
  { name: 'Oche-banden', points: 31 },
  { name: 'Nine-darter', points: 29 },
  { name: 'Kasteskjeva', points: 27 },
  { name: 'Tungvekterne', points: 25 },
  { name: 'Bakerste bord', points: 22 },
]
// Laget ditt: 20p = 10. plass, så 26/30/34/37 → 8./6./4./3. plass.
const YOUR_POINTS_BY_STEP = [20, 20, 20, 20, 26, 30, 34, 37]
const LEAGUE_ROW_H = 26

function ProgressPhase() {
  const [step, setStep] = useState(0)
  // «Tilfeldig poeng» per spiller — trekkes ved mount, så eksempelet varierer.
  const [playerPoints, setPlayerPoints] = useState<number[]>(() => EXAMPLE_TEAM.map(() => 4))

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlayerPoints(EXAMPLE_TEAM.map(() => 2 + Math.floor(Math.random() * 8)))
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStep(PROGRESS_STEPS.length - 1)
      return
    }
    const timers = PROGRESS_STEPS.slice(1).map((t, i) => setTimeout(() => setStep(i + 1), t))
    return () => timers.forEach(clearTimeout)
  }, [])

  const reveal = (from: number, extra?: React.CSSProperties): React.CSSProperties => ({
    opacity: step >= from ? 1 : 0,
    transform: step >= from ? 'translateY(0)' : 'translateY(6px)',
    transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
    ...extra,
  })

  const yourPoints = YOUR_POINTS_BY_STEP[step]
  const table = [...LEAGUE_RIVALS.map((r) => ({ ...r, you: false })), { name: 'Laget ditt', points: yourPoints, you: true }]
    .sort((a, b) => b.points - a.points)
  const yourRank = table.findIndex((r) => r.you) + 1

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: SPORT, fontSize: 24, fontWeight: 900, textTransform: 'uppercase', color: '#fff', lineHeight: 1, marginBottom: 14, animation: 'slide-enter 0.6s cubic-bezier(0.22,1,0.36,1) both' }}>
        Følg utviklingen på «Min side»
      </div>

      {/* Laget med poeng per spiller */}
      <div style={reveal(1, { display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 18 })} aria-hidden="true">
        {EXAMPLE_TEAM.map((t, i) => {
          const photo = PLAYER_PHOTOS[t.player.name]
          return (
            <div key={t.player.name} style={{ width: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{
                width: '100%', aspectRatio: '4 / 5', borderRadius: 10, overflow: 'hidden', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1.5px solid ${t.color}`,
                background: `radial-gradient(ellipse 80% 70% at 50% 35%, ${t.color} 0%, ${t.colorDark} 100%)`,
                animationName: step >= 1 ? 'flag-pop' : 'none', animationDuration: '0.45s',
                animationTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)', animationFillMode: 'both', animationDelay: `${i * 70}ms`,
              }}>
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- statisk fil i public/
                  <img src={photo.src} alt="" style={{ position: 'absolute', inset: '6% 4% 0', width: '92%', height: '94%', objectFit: 'contain', objectPosition: 'bottom', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.5))' }} />
                ) : (
                  <Flag iso2={t.player.iso2} size={16} />
                )}
              </div>
              <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.player.name.slice(t.player.name.indexOf(' ') + 1)}
              </span>
              <span style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{playerPoints[i]}p</span>
            </div>
          )
        })}
      </div>

      <div style={reveal(2, { fontFamily: SPORT, fontSize: 20, fontWeight: 900, textTransform: 'uppercase', color: '#fff', lineHeight: 1.1, marginBottom: 12 })}>
        Opprett eller delta i egne ligaer
      </div>

      {/* Liga-tabell: absolutt posisjonerte rader, så re-sortering glir */}
      <div style={reveal(3, {
        position: 'relative', height: table.length * LEAGUE_ROW_H, maxWidth: 300, margin: '0 auto',
        background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12, overflow: 'hidden', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 20px rgba(0,0,0,0.25)',
      })}>
        {table.map((row, i) => (
          <div
            key={row.name}
            style={{
              position: 'absolute', left: 0, right: 0, top: i * LEAGUE_ROW_H, height: LEAGUE_ROW_H,
              display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px',
              background: row.you ? 'rgba(220,38,38,0.22)' : 'transparent',
              boxShadow: row.you ? 'inset 0 0 0 1px rgba(220,38,38,0.6)' : 'none',
              transition: 'top 0.7s cubic-bezier(0.22,1,0.36,1)',
              zIndex: row.you ? 2 : 1,
            }}
          >
            <span style={{ fontFamily: SPORT, fontSize: 12, fontWeight: 900, width: 18, textAlign: 'right', color: row.you ? '#fff' : i === 0 ? '#fbbf24' : 'rgba(255,255,255,0.3)', fontVariantNumeric: 'tabular-nums' }}>
              {i + 1}
            </span>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 11, fontWeight: row.you ? 800 : 500, color: row.you ? '#fff' : 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.name}
            </span>
            <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 900, color: row.you ? '#f59e0b' : 'rgba(255,255,255,0.5)', fontVariantNumeric: 'tabular-nums' }}>
              {row.points}p
            </span>
          </div>
        ))}
      </div>
      <div style={reveal(3, { fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: 8 })}>
        {yourRank}. plass
      </div>
    </div>
  )
}
