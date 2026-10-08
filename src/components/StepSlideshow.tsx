'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { POTS } from '@/data/pots'
import { POT_COLORS, POT_COLORS_DARK } from '@/config/potColors'
import { PlayerCard } from '@/components/PlayerCard'
import TeamTile, { lastName } from '@/components/TeamTile'
import { finishShortLabel } from '@/lib/finish'
import TeamBuildAnimation, { EXAMPLE_TEAM } from '@/components/TeamBuildAnimation'
import { usePageVisible } from '@/lib/usePageVisible'
import { SPORT, CARD_GRADIENT } from '@/config/theme'
import { useLocale } from '@/lib/i18n/useLocale'

// Én typografisk skala for alle intro-slidene: tittel / undertekst / etikett.
// Sport-skriften brukes kun til titler, navn og tall — aldri til setninger.
const H1: React.CSSProperties = { fontFamily: SPORT, fontSize: 26, fontWeight: 900, textTransform: 'uppercase', color: '#fff', lineHeight: 1 }
const SUB: React.CSSProperties = { fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }
const LABEL: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }
const REDUCED_MOTION = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface Props {
  onStart?: () => void
  onCtaReady?: () => void
  onSlide?: (slide: number) => void
  ctaHref?: string
  ctaLabel?: string
}

// ── Eksempeldata til intro-sekvensen (illustrerer spillmekanikken, ikke et ekte resultat) ──
// De to største favorittene (pott 1) — IKKE bestemte navn, så introen ikke
// går i stykker når spillerfeltet byttes ut.
const EXAMPLE_CHAMPION = { potNumber: 1, player: POTS[0].players[0] }
const EXAMPLE_FINALIST = { potNumber: 1, player: POTS[0].players[1] }
const EXAMPLE_SCORE = [16, 11] as const
const EXAMPLE_HOLDERS = 3

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
 * Manuelt styrt, tre-fase intro-sekvens: fase 0 = lagbygging-animasjonen,
 * fase 1 = eksempelkamp med poeng, fase 2 = «Min side»/ligaer med CTA
 * («Velg spillere») nederst i stedet for «Neste». Bruker blar med knapp,
 * sveip eller piltaster (ingen auto-advance). Brukes som steg 0 i
 * tippe-flyten (tipp/page.tsx).
 */
