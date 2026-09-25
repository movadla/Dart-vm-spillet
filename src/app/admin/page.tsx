'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { POTS, getIso2 } from '@/data/pots'
import { R1_MATCHES } from '@/lib/bracketProjection'
import Flag from '@/components/Flag'
import { STAGE_ORDER, STAGE_LABELS } from '@/config/scoring'
import { SPORT } from '@/config/theme'
import { ALL_PLAYERS, ALL_MATCH_PLAYERS, MATCH_STAGES, ADMIN_HEADERS, Tab, Participant, League, LeagueMember, MagicLink, card, cardHead, label, inputStyle, selectStyle, btn, csvExport } from './shared'
import { DeltakereTab } from './tabs/DeltakereTab'
import { LigaerTab } from './tabs/LigaerTab'
import { StatistikkTab } from './tabs/StatistikkTab'
import { VerktøyTab } from './tabs/VerktoyTab'
import { EpostTab } from './tabs/EpostTab'

function AdminContent() {
  const router = useRouter()

  const [tab, setTab] = useState<Tab>('deltakere')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchParticipants = useCallback(async () => {
    setLoading(true); setFetchError(null)
    try {
      const res = await fetch('/api/admin/participants', { headers: ADMIN_HEADERS })
      if (res.ok) setParticipants((await res.json()).participants ?? [])
      else setFetchError('Kunne ikke hente deltakere')
    } catch { setFetchError('Nettverksfeil — prøv igjen') }
    finally { setLoading(false) }
  }, [])

  // «Hent på mount»-mønsteret er korrekt — fetchParticipants er stabil (useCallback, ingen deps).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchParticipants() }, [fetchParticipants])

  const TABS: { id: Tab; label: string }[] = [
    { id: 'deltakere', label: 'Deltakere' },
    { id: 'ligaer', label: 'Ligaer' },
    { id: 'statistikk', label: 'Statistikk' },
    { id: 'verktøy', label: 'Verktøy' },
    { id: 'epost', label: 'E-post' },
  ]

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '32px 16px 56px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textDecoration: 'none' }}>← Hjem</Link>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 12, cursor: 'pointer', padding: 0 }}>Logg ut</button>
      </div>

      <div style={{ fontFamily: SPORT, fontSize: 52, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 24 }}>
        <div style={{ color: 'rgba(255,255,255,0.3)' }}>Dart-VM 2026</div>
        <div style={{ color: '#fff' }}>Admin</div>
      </div>

      {/* Tab-bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)', background: tab === t.id ? '#dc2626' : 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}
          >
            {t.label}
            {t.id === 'deltakere' && !loading && <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>{participants.length}</span>}
          </button>
        ))}
      </div>

      {tab === 'deltakere' && (
        <DeltakereTab participants={participants} loading={loading} error={fetchError} headers={ADMIN_HEADERS} onRefresh={fetchParticipants} />
      )}
      {tab === 'ligaer' && <LigaerTab headers={ADMIN_HEADERS} />}
      {tab === 'statistikk' && <StatistikkTab participantCount={participants.length} headers={ADMIN_HEADERS} />}
      {tab === 'verktøy' && <VerktøyTab headers={ADMIN_HEADERS} />}
      {tab === 'epost' && <EpostTab participantCount={participants.length} participants={participants} headers={ADMIN_HEADERS} />}
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '80px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Laster...</div>}>
      <AdminContent />
    </Suspense>
  )
}
