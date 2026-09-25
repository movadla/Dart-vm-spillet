'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Flag from '@/components/Flag'
import TeamTile, { lastName } from '@/components/TeamTile'
import { POTS, getIso2, type Player } from '@/data/pots'
import { POT_COLORS, POT_COLORS_DARK } from '@/config/potColors'
import { STAGE_ORDER, STAGE_LABELS, CHAMPION_LABEL, type Stage } from '@/config/scoring'
import { calcPlayerPoints, isPlayerEliminated, isPlayerChampion, furthestStageReached, type PickWithPot, type MatchResult } from '@/lib/scoring'
import { formatPoints } from '@/lib/format'
import { SPORT, CARD_GRADIENT, CARD_SHADOW } from '@/config/theme'

const PlayerDetailPanel = dynamic(() => import('@/components/PlayerDetailPanel'), { ssr: false })

const STAGE_INDEX: Record<string, number> = Object.fromEntries(STAGE_ORDER.map((s, i) => [s, i]))
const GOLD = '#fbbf24'
const SILVER = '#9ca3af'

const ALL_PLAYERS: Player[] = POTS.flatMap((p) => p.players)
function findPlayer(name: string): Player | undefined {
  return ALL_PLAYERS.find((p) => p.name === name)
}

interface Props {
  picks: PickWithPot[]
  matchResults: MatchResult[]
  vmStarted: boolean
}

/** Status-merkelapp for én spiller: hvor langt han er kommet, eller når han røk ut. */
function statusFor(name: string, matches: MatchResult[]): { label: string; color: string; strong: boolean } | null {
  const champion = isPlayerChampion(name, matches)
  if (champion) return { label: CHAMPION_LABEL, color: GOLD, strong: true }
  const reached = furthestStageReached(name, matches, STAGE_ORDER) as Stage | null
  const eliminated = isPlayerEliminated(name, matches)
  if (!reached) return null
  if (eliminated) {
    if (reached === 'final') return { label: 'Finalist', color: SILVER, strong: true }
    return { label: `Ute i ${STAGE_LABELS[reached].toLowerCase()}`, color: 'rgba(255,255,255,0.6)', strong: false }
  }
  const next = STAGE_ORDER[STAGE_INDEX[reached] + 1]
  return { label: next ? `Videre til ${STAGE_LABELS[next].toLowerCase()}` : STAGE_LABELS[reached], color: '#4ade80', strong: false }
}

/**
 * «Laget ditt» på Min side: de seks lagbrikkene (samme TeamTile som i introen
 * og oppsummeringen) med poeng under, og en rad per spiller med status og
 * poeng. Rad-trykk viser kampene hans; brikke-trykk (eller «Spillerinfo»)
 * åpner det samme spillerpanelet som i tippe-flyten.
 */
