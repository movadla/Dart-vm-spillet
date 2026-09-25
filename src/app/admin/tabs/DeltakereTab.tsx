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

// ─── Tab: Deltakere ───────────────────────────────────────────────────────────
export function DeltakereTab({ participants, loading, error, headers, onRefresh }: {
  participants: Participant[]; loading: boolean; error: string | null
  headers: Record<string, string>; onRefresh: () => void
}) {
  const [deleting, setDeleting] = useState<string | null>(null)
  // Erstatter alert() — lett å overse midt i en hektisk økt med mange
  // handlinger, og blokkerer resten av siden til den avvises manuelt.
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function deleteParticipant(id: string, name: string) {
    if (!confirm(`Slett ${name}? Dette kan ikke angres.`)) return
    setDeleting(id)
    setDeleteError(null)
    try {
      const res = await fetch('/api/admin/delete-participant', { method: 'DELETE', headers, body: JSON.stringify({ id }) })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setDeleteError(`Kunne ikke slette ${name}: ${data.error ?? res.statusText}`)
      }
    } catch {
      setDeleteError(`Kunne ikke slette ${name}: nettverksfeil — prøv igjen`)
    } finally {
      setDeleting(null)
      onRefresh()
    }
  }

  return (
    <div style={card}>
      <div style={cardHead}>
        <span style={label}>Deltakere ({participants.length})</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn()} onClick={() => csvExport(participants)}>CSV ↓</button>
          <button style={btn()} onClick={onRefresh}>Oppdater</button>
        </div>
      </div>
      {deleteError && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 18px', background: 'rgba(220,38,38,0.1)', borderBottom: '1px solid rgba(220,38,38,0.2)', color: '#ef4444', fontSize: 13 }}>
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} aria-label="Lukk feilmelding" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✕</button>
        </div>
      )}
      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Laster...</div>
      ) : error ? (
        <div style={{ padding: 24, color: '#ef4444', fontSize: 14 }}>{error}</div>
      ) : participants.length === 0 ? (
        <div style={{ padding: 24, color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Ingen deltakere ennå.</div>
      ) : participants.map((p) => (
        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{p.email}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>{new Date(p.created_at).toLocaleString('nb-NO')}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href={`/deltaker/${p.id}`} style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Se →</Link>
            <button
              style={{ ...btn('danger'), padding: '4px 10px', fontSize: 11, opacity: deleting === p.id ? 0.5 : 1 }}
              onClick={() => deleteParticipant(p.id, p.name)}
              disabled={deleting === p.id}
            >Slett</button>
          </div>
        </div>
      ))}
    </div>
  )
}
