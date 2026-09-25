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

// ─── Tab: Ligaer ─────────────────────────────────────────────────────────────
export function LigaerTab({ headers }: { headers: Record<string, string> }) {
  const [leagues, setLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [membersCache, setMembersCache] = useState<Record<string, LeagueMember[]>>({})
  const [membersLoading, setMembersLoading] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deletingLeague, setDeletingLeague] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/leagues', { headers })
      .then((r) => r.json())
      .then((d) => setLeagues(d.leagues ?? []))
      .finally(() => setLoading(false))
  }, [headers])

  async function toggleLeague(id: string) {
    if (expandedId === id) { setExpandedId(null); return }
    setExpandedId(id)
    if (membersCache[id]) return
    setMembersLoading(id)
    try {
      const res = await fetch(`/api/admin/leagues/${id}/members`, { headers })
      const data = await res.json()
      setMembersCache((prev) => ({ ...prev, [id]: data.members ?? [] }))
    } finally {
      setMembersLoading(null)
    }
  }

  async function deleteLeague(id: string, name: string) {
    if (!confirm(`Slett ligaen «${name}»? Alle medlemmer fjernes. Dette kan ikke angres.`)) return
    setDeletingLeague(id)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/admin/leagues/${id}`, { method: 'DELETE', headers })
      if (!res.ok) { setDeleteError(`Kunne ikke slette «${name}» — prøv igjen`); return }
      setLeagues((prev) => prev.filter((l) => l.id !== id))
      if (expandedId === id) setExpandedId(null)
    } finally {
      setDeletingLeague(null)
    }
  }

  async function toggleHidden(id: string, current: boolean) {
    setToggling(id)
    try {
      await fetch(`/api/admin/leagues/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ hidden_until_kickoff: !current }),
      })
      setLeagues((prev) => prev.map((l) => l.id === id ? { ...l, hidden_until_kickoff: !current } : l))
    } finally {
      setToggling(null)
    }
  }

  return (
    <div style={card}>
      <div style={cardHead}><span style={label}>Ligaer ({leagues.length})</span></div>
      {deleteError && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 18px', background: 'rgba(220,38,38,0.1)', borderBottom: '1px solid rgba(220,38,38,0.2)', color: '#ef4444', fontSize: 13 }}>
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} aria-label="Lukk feilmelding" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✕</button>
        </div>
      )}
      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Laster...</div>
      ) : leagues.length === 0 ? (
        <div style={{ padding: 24, color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Ingen ligaer opprettet ennå.</div>
      ) : leagues.map((l) => (
        <div key={l.id}>
          <div
            onClick={() => toggleLeague(l.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{l.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                Kode: <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>{l.invite_code}</span>
                {' · '}{new Date(l.created_at).toLocaleDateString('nb-NO')}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); toggleHidden(l.id, l.hidden_until_kickoff) }}
              disabled={toggling === l.id}
              title={l.hidden_until_kickoff ? 'Deltakerliste skjult — klikk for å vise' : 'Deltakerliste synlig — klikk for å skjule'}
              style={{ padding: '3px 8px', borderRadius: 6, border: `1px solid ${l.hidden_until_kickoff ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.1)'}`, background: l.hidden_until_kickoff ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)', color: l.hidden_until_kickoff ? '#f59e0b' : 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, cursor: 'pointer', opacity: toggling === l.id ? 0.5 : 1 }}
            >
              {l.hidden_until_kickoff ? '🔒 Skjult' : '👁 Synlig'}
            </button>
            <div style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, color: '#22c55e', minWidth: 32, textAlign: 'right' }}>{l.member_count}</div>
            <button
              onClick={(e) => { e.stopPropagation(); deleteLeague(l.id, l.name) }}
              disabled={deletingLeague === l.id}
              style={{ ...btn('danger'), padding: '3px 8px', fontSize: 11, opacity: deletingLeague === l.id ? 0.5 : 1 }}
            >
              Slett
            </button>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', transform: expandedId === l.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▼</div>
          </div>
          {expandedId === l.id && (
            <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {membersLoading === l.id ? (
                <div style={{ padding: '12px 18px 12px 28px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Laster...</div>
              ) : !membersCache[l.id]?.length ? (
                <div style={{ padding: '12px 18px 12px 28px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Ingen deltakere.</div>
              ) : membersCache[l.id].map((m, i) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 18px 9px 28px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ fontFamily: SPORT, fontSize: 15, fontWeight: 900, color: 'rgba(255,255,255,0.2)', minWidth: 20, textAlign: 'right' }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{m.email}</div>
                  </div>
                  <div style={{ fontFamily: SPORT, fontSize: 17, fontWeight: 900, color: '#f59e0b' }}>{m.points}p</div>
                  <Link href={`/deltaker/${m.id}`} style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>Se →</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
