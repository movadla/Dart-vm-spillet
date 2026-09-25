'use client'

import { useEffect, useRef, useState } from 'react'
import { PlayerCard } from '@/components/PlayerCard'
import TeamTile from '@/components/TeamTile'
import { POTS, getPickablePlayers, type Player } from '@/data/pots'
import { POT_COLORS, POT_COLORS_DARK } from '@/config/potColors'
import { usePageVisible } from '@/lib/usePageVisible'
import { SPORT } from '@/config/theme'

// Illustrerer HVORDAN man plukker laget sitt — ikke ekte/anbefalte valg.
// Littler/Price er eksplisitt ønsket som de to første, rolige stegene;
// resten er bare første kandidat i hver pott.
const EXAMPLE_PICKS = ['Luke Littler', 'Gerwyn Price', 'James Wade', 'Wessel Nijman', 'Ross Smith', 'Luke Woodhouse']

const CARD_WIDTH = 104
const SLOT_WIDTH = 54
const SLOT_WIDTH_FINISHED = 66

interface Level {
  potNumber: number
  color: string
  colorDark: string
  candidates: Player[]
  pickIndex: number
}

const LEVELS: Level[] = POTS.map((pot, i) => {
  const candidates = getPickablePlayers(pot)
  const found = candidates.findIndex((p) => p.name === EXAMPLE_PICKS[i])
  return {
    potNumber: pot.potNumber,
    color: POT_COLORS[i % POT_COLORS.length],
    colorDark: POT_COLORS_DARK[i % POT_COLORS_DARK.length],
    candidates,
    pickIndex: found < 0 ? 0 : found,
  }
})

/** Eksempellaget slik det ender opp i animasjonen — deles med de neste
 * intro-fasene (StepSlideshow) så «laget ditt» er det samme hele veien. */
export const EXAMPLE_TEAM = LEVELS.map((l) => ({
  player: l.candidates[l.pickIndex],
  potNumber: l.potNumber,
  color: l.color,
  colorDark: l.colorDark,
}))

type SubPhase = 'revealed' | 'highlighted' | 'flying' | 'hidden'
type Event = { t: number; kind: 'level'; level: number; phase: SubPhase } | { t: number; kind: 'finish' }

// De to første nivåene spilles rolig av med tydelige pauser mellom hvert
// steg (nivåene → kandidatene → valget → flyr inn i laget), resten kjøres
// raskt for å vise at mønsteret bare fortsetter. Alle tider i ms fra start.
const SLOT_STAGGER = 90
const SLOT_START = 150
const FLY_DUR_SLOW = 700
const FLY_DUR_FAST = 420

function buildSchedule(): Event[] {
  const events: Event[] = []
  let t = SLOT_START + LEVELS.length * SLOT_STAGGER + 700
  const PACE = [
    { hold: 1700, pick: 1100, fly: FLY_DUR_SLOW, gap: 850 },
    { hold: 1500, pick: 1000, fly: FLY_DUR_SLOW, gap: 650 },
  ]
  const fast = { hold: 560, pick: 320, fly: FLY_DUR_FAST, gap: 260 }
  for (let i = 0; i < LEVELS.length; i++) {
    const p = PACE[i] ?? fast
    events.push({ t, kind: 'level', level: i, phase: 'revealed' })
    t += p.hold
    events.push({ t, kind: 'level', level: i, phase: 'highlighted' })
    t += p.pick
    events.push({ t, kind: 'level', level: i, phase: 'flying' })
    t += p.fly
    events.push({ t, kind: 'level', level: i, phase: 'hidden' })
    t += p.gap
  }
  events.push({ t: t + 350, kind: 'finish' })
  return events
}

/**
 * Selvspillende demo på intro-slidens første fase: de 6 lag-plassene
 * popper inn øverst, så roterer scenen under gjennom pott 1→6 med de EKTE
 * spillerkortene i miniatyr — kandidatene tones inn, ett lyser opp (samme
 * valgt/dempet-stil som i selve tippe-flyten) og flyr målt inn i sin plass i
 * laget. Til slutt løftes laget fram med glød og «Laget ditt». Spilles av én
 * gang per mount; venter til fanen er synlig; respekterer
 * prefers-reduced-motion ved å hoppe rett til ferdig sluttilstand.
 */