export default function StepSlideshow({ onStart, onCtaReady, onSlide, ctaHref = '/tipp', ctaLabel }: Props) {
  const { dict } = useLocale()
  const resolvedCtaLabel = ctaLabel ?? dict.tipp.stepSlideshow.ctaLabel
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState(0)
  // Retning på siste fasebytte → innholdet glir inn fra riktig side.
  const [dir, setDir] = useState<1 | -1>(1)
  const [introDone, setIntroDone] = useState(false)

  const onSlideRef = useRef(onSlide)
  const onCtaReadyRef = useRef(onCtaReady)
  useEffect(() => {
    onSlideRef.current = onSlide
    onCtaReadyRef.current = onCtaReady
  })

  // Touch-sveip mellom fasene. Nesten-vertikale bevegelser ignoreres med
  // vilje, slik at vanlig sideskrolling ikke feiltolkes som sveip.
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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight' && phase < LAST_PHASE) { e.preventDefault(); goToPhase(phase + 1) }
    else if (e.key === 'ArrowLeft' && phase > 0) { e.preventDefault(); goToPhase(phase - 1) }
  }

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    onSlideRef.current?.(0)
  }, [])

  function goToPhase(next: number) {
    setDir(next > phase ? 1 : -1)
    setPhase(next)
    onSlideRef.current?.(next)
    if (next === LAST_PHASE) onCtaReadyRef.current?.()
  }

  const compactHeader = phase > 0

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Merkevare-header — full på første slide, komprimert på de neste så
          innholdet får plass over folden */}
      <div style={{ textAlign: 'center', marginBottom: compactHeader ? 12 : 22, transition: 'margin 0.3s ease' }}>
        {/* PDC-linjen kun på første slide — på slide 2–3 er logoen alene nok */}
        {!compactHeader && (
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
            — PDC Grand Slam of Darts —
          </div>
        )}
        <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: compactHeader ? 'clamp(16px, 5vw, 22px)' : 'clamp(22px, 6.5vw, 36px)', letterSpacing: '-1px', lineHeight: 1, transition: 'font-size 0.3s ease' }}>
          <span style={{ color: 'rgba(255,255,255,0.38)' }}>GRAND SLAM-</span>
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

      {/* Faseprikker som ekte tabs: klikkbare, piltast-navigerbare, med
          28 px trykkflate rundt selve streken */}
      <div role="tablist" aria-label={dict.tipp.stepSlideshow.tablistAriaLabel} style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            role="tab"
            type="button"
            aria-selected={i === phase}
            aria-label={dict.tipp.stepSlideshow.slideAriaLabel(i + 1)}
            aria-controls="step-slideshow-panel"
            tabIndex={i === phase ? 0 : -1}
            onClick={() => goToPhase(i)}
            onKeyDown={handleKeyDown}
            style={{ padding: '11px 6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <span style={{
              position: 'relative', overflow: 'hidden', display: 'block',
              width: i === phase ? 24 : 8,
              height: 6,
              borderRadius: 3,
              background: i <= phase ? '#dc2626' : 'rgba(255,255,255,0.28)',
              transition: 'width 0.35s cubic-bezier(0.22,1,0.36,1), background 0.35s ease',
            }}>
              {i === phase && (
                <span key={phase} style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.35, animation: 'dot-fill 0.35s ease-out both' }} />
              )}
            </span>
          </button>
        ))}
      </div>

      <div
        id="step-slideshow-panel"
        role="tabpanel"
        aria-live="polite"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ minHeight: 268, marginBottom: 20 }}
      >
        {/* key på fase → innholdet remonteres og glir inn fra siden man blar mot */}
        <div key={phase} style={{ animation: `${dir > 0 ? 'slide-enter-left' : 'slide-enter-right'} 0.35s cubic-bezier(0.22,1,0.36,1) both` }}>
          {phase === 0 && <IntroPhase onFinished={() => setIntroDone(true)} />}
          {phase === 1 && <ExamplePhase />}
          {phase === 2 && <ProgressPhase />}
        </div>
      </div>

      {/* Navigasjon — på siste fase erstattes «Neste» av selve CTA-en, men den
          lille Tilbake-knappen beholdes. Neste pulserer diskret når
          lagbygging-animasjonen er ferdig. */}
      <div style={{ display: 'flex', gap: 10 }}>
        {phase > 0 && (
          <button
            onClick={() => goToPhase(phase - 1)}
            style={{
              flexShrink: 0, padding: '14px 18px', background: 'transparent',
              color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 14, fontFamily: SPORT, fontSize: 14, fontWeight: 800,
              letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            {dict.tipp.stepSlideshow.back}
          </button>
        )}
        {phase < LAST_PHASE ? (
          <button
            onClick={() => goToPhase(phase + 1)}
            className={introDone && phase === 0 ? 'btn-hover cta-pulse' : 'btn-hover'}
            style={{
              flex: 1, padding: '14px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)',
              color: '#fff', fontFamily: SPORT, fontSize: 15, fontWeight: 900,
              letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 14,
              border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(220,38,38,0.35)',
            }}
          >
            {dict.tipp.stepSlideshow.next}
          </button>
        ) : onStart ? (
          <button onClick={onStart} className="cta-pulse" style={CTA_STYLE}>
            {resolvedCtaLabel}
          </button>
        ) : (
          <Link href={ctaHref} className="cta-btn cta-pulse" style={{ ...CTA_STYLE, textAlign: 'center', textDecoration: 'none' }}>
            {resolvedCtaLabel}
          </Link>
        )}
      </div>
    </div>
  )
}

/** Tidsstyrt steg-teller: venter til fanen er synlig, hopper til slutt ved
 * prefers-reduced-motion, og rydder timerne ved unmount. */
function useTimedSteps(times: number[]): number {
  const pageVisible = usePageVisible()
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (!pageVisible) return
    if (REDUCED_MOTION()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(times.length - 1)
      return
    }
    const timers = times.slice(1).map((t, i) => setTimeout(() => setStep(i + 1), t))
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageVisible])
  return step
}

function reveal(step: number, from: number, extra?: React.CSSProperties): React.CSSProperties {
  return {
    opacity: step >= from ? 1 : 0,
    transform: step >= from ? 'translateY(0)' : 'translateY(6px)',
    transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
    ...extra,
  }
}

// Fase 0 i tre trinn, så folk rekker å lese: overskrift → undertekst →
// selve animasjonen (som tar plass fra start, så ingenting hopper).
// MIDLERTIDIG (2026-09-27): alle tre STEPS-arrayene er skalert ×0.75
// (25 % raskere) etter tilbakemelding om at introen gikk litt tregt.
const INTRO_STEPS = [0, 975, 2025]

