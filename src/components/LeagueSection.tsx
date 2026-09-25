'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import CopyCode from '@/components/CopyCode'
import { isDemoId } from '@/lib/demo'
import { KICKOFF } from '@/config/tournament'
import { SPORT, CARD_GRADIENT, CARD_SHADOW } from '@/config/theme'
import { useLocale } from '@/lib/i18n/useLocale'

const CARD: React.CSSProperties = {
  background: CARD_GRADIENT,
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 14,
  boxShadow: CARD_SHADOW,
}

function ShareLeagueButton({ name, code }: { name: string; code: string }) {
  const { dict } = useLocale()
  const [copied, setCopied] = useState(false)

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    const url = `${window.location.origin}/liga/${code}`
    const text = dict.liga.shareLeague.inviteText(name, code)
    if (navigator.share) {
      try { await navigator.share({ title: `${name} – ${dict.common.appName}`, text, url }) } catch {}
    } else {
      try { await navigator.clipboard.writeText(`${text}\n${url}`) } catch {}
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button onClick={handleShare} className="btn-hover" aria-label={dict.liga.shareLeague.ariaLabel(name)} style={{
      padding: '5px 10px', flexShrink: 0,
      background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.06)',
      border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.14)'}`,
      borderRadius: 999, color: copied ? '#22c55e' : 'rgba(255,255,255,0.75)',
      fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em',
    }}>
      {copied ? dict.common.share.copied : dict.liga.shareLeague.label}
    </button>
  )
}

