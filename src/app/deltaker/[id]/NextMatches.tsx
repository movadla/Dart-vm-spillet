'use client'

import { useState } from 'react'
import Flag from '@/components/Flag'
import { lastName } from '@/lib/playerName'
import { POTS, getIso2, type Player } from '@/data/pots'
import { STAGE_ORDER, type Stage } from '@/config/scoring'
import { getScheduleLabel, getScheduleSortKey } from '@/config/schedule'
import { getNextMatch, type NextMatchInfo } from '@/lib/bracketProjection'
import { isPlayerChampion, isPlayerEliminated, type MatchResult, type PickWithPot } from '@/lib/scoring'
import { CARD_GRADIENT, CARD_SHADOW, SPORT } from '@/config/theme'
import { useLocale } from '@/lib/i18n/useLocale'

const ALL_PLAYERS: Player[] = POTS.flatMap((p) => p.players)
function iso2For(name: string): string {
  return ALL_PLAYERS.find((p) => p.name === name)?.iso2 ?? getIso2(name)
}
const STAGE_INDEX: Record<string, number> = Object.fromEntries(STAGE_ORDER.map((s, i) => [s, i]))

/**
 * «Neste kamper» på Min side: kun spillerne som faktisk HAR en neste kamp —
 * slåtte ut og VM-vinneren er ferdige og hører ikke hjemme i en liste over
 * kommende kamper, så de filtreres bort i stedet for å vises som «ute».
 * Raden i seg selv viser KUN hvem som møter hvem + dato — etternavn (uten
 * "van"/"de" osv., se lastName() i playerName.ts) i faste, justerte
 * kolonner, siden runde/klokkeslett er flyttet ut av selve raden. Trykk på
 * en rad for å se runde + klokkeslett i et utvidet felt under, samme
 * mønster som «Mitt lag»-radene over (se MyTeam.tsx sin openRow-state).
 */
const GRID_COLUMNS = '18px 82px 14px 16px 82px 46px'
export default function NextMatches({ picks, matchResults }: { picks: PickWithPot[]; matchResults: MatchResult[] }) {
  const { locale, dict } = useLocale()
  const { deltaker, players, common } = dict
  const [openRow, setOpenRow] = useState<number | null>(null)

  // Sortert etter når kampen faktisk spilles (tidligst øverst) — ikke etter
  // pott-nummer som før. Ukjent dato/klokkeslett gir Infinity (se
  // getScheduleSortKey()) og havner sist, med rundenummer og pott-nummer som
  // stabile sekundære sorteringer for kamper som ellers ville vært likestilt.
  const upcoming = picks
    .map((pick) => ({ pick, next: getUpcoming(pick.player_name, matchResults) }))
    .filter((row): row is { pick: PickWithPot; next: NextMatchInfo } => row.next !== null)
    .sort((a, b) => {
      const keyA = getScheduleSortKey(a.next.stage as Stage, a.pick.player_name)
      const keyB = getScheduleSortKey(b.next.stage as Stage, b.pick.player_name)
      if (keyA !== keyB) return keyA - keyB
      const stageA = STAGE_INDEX[a.next.stage] ?? 0
      const stageB = STAGE_INDEX[b.next.stage] ?? 0
      if (stageA !== stageB) return stageA - stageB
      return a.pick.pot_number - b.pick.pot_number
    })

  if (upcoming.length === 0) {
    return (
      <div style={{ background: CARD_GRADIENT, borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', padding: 20, color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center' }}>
        {deltaker.nextMatches.none}
      </div>
    )
  }

  return (
    <div style={{ background: CARD_GRADIENT, borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', boxShadow: CARD_SHADOW }}>
      {upcoming.map(({ pick, next }, idx) => {
        const isLast = idx === upcoming.length - 1
        const isOpen = openRow === pick.pot_number
        // pick.player_name holder for oppslaget (én av de to i kampen holder,
        // se getScheduleLabel()) — funker uansett om det er MIN spiller eller
        // motstanderen som tilfeldigvis er nøkkelen i R1_MATCH_TIMES.
        const schedule = getScheduleLabel(next.stage as Stage, locale, pick.player_name)
        const hasOpponent = next.opponent && !next.isFiller
        return (
          <div key={pick.pot_number}>
            <button
              type="button"
              className="pick-row"
              onClick={() => setOpenRow(isOpen ? null : pick.pot_number)}
              aria-expanded={isOpen}
              style={{
                display: 'grid', gridTemplateColumns: GRID_COLUMNS, alignItems: 'center', columnGap: 8, width: '100%', textAlign: 'left',
                padding: '11px 14px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
                borderBottom: !isLast || isOpen ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}
            >
              <Flag iso2={iso2For(pick.player_name)} size={18} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                {lastName(pick.player_name)}
              </span>
              <span aria-hidden style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>vs</span>
              {hasOpponent ? (
                <>
                  <Flag iso2={iso2For(next.opponent as string)} size={16} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                    {lastName(next.opponent as string)}
                  </span>
                </>
              ) : (
                <>
                  <span />
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                    {next.isFiller ? common.qualifiedFillerLabel : deltaker.playerDetailPanel.notDecided}
                  </span>
                </>
              )}
              <span style={{ fontFamily: SPORT, fontSize: 12, fontWeight: 700, color: schedule.dateKnown ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', textAlign: 'right' }}>
                {schedule.dateLabel}
              </span>
            </button>

            {isOpen && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px 11px 20px', background: 'rgba(255,255,255,0.025)', borderBottom: !isLast ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
                  {players.stages[next.stage as Stage]}
                </span>
                <span aria-hidden style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 700, color: schedule.timeKnown ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                  {schedule.timeLabel}
                </span>
                {!next.confirmed && (
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 4, padding: '2px 5px', whiteSpace: 'nowrap' }}>
                    {deltaker.playerDetailPanel.exampleTag}
                  </span>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** getNextMatch(), men null for spillere som er slått ut eller har vunnet — de har ingen kommende kamp. */
function getUpcoming(playerName: string, matches: MatchResult[]): NextMatchInfo | null {
  if (isPlayerChampion(playerName, matches) || isPlayerEliminated(playerName, matches)) return null
  return getNextMatch(playerName, matches)
}
