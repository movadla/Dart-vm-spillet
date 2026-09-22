'use client'

import { useState, type CSSProperties } from 'react'
import Link from 'next/link'
import Flag from '@/components/Flag'
import { getIso2 } from '@/data/pots'
import { STAGE_ORDER, STAGE_LABELS, type Stage } from '@/config/scoring'
import { calcPlayerPoints, isPlayerEliminated, type PickWithPot, type AdvancementRow, type MatchResult } from '@/lib/scoring'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

// Fargekoding pr. pott (1–5).
const POT_COLORS = ['#dc2626', '#f59e0b', '#3b82f6', '#22c55e', '#f97316', '#8b5cf6']

const STAGE_INDEX: Record<string, number> = Object.fromEntries(STAGE_ORDER.map((s, i) => [s, i]))

interface Props {
  picks: PickWithPot[]
  advancement: AdvancementRow[]
  matchResults: MatchResult[]
  totalPoints: number
  vmStarted: boolean
  pointsAccent?: 'gold' | 'green'
  pointsColWidth?: number
  alignPointsTop?: boolean
  stageBadgeColor?: string
  stageBadgeInline?: boolean
  hideTotal?: boolean
}

// Grønn gradient/glød — samme grønnfarge som "PDC World Championship"-teksten.
const GREEN_TEXT: CSSProperties = {
  background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)',
  WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
  textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)',
}

/** Finner den siste (høyest rangerte) registrerte kampen for en spiller. */
function findLastMatch(playerName: string, matchResults: MatchResult[]): MatchResult | null {
  const relevant = matchResults.filter(m => m.player1 === playerName || m.player2 === playerName)
  if (relevant.length === 0) return null
  return relevant.reduce((latest, m) =>
    (STAGE_INDEX[m.stage ?? 'r1'] ?? 0) > (STAGE_INDEX[latest.stage ?? 'r1'] ?? 0) ? m : latest
  )
}