function IntroPhase({ onFinished }: { onFinished: () => void }) {
  const { dict } = useLocale()
  const step = useTimedSteps(INTRO_STEPS)
  const [done, setDone] = useState(false)
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...H1, marginBottom: 10 }}>{dict.tipp.stepSlideshow.intro.title}</div>
      <div style={reveal(step, 1, { ...SUB, marginBottom: 22 })}>
        {dict.tipp.stepSlideshow.intro.subtitle}
      </div>
      <TeamBuildAnimation startDelay={INTRO_STEPS[2]} allowSkip onFinished={() => { setDone(true); onFinished() }} />
      {/* Spol-hint for dem som har sett animasjonen før — forsvinner når den er ferdig */}
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2, opacity: step >= 2 && !done ? 1 : 0, transition: 'opacity 0.4s ease' }}>
        {dict.tipp.stepSlideshow.intro.skipHint}
      </div>
    </div>
  )
}

// Fase 1: tekst → tekst → finalen → kampoppsett med ekte kort → resultat →
// vinneren → antall som har ham → din andel av premien.
const EXAMPLE_STEPS = [0, 975, 2025, 2550, 4050, 4950, 5475, 6075]
const EXAMPLE_CARD_WIDTH = 92

function ExamplePhase() {
  const { dict } = useLocale()
  const step = useTimedSteps(EXAMPLE_STEPS)
  const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: 'rgba(255,255,255,0.75)', padding: '0 4px' }
  const valueStyle: React.CSSProperties = { fontFamily: SPORT, fontWeight: 900, color: '#fff', fontSize: 16, fontVariantNumeric: 'tabular-nums' }
  const { champion: c, finalist: f } = { champion: EXAMPLE_CHAMPION, finalist: EXAMPLE_FINALIST }

  return (
    <div className="card-mini" style={{ textAlign: 'center' }}>
      <div style={{ ...H1, marginBottom: 10 }}>{dict.tipp.stepSlideshow.example.title}</div>
      <div style={reveal(step, 1, { ...SUB, marginBottom: 18 })}>
        {dict.tipp.stepSlideshow.example.subtitle}
      </div>

      <div style={reveal(step, 2, { marginBottom: 10 })}>
        {/* «Eksempel» over runden, så ingen tror det er en ekte kamp */}
        <div style={{ ...LABEL, fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>{dict.tipp.stepSlideshow.example.exampleLabel}</div>
        <div style={{ ...LABEL, color: '#f3d576' }}>{dict.players.stages.final}</div>
      </div>

      {/* Finalen: favoritten mot en annen favoritt — «VS» byttes ut med resultatet */}
      <div style={reveal(step, 3, { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 14 })} inert>
        <div style={{ width: EXAMPLE_CARD_WIDTH, flexShrink: 0, pointerEvents: 'none' }}>
          <PlayerCard
            player={c.player}
            color={POT_COLORS[(c.potNumber - 1) % POT_COLORS.length]}
            colorDark={POT_COLORS_DARK[(c.potNumber - 1) % POT_COLORS_DARK.length]}
            selected={step >= 4}
            index={0}
            potNumber={c.potNumber}
            onClick={() => {}}
          />
        </div>
        <div style={{ width: 80, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {step >= 4 ? (
            <div key="score" style={{ fontFamily: SPORT, fontSize: 26, whiteSpace: 'nowrap', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums', animation: 'flag-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>
              {EXAMPLE_SCORE[0]}–{EXAMPLE_SCORE[1]}
            </div>
          ) : (
            <div key="vs" style={{ fontFamily: SPORT, fontSize: 18, fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>{dict.tipp.stepSlideshow.example.vs}</div>
          )}
          <div style={{ ...LABEL, fontSize: 11, opacity: step >= 4 ? 1 : 0, transition: 'opacity 0.4s ease' }}>{dict.tipp.stepSlideshow.example.legsUnit}</div>
        </div>
        <div style={{ width: EXAMPLE_CARD_WIDTH, flexShrink: 0, pointerEvents: 'none' }}>
          <PlayerCard
            player={f.player}
            color={POT_COLORS[(f.potNumber - 1) % POT_COLORS.length]}
            colorDark={POT_COLORS_DARK[(f.potNumber - 1) % POT_COLORS_DARK.length]}
            selected={false}
            dimmed={step >= 4}
            index={1}
            potNumber={f.potNumber}
            onClick={() => {}}
          />
        </div>
      </div>

      {/* Én og én rad: vinneren → hvor mange som har ham → din andel */}
      <div style={{ maxWidth: 260, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={reveal(step, 5, rowStyle)}>
          <span>{dict.tipp.stepSlideshow.example.champion}</span>
          <span style={valueStyle}>{lastName(c.player.name)}</span>
        </div>
        <div style={reveal(step, 6, rowStyle)}>
          <span>{dict.tipp.stepSlideshow.example.holders}</span>
          <span style={valueStyle}>{EXAMPLE_HOLDERS}</span>
        </div>
        <div style={reveal(step, 7, { ...rowStyle, borderTop: '1px solid rgba(243,213,118,0.3)', marginTop: 2, padding: '8px 4px 0' })}>
          <span style={LABEL}>{dict.tipp.stepSlideshow.example.yourShare}</span>
          <span
            className={step >= 7 ? 'multiplier-badge' : undefined}
            style={{
              fontFamily: SPORT, fontSize: 18, fontWeight: 900, color: '#f59e0b', fontVariantNumeric: 'tabular-nums',
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)',
              borderRadius: 8, padding: '4px 12px',
            }}
          >
            1/{EXAMPLE_HOLDERS}
          </span>
        </div>
      </div>
    </div>
  )
}

// Fase 2: «Min side» — laget ditt, der spillerne faller fra én etter én og
// den siste vinner → en liga-tabell der du klatrer til topps. Nivåene er
// samme modell som leaderboardet (src/lib/prize.ts): 1 = gruppespill …
// 5 = finalist, 6 = turneringsvinner.
const PROGRESS_STEPS = [0, 975, 2475, 3450, 4275, 4875, 5475, 6075]
// Rivalenes nivå, indeksmatchet med dict.tipp.stepSlideshow.progress.rivals
// (navnene er språkavhengig eksempeldata, nivåene er ikke).
const LEAGUE_RIVAL_LEVELS = [4, 3, 3, 2, 2, 1, 1, 1, 1]
// Ditt beste nivå per steg: starter i gruppespillet og ender som mester.
const YOUR_LEVEL_BY_STEP = [1, 1, 1, 2, 3, 4, 6, 6]
// Hvilke av de fire brikkene som er «ute» ved hvert steg (indeks → fra steg).
const OUT_FROM_STEP = [3, 4, 5, Infinity]
const LEAGUE_ROW_H = 22

function ProgressPhase() {
  const { dict } = useLocale()
  const step = useTimedSteps(PROGRESS_STEPS)
  const leagueRivals = dict.tipp.stepSlideshow.progress.rivals.map((name, i) => ({ name, level: LEAGUE_RIVAL_LEVELS[i] }))

  const yourLevel = YOUR_LEVEL_BY_STEP[step]
  const table = [...leagueRivals.map((r) => ({ ...r, you: false })), { name: dict.common.yourTeam, level: yourLevel, you: true }]
    .sort((a, b) => b.level - a.level || Number(a.you) - Number(b.you))
  const yourRank = 1 + table.filter((r) => r.level > yourLevel).length

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...H1, marginBottom: 14 }}>{dict.tipp.stepSlideshow.progress.title}</div>

      {/* Laget ditt — spillerne dempes etter hvert som de er ute */}
      <div style={reveal(step, 1, { display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 })} inert>
        {EXAMPLE_TEAM.map((t, i) => (
          <div key={t.player.name} style={{ width: 52 }}>
            <TeamTile player={t.player} potNumber={t.potNumber} color={t.color} colorDark={t.colorDark} dimmed={step >= OUT_FROM_STEP[i]} glow={step >= 6 && i === EXAMPLE_TEAM.length - 1} pop={step >= 1} popDelayMs={i * 70} />
          </div>
        ))}
      </div>

      <div style={reveal(step, 2, { ...H1, fontSize: 22, marginBottom: 12 })}>
        {dict.tipp.stepSlideshow.progress.leagues}
      </div>

      {/* Liga-tabell: absolutt posisjonerte rader, så re-sortering glir */}
      <div style={reveal(step, 3, {
        position: 'relative', height: table.length * LEAGUE_ROW_H, maxWidth: 300, margin: '0 auto',
        background: CARD_GRADIENT, border: '1px solid rgba(255,255,255,0.1)',
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
            <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 900, width: 18, textAlign: 'right', color: i < 3 ? '#fbbf24' : row.you ? '#fff' : 'rgba(255,255,255,0.45)', fontVariantNumeric: 'tabular-nums' }}>
              {1 + table.filter((r) => r.level > row.level).length}
            </span>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 12, fontWeight: row.you ? 800 : 500, color: row.you ? '#fff' : 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.name}
            </span>
            <span style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, color: row.you ? '#f59e0b' : 'rgba(255,255,255,0.6)' }}>
              {finishShortLabel(row.level, dict)}
            </span>
          </div>
        ))}
      </div>
      <div style={reveal(step, 3, { ...LABEL, marginTop: 8 })}>
        {dict.tipp.stepSlideshow.progress.rank(yourRank)}
      </div>
    </div>
  )
}
