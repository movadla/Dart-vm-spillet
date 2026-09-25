'use client'

import Flag from '@/components/Flag'
import type { Player } from '@/data/pots'
import { PLAYER_PHOTOS } from '@/data/playerPhotos'
import { formatPoints } from '@/lib/format'
import { SPORT } from '@/config/theme'
import { useLocale } from '@/lib/i18n/useLocale'
// Re-eksportert for bakoverkompatibilitet med eksisterende importer — men en
// server-komponent MÅ importere fra '@/lib/playerName' direkte (se den filen).
export { lastName, initials } from '@/lib/playerName'
import { lastName, initials } from '@/lib/playerName'

export interface TeamTileProps {
  /** undefined = tom plass (viser pott-nummeret) */
  player?: Player
  potNumber: number
  color: string
  colorDark: string
  /** Etternavn under brikken */
  label?: boolean
  /** Poeng under navnet (Min side / intro) */
  points?: number
  inProgress?: boolean
  glow?: boolean
  /** Slått ut: selve brikken dempes, men navn og poeng står klart */
  dimmed?: boolean
  /** flag-pop ved (re)mount — gi ny key utenfra for å trigge på nytt */
  pop?: boolean
  popDelayMs?: number
  /** Usynlig, men tar plass (så layout ikke hopper når den vises) */
  hidden?: boolean
  tileRef?: (el: HTMLDivElement | null) => void
}

/**
 * «Laget ditt»-brikken: spillerfoto på pott-farget bakgrunn. Én komponent for
 * intro-animasjonen, «Min side»-sliden, oppsummeringen og registreringen, så
 * laget ser likt ut gjennom hele appen.
 */
export default function TeamTile({
  player, potNumber, color, colorDark, label = true, points, inProgress = false, glow = false, dimmed = false,
  pop = false, popDelayMs = 0, hidden = false, tileRef,
}: TeamTileProps) {
  const { locale, dict } = useLocale()
  const photo = player ? PLAYER_PHOTOS[player.name] : undefined
  const filled = !!player
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: hidden ? 0 : 1, transition: 'opacity 0.4s ease' }}>
      <div
        ref={tileRef}
        style={{
          width: '100%', aspectRatio: '4 / 5', borderRadius: 10, overflow: 'hidden', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1.5px solid ${filled || inProgress ? color : 'rgba(255,255,255,0.18)'}`,
          background: filled ? `radial-gradient(ellipse 80% 70% at 50% 35%, ${color} 0%, ${colorDark} 100%)` : 'rgba(255,255,255,0.03)',
          boxShadow: inProgress ? `0 0 0 3px ${color}33` : glow && filled ? `0 0 12px ${color}80` : 'none',
          opacity: dimmed ? 0.45 : 1,
          filter: dimmed ? 'grayscale(0.8)' : 'none',
          animationName: pop ? 'flag-pop' : 'none',
          animationDuration: '0.45s',
          animationTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)',
          animationFillMode: 'both',
          animationDelay: `${popDelayMs}ms`,
          transition: 'border-color 0.25s ease, box-shadow 0.4s ease, opacity 0.3s ease',
        }}
      >
        {player ? (
          photo ? (
            // Brikkene her er alltid umiddelbart synlige (laget ditt, aldri
            // lenger nede i en scrollbar liste) — «lazy» ga bare en unødvendig
            // forsinkelse siden nettleseren må gjøre en egen vurdering før den
            // henter bildet.
            // eslint-disable-next-line @next/next/no-img-element -- statisk fil i public/
            <img src={photo.src} alt="" fetchPriority="high" decoding="async" style={{ position: 'absolute', inset: '6% 4% 0', width: '92%', height: '94%', objectFit: 'contain', objectPosition: 'bottom', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.5))' }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <Flag iso2={player.iso2} size={16} />
              <span style={{ fontFamily: SPORT, fontWeight: 900, fontSize: 13, color: '#f3d576', lineHeight: 1 }}>{initials(player.name)}</span>
            </div>
          )
        ) : (
          <span style={{ fontFamily: SPORT, fontWeight: 900, fontSize: 15, color: inProgress ? color : 'rgba(255,255,255,0.4)', transition: 'color 0.25s ease' }}>
            {potNumber}
          </span>
        )}
      </div>
      {label && (() => {
        const text = player ? lastName(player.name) : dict.common.teamTile.level(potNumber)
        // Lange ETT-ORDS etternavn («Woodhouse», «Humphries», «Wattimena») får
        // aldri brytes eller renne inn i nabobrikken: de settes på én linje og
        // kondenseres (scaleX) i stedet — som navnetrekk på en sportsgrafikk.
        // Navn med mellomrom («Van Gerwen») brytes ved mellomrommet som før.
        const long = text.length > 7
        const condensed = long && !text.includes(' ')
        return (
          <span
            style={{
              display: 'flex', justifyContent: 'center', width: '100%', minHeight: '2.3em',
              fontSize: long ? 10 : 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: long ? '-0.02em' : '0.02em',
              color: filled ? (dimmed ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.85)') : 'rgba(255,255,255,0.4)',
              textAlign: 'center', lineHeight: 1.15,
            }}
          >
            <span style={condensed
              ? { whiteSpace: 'nowrap', transform: 'scaleX(0.82)', transformOrigin: '50% 50%', flexShrink: 0 }
              : { whiteSpace: 'normal', wordBreak: 'keep-all', overflowWrap: 'normal' }}>
              {text}
            </span>
          </span>
        )
      })()}
      {points != null && (
        <span style={{ fontFamily: SPORT, fontSize: 15, fontWeight: 900, color: '#f59e0b', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {formatPoints(points, locale)}
        </span>
      )}
    </div>
  )
}
