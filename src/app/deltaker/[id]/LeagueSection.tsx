'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import CopyCode from '@/components/CopyCode'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'
const KICKOFF = new Date('2026-06-11T19:00:00Z')
const isBeforeKickoff = new Date() < KICKOFF

function ShareLeagueButton({ name, code }: { name: string; code: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    const url = `${window.location.origin}/liga/${code}`
    const text = `Bli med i ${name}! Kode: ${code}`
    if (navigator.share) {
      try { await navigator.share({ title: `${name} – VM-Spillet 2026`, text, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button onClick={handleShare} className="btn-hover" style={{
      padding: '3px 8px', flexShrink: 0,
      background: copied ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${copied ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 6, color: copied ? '#22c55e' : 'rgba(255,255,255,0.35)',
      fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: SPORT,
      letterSpacing: '0.06em', textTransform: 'uppercase' as const,
    }}>
      {copied ? '✓' : 'Del →'}
    </button>
  )
}

interface League { name: string; invite_code: string; rank?: number; total?: number }

export type Mode = 'idle' | 'create' | 'join'

export default function LeagueSection({ participantId, showHeader = true, mode: modeProp, onModeChange, overallRank, overallTotal }: { participantId: string; showHeader?: boolean; mode?: Mode; onModeChange?: (m: Mode) => void; overallRank?: number; overallTotal?: number }) {
const [leagues, setLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)
  const [modeInternal, setModeInternal] = useState<Mode>('idle')
  const mode = modeProp ?? modeInternal
  const setMode = onModeChange ?? setModeInternal
  const [ligaNavn, setLigaNavn] = useState('')
  const [kode, setKode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [newLeague, setNewLeague] = useState<League | null>(null)

  useEffect(() => {
    async function fetchLeagues() {
      try {
        const res = await fetch(`/api/league/mine?participantId=${participantId}`)
        if (res.ok) {
          const data = await res.json()
          setLeagues(data.leagues ?? [])
        }
      } catch {
        // ignore — tables may not exist yet
      } finally {
        setLoading(false)
      }
    }
    fetchLeagues()
  }, [participantId])

  async function handleCreate() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/league/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: ligaNavn.trim(), participantId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Noe gikk galt'); return }
      const created = { name: ligaNavn.trim(), invite_code: data.inviteCode }
      setLeagues(prev => [...prev, created])
      setNewLeague(created)
      setMode('idle')
      setLigaNavn('')
    } catch {
      setError('Noe gikk galt')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleJoin() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/league/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: kode.trim().toUpperCase(), participantId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Noe gikk galt'); return }
      const joined = { name: data.leagueName, invite_code: kode.trim().toUpperCase() }
      setLeagues(prev => [...prev, joined])
      setNewLeague(joined)
      setMode('idle')
      setKode('')
    } catch {
      setError('Noe gikk galt')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#fff', fontSize: 16,
    boxSizing: 'border-box',
  }

  return (
    <div style={{ marginBottom: showHeader ? 20 : 0 }}>
      {showHeader && (
        <>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: leagues.length === 0 && !loading ? 4 : 12 }}>
            Venneligaer
          </div>
          {leagues.length === 0 && !loading && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 12, lineHeight: 1.5 }}>
              Spill mot venner — lag en liga og del koden.
            </div>
          )}
        </>
      )}

      {/* Nye liga-bekreftelse */}
      {newLeague && (
        <div style={{ background: 'linear-gradient(160deg, rgba(34,197,94,0.07) 0%, rgba(34,197,94,0.03) 100%)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 14, padding: '14px 16px', marginBottom: 10, animation: 'slide-enter 0.2s ease-out' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', marginBottom: 6 }}>
            {newLeague.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Kode:</span>
            <CopyCode code={newLeague.invite_code} fontSize={20} letterSpacing="0.1em" />
          </div>
          <Link href={`/liga/${newLeague.invite_code}`} className="btn-hover" style={{ fontSize: 12, color: '#22c55e', fontWeight: 700, textDecoration: 'none' }}>
            Se ligaen →
          </Link>
        </div>
      )}

      {/* Eksisterende ligaer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: mode === 'idle' && !onModeChange && leagues.filter(l => l.invite_code !== newLeague?.invite_code).length > 0 ? 8 : 0 }}>
        {loading && [0, 1].map(i => (
          <div key={i} className="skeleton" style={{ height: 46, borderRadius: 12 }} />
        ))}
        {!loading && leagues.filter(l => l.invite_code !== newLeague?.invite_code).map((l) => (
          <div key={l.invite_code} className="lb-card" style={{ background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}>
            <Link href={`/liga/${l.invite_code}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px 11px 16px', textDecoration: 'none', gap: 8, minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {!isBeforeKickoff && l.rank != null && (
                  <span style={{ fontFamily: SPORT, fontSize: 20, fontWeight: 900, color: '#fbbf24', lineHeight: 1, letterSpacing: '-0.5px' }}>
                    {l.rank}<span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/{l.total}</span>
                  </span>
                )}
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>›</span>
              </div>
            </Link>
            {isBeforeKickoff && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', borderLeft: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, width: '50%' }}>
                <CopyCode code={l.invite_code} fontSize={14} color="rgba(255,255,255,0.5)" letterSpacing="0.18em" />
                <div style={{ marginLeft: 'auto' }}>
                  <ShareLeagueButton name={l.name} code={l.invite_code} />
                </div>
              </div>
            )}
          </div>
        ))}
        {overallRank !== undefined && (
          <Link href="/leaderboard" className="lb-card" style={{ background: 'linear-gradient(180deg, #1c2030 0%, #14181f 100%)', border: '1px solid rgba(251,191,36,0.28)', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px 11px 16px', textDecoration: 'none', gap: 8, minWidth: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Overall leaderboard</span>
              <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>🌍</span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {!isBeforeKickoff && overallRank != null && (
                <span style={{ fontFamily: SPORT, fontSize: 20, fontWeight: 900, color: '#fbbf24', lineHeight: 1, letterSpacing: '-0.5px' }}>
                  {overallRank}<span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/{overallTotal}</span>
                </span>
              )}
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>›</span>
            </div>
          </Link>
        )}
      </div>

      {/* Handlingsknapper */}
      {mode === 'idle' && !onModeChange && (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn-hover"
            onClick={() => { setMode('join'); setError(null) }}
            style={{ flex: 1, padding: '9px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: SPORT, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}
          >
            Bli med i liga
          </button>
          <button
            className="btn-hover"
            onClick={() => { setMode('create'); setError(null) }}
            style={{ flex: 1, padding: '9px 12px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 10, color: 'rgba(239,68,68,0.7)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: SPORT, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}
          >
            Opprett liga
          </button>
        </div>
      )}

      {/* Lag liga-form */}
      {mode === 'create' && (
        <div style={{ background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '18px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 24px rgba(0,0,0,0.6)', animation: 'slide-enter 0.18s ease-out' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 14 }}>Lag liga</div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>Liganavn</label>
            <input value={ligaNavn} onChange={e => setLigaNavn(e.target.value)} placeholder="F.eks. Kontorlaget" style={inputStyle} autoFocus />
          </div>
          {error && <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, marginBottom: 10 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setMode('idle'); setError(null) }} className="btn-hover" style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Avbryt</button>
            <button
              className="btn-hover"
              disabled={!ligaNavn.trim() || submitting}
              onClick={handleCreate}
              style={{ flex: 2, padding: '12px', background: ligaNavn.trim() && !submitting ? '#dc2626' : 'rgba(255,255,255,0.07)', color: ligaNavn.trim() && !submitting ? '#fff' : 'rgba(255,255,255,0.25)', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: ligaNavn.trim() && !submitting ? 'pointer' : 'not-allowed', fontFamily: SPORT, letterSpacing: '0.06em', textTransform: 'uppercase', boxShadow: ligaNavn.trim() && !submitting ? '0 4px 16px rgba(220,38,38,0.35)' : 'none' }}
            >
              {submitting ? 'Oppretter...' : 'Opprett liga →'}
            </button>
          </div>
        </div>
      )}

      {/* Bli med-form */}
      {mode === 'join' && (
        <div style={{ background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '18px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 24px rgba(0,0,0,0.6)', animation: 'slide-enter 0.18s ease-out' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 14 }}>Bli med i liga</div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>Ligakode (6 tegn)</label>
            <input value={kode} onChange={e => setKode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))} placeholder="WOLF42" style={{ ...inputStyle, fontFamily: SPORT, fontSize: 22, fontWeight: 900, letterSpacing: '0.2em', textAlign: 'center', textTransform: 'uppercase' }} autoFocus />
          </div>
          {error && <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, marginBottom: 10 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setMode('idle'); setError(null); setKode('') }} className="btn-hover" style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Avbryt</button>
            <button
              className="btn-hover"
              disabled={kode.length !== 6 || submitting}
              onClick={handleJoin}
              style={{ flex: 2, padding: '12px', background: kode.length === 6 && !submitting ? '#dc2626' : 'rgba(255,255,255,0.07)', color: kode.length === 6 && !submitting ? '#fff' : 'rgba(255,255,255,0.25)', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: kode.length === 6 && !submitting ? 'pointer' : 'not-allowed', fontFamily: SPORT, letterSpacing: '0.06em', textTransform: 'uppercase', boxShadow: kode.length === 6 && !submitting ? '0 4px 16px rgba(220,38,38,0.35)' : 'none' }}
            >
              {submitting ? 'Sjekker...' : 'Bli med →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