export default function TeamBuildAnimation({ startOnView = false, startDelay = 0, allowSkip = false, onFinished }: {
  /** true = vent til komponenten er skrollet inn i synsfeltet (forsiden). */
  startOnView?: boolean
  /** ms å vente etter mount før noe vises. Alt tar plass fra start, så layouten ikke hopper. */
  startDelay?: number
  /** Trykk/Enter på animasjonen spoler rett til ferdig lag (for dem som har sett den før). */
  allowSkip?: boolean
  onFinished?: () => void
}) {
  const pageVisible = usePageVisible()
  const [armed, setArmed] = useState(!startOnView && startDelay === 0)
  const [landedCount, setLandedCount] = useState(0)
  const [active, setActive] = useState<{ level: number; phase: SubPhase } | null>(null)
  const [finished, setFinished] = useState(false)
  const [fly, setFly] = useState<{ dx: number; dy: number; scale: number } | null>(null)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])
  const chosenRef = useRef<HTMLDivElement | null>(null)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const onFinishedRef = useRef(onFinished)
  useEffect(() => { onFinishedRef.current = onFinished })

  const started = armed && pageVisible

  useEffect(() => {
    if (armed || startOnView || startDelay === 0) return
    const t = setTimeout(() => setArmed(true), startDelay)
    return () => clearTimeout(t)
  }, [armed, startOnView, startDelay])

  useEffect(() => {
    if (armed || !startOnView || !rootRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setArmed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(rootRef.current)
    return () => observer.disconnect()
  }, [armed, startOnView])

  useEffect(() => {
    if (!started) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLandedCount(LEVELS.length)
      setFinished(true)
      onFinishedRef.current?.()
      return
    }
    timeoutsRef.current = buildSchedule().map((ev) =>
      setTimeout(() => {
        if (ev.kind === 'finish') { setFinished(true); onFinishedRef.current?.(); return }
        if (ev.phase === 'hidden') {
          setLandedCount(ev.level + 1)
          setActive(null)
          setFly(null)
        } else {
          setActive({ level: ev.level, phase: ev.phase })
        }
      }, ev.t)
    )
    return () => { timeoutsRef.current.forEach(clearTimeout) }
  }, [started])

  // Målt flytur: fra det valgte kortets senter til plassens senter, skalert
  // ned til plassens bredde — lander riktig uansett skjermbredde.
  useEffect(() => {
    if (active?.phase !== 'flying') return
    const card = chosenRef.current
    const slot = slotRefs.current[active.level]
    if (!card || !slot) return
    const c = card.getBoundingClientRect()
    const s = slot.getBoundingClientRect()
    setFly({
      dx: s.left + s.width / 2 - (c.left + c.width / 2),
      dy: s.top + s.height / 2 - (c.top + c.height / 2),
      scale: s.width / c.width,
    })
  }, [active])

  const activeLevel = active ? LEVELS[active.level] : null
  const activePhase = active?.phase ?? 'hidden'
  const flyDur = active && active.level < 2 ? FLY_DUR_SLOW : FLY_DUR_FAST

  function skip() {
    if (!allowSkip || !started || finished) return
    timeoutsRef.current.forEach(clearTimeout)
    setActive(null)
    setFly(null)
    setLandedCount(LEVELS.length)
    setFinished(true)
    onFinishedRef.current?.()
  }

  return (
    // Ytre wrapper tar trykk/Enter for spoling — det indre treet er inert
    // (kortene er ekte <button>-er som ikke skal være nåbare i demoen).
    <div
      role={allowSkip ? 'button' : undefined}
      tabIndex={allowSkip && started && !finished ? 0 : -1}
      aria-label={allowSkip ? 'Spol fram til ferdig lag' : undefined}
      onClick={skip}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); skip() } }}
      style={{ cursor: allowSkip && started && !finished ? 'pointer' : 'default', outline: 'none' }}
    >
    <div ref={rootRef} className="card-mini" inert>
      {/* Laget — 6 plasser som fylles etter hvert som spillere landes */}
      <div
        style={{
          display: 'flex', gap: 6, justifyContent: 'center', margin: '0 auto 20px', padding: '8px 10px',
          width: 'fit-content', maxWidth: '100%',
          borderRadius: 14,
          transform: finished ? 'scale(1.08)' : 'scale(1)',
          background: finished ? 'linear-gradient(180deg, rgba(243,213,118,0.10) 0%, rgba(243,213,118,0.03) 100%)' : 'transparent',
          boxShadow: finished ? '0 0 0 1px rgba(243,213,118,0.4), 0 12px 40px rgba(243,213,118,0.2)' : 'none',
          animationName: finished ? 'team-glow-pulse' : 'none',
          animationDuration: '2.8s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: '0.8s',
          transition: 'transform 0.7s cubic-bezier(0.22,1,0.36,1), box-shadow 0.7s ease, background 0.7s ease',
        }}
      >
        {LEVELS.map((lvl, i) => {
          const landed = i < landedCount
          const inProgress = !landed && active?.level === i
          return (
            <div
              key={lvl.potNumber}
              style={{
                width: finished ? SLOT_WIDTH_FINISHED : SLOT_WIDTH, flexShrink: 1, minWidth: 0,
                transition: 'width 0.7s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              {/* key-bytte ved landing → brikken popper på nytt */}
              <TeamTile
                key={landed ? 'landed' : 'empty'}
                player={landed ? lvl.candidates[lvl.pickIndex] : undefined}
                potNumber={lvl.potNumber}
                color={lvl.color}
                colorDark={lvl.colorDark}
                inProgress={inProgress}
                glow={finished}
                pop={started}
                popDelayMs={landed ? 0 : SLOT_START + i * SLOT_STAGGER}
                hidden={!started}
                tileRef={(el) => { slotRefs.current[i] = el }}
              />
            </div>
          )
        })}
      </div>

      {/* Scenen — de tre ekte kortene for nivået som spilles av nå, eller
          «Laget ditt» når alt er på plass */}
      {/* Scenen krymper når finalen vises — ellers står det igjen ~120 px tom
          plass under «Laget ditt» (kortene som ikke lenger er der). */}
      <div style={{ position: 'relative', height: finished ? 64 : 186, zIndex: 2, transition: 'height 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
        {activeLevel && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'flex-start', paddingTop: 4 }}>
            {activeLevel.candidates.map((c, ci) => {
              const isPick = ci === activeLevel.pickIndex
              const flying = isPick && activePhase === 'flying'
              const chosen = isPick && activePhase !== 'revealed'
              const fadingOut = !isPick && activePhase === 'flying'
              const transform = flying && fly ? `translate(${fly.dx}px, ${fly.dy}px) scale(${fly.scale})` : 'none'
              return (
                <div
                  key={c.name}
                  ref={isPick ? chosenRef : undefined}
                  style={{
                    width: CARD_WIDTH, flexShrink: 0, pointerEvents: 'none',
                    opacity: fadingOut || (flying && fly) ? 0 : 1,
                    transform,
                    zIndex: isPick ? 3 : 1, position: 'relative',
                    // Kortet holder seg synlig nesten hele flyturen og forsvinner
                    // først idet plassen popper inn — så øyet får følge det fram.
                    transition: flying
                      ? `transform ${flyDur}ms cubic-bezier(0.4,0,0.2,1), opacity 160ms ease-in ${flyDur - 160}ms`
                      : 'opacity 0.3s ease',
                  }}
                >
                  <PlayerCard
                    player={c}
                    color={activeLevel.color}
                    colorDark={activeLevel.colorDark}
                    selected={chosen}
                    dimmed={!isPick && activePhase !== 'revealed'}
                    index={ci}
                    potNumber={activeLevel.potNumber}
                    onClick={() => {}}
                  />
                </div>
              )
            })}
          </div>
        )}

        {finished && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 22, animation: 'slide-enter 0.6s cubic-bezier(0.22,1,0.36,1) both' }}>
            <div
              style={{
                fontFamily: SPORT, fontWeight: 900, fontSize: 28, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1,
                background: 'linear-gradient(180deg, #fff3d0 0%, #f3d576 45%, #c99a2e 100%)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 8px rgba(243,213,118,0.35))',
              }}
            >
              Laget ditt
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
