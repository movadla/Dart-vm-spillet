'use client'

import Flag from '@/components/Flag'
import { getIso2 } from '@/data/pots'
import type { MatchResult } from '@/lib/scoring'
import { STAGE_ORDER } from '@/config/scoring'
import { SPORT, CARD_GRADIENT, CARD_SHADOW } from '@/config/theme'
import { useLocale } from '@/lib/i18n/useLocale'

/**
 * Registrerte kampresultater, gruppert per runde med nyeste runde øverst.
 * Erstatter brakett-visningen fra World Grand Prix: Grand Slam har et
 * gruppespill (3 per gruppe), så et klassisk bracket-tre passer ikke.
 */
export default function MatchList({ matches }: { matches: MatchResult[] }) {
  const { dict } = useLocale()

  if (matches.length === 0) {
    return (
      <div style={{ background: CARD_GRADIENT, borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', boxShadow: CARD_SHADOW, padding: '28px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.5 }}>
        {dict.vmInfo.matchesTab.empty}
      </div>
    )
  }

  const stages = [...STAGE_ORDER].reverse().filter((stage) => matches.some((m) => m.stage === stage))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {stages.map((stage) => (
        <div key={stage} style={{ background: CARD_GRADIENT, borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', boxShadow: CARD_SHADOW, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', fontSize: 12, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#f3d576', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {dict.players.stages[stage]}
          </div>
          {matches.filter((m) => m.stage === stage).map((m, i, all) => {
            const p1Won = m.winner ? m.winner === m.player1 : m.sets1 > m.sets2
            return (
              <div key={`${m.player1}-${m.player2}-${i}`} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, padding: '9px 14px', borderBottom: i < all.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, justifyContent: 'flex-end', textAlign: 'right' }}>
                  <span style={{ fontSize: 13, fontWeight: p1Won ? 800 : 500, color: p1Won ? '#fff' : 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.player1}</span>
                  <Flag iso2={getIso2(m.player1)} size={14} />
                </div>
                <span style={{ fontFamily: SPORT, fontSize: 16, fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: '#fff', minWidth: 56, textAlign: 'center' }}>
                  {m.sets1}–{m.sets2}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <Flag iso2={getIso2(m.player2)} size={14} />
                  <span style={{ fontSize: 13, fontWeight: !p1Won ? 800 : 500, color: !p1Won ? '#fff' : 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.player2}</span>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
