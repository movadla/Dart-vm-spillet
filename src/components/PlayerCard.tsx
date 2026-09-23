'use client'

import Flag from '@/components/Flag'
import type { Player } from '@/data/pots'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'
const GOLD = '#f3d576'

// Skjold-/vimpel-formen fra referansekortet («Ultimate Darts»). To ting er avgjørende
// for at den skal se riktig ut UANSETT hvor mye innhold kortet har (kort/langt navn,
// 1 eller 2 linjer):
// 1. Toppen (hakket) er ankret i faste PX fra toppen — det innholdet varierer aldri.
// 2. "Vingene" og spissen er ankret i faste PX fra BUNNEN (calc(100% - Npx)), ikke i
//    prosent av total høyde. Slik holder statistikk-raden og bunn-signaturen seg alltid
//    innenfor den brede sonen rett over spissen, uansett om navnet over vokser til 2
//    linjer — det var nettopp en variabel prosent-basert form som klippet bort hele
//    bunnen av kortet for lengre spillernavn i forrige versjon.
// Hvert "skarpe" hjørne er delt i 2–3 punkter tett sammen for å fake en avrundet kant
// (clip-path polygon støtter ikke ekte kurver/border-radius per punkt).
const SHIELD_CLIP = `polygon(
  42% 4px, 46% 10px, 50% 16px, 54% 10px, 58% 4px,
  92% 4px, 94% 8px, 95% 14px,
  95% calc(100% - 75px),
  100% calc(100% - 55px),
  84% calc(100% - 42px),
  56% calc(100% - 6px), 50% 100%, 44% calc(100% - 6px),
  16% calc(100% - 42px),
  0% calc(100% - 55px),
  5% calc(100% - 75px),
  5% 14px, 6% 8px, 8% 4px
)`

const FRAME_GOLD = 'linear-gradient(135deg, #fff7d6 0%, #f3d576 12%, #b8860b 32%, #8a660a 50%, #b8860b 68%, #f3d576 88%, #fff7d6 100%)'

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '3px 2px' }}>
      <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(243,213,118,0.65)' }}>{label}</div>
      <div style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, color: GOLD, lineHeight: 1.35 }}>{value}</div>
    </div>
  )
}