export default function MyTeam({ picks, matchResults, vmStarted }: Props) {
  const [openRow, setOpenRow] = useState<string | null>(null)
  const [sheetPlayer, setSheetPlayer] = useState<Player | null>(null)

  const sorted = picks.slice().sort((a, b) => a.pot_number - b.pot_number)

  if (sorted.length === 0) {
    return (
      <div style={{ background: CARD_GRADIENT, borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', padding: 20, color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center' }}>
        Ingen spillere registrert ennå.
      </div>
    )
  }

  const sheetIndex = sheetPlayer ? sorted.findIndex((p) => p.player_name === sheetPlayer.name) : -1
  const nextPick = sheetIndex >= 0 ? sorted[(sheetIndex + 1) % sorted.length] : null

  return (
    <>
      {/* Radene — spillerfoto ved siden av navnet i stedet for en tallmerket
          brikke-rekke, så laget leses som én vertikal liste. */}
      <div style={{ background: CARD_GRADIENT, borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', boxShadow: CARD_SHADOW }}>
        {sorted.map((pick, idx) => {
          const player = findPlayer(pick.player_name)
          const i = (pick.pot_number - 1) % POT_COLORS.length
          const color = POT_COLORS[i]
          const isLast = idx === sorted.length - 1
          const isOpen = openRow === pick.player_name
          const { setPts, advPts, winnerBonus, multiplier, total } = calcPlayerPoints(pick, matchResults)
          const wins = advPts / 2
          const eliminated = vmStarted && isPlayerEliminated(pick.player_name, matchResults)
          const champion = vmStarted && isPlayerChampion(pick.player_name, matchResults)
          const status = vmStarted ? statusFor(pick.player_name, matchResults) : null
          const myMatches = matchResults
            .filter((m) => m.player1 === pick.player_name || m.player2 === pick.player_name)
            .sort((a, b) => (STAGE_INDEX[a.stage ?? 'r1'] ?? 0) - (STAGE_INDEX[b.stage ?? 'r1'] ?? 0))

          return (
            <div key={pick.pot_number}>
              <button
                type="button"
                className="pick-row"
                onClick={() => (vmStarted ? setOpenRow(isOpen ? null : pick.player_name) : player && setSheetPlayer(player))}
                aria-expanded={vmStarted ? isOpen : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                  padding: '9px 14px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
                  borderBottom: !isLast || isOpen ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                {/* Foto på pott-farget bakgrunn — slått ut dempes fotoet, poengene til høyre står klart */}
                <div style={{ width: 42, flexShrink: 0 }}>
                  <TeamTile player={player} potNumber={pick.pot_number} color={color} colorDark={POT_COLORS_DARK[i]} label={false} glow={champion} dimmed={eliminated} />
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, opacity: eliminated ? 0.5 : 1 }}>
                  <Flag iso2={player?.iso2 ?? getIso2(pick.player_name)} size={22} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: eliminated ? 'line-through' : 'none', textDecorationColor: 'rgba(255,255,255,0.5)' }}>
                        {pick.player_name}
                      </span>
                      {multiplier > 1 && (
                        <span style={{ fontFamily: SPORT, fontSize: 12, fontWeight: 900, flexShrink: 0, color: multiplier >= 3 ? '#ef4444' : '#f59e0b', background: multiplier >= 3 ? 'rgba(220,38,38,0.12)' : 'rgba(245,158,11,0.12)', border: `1px solid ${multiplier >= 3 ? 'rgba(220,38,38,0.35)' : 'rgba(245,158,11,0.35)'}`, borderRadius: 4, padding: '1px 6px', lineHeight: 1.4 }}>
                          ×{multiplier}
                        </span>
                      )}
                    </span>
                    {vmStarted && (
                      <span style={{ display: 'block', fontSize: 12, marginTop: 2, color: status ? status.color : 'rgba(255,255,255,0.55)', fontWeight: status?.strong ? 800 : 600, letterSpacing: status?.strong ? '0.04em' : 0, textTransform: status?.strong ? 'uppercase' : 'none' }}>
                        {status ? status.label : 'Ikke spilt ennå'}
                      </span>
                    )}
                  </span>
                </span>
                {vmStarted ? (
                  <span style={{ fontFamily: SPORT, fontSize: 20, fontWeight: 900, lineHeight: 1, flexShrink: 0, minWidth: 48, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: total > 0 ? '#4ade80' : 'rgba(255,255,255,0.35)' }}>
                    {formatPoints(total)}
                  </span>
                ) : (
                  <span aria-hidden style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>›</span>
                )}
              </button>

              {isOpen && (
                <div style={{ padding: '10px 14px 12px 20px', background: 'rgba(255,255,255,0.025)', borderBottom: !isLast ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  {myMatches.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Ingen kamper spilt ennå.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {myMatches.map((m, k) => {
                        const isP1 = m.player1 === pick.player_name
                        const mySets = isP1 ? m.sets1 : m.sets2
                        const oppSets = isP1 ? m.sets2 : m.sets1
                        const opp = isP1 ? m.player2 : m.player1
                        const won = m.winner ? m.winner === pick.player_name : mySets > oppSets
                        return (
                          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                            <span style={{ width: 74, flexShrink: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
                              {STAGE_LABELS[(m.stage ?? 'r1') as Stage] ?? m.stage}
                            </span>
                            <span style={{ fontFamily: SPORT, fontSize: 15, fontWeight: 900, width: 34, flexShrink: 0, color: won ? '#4ade80' : '#f87171', fontVariantNumeric: 'tabular-nums' }}>
                              {mySets}–{oppSets}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>{won ? 'over' : 'mot'}</span>
                            <Flag iso2={getIso2(opp)} size={14} />
                            <span style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastName(opp)}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {total > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '7px 10px', borderRadius: 8, background: 'rgba(34,197,94,0.07)', borderLeft: '2px solid rgba(34,197,94,0.4)' }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', flex: 1, fontVariantNumeric: 'tabular-nums' }}>
                        {setPts} sett · {wins} {wins === 1 ? 'seier' : 'seire'}{winnerBonus > 0 ? ' · VM-seier' : ''}{multiplier > 1 ? ` · ×${multiplier}` : ''}
                      </span>
                      <span style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, color: '#4ade80', fontVariantNumeric: 'tabular-nums' }}>{formatPoints(total)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                    {player && (
                      <button type="button" onClick={() => setSheetPlayer(player)} className="text-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                        Spillerinfo →
                      </button>
                    )}
                    <Link href={`/vm-info?tab=kamper`} className="text-link" style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                      Alle kamper →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {sheetPlayer && (
        <PlayerDetailPanel
          player={sheetPlayer}
          color={POT_COLORS[(sorted[sheetIndex]?.pot_number - 1 + POT_COLORS.length) % POT_COLORS.length]}
          open
          onClose={() => setSheetPlayer(null)}
          onNext={() => { const p = nextPick && findPlayer(nextPick.player_name); if (p) setSheetPlayer(p) }}
          nextLabel="Neste spiller →"
          matchResults={matchResults}
          potNumber={sorted[sheetIndex]?.pot_number}
        />
      )}
    </>
  )
}
