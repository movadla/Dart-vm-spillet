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

export function StatusmailCard({ participants, headers }: { participants: Participant[]; headers: Record<string, string> }) {
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
export function EpostTab({ participantCount, participants, headers }: { participantCount: number; participants: Participant[]; headers: Record<string, string> }) {
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
            <input style={inputStyle} type="text" placeholder="World Grand Prix-Spillet — …" value={subject} onChange={(e) => setSubject(e.target.value)} required />
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
