import Flag from '@/components/Flag'
import { lastName } from '@/lib/playerName'
import { POTS, getIso2, type Player } from '@/data/pots'
import type { Stage } from '@/config/scoring'
import { getNextMatch, type NextMatchInfo } from '@/lib/bracketProjection'
import { isPlayerChampion, isPlayerEliminated, type MatchResult, type PickWithPot } from '@/lib/scoring'
import { CARD_GRADIENT, CARD_SHADOW } from '@/config/theme'
import { getLocale } from '@/lib/i18n/getLocale'
import { getDictionary } from '@/i18n/dictionaries'
import { getScheduleLabel } from '@/config/schedule'
import { SPORT } from '@/config/theme'

// Faste grid-kolonner, samme på ALLE rader (kolonne 2/5 er de eneste
// fleksible — resten har fast bredde) — dette (ikke fravær av dato/
// klokkeslett) var det som fikset «rotete»-problemet: forrige runde hadde
// ulik radstruktur avhengig av om dato var kjent eller ikke. Nå er
// strukturen alltid lik, bare tekstinnholdet i dato/klokkeslett-cellene
// endrer seg («Ikke satt» der PDC ikke har kunngjort det ennå).
// Runde/dato/klokkeslett-kolonnene bruker SPORT (smal, kondensert skrift) —
// «Kvartfinale»/«Ikke satt» er for brede til å få plass i vanlig skrift uten
// enten å ellipsere hardt eller spise av navne-kolonnene.
const GRID_COLUMNS = '16px minmax(0,1fr) 14px 14px minmax(0,1fr) 58px 42px 48px'

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
          <div key={pick.pot_number} style={{
            display: 'grid', gridTemplateColumns: GRID_COLUMNS, alignItems: 'center', columnGap: 6,
            padding: '11px 14px', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)',
          }}>
            <Flag iso2={iso2For(pick.player_name)} size={16} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
              {lastName(pick.player_name)}
            </span>
            <span aria-hidden style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>vs</span>
            {next.opponent && !next.isFiller ? (
              <Flag iso2={iso2For(next.opponent)} size={14} />
            ) : <span />}
            {next.opponent && !next.isFiller ? (
              <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                {lastName(next.opponent)}
                {!next.confirmed && (
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 4, padding: '1px 4px', marginLeft: 5, whiteSpace: 'nowrap' }}>
                    {deltaker.playerDetailPanel.exampleTag}
                  </span>
                )}
              </span>
            ) : (
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                {next.isFiller ? common.qualifiedFillerLabel : deltaker.playerDetailPanel.notDecided}
              </span>
            )}
            <span style={{ fontFamily: SPORT, fontSize: 11, fontWeight: 700, letterSpacing: '0.01em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
              {players.stages[next.stage as Stage]}
            </span>
            <span style={{ fontFamily: SPORT, fontSize: 11, fontWeight: 600, color: schedule.dateKnown ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.3)', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
              {schedule.dateLabel}
            </span>
            <span style={{ fontFamily: SPORT, fontSize: 11, fontWeight: 600, color: schedule.timeKnown ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.3)', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
              {schedule.timeLabel}
            </span>
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
