'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { POTS, getIso2 } from '@/data/pots'
import { R1_MATCHES } from '@/lib/bracketProjection'
import Flag from '@/components/Flag'
import { STAGE_ORDER, STAGE_LABELS } from '@/config/scoring'
import { SPORT } from '@/config/theme'
import { ALL_PLAYERS, ALL_MATCH_PLAYERS, MATCH_STAGES, ADMIN_HEADERS, Tab, Participant, League, LeagueMember, MagicLink, card, cardHead, label, inputStyle, selectStyle, btn, csvExport } from '../shared'

// ─── Tab: Statistikk ─────────────────────────────────────────────────────────
export function StatistikkTab({ participantCount: totalCount, headers }: { participantCount: number; headers: Record<string, string> }) {
  const [stats, setStats] = useState<Record<number, { team: string; count: number }[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedPot, setSelectedPot] = useState(1)
  const [leagues, setLeagues] = useState<League[]>([])
  const [selectedLeagueId, setSelectedLeagueId] = useState('')
  const [participantCount, setParticipantCount] = useState(totalCount)

  useEffect(() => {
    fetch('/api/admin/leagues', { headers })
      .then((r) => r.json())
      .then((d) => setLeagues(d.leagues ?? []))
  }, [headers])

  // Refetch trigges med vilje av selectedLeagueId/totalCount — «start lasting, så fetch»
  // er korrekt her, ikke noe som bør flyttes til en lazy initializer.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    const url = selectedLeagueId ? `/api/admin/stats?leagueId=${selectedLeagueId}` : '/api/admin/stats'
    fetch(url, { headers })
      .then((r) => r.json())
      .then((d) => {
        setStats(d.byPot ?? {})
        setParticipantCount(d.participantCount ?? totalCount)
      })
      .finally(() => setLoading(false))
  }, [selectedLeagueId, headers, totalCount])

  const potTeams = stats[selectedPot] ?? []
  const max = potTeams[0]?.count ?? 1

  return (
    <>
      {/* Trafikk — Vercel Analytics har ingen offentlig REST API, lenker til dashbordet */}
      <div style={card}>
        <div style={cardHead}><span style={label}>Trafikk</span></div>
        <div style={{ padding: '12px 18px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>
            Sidevisninger, besøkende, enheter og land vises i Vercel-dashbordet. Tracking er aktivt.
          </p>
          <a
            // Pekte tidligere direkte til det GAMLE fotball-VM-prosjektet
            // ("vm-tipping") sitt Vercel-dashbord — en rest fra kopieringen.
            // Peker nå til den generelle dashbord-lenken siden dette
            // dart-prosjektet ikke er deployet til Vercel ennå (se TODO.md);
            // bytt til den direkte /analytics-lenken for RIKTIG prosjekt når
            // det er satt opp.
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', width: 'fit-content' }}
          >
            Åpne Vercel Analytics →
          </a>
        </div>
      </div>

      {/* Liga-filter */}
      <div style={{ marginBottom: 16 }}>
        <select
          value={selectedLeagueId}
          onChange={(e) => setSelectedLeagueId(e.target.value)}
          style={{ ...selectStyle, maxWidth: 320 }}
        >
          <option value="">Alle deltakere ({totalCount})</option>
          {leagues.map((l) => (
            <option key={l.id} value={l.id}>{l.name} ({l.member_count})</option>
          ))}
        </select>
      </div>

      {/* Sammendrag */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, textAlign: 'center' }}>
          <div style={{ fontFamily: SPORT, fontSize: 36, fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>{participantCount}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{selectedLeagueId ? 'Deltakere i liga' : 'Deltakere'}</div>
        </div>
        <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, textAlign: 'center' }}>
          <div style={{ fontFamily: SPORT, fontSize: 36, fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{participantCount * POTS.length}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Totale picks</div>
        </div>
      </div>

      {/* Picks per pot */}
      <div style={card}>
        <div style={{ ...cardHead, flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
          <span style={label}>Mest plukket</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {POTS.map((p, i) => (
              <button
                key={i}
                onClick={() => setSelectedPot(i + 1)}
                style={{ padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.15)', background: selectedPot === i + 1 ? '#dc2626' : 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Pot {i + 1}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Laster...</div>
        ) : potTeams.length === 0 ? (
          <div style={{ padding: 24, color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Ingen picks ennå.</div>
        ) : potTeams.slice(0, 10).map(({ team, count }, i) => {
          const pct = Math.round((count / max) * 100)
          return (
            <div key={team} style={{ padding: '10px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Flag iso2={getIso2(team)} size={16} /> {team}</span>
                <span style={{ fontSize: 12, color: i === 0 ? '#fbbf24' : 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{count} ({participantCount > 0 ? Math.round(count / participantCount * 100) : 0}%)</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <div style={{ height: 4, width: `${pct}%`, background: i === 0 ? '#fbbf24' : '#dc2626', borderRadius: 2 }} />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
