'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { POTS } from '@/data/pots'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'
const ALL_TEAMS = POTS.flatMap((p) => p.teams.map((t) => ({ name: t.name, flag: t.flag, pot: p.name }))).sort((a, b) => a.name.localeCompare(b.name, 'no'))

type Tab = 'deltakere' | 'ligaer' | 'statistikk' | 'verktøy' | 'epost'

interface Participant { id: string; name: string; email: string; created_at: string }
interface League { id: string; name: string; invite_code: string; created_at: string; member_count: number; hidden_until_kickoff: boolean }
interface LeagueMember { id: string; name: string; email: string; points: number }
interface MagicLink { token: string; participant_id: string; expires_at: string; used_at: string | null; participants: { name: string; email: string } | null }

const card: React.CSSProperties = { background: '#141414', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden', marginBottom: 16 }
const cardHead: React.CSSProperties = { padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
const label: React.CSSProperties = { fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#dc2626' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }
const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none' as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36 }
const btn = (variant: 'primary' | 'ghost' | 'danger' = 'ghost'): React.CSSProperties => ({
  padding: variant === 'primary' ? '14px' : '6px 14px',
  background: variant === 'primary' ? '#dc2626' : variant === 'danger' ? 'rgba(220,38,38,0.12)' : 'rgba(255,255,255,0.06)',
  border: `1px solid ${variant === 'primary' ? 'transparent' : variant === 'danger' ? 'rgba(220,38,38,0.3)' : 'rgba(255,255,255,0.1)'}`,
  borderRadius: variant === 'primary' ? 12 : 8,
  color: variant === 'danger' ? '#ef4444' : '#fff',
  fontSize: variant === 'primary' ? 14 : 12,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: variant === 'primary' ? SPORT : 'inherit',
  letterSpacing: variant === 'primary' ? '0.06em' : 'inherit',
  textTransform: variant === 'primary' ? 'uppercase' as const : 'none' as const,
})

function csvExport(participants: Participant[]) {
  const rows = [['Navn', 'E-post', 'Registrert']]
  for (const p of participants) {
    rows.push([p.name, p.email, new Date(p.created_at).toLocaleString('nb-NO')])
  }
  const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `deltakere-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  URL.revokeObjectURL(url)
}

// ─── Tab: Deltakere ───────────────────────────────────────────────────────────
function DeltakereTab({ participants, loading, error, headers, onRefresh }: {
  participants: Participant[]; loading: boolean; error: string | null
  headers: Record<string, string>; onRefresh: () => void
}) {
  const [deleting, setDeleting] = useState<string | null>(null)

  async function deleteParticipant(id: string, name: string) {
    if (!confirm(`Slett ${name}? Dette kan ikke angres.`)) return
    setDeleting(id)
    try {
      const res = await fetch('/api/admin/delete-participant', { method: 'DELETE', headers, body: JSON.stringify({ id }) })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(`Feil: ${data.error ?? res.statusText}`)
      }
    } catch {
      alert('Nettverksfeil — prøv igjen')
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

// ─── Tab: Ligaer ─────────────────────────────────────────────────────────────
function LigaerTab({ headers }: { headers: Record<string, string> }) {
  const [leagues, setLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [membersCache, setMembersCache] = useState<Record<string, LeagueMember[]>>({})
  const [membersLoading, setMembersLoading] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deletingLeague, setDeletingLeague] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/leagues', { headers })
      .then((r) => r.json())
      .then((d) => setLeagues(d.leagues ?? []))
      .finally(() => setLoading(false))
  }, [])

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
    try {
      const res = await fetch(`/api/admin/leagues/${id}`, { method: 'DELETE', headers })
      if (!res.ok) { alert('Feil ved sletting — prøv igjen'); return }
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

// ─── Tab: Statistikk ─────────────────────────────────────────────────────────
function StatistikkTab({ participantCount: totalCount, headers }: { participantCount: number; headers: Record<string, string> }) {
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
  }, [])

  useEffect(() => {
    setLoading(true)
    const url = selectedLeagueId ? `/api/admin/stats?leagueId=${selectedLeagueId}` : '/api/admin/stats'
    fetch(url, { headers })
      .then((r) => r.json())
      .then((d) => {
        setStats(d.byPot ?? {})
        setParticipantCount(d.participantCount ?? totalCount)
      })
      .finally(() => setLoading(false))
  }, [selectedLeagueId])

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
            href="https://vercel.com/movadla/vm-tipping/analytics"
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
          <div style={{ fontFamily: SPORT, fontSize: 36, fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{participantCount * 8}</div>
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
          const teamData = ALL_TEAMS.find((t) => t.name === team)
          const pct = Math.round((count / max) * 100)
          return (
            <div key={team} style={{ padding: '10px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{teamData?.flag ?? ''} {team}</span>
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

// ─── Tab: Verktøy ─────────────────────────────────────────────────────────────
function VerktøyTab({ headers }: { headers: Record<string, string> }) {
  const [syncMsg, setSyncMsg] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [links, setLinks] = useState<MagicLink[]>([])
  const [linksLoading, setLinksLoading] = useState(true)
  const [matchForm, setMatchForm] = useState({ home: '', away: '', homeGoals: '', awayGoals: '', stage: 'group' })
  const [matchMsg, setMatchMsg] = useState('')
  const [advForm, setAdvForm] = useState({ team: '', stage: 'group' })
  const [advMsg, setAdvMsg] = useState('')

  useEffect(() => {
    fetch('/api/admin/magic-links', { headers })
      .then((r) => r.json())
      .then((d) => setLinks(d.links ?? []))
      .finally(() => setLinksLoading(false))
  }, [])

  async function triggerSync() {
    setSyncing(true); setSyncMsg('')
    try {
      const res = await fetch('/api/admin/sync', { method: 'POST', headers })
      const data = await res.json()
      setSyncMsg(res.ok
        ? `✅ Synk fullført — ${(data.matches?.inserted ?? 0) + (data.matches?.updated ?? 0)} kamper, ${data.goals?.matchesUpdated ?? 0} kamper med mål oppdatert`
        : `❌ ${data.error ?? 'Synk feilet'}`)
    } catch { setSyncMsg('❌ Nettverksfeil') }
    finally { setSyncing(false) }
  }

  async function submitMatchResult(e: React.FormEvent) {
    e.preventDefault(); setMatchMsg('')
    try {
      const res = await fetch('/api/admin/match-result', { method: 'POST', headers, body: JSON.stringify({ home: matchForm.home, away: matchForm.away, homeGoals: parseInt(matchForm.homeGoals), awayGoals: parseInt(matchForm.awayGoals), stage: matchForm.stage }) })
      if (res.ok) { setMatchMsg('✅ Resultat lagret'); setMatchForm({ home: '', away: '', homeGoals: '', awayGoals: '', stage: 'group' }) }
      else setMatchMsg('❌ Feil ved lagring')
    } catch { setMatchMsg('❌ Serverfeil') }
  }

  async function submitAdvancement(e: React.FormEvent) {
    e.preventDefault(); setAdvMsg('')
    try {
      const res = await fetch('/api/admin/advancement', { method: 'POST', headers, body: JSON.stringify({ team: advForm.team, stage: advForm.stage }) })
      if (res.ok) { setAdvMsg('✅ Avansement lagret'); setAdvForm({ team: '', stage: 'group' }) }
      else setAdvMsg('❌ Feil ved lagring')
    } catch { setAdvMsg('❌ Serverfeil') }
  }

  async function deleteAdvancement() {
    if (!advForm.team) { setAdvMsg('❌ Velg et lag først'); return }
    if (!confirm(`Slette avansement for ${advForm.team}?`)) return
    setAdvMsg('')
    try {
      const res = await fetch('/api/admin/advancement', { method: 'DELETE', headers, body: JSON.stringify({ team: advForm.team }) })
      if (res.ok) { setAdvMsg(`✅ Avansement for ${advForm.team} slettet`); setAdvForm({ team: '', stage: 'group' }) }
      else setAdvMsg('❌ Feil ved sletting')
    } catch { setAdvMsg('❌ Serverfeil') }
  }

  return (
    <>
      {/* Synk */}
      <div style={{ ...card, overflow: 'visible' }}>
        <div style={cardHead}><span style={label}>Synkroniser resultater</span></div>
        <div style={{ padding: '16px 18px' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 14px' }}>
            Henter siste kampresultater fra football-data.org og oppdaterer poengsum for alle deltakere.
          </p>
          <button style={btn('primary')} onClick={triggerSync} disabled={syncing}>
            {syncing ? 'Synker...' : '⟳ Kjør synk nå'}
          </button>
          {syncMsg && <div style={{ fontSize: 13, marginTop: 12, color: syncMsg.startsWith('✅') ? '#22c55e' : '#ef4444' }}>{syncMsg}</div>}
        </div>
      </div>

      {/* Kampresultat-skjema */}
      <div style={{ ...card, overflow: 'visible' }}>
        <div style={cardHead}><span style={label}>Legg inn kampresultat manuelt</span></div>
        <div style={{ padding: '16px 18px' }}>
          <form onSubmit={submitMatchResult} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(['home', 'away'] as const).map((key) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>{key === 'home' ? 'Hjemmelag' : 'Bortelag'}</label>
                  <select style={selectStyle} value={matchForm[key]} onChange={(e) => setMatchForm((f) => ({ ...f, [key]: e.target.value }))} required>
                    <option value="">Velg lag</option>
                    {ALL_TEAMS.map((t) => <option key={t.name} value={t.name}>{t.flag} {t.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(['homeGoals', 'awayGoals'] as const).map((key) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>{key === 'homeGoals' ? 'Hjemmemål' : 'Bortemål'}</label>
                  <input style={inputStyle} type="number" min={0} placeholder="0" value={matchForm[key]} onChange={(e) => setMatchForm((f) => ({ ...f, [key]: e.target.value }))} required />
                </div>
              ))}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>Fase</label>
              <select style={selectStyle} value={matchForm.stage} onChange={(e) => setMatchForm((f) => ({ ...f, stage: e.target.value }))}>
                <option value="group">Gruppespill</option>
                <option value="r32">R32</option>
                <option value="r16">R16</option>
                <option value="qf">Kvartfinale</option>
                <option value="sf">Semifinale</option>
                <option value="final">Finale</option>
              </select>
            </div>
            <button type="submit" style={btn('primary')}>Lagre resultat</button>
            {matchMsg && <div style={{ fontSize: 13, color: matchMsg.startsWith('✅') ? '#22c55e' : '#ef4444', textAlign: 'center' }}>{matchMsg}</div>}
          </form>
        </div>
      </div>

      {/* Avansement */}
      <div style={{ ...card, overflow: 'visible' }}>
        <div style={cardHead}><span style={label}>Oppdater avansement</span></div>
        <div style={{ padding: '16px 18px' }}>
          <form onSubmit={submitAdvancement} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>Lag</label>
              <select style={selectStyle} value={advForm.team} onChange={(e) => setAdvForm((f) => ({ ...f, team: e.target.value }))} required>
                <option value="">Velg lag</option>
                {ALL_TEAMS.map((t) => <option key={t.name} value={t.name}>{t.flag} {t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>Stadium nådd</label>
              <select style={selectStyle} value={advForm.stage} onChange={(e) => setAdvForm((f) => ({ ...f, stage: e.target.value }))}>
                <option value="group">Videre fra gruppe (+5p)</option>
                <option value="r32">Vinner R32 (+8p)</option>
                <option value="r16">Vinner R16 (+12p)</option>
                <option value="qf">Vinner QF (+17p)</option>
                <option value="sf">Vinner SF (+24p)</option>
                <option value="final">I finalen</option>
                <option value="winner">VM-vinner (+32p)</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={{ ...btn('primary'), flex: 1 }}>Lagre avansement</button>
              <button type="button" style={{ ...btn('danger'), flex: 1 }} onClick={deleteAdvancement}>Slett avansement</button>
            </div>
            {advMsg && <div style={{ fontSize: 13, color: advMsg.startsWith('✅') ? '#22c55e' : '#ef4444', textAlign: 'center' }}>{advMsg}</div>}
          </form>
        </div>
      </div>

      {/* Magic link-logg */}
      <div style={card}>
        <div style={cardHead}><span style={label}>Magic link-logg (siste 50)</span></div>
        {linksLoading ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Laster...</div>
        ) : links.length === 0 ? (
          <div style={{ padding: 24, color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Ingen magic links ennå.</div>
        ) : links.map((l) => {
          const now = new Date()
          const exp = new Date(l.expires_at)
          const isUsed = !!l.used_at
          const isExpired = exp < now
          const status = isUsed ? { text: 'Brukt', color: '#22c55e' } : isExpired ? { text: 'Utløpt', color: 'rgba(255,255,255,0.2)' } : { text: 'Aktiv', color: '#f59e0b' }
          return (
            <div key={l.token} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{l.participants?.name ?? '—'}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{l.participants?.email ?? l.participant_id.slice(0, 8)}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>
                  Gyldig til {exp.toLocaleString('nb-NO')}
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: status.color }}>{status.text}</span>
            </div>
          )
        })}
      </div>
    </>
  )
}

// ─── Statusmail-kort ─────────────────────────────────────────────────────────
function StatusmailCard({ participants, headers }: { participants: Participant[]; headers: Record<string, string> }) {
  const [recipientMode, setRecipientMode] = useState<'all' | 'leagues' | 'persons'>('all')
  const [leagues, setLeagues] = useState<League[]>([])
  const [leaguesLoading, setLeaguesLoading] = useState(false)
  const [selectedLeagueIds, setSelectedLeagueIds] = useState<Set<string>>(new Set())
  const [selectedPersonIds, setSelectedPersonIds] = useState<Set<string>>(new Set())
  const [personSearch, setPersonSearch] = useState('')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')

  async function fetchLeagues() {
    if (leagues.length > 0) return
    setLeaguesLoading(true)
    try {
      const res = await fetch('/api/admin/leagues', { headers })
      if (res.ok) setLeagues((await res.json()).leagues ?? [])
    } finally { setLeaguesLoading(false) }
  }

  function toggleLeague(id: string) {
    setSelectedLeagueIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function togglePerson(id: string) {
    setSelectedPersonIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const filteredParticipants = personSearch.trim()
    ? participants.filter(p => p.name.toLowerCase().includes(personSearch.toLowerCase()) || p.email.toLowerCase().includes(personSearch.toLowerCase()))
    : participants

  const recipientLabel = recipientMode === 'all'
    ? `alle ${participants.length} deltakere`
    : recipientMode === 'leagues'
      ? `${selectedLeagueIds.size} liga${selectedLeagueIds.size !== 1 ? 'er' : ''}`
      : selectedPersonIds.size === 1
        ? participants.find(p => selectedPersonIds.has(p.id))?.name ?? '1 deltaker'
        : `${selectedPersonIds.size} deltakere`

  const canSend = recipientMode === 'all'
    || (recipientMode === 'leagues' && selectedLeagueIds.size > 0)
    || (recipientMode === 'persons' && selectedPersonIds.size > 0)

  async function sendStatusmail() {
    if (!confirm(`Send daglig statusmail til ${recipientLabel}?`)) return
    setSending(true); setMsg('')
    try {
      const payload: Record<string, unknown> = {}
      if (recipientMode === 'leagues') payload.leagueIds = [...selectedLeagueIds]
      else if (recipientMode === 'persons') payload.participantIds = [...selectedPersonIds]
      const res = await fetch('/api/admin/send-status-email', { method: 'POST', headers, body: JSON.stringify(payload) })
      const data = await res.json()
      if (res.ok) setMsg(`✅ Sendt til ${data.sent} av ${data.total} deltakere`)
      else setMsg(`❌ ${data.error ?? 'Sending feilet'}`)
    } catch { setMsg('❌ Nettverksfeil') }
    finally { setSending(false) }
  }

  const modeBtn = (mode: 'all' | 'leagues' | 'persons'): React.CSSProperties => ({
    padding: '8px 14px', borderRadius: 8, border: '1px solid',
    borderColor: recipientMode === mode ? '#dc2626' : 'rgba(255,255,255,0.1)',
    background: recipientMode === mode ? 'rgba(220,38,38,0.12)' : 'rgba(255,255,255,0.04)',
    color: recipientMode === mode ? '#fff' : 'rgba(255,255,255,0.4)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  })
  const listBox: React.CSSProperties = { marginTop: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 14px', maxHeight: 220, overflowY: 'auto' }

  return (
    <div style={{ ...card, overflow: 'visible', marginBottom: 16 }}>
      <div style={cardHead}><span style={label}>Send daglig statusmail</span></div>
      <div style={{ padding: '16px 18px' }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 16px', lineHeight: 1.5 }}>
          Sender den daglige statusmailen med poeng, ligaer og gårsdagens resultater — lik den automatiske kl. 09:00.
        </p>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Mottakere</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            <button type="button" onClick={() => setRecipientMode('all')} style={modeBtn('all')}>Alle ({participants.length})</button>
            <button type="button" onClick={() => { setRecipientMode('leagues'); fetchLeagues() }} style={modeBtn('leagues')}>Velg ligaer</button>
            <button type="button" onClick={() => setRecipientMode('persons')} style={modeBtn('persons')}>Velg deltakere</button>
          </div>

          {recipientMode === 'leagues' && (
            <div style={listBox}>
              {leaguesLoading ? (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', padding: '4px 0' }}>Laster ligaer...</div>
              ) : leagues.length === 0 ? (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', padding: '4px 0' }}>Ingen ligaer funnet</div>
              ) : leagues.map((l, i) => (
                <label key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < leagues.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedLeagueIds.has(l.id)} onChange={() => toggleLeague(l.id)} style={{ width: 15, height: 15, accentColor: '#dc2626', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#fff', flex: 1 }}>{l.name}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' as const }}>{l.member_count} deltakere</span>
                </label>
              ))}
            </div>
          )}

          {recipientMode === 'persons' && (
            <div style={{ marginTop: 10 }}>
              <input type="search" placeholder="Søk på navn eller e-post…" value={personSearch} onChange={e => setPersonSearch(e.target.value)} style={{ ...inputStyle, marginBottom: 8 }} />
              <div style={listBox}>
                {filteredParticipants.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', padding: '4px 0' }}>Ingen treff</div>
                ) : filteredParticipants.map((p, i) => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < filteredParticipants.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer' }}>
                    <input type="checkbox" checked={selectedPersonIds.has(p.id)} onChange={() => togglePerson(p.id)} style={{ width: 15, height: 15, accentColor: '#dc2626', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#fff', flex: 1 }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' as const }}>{p.email}</span>
                  </label>
                ))}
              </div>
              {selectedPersonIds.size > 0 && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>{selectedPersonIds.size} valgt</div>}
            </div>
          )}
        </div>

        <button
          onClick={sendStatusmail}
          disabled={sending || !canSend}
          style={{ ...btn('primary'), width: '100%', opacity: !canSend ? 0.4 : 1 }}
        >
          {sending ? 'Sender...' : canSend ? `Send til ${recipientLabel}` : 'Velg mottakere'}
        </button>
        {msg && <div style={{ fontSize: 13, color: msg.startsWith('✅') ? '#22c55e' : '#ef4444', textAlign: 'center', marginTop: 12 }}>{msg}</div>}
      </div>
    </div>
  )
}

// ─── Tab: E-post ──────────────────────────────────────────────────────────────
function EpostTab({ participantCount, participants, headers }: { participantCount: number; participants: Participant[]; headers: Record<string, string> }) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')
  const [recipientMode, setRecipientMode] = useState<'all' | 'leagues' | 'persons'>('all')
  const [leagues, setLeagues] = useState<League[]>([])
  const [leaguesLoading, setLeaguesLoading] = useState(false)
  const [selectedLeagueIds, setSelectedLeagueIds] = useState<Set<string>>(new Set())
  const [selectedPersonIds, setSelectedPersonIds] = useState<Set<string>>(new Set())
  const [personSearch, setPersonSearch] = useState('')

  async function fetchLeagues() {
    if (leagues.length > 0) return
    setLeaguesLoading(true)
    try {
      const res = await fetch('/api/admin/leagues', { headers })
      if (res.ok) setLeagues((await res.json()).leagues ?? [])
    } finally { setLeaguesLoading(false) }
  }

  function toggleLeague(id: string) {
    setSelectedLeagueIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function togglePerson(id: string) {
    setSelectedPersonIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredParticipants = personSearch.trim()
    ? participants.filter(p =>
        p.name.toLowerCase().includes(personSearch.toLowerCase()) ||
        p.email.toLowerCase().includes(personSearch.toLowerCase())
      )
    : participants

  async function sendBroadcast(e: React.FormEvent) {
    e.preventDefault()
    const targetDesc = recipientMode === 'all'
      ? `alle ${participantCount} deltakere`
      : recipientMode === 'leagues'
        ? `${selectedLeagueIds.size} liga${selectedLeagueIds.size > 1 ? 'er' : ''}`
        : selectedPersonIds.size === 1
          ? participants.find(p => selectedPersonIds.has(p.id))?.name ?? '1 deltaker'
          : `${selectedPersonIds.size} deltakere`
    if (!confirm(`Send e-post til ${targetDesc}?`)) return
    setSending(true); setMsg('')
    try {
      const payload: Record<string, unknown> = { subject, body }
      if (recipientMode === 'leagues' && selectedLeagueIds.size > 0) {
        payload.leagueIds = [...selectedLeagueIds]
      } else if (recipientMode === 'persons' && selectedPersonIds.size > 0) {
        payload.participantIds = [...selectedPersonIds]
      }
      const res = await fetch('/api/admin/broadcast', { method: 'POST', headers, body: JSON.stringify(payload) })
      const data = await res.json()
      if (res.ok) { setMsg(`✅ Sendt til ${data.sent} deltakere`); setSubject(''); setBody('') }
      else setMsg(`❌ ${data.error ?? 'Sending feilet'}`)
    } catch { setMsg('❌ Nettverksfeil') }
    finally { setSending(false) }
  }

  const modeBtn = (mode: 'all' | 'leagues' | 'persons'): React.CSSProperties => ({
    padding: '8px 14px', borderRadius: 8, border: '1px solid',
    borderColor: recipientMode === mode ? '#dc2626' : 'rgba(255,255,255,0.1)',
    background: recipientMode === mode ? 'rgba(220,38,38,0.12)' : 'rgba(255,255,255,0.04)',
    color: recipientMode === mode ? '#fff' : 'rgba(255,255,255,0.4)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  })

  const listBox: React.CSSProperties = { marginTop: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 14px', maxHeight: 220, overflowY: 'auto' }

  return (
    <>
    <StatusmailCard participants={participants} headers={headers} />
    <div style={{ ...card, overflow: 'visible' }}>
      <div style={cardHead}><span style={label}>Send melding til deltakere</span></div>
      <div style={{ padding: '16px 18px' }}>

        {/* Mottaker-valg */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Mottakere</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            <button type="button" onClick={() => setRecipientMode('all')} style={modeBtn('all')}>
              Alle deltakere ({participantCount})
            </button>
            <button type="button" onClick={() => { setRecipientMode('leagues'); fetchLeagues() }} style={modeBtn('leagues')}>
              Velg ligaer
            </button>
            <button type="button" onClick={() => setRecipientMode('persons')} style={modeBtn('persons')}>
              Velg deltakere
            </button>
          </div>

          {recipientMode === 'leagues' && (
            <div style={listBox}>
              {leaguesLoading ? (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', padding: '4px 0' }}>Laster ligaer...</div>
              ) : leagues.length === 0 ? (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', padding: '4px 0' }}>Ingen ligaer funnet</div>
              ) : leagues.map((league, i) => (
                <label key={league.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < leagues.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedLeagueIds.has(league.id)}
                    onChange={() => toggleLeague(league.id)}
                    style={{ width: 15, height: 15, accentColor: '#dc2626', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13, color: '#fff', flex: 1 }}>{league.name}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' as const }}>{league.member_count} deltakere</span>
                </label>
              ))}
            </div>
          )}

          {recipientMode === 'persons' && (
            <div style={{ marginTop: 10 }}>
              <input
                type="search"
                placeholder="Søk på navn eller e-post…"
                value={personSearch}
                onChange={e => setPersonSearch(e.target.value)}
                style={{ ...inputStyle, marginBottom: 8 }}
              />
              <div style={listBox}>
                {filteredParticipants.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', padding: '4px 0' }}>Ingen treff</div>
                ) : filteredParticipants.map((p, i) => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < filteredParticipants.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedPersonIds.has(p.id)}
                      onChange={() => togglePerson(p.id)}
                      style={{ width: 15, height: 15, accentColor: '#dc2626', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 13, color: '#fff', flex: 1 }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' as const }}>{p.email}</span>
                  </label>
                ))}
              </div>
              {selectedPersonIds.size > 0 && (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>{selectedPersonIds.size} valgt</div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={sendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>Emne</label>
            <input style={inputStyle} type="text" placeholder="VM-Spillet 2026 — …" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>Innhold</label>
            <textarea
              style={{ ...inputStyle, minHeight: 140, resize: 'vertical' as const, lineHeight: 1.5 }}
              placeholder="Skriv meldingen her. Tomme linjer blir avsnitt."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            style={btn('primary')}
            disabled={sending
              || (recipientMode === 'leagues' && selectedLeagueIds.size === 0)
              || (recipientMode === 'persons' && selectedPersonIds.size === 0)}
          >
            {sending ? 'Sender...' : recipientMode === 'all'
              ? `Send til ${participantCount} deltakere`
              : recipientMode === 'leagues'
                ? selectedLeagueIds.size === 0 ? 'Velg minst én liga' : `Send til ${selectedLeagueIds.size} liga${selectedLeagueIds.size > 1 ? 'er' : ''}`
                : selectedPersonIds.size === 0 ? 'Velg minst én deltaker' : `Send til ${selectedPersonIds.size} deltaker${selectedPersonIds.size > 1 ? 'e' : ''}`}
          </button>
          {msg && <div style={{ fontSize: 13, color: msg.startsWith('✅') ? '#22c55e' : '#ef4444', textAlign: 'center' }}>{msg}</div>}
        </form>
      </div>
    </div>
    </>
  )
}

// ─── Hoved-komponent ─────────────────────────────────────────────────────────
function AdminContent() {
  const router = useRouter()
  const adminHeaders = { 'Content-Type': 'application/json' }

  const [tab, setTab] = useState<Tab>('deltakere')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchParticipants = useCallback(async () => {
    setLoading(true); setFetchError(null)
    try {
      const res = await fetch('/api/admin/participants', { headers: adminHeaders })
      if (res.ok) setParticipants((await res.json()).participants ?? [])
      else setFetchError('Kunne ikke hente deltakere')
    } catch { setFetchError('Nettverksfeil — prøv igjen') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchParticipants() }, [])

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
      <img src="/snåsamannen.png" alt="" style={{ position: 'absolute', right: -10, top: 0, width: 260, opacity: 0.32, pointerEvents: 'none', zIndex: 0, filter: 'brightness(1.0) saturate(0.7) contrast(1.05)', maskImage: 'radial-gradient(ellipse 62% 42% at 56% 23%, black 0%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 62% 42% at 56% 23%, black 0%, transparent 100%)' }} />
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textDecoration: 'none' }}>← Hjem</Link>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 12, cursor: 'pointer', padding: 0 }}>Logg ut</button>
      </div>

      <div style={{ fontFamily: SPORT, fontSize: 52, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 24 }}>
        <div style={{ color: 'rgba(255,255,255,0.3)' }}>VM 2026</div>
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
        <DeltakereTab participants={participants} loading={loading} error={fetchError} headers={adminHeaders} onRefresh={fetchParticipants} />
      )}
      {tab === 'ligaer' && <LigaerTab headers={adminHeaders} />}
      {tab === 'statistikk' && <StatistikkTab participantCount={participants.length} headers={adminHeaders} />}
      {tab === 'verktøy' && <VerktøyTab headers={adminHeaders} />}
      {tab === 'epost' && <EpostTab participantCount={participants.length} participants={participants} headers={adminHeaders} />}
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
