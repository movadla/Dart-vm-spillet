'use client'

import Flag from '@/components/Flag'
import { getIso2 } from '@/data/pots'
import { getBracketRound, isFillerName, type BracketSlot } from '@/lib/bracketProjection'
import type { MatchResult } from '@/lib/scoring'
import type { Stage } from '@/config/scoring'
import { SPORT } from '@/config/theme'
import { useLocale } from '@/lib/i18n/useLocale'

// Klassisk brakett-visning med koblingsstreker mellom rundene (samme mønster
// som en fysisk turneringsplakat, eller f.eks. NCAA sine bracket-grafikker):
// hver runde er en kolonne, og vinner-boksen i neste runde står loddrett midt
// mellom de to kampene den kommer fra, koblet med en strek. Hver kolonne
// bygges fra `getBracketRound()` — ALLE bracket-slotene for runden (64/32/…/1),
// ikke bare de kampene som tilfeldigvis er spilt så langt — slik at
// posisjonen i treet blir riktig selv når f.eks. bare 4 av 8 runde 4-kamper
// er avgjort ennå.

const CARD_W = 150
// 56 (var 48) — to rader (4px padding + tekstlinje hver) + 1px skillelinje
// trengte mer enn 48px; navn/poeng ble kuttet av kortets avrundede kant.
const CARD_H = 56
// Loddrett avstand mellom to nabo-kamper i runde 1 — dette tallet ganger
// antall runde 1-kamper avgjør braketten sin totale (store) høyde, siden alle
// senere runder deler nøyaktig samme høyde (bare med færre, mer spredte kort).
const ROUND1_PITCH = 64
const COL_GAP = 30