export default function PicksClient({ picks, advancement, matchResults, totalPoints, vmStarted, pointsAccent = 'gold', pointsColWidth, alignPointsTop, stageBadgeColor, stageBadgeInline, hideTotal }: Props) {
  const [open, setOpen] = useState<string | null>(null)
  const accentGreen = pointsAccent === 'green'

  if (picks.length === 0) {
    return (
      <div style={{ background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', padding: '20px', color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
        Ingen picks registrert.
      </div>
    )
  }

  return (
    <>
      <div style={{ background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', marginBottom: 12, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)' }}>
      {picks.map((pick, idx) => {
        const isOpen = open === pick.player_name
        const isLast = idx === picks.length - 1

        const potColor = POT_COLORS[(pick.pot_number - 1 + POT_COLORS.length) % POT_COLORS.length]
        const advRow = advancement.find(a => a.player_name === pick.player_name)
        const stageReached = advRow?.stage_reached ?? null
        const stageLabel = stageReached ? (STAGE_LABELS[stageReached as Stage] ?? null) : null
        const { advPts, multiplier, total } = calcPlayerPoints(pick, advancement)
        const eliminated = isPlayerEliminated(pick.player_name, matchResults)
        const lastMatch = findLastMatch(pick.player_name, matchResults)

        // VM-vinner → gull. Tapte finalen → sølv. PDC har ingen bronsefinale.
        const medalColor = stageReached === 'winner' ? '#fbbf24'
          : (stageReached === 'final' && eliminated) ? '#9ca3af'
          : null
        const accentColor = eliminated ? 'rgba(255,255,255,0.08)' : (medalColor ?? potColor)

        // Detaljer om siste kamp
        let lastMatchNode: React.ReactNode = null
        if (lastMatch) {
          const isP1 = lastMatch.player1 === pick.player_name
          const mySets = isP1 ? lastMatch.sets1 : lastMatch.sets2
          const oppSets = isP1 ? lastMatch.sets2 : lastMatch.sets1
          const opponentName = isP1 ? lastMatch.player2 : lastMatch.player1
          const won = lastMatch.winner ? lastMatch.winner === pick.player_name : mySets > oppSets
          const matchStage = lastMatch.stage ?? 'r1'
          const matchStageLabel = STAGE_LABELS[matchStage as Stage] ?? matchStage

          lastMatchNode = (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <span style={{ fontWeight: 700, color: won ? '#4ade80' : 'rgba(255,255,255,0.55)' }}>
                {won ? 'Vant' : 'Tapte'} {mySets}–{oppSets} {won ? 'over' : 'mot'}
              </span>
              <Flag iso2={getIso2(opponentName)} size={14} />
              <span style={{ color: '#fff' }}>{opponentName}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>· {matchStageLabel}</span>
            </div>
          )
        }

        return (
          <div key={pick.pot_number}>
            {/* Lukket rad */}
            <div
              className="pick-row"
              onClick={() => setOpen(isOpen ? null : pick.player_name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px 12px 10px',
                borderBottom: (!isLast || isOpen) ? '1px solid rgba(255,255,255,0.05)' : 'none',
                cursor: 'pointer',
              }}
            >
              {/* Flagg + navn — grås ut ved eliminering */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, opacity: eliminated ? 0.2 : 1, filter: eliminated ? 'grayscale(1)' : 'none' }}>
                {/* Pott-badge */}
                <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 900, color: accentColor, lineHeight: 1, flexShrink: 0, minWidth: 12, textAlign: 'center' }}>{pick.pot_number}</span>
                <Flag iso2={getIso2(pick.player_name)} size={24} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.2, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pick.player_name}</span>
                    {multiplier > 1 && (
                      <span style={{
                        fontFamily: SPORT, fontSize: 12, fontWeight: 900, flexShrink: 0,
                        color: multiplier === 2 ? '#f59e0b' : '#ef4444',
                        background: multiplier === 2 ? 'rgba(245,158,11,0.12)' : 'rgba(220,38,38,0.12)',
                        border: `1px solid ${multiplier === 2 ? 'rgba(245,158,11,0.35)' : 'rgba(220,38,38,0.35)'}`,
                        borderRadius: 4, padding: '2px 7px', letterSpacing: '0.02em', lineHeight: 1.4,
                      }}>×{multiplier}</span>
                    )}
                    {stageBadgeInline && stageLabel && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0, whiteSpace: 'nowrap',
                        color: medalColor ?? stageBadgeColor ?? potColor,
                        background: medalColor ? `${medalColor}18` : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${medalColor ? `${medalColor}40` : 'rgba(255,255,255,0.12)'}`,
                        borderRadius: 4, padding: '2px 6px',
                      }}>{stageLabel}</span>
                    )}
                  </div>
                  {!stageBadgeInline && stageLabel && (
                    <div style={{ marginTop: 3 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
                        color: medalColor ?? stageBadgeColor ?? potColor,
                        background: medalColor ? `${medalColor}18` : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${medalColor ? `${medalColor}40` : 'rgba(255,255,255,0.12)'}`,
                        borderRadius: 4, padding: '2px 6px',
                      }}>
                        {stageLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {vmStarted ? (
                <div style={{ textAlign: 'right', flexShrink: 0, minWidth: pointsColWidth, alignSelf: alignPointsTop ? 'flex-start' : undefined, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                  <div style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, lineHeight: 1,
                    ...(total > 0
                        ? (accentGreen ? GREEN_TEXT : { color: '#f59e0b' })
                        : lastMatch
                          ? { color: 'rgba(74,222,128,0.55)' }
                          : { color: 'rgba(255,255,255,0.1)' }) }}>
                    {total}p
                  </div>
                </div>
              ) : (
                <span style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, color: 'rgba(255,255,255,0.12)', lineHeight: 1, flexShrink: 0 }}>–</span>
              )}

            </div>

            {/* Utvidet innhold */}
            {isOpen && (
              <div style={{ padding: '12px 16px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: !isLast ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>

                {/* Siste kamp */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 7 }}>Siste kamp</div>
                  {lastMatchNode ?? (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>Ingen kamper spilt ennå</div>
                  )}
                </div>

                {/* Poengsum */}
                {stageLabel && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 6, background: 'rgba(34,197,94,0.06)', borderLeft: '2px solid rgba(34,197,94,0.3)' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', flex: 1 }}>{stageLabel}</span>
                    <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 900, color: '#f59e0b' }}>
                      {multiplier > 1 ? `${advPts} × ${multiplier} = +${total}p` : `+${total}p`}
                    </span>
                  </div>
                )}

                <div style={{ marginTop: 14, marginLeft: -16, marginRight: -16, marginBottom: -16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <Link href="/vm-info" className="pick-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 16px', textDecoration: 'none' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.01em' }}>Se poengoversikt for alle spillere</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>→</span>
                  </Link>
                </div>

              </div>
            )}
          </div>
        )
      })}

      {/* Totalsum */}
      {!hideTotal && (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Totalt</span>
          {!vmStarted && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>Poeng telles fra VM-start</div>}
        </div>
        {vmStarted
          ? <span style={{ fontFamily: SPORT, fontSize: 28, fontWeight: 900, lineHeight: 1, ...(accentGreen ? GREEN_TEXT : { color: '#f59e0b' }) }}>{totalPoints}p</span>
          : <span style={{ fontFamily: SPORT, fontSize: 28, fontWeight: 900, color: 'rgba(255,255,255,0.1)', lineHeight: 1 }}>–</span>
        }
      </div>
      )}
    </div>
    </>
  )
}