function RankChip({ rank, total }: { rank: number; total: number }) {
  const { dict } = useLocale()
  const top = rank === 1
  return (
    // Fast total bredde, venstrestilt innhold: «#N» starter på nøyaktig
    // samme skjermposisjon på hver rad uansett hvor mange sifre rangeringen
    // eller ligastørrelsen har — ellers hopper tallene ujevnt fra liga til
    // liga (raden er selv høyrestilt mot kortkanten via space-between).
    <span style={{ display: 'inline-flex', alignItems: 'baseline', justifyContent: 'flex-start', gap: 3, width: 90, fontFamily: SPORT, fontWeight: 900, lineHeight: 1, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
      <span style={{ fontSize: 20, color: top ? '#4ade80' : '#fff' }}>#{rank}</span>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-inter), sans-serif', fontWeight: 600, whiteSpace: 'nowrap' }}>{dict.liga.rankChip.ofTotal(total)}</span>
    </span>
  )
}

interface League { name: string; invite_code: string; rank?: number; total?: number }

export type Mode = 'idle' | 'create' | 'join'

/**
 * Ligaer på Min side (og rett etter påmelding): listen over ligaene du er
 * med i, lenke til hele leaderboardet, og «Bli med»/«Opprett» — som blir
 * skjemaer på plass. Låst etter VM-start; skjult for demo-deltakeren (som
 * ikke har noen innlogging å opprette ligaer med).
 */
export default function LeagueSection({ participantId, showHeader = true, showInviteInline = true, mode: modeProp, onModeChange, overallRank, overallTotal, vmStarted }: {
  participantId: string
  showHeader?: boolean
  /** false = ikke vis ligakode/inviter-knapp her — de vises i stedet inne på selve liga-siden (/liga/[code]). */
  showInviteInline?: boolean
  mode?: Mode
  onModeChange?: (m: Mode) => void
  overallRank?: number
  overallTotal?: number
  /** Overstyrer dato-sjekken (demo-fasen) */
  vmStarted?: boolean
}) {
  const { dict } = useLocale()
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

  const demo = isDemoId(participantId)
  const started = vmStarted ?? new Date() >= KICKOFF

  useEffect(() => {
    let alive = true
    fetch(`/api/league/mine?participantId=${participantId}`)
      .then((r) => (r.ok ? r.json() : { leagues: [] }))
      .then((data) => { if (alive) setLeagues(data.leagues ?? []) })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [participantId])

  async function handleCreate() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/league/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // participantId sendes ikke — /api/league/create henter identitet
        // fra den verifiserte vm_auth-cookien (se route.ts).
        body: JSON.stringify({ name: ligaNavn.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? dict.liga.section.genericError); return }
      const created = { name: ligaNavn.trim(), invite_code: data.inviteCode }
      setLeagues(prev => [...prev, created])
      setNewLeague(created)
      setMode('idle')
      setLigaNavn('')
    } catch {
      setError(dict.liga.section.genericError)
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
        body: JSON.stringify({ inviteCode: kode.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? dict.liga.section.genericError); return }
      const joined = { name: data.leagueName, invite_code: kode.trim().toUpperCase() }
      setLeagues(prev => [...prev, joined])
      setNewLeague(joined)
      setMode('idle')
      setKode('')
    } catch {
      setError(dict.liga.section.genericError)
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 10, color: '#fff', fontSize: 16,
    boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }
  const cancelBtn: React.CSSProperties = { flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }
  const primaryBtn = (ok: boolean): React.CSSProperties => ({
    flex: 2, padding: '12px', border: 'none', borderRadius: 999, fontSize: 14, fontWeight: 800, fontFamily: SPORT, letterSpacing: '0.06em', textTransform: 'uppercase',
    background: ok ? 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)' : 'rgba(255,255,255,0.07)',
    color: ok ? '#fff' : 'rgba(255,255,255,0.4)', cursor: ok ? 'pointer' : 'not-allowed',
    boxShadow: ok ? '0 4px 16px rgba(220,38,38,0.35)' : 'none',
  })

  const otherLeagues = leagues.filter(l => l.invite_code !== newLeague?.invite_code)

  return (
    <div style={{ marginBottom: showHeader ? 20 : 0 }}>
      {showHeader && (
        // Samme seksjonstittel som «Laget ditt»/«Ligaer» på Min side
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 8px' }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>{dict.liga.section.heading}</span>
          <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>
      )}

      {/* Nye liga-bekreftelse */}
      {newLeague && (
        <div style={{ background: 'linear-gradient(160deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.03) 100%)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 14, padding: '14px 16px', marginBottom: 8, animation: 'slide-enter 0.2s ease-out' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#4ade80', marginBottom: showInviteInline ? 6 : 10 }}>{newLeague.name}</div>
          {showInviteInline && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{dict.liga.section.codeLabel}</span>
              <CopyCode code={newLeague.invite_code} fontSize={20} letterSpacing="0.1em" />
              <ShareLeagueButton name={newLeague.name} code={newLeague.invite_code} />
            </div>
          )}
          <Link href={`/liga/${newLeague.invite_code}`} className="text-link" style={{ fontSize: 13, color: '#4ade80', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }}>
            {showInviteInline ? dict.liga.section.newLeagueViewCta : dict.liga.section.newLeagueCreatedCta}
          </Link>
        </div>
      )}

      {/* Ligaene dine + hele leaderboardet */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
        {loading && [0, 1].map(i => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 14 }} />)}
        {!loading && otherLeagues.map((l) => (
          <div key={l.invite_code} className="lb-card" style={{ ...CARD, overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}>
            <Link href={`/liga/${l.invite_code}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 12px 11px 14px', textDecoration: 'none', gap: 10, minWidth: 0 }}>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                {started && l.rank != null && l.total != null && <RankChip rank={l.rank} total={l.total} />}
                <span aria-hidden style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>›</span>
              </span>
            </Link>
            {!started && showInviteInline && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px 0 12px', borderLeft: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                <CopyCode code={l.invite_code} fontSize={14} color="rgba(255,255,255,0.75)" letterSpacing="0.14em" />
                <ShareLeagueButton name={l.name} code={l.invite_code} />
              </div>
            )}
          </div>
        ))}
        {!loading && otherLeagues.length === 0 && !newLeague && (
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, padding: '2px 2px 6px' }}>
            {dict.liga.section.noLeaguesYet}
          </div>
        )}
        {overallRank !== undefined && (
          <Link href="/leaderboard" className="lb-card" style={{ ...CARD, border: '1px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 12px 11px 14px', textDecoration: 'none', gap: 10, minWidth: 0 }}>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#fff' }}>{dict.liga.section.wholeLeaderboard}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              {started && overallTotal != null && <RankChip rank={overallRank} total={overallTotal} />}
              <span aria-hidden style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>›</span>
            </span>
          </Link>
        )}
      </div>

      {/* Handlingsknapper */}
      {mode === 'idle' && !started && !demo && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn-hover"
            onClick={() => { setMode('join'); setError(null) }}
            style={{ flex: 1, padding: '11px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 999, color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: SPORT, letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            {dict.liga.section.joinBtn}
          </button>
          <button
            className="btn-hover"
            onClick={() => { setMode('create'); setError(null) }}
            style={{ flex: 1, padding: '11px 12px', background: 'rgba(220,38,38,0.14)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 999, color: '#fca5a5', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: SPORT, letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            {dict.liga.section.createBtn}
          </button>
        </div>
      )}
      {mode === 'idle' && started && !demo && (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
          {dict.liga.section.lockedAfterStart}
        </div>
      )}

      {/* Lag liga-form */}
      {mode === 'create' && (
        <div style={{ ...CARD, borderRadius: 16, padding: 16, animation: 'slide-enter 0.18s ease-out' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>{dict.liga.section.createForm.heading}</div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="liga-navn" style={labelStyle}>{dict.liga.section.createForm.nameLabel}</label>
            <input id="liga-navn" value={ligaNavn} onChange={e => setLigaNavn(e.target.value)} placeholder={dict.liga.section.createForm.namePlaceholder} style={inputStyle} autoFocus maxLength={40} />
          </div>
          {error && <div role="alert" style={{ fontSize: 13, color: '#f87171', fontWeight: 600, marginBottom: 10 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setMode('idle'); setError(null) }} className="btn-hover" style={cancelBtn}>{dict.liga.section.createForm.cancel}</button>
            <button className="btn-hover cta-btn" disabled={!ligaNavn.trim() || submitting} onClick={handleCreate} style={primaryBtn(!!ligaNavn.trim() && !submitting)}>
              {submitting ? dict.liga.section.createForm.submitting : dict.liga.section.createForm.submit}
            </button>
          </div>
        </div>
      )}

      {/* Bli med-form */}
      {mode === 'join' && (
        <div style={{ ...CARD, borderRadius: 16, padding: 16, animation: 'slide-enter 0.18s ease-out' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>{dict.liga.section.joinForm.heading}</div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="liga-kode" style={labelStyle}>{dict.liga.section.joinForm.codeLabel}</label>
            <input id="liga-kode" value={kode} onChange={e => setKode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))} placeholder={dict.liga.section.joinForm.codePlaceholder} autoCapitalize="characters" autoCorrect="off" spellCheck={false} style={{ ...inputStyle, fontFamily: SPORT, fontSize: 22, fontWeight: 900, letterSpacing: '0.2em', textAlign: 'center', textTransform: 'uppercase' }} autoFocus />
          </div>
          {error && <div role="alert" style={{ fontSize: 13, color: '#f87171', fontWeight: 600, marginBottom: 10 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setMode('idle'); setError(null); setKode('') }} className="btn-hover" style={cancelBtn}>{dict.liga.section.joinForm.cancel}</button>
            <button className="btn-hover cta-btn" disabled={kode.length !== 6 || submitting} onClick={handleJoin} style={primaryBtn(kode.length === 6 && !submitting)}>
              {submitting ? dict.liga.section.joinForm.submitting : dict.liga.section.joinForm.submit}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
