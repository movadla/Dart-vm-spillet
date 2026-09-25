import Flag from '@/components/Flag'
import { lastName } from '@/lib/playerName'
import { POTS, getIso2, type Player } from '@/data/pots'
import type { Stage } from '@/config/scoring'
import { getNextMatch, type NextMatchInfo } from '@/lib/bracketProjection'
import { getScheduleLabel } from '@/config/schedule'
import { isPlayerChampion, isPlayerEliminated, type MatchResult, type PickWithPot } from '@/lib/scoring'
import { CARD_GRADIENT, CARD_SHADOW } from '@/config/theme'
import { getLocale } from '@/lib/i18n/getLocale'
import { getDictionary } from '@/i18n/dictionaries'

const ALL_PLAYERS: Player[] = POTS.flatMap((p) => p.players)
function iso2For(name: string): string {
  return ALL_PLAYERS.find((p) => p.name === name)?.iso2 ?? getIso2(name)
}

/**
 * «Neste kamper» på Min side: kun spillerne som faktisk HAR en neste kamp —
 * slåtte ut og VM-vinneren er ferdige og hører ikke hjemme i en liste over
 * kommende kamper, så de filtreres bort i stedet for å vises som «ute».
 * Motstander og runde er ekte og avgjort så langt braketten faktisk er
 * spilt (`getNextMatch`), ellers vises favoritt-eksempelet med et lite
 * «eksempel»-merke; dato/klokkeslett vises når PDC har kunngjort det, «Ikke
 * satt» inntil da.
 */
export default async function NextMatches({ picks, matchResults }: { picks: PickWithPot[]; matchResults: MatchResult[] }) {
  const locale = await getLocale()
  const { deltaker, players, common } = getDictionary(locale)
  const upcoming = picks
    .slice()
    .sort((a, b) => a.pot_number - b.pot_number)
    .map((pick) => ({ pick, next: getUpcoming(pick.player_name, matchResults) }))
    .filter((row): row is { pick: PickWithPot; next: NextMatchInfo } => row.next !== null)

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
        const schedule = getScheduleLabel(next.stage as Stage, locale)
        return (
          <div key={pick.pot_number} style={{ padding: '10px 14px', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: '0 1 auto' }}>
                <Flag iso2={iso2For(pick.player_name)} size={20} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastName(pick.player_name)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', minWidth: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {players.stages[next.stage as Stage]}
                </span>
                <span aria-hidden style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>·</span>
                {next.opponent && !next.isFiller ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <Flag iso2={iso2For(next.opponent)} size={16} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastName(next.opponent)}</span>
                  </span>
                ) : (
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                    {next.isFiller ? common.qualifiedFillerLabel : deltaker.playerDetailPanel.notDecided}
                  </span>
                )}
                {!next.confirmed && (
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 4, padding: '2px 5px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {deltaker.playerDetailPanel.exampleTag}
                  </span>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>
              {schedule.dateKnown ? `${schedule.dateLabel} · ${schedule.timeLabel}` : schedule.dateLabel}
            </div>
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
