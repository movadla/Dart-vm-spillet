import Flag from '@/components/Flag'
import { lastName } from '@/lib/playerName'
import { POTS, getIso2, type Player } from '@/data/pots'
import { STAGE_LABELS, CHAMPION_LABEL, type Stage } from '@/config/scoring'
import { getNextMatch } from '@/lib/bracketProjection'
import { isPlayerChampion, isPlayerEliminated, type MatchResult, type PickWithPot } from '@/lib/scoring'
import { CARD_GRADIENT, CARD_SHADOW } from '@/config/theme'

const ALL_PLAYERS: Player[] = POTS.flatMap((p) => p.players)
function iso2For(name: string): string {
  return ALL_PLAYERS.find((p) => p.name === name)?.iso2 ?? getIso2(name)
}

/**
 * «Neste kamper» på Min side: hvem hver av de seks spillerne dine møter
 * neste, og i hvilken runde. Ekte og avgjort så langt braketten faktisk er
 * spilt (`getNextMatch`); ellers vises den favorittbaserte eksempel-
 * motstanderen med et lite «eksempel»-merke, akkurat som i spillerpanelet.
 */
export default function NextMatches({ picks, matchResults }: { picks: PickWithPot[]; matchResults: MatchResult[] }) {
  const sorted = picks.slice().sort((a, b) => a.pot_number - b.pot_number)
  if (sorted.length === 0) return null

  return (
    <div style={{ background: CARD_GRADIENT, borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', boxShadow: CARD_SHADOW }}>
      {sorted.map((pick, idx) => {
        const isLast = idx === sorted.length - 1
        const champion = isPlayerChampion(pick.player_name, matchResults)
        const eliminated = !champion && isPlayerEliminated(pick.player_name, matchResults)
        const next = !champion && !eliminated ? getNextMatch(pick.player_name, matchResults) : null

        return (
          <div key={pick.pot_number} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: '0 1 auto' }}>
              <Flag iso2={iso2For(pick.player_name)} size={20} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastName(pick.player_name)}</span>
            </div>

            {champion ? (
              <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, color: '#fbbf24', letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0 }}>{CHAMPION_LABEL} 🏆</span>
            ) : eliminated ? (
              <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', flexShrink: 0 }}>Ute av turneringen</span>
            ) : next ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', minWidth: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {STAGE_LABELS[next.stage as Stage]}
                </span>
                <span aria-hidden style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>·</span>
                {next.opponent && !next.isFiller ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <Flag iso2={iso2For(next.opponent)} size={16} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastName(next.opponent)}</span>
                  </span>
                ) : (
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                    {next.isFiller ? 'Kvalifisert' : 'Ikke avgjort'}
                  </span>
                )}
                {!next.confirmed && (
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 4, padding: '2px 5px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    eksempel
                  </span>
                )}
              </div>
            ) : (
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>—</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