export function PlayerCard({
  player, color, selected, potName, onClick,
}: {
  player: Player
  color: string
  colorDark: string
  selected: boolean
  potName: string
  onClick: () => void
}) {
  const topLabel = player.seedNumber ? 'SEED' : 'PDC-RANKING'
  const topNumber = player.seedNumber ?? player.pdcRanking

  return (
    <button
      role="radio"
      aria-checked={selected}
      aria-label={player.name}
      onClick={onClick}
      style={{
        display: 'block', width: 'min(300px, 100%)', margin: '0 auto',
        border: 'none', background: 'none', padding: 0, cursor: 'pointer',
        filter: selected ? `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 3px #fff)` : 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))',
        transition: 'filter 0.15s',
      }}
    >
      {/* Ytre gull-ramme */}
      <div style={{ clipPath: SHIELD_CLIP, background: FRAME_GOLD, padding: 6 }}>
        {/* Tynn mørk pinstripe mellom gull-rammen og innholdet, som i referansen */}
        <div style={{ clipPath: SHIELD_CLIP, background: '#0a0c14', padding: 2 }}>
          <div style={{
            clipPath: SHIELD_CLIP,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            padding: '9% 13% 6%',
            color: '#fff',
            textAlign: 'center',
            overflow: 'hidden',
            // Nær-svart/marineblå bunnfarge som i referansen, med en diagonal
            // pott-fargede lysstripe over — potten gir aksentfargen, ikke hele
            // kortkroppen, for et roligere/mer premium uttrykk.
            background: `
              linear-gradient(100deg, ${color}55 0%, transparent 26%),
              radial-gradient(120% 90% at 15% 0%, #1a2036 0%, transparent 55%),
              radial-gradient(90% 70% at 90% 100%, #10131f 0%, transparent 60%),
              linear-gradient(165deg, #0d1120 0%, #05070d 55%, #030408 100%)
            `,
          }}>
            {/* Frost/marmor-tekstur — flere svake, tilfeldig plasserte radiale
                gradienter som bryter opp den ellers helt flate bakgrunnen */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.5, mixBlendMode: 'screen', pointerEvents: 'none',
              background: `
                radial-gradient(3px 40px at 20% 30%, rgba(255,255,255,0.08), transparent),
                radial-gradient(3px 60px at 70% 15%, rgba(255,255,255,0.06), transparent),
                radial-gradient(2px 50px at 85% 55%, rgba(255,255,255,0.07), transparent),
                radial-gradient(2px 35px at 35% 70%, rgba(255,255,255,0.05), transparent)
              `,
            }} />

            {/* Valgt-merke */}
            {selected && (
              <div style={{
                position: 'absolute', top: 10, right: 14, zIndex: 3,
                width: 24, height: 24, borderRadius: '50%', background: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #fff', boxShadow: '0 0 8px rgba(0,0,0,0.5)',
              }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', lineHeight: 1 }}>✓</span>
              </div>
            )}

            {/* "Foto"-felt: ingen lisensierte spillerbilder tilgjengelig ennå.
                Stort, mykt silhuett-merke (flagget som skjold-emblem) i stedet for et
                tomt hjørne-vannmerke, så feltet ikke oppleves som et tomt hull. */}
            <div style={{ position: 'relative', height: 92, marginBottom: 10, textAlign: 'left', zIndex: 1 }}>
              <div style={{
                position: 'absolute', right: 4, top: -6, width: 88, height: 88,
                borderRadius: '50%', overflow: 'hidden',
                background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
                border: `1px solid ${GOLD}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Flag iso2={player.iso2} size={56} />
              </div>
              <div style={{ position: 'relative', zIndex: 1, paddingTop: 4 }}>
                <div style={{ fontFamily: SPORT, fontSize: 34, fontWeight: 900, color: GOLD, lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                  {topNumber}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(243,213,118,0.85)', marginTop: 3 }}>{topLabel}</div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.55)', marginTop: 5, textTransform: 'uppercase' }}>
                  {player.nationality}
                </div>
              </div>
            </div>

            {/* Navn */}
            <div style={{
              fontFamily: SPORT, fontSize: 23, fontWeight: 900, textTransform: 'uppercase',
              color: GOLD, lineHeight: 1.15, letterSpacing: '0.01em', zIndex: 1,
              textShadow: '0 2px 5px rgba(0,0,0,0.5)',
            }}>
              {player.name}
            </div>
            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: '9px 0', zIndex: 1 }} />

            {/* Pott-tilhørighet (erstatter "walk-on song"-raden — vi har ikke ekte
                inngangslåt-data, men beholder samme visuelle rytme) */}
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(243,213,118,0.85)', fontStyle: 'italic', marginBottom: 8, zIndex: 1 }}>
              🎯 {potName}
            </div>

            {/* To-kolonners statistikk, som i referansekortet — ankret til den brede
                sonen rett over spissen (se kommentar på SHIELD_CLIP) */}
            <div style={{ display: 'flex', borderTop: '1px solid rgba(243,213,118,0.3)', paddingTop: 5, zIndex: 1 }}>
              <div style={{ flex: 1, borderRight: '1px solid rgba(243,213,118,0.3)' }}>
                <StatCell label="VINNERODDS" value={player.odds} />
                <StatCell label="SNITT 2026" value="—" />
              </div>
              <div style={{ flex: 1 }}>
                <StatCell label="PDC-RANKING" value={`#${player.pdcRanking}`} />
                <StatCell label="STØRSTE HINDER" value="—" />
              </div>
            </div>

            {/* Egen app-signatur i stedet for tredjeparts "Ultimate Darts"-logo —
                holdt som et lite, smalt merke siden denne raden sitter i selve
                skjoldspissen, der bred tekst ville blitt klippet av fasongen. */}
            <div style={{
              marginTop: 10, zIndex: 1, display: 'flex', justifyContent: 'center',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', border: `1px solid ${GOLD}88`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
              }}>
                🎯
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}
