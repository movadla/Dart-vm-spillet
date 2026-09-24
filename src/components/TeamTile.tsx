'use client'

import Flag from '@/components/Flag'
import type { Player } from '@/data/pots'
import { PLAYER_PHOTOS } from '@/data/playerPhotos'
import { formatPoints } from '@/lib/format'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

export function lastName(name: string): string {
  const i = name.indexOf(' ')
  return i < 0 ? name : name.slice(i + 1)
}
export function initials(name: string): string {
  const parts = name.split(' ').filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
}

export interface TeamTileProps {
  /** undefined = tom plass (viser pott-nummeret) */
  player?: Player
  potNumber: number
  color: string
  colorDark: string
  /** Etternavn under brikken (brytes på inntil to linjer i stedet for «WOODHO…») */
  label?: boolean
  /** Poeng under navnet (Min side / intro) */
  points?: number
  inProgress?: boolean
  glow?: boolean
  /** flag-pop ved (re)mount — gi ny key utenfra for å trigge på nytt */
  pop?: boolean
  popDelayMs?: number
  /** Usynlig, men tar plass (så layout ikke hopper når den vises) */
  hidden?: boolean
  tileRef?: (el: HTMLDivElement | null) => void
}

/**
 * «Laget ditt»-brikken: spillerfoto på pott-farget bakgrunn. Én komponent for
 * intro-animasjonen, «Min side»-sliden og oppsummeringen, så laget ser likt
 * ut gjennom hele appen.
 */
export default function TeamTile({
  player, potNumber, color, colorDark, label = true, points, inProgress = false, glow = false,
  pop = false, popDelayMs = 0, hidden = false, tileRef,
}: TeamTileProps) {
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
          animationName: pop ? 'flag-pop' : 'none',
          animationDuration: '0.45s',
          animationTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)',
          animationFillMode: 'both',
          animationDelay: `${popDelayMs}ms`,
          transition: 'border-color 0.25s ease, box-shadow 0.4s ease',
        }}
      >
        {player ? (
          photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- statisk fil i public/
            <img src={photo.src} alt="" loading="lazy" decoding="async" style={{ position: 'absolute', inset: '6% 4% 0', width: '92%', height: '94%', objectFit: 'contain', objectPosition: 'bottom', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.5))' }} />
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
        const text = player ? lastName(player.name) : `Nivå ${potNumber}`
        // Lange etternavn («Woodhouse») får ett trinn mindre skrift og
        // tettere sats i stedet for å brytes eller trunkeres.
        const long = text.length > 7
        return (
          <span
            style={{
              fontSize: long ? 10 : 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: long ? '-0.02em' : '0.02em',
              color: filled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
              // Bryt kun ved mellomrom («VAN GERWEN» → to linjer), aldri inne i
              // et ord; fast minhøyde så poeng/etiketter under står på linje.
              textAlign: 'center', lineHeight: 1.15, whiteSpace: 'normal', wordBreak: 'keep-all', overflowWrap: 'normal',
              minHeight: '2.3em', width: '100%',
            }}
          >
            {text}
          </span>
        )
      })()}
      {points != null && (
        <span style={{ fontFamily: SPORT, fontSize: 15, fontWeight: 900, color: '#f59e0b', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {formatPoints(points)}
        </span>
      )}
    </div>
  )
}