function Side({ name, wins, sets, dict }: {
  name: string | null; wins: boolean; sets: number | null
  dict: ReturnType<typeof useLocale>['dict']
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', flex: 1, background: wins ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
      {name ? (
        <>
          <span style={{ flexShrink: 0 }}><Flag iso2={getIso2(name)} size={13} /></span>
          <span style={{ flex: 1, fontSize: 10.5, fontWeight: wins ? 800 : 400, color: wins ? '#fff' : 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isFillerName(name) ? dict.common.qualifiedFillerLabel : name}
          </span>
        </>
      ) : (
        <span style={{ flex: 1, fontSize: 10, fontStyle: 'italic', color: 'rgba(255,255,255,0.35)' }}>
          {dict.vmInfo.matchesTab.notDecided}
        </span>
      )}
      <span style={{ fontFamily: SPORT, fontSize: 12, fontWeight: 900, color: wins ? '#fff' : 'rgba(255,255,255,0.55)', flexShrink: 0, minWidth: 10, textAlign: 'right' }}>
        {sets ?? (name ? '–' : '')}
      </span>
    </div>
  )
}

function MatchCard({ slot }: { slot: BracketSlot }) {
  const { dict } = useLocale()
  const { player1, player2, match } = slot
  const p1Wins = match?.winner != null && match.winner === match.player1
  const p2Wins = match?.winner != null && match.winner === match.player2

  return (
    <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Side name={player1} wins={p1Wins} sets={match?.sets1 ?? null} dict={dict} />
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
      <Side name={player2} wins={p2Wins} sets={match?.sets2 ?? null} dict={dict} />
    </div>
  )
}

/** Koblingsstreker mellom denne kolonnen og neste — én "⊐"-formet strek per par kamper. */
function Connectors({ fromCount, height }: { fromCount: number; height: number }) {
  const pitch = height / fromCount
  const midX = COL_GAP / 2
  return (
    <svg width={COL_GAP} height={height} style={{ position: 'absolute', left: CARD_W, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
      {Array.from({ length: fromCount / 2 }, (_, i) => {
        const y1 = (2 * i + 0.5) * pitch
        const y2 = (2 * i + 1.5) * pitch
        const yMid = (y1 + y2) / 2
        return (
          <path
            key={i}
            d={`M0,${y1} H${midX} V${y2} M${midX},${yMid} H${COL_GAP}`}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={1.5}
            fill="none"
          />
        )
      })}
    </svg>
  )
}

function BracketColumn({ slots, height }: { slots: BracketSlot[]; height: number }) {
  const pitch = height / slots.length
  return (
    <div style={{ position: 'relative', width: CARD_W, height, flexShrink: 0 }}>
      {slots.map((slot, i) => (
        <div key={i} style={{ position: 'absolute', left: 0, top: (i + 0.5) * pitch - CARD_H / 2, width: CARD_W, height: CARD_H }}>
          <MatchCard slot={slot} />
        </div>
      ))}
    </div>
  )
}

/**
 * Hele sluttspillet som én sammenhengende, koblet brakett — rundene er
 * kolonner, koblingsstreker binder hver vinner til riktig plass i neste
 * runde. Scroller både vannrett (rundene) og loddrett (runde 1 sine 64
 * kamper gjør hele treet høyt) inne i sin egen boks, slik at faner/header
 * rundt står i ro.
 */
export default function MatchBracket({ stages, matches }: {
  stages: readonly Stage[]
  matches: MatchResult[]
}) {
  const { dict } = useLocale()
  const round1Count = getBracketRound(stages[0], []).length
  const totalHeight = round1Count * ROUND1_PITCH
  const finalSlot = getBracketRound(stages[stages.length - 1], matches)[0]
  const champion = finalSlot?.match?.winner ?? null

  const headerStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
    textAlign: 'center', padding: '0 2px 8px', marginBottom: 10,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  }

  return (
    // Én og samme scroll-boks i begge retninger — kolonneoverskriftene er
    // «position: sticky» inni den, så de blir stående i ro loddrett når man
    // scroller nedover i runde 1 sine 64 kamper, men flytter seg vannrett
    // sammen med resten når man scroller mellom rundene.
    <div style={{ overflow: 'auto', maxHeight: '68vh', marginLeft: -16, marginRight: -16, paddingLeft: 16, paddingRight: 16, paddingBottom: 10 }}>
      <div style={{ width: 'max-content' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 2, display: 'flex', background: '#0d1117', paddingTop: 4 }}>
          {stages.map((stage) => (
            <div key={stage} style={{ width: CARD_W, flexShrink: 0, marginRight: COL_GAP, ...headerStyle, color: 'rgba(255,255,255,0.5)' }}>
              {dict.players.stages[stage]}
            </div>
          ))}
          <div style={{ width: CARD_W, flexShrink: 0, ...headerStyle, color: '#f59e0b', borderBottomColor: 'rgba(245,158,11,0.25)' }}>
            {dict.players.champion}
          </div>
        </div>
        <div style={{ display: 'flex', width: 'max-content' }}>
          {stages.map((stage, si) => {
            const slots = getBracketRound(stage, matches)
            const isLast = si === stages.length - 1
            return (
              <div key={stage} style={{ position: 'relative', marginRight: COL_GAP }}>
                <BracketColumn slots={slots} height={totalHeight} />
                {!isLast && <Connectors fromCount={slots.length} height={totalHeight} />}
                {isLast && (
                  <svg width={COL_GAP} height={totalHeight} style={{ position: 'absolute', left: CARD_W, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
                    <line x1={0} y1={totalHeight / 2} x2={COL_GAP} y2={totalHeight / 2} stroke="rgba(245,158,11,0.4)" strokeWidth={1.5} />
                  </svg>
                )}
              </div>
            )
          })}
          {/* VM-vinner — én boks, koblet til finalen med én rett strek. */}
          <div style={{ position: 'relative', width: CARD_W, height: totalHeight }}>
            <div style={{
              position: 'absolute', left: 0, top: totalHeight / 2 - CARD_H / 2, width: CARD_W, height: CARD_H,
              display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px',
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 8,
            }}>
              {champion ? (
                <>
                  <Flag iso2={getIso2(champion)} size={16} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#fbbf24', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{champion}</span>
                </>
              ) : (
                <span style={{ fontSize: 11, fontStyle: 'italic', color: 'rgba(245,158,11,0.5)' }}>{dict.players.champion}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
