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

// ─── Tab: Verktøy ─────────────────────────────────────────────────────────────
export function VerktøyTab({ headers }: { headers: Record<string, string> }) {
  const [links, setLinks] = useState<MagicLink[]>([])
  const [linksLoading, setLinksLoading] = useState(true)
  const [matchForm, setMatchForm] = useState({ player1: '', player2: '', sets1: '', sets2: '', stage: 'r1' })
  const [matchMsg, setMatchMsg] = useState('')
  const [bulkText, setBulkText] = useState('')
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkResult, setBulkResult] = useState<{ succeeded: number; failed: number; results: { index: number; ok: boolean; error?: string }[] } | null>(null)
  useEffect(() => {
    fetch('/api/admin/magic-links', { headers })
      .then((r) => r.json())
      .then((d) => setLinks(d.links ?? []))
      .finally(() => setLinksLoading(false))
  }, [headers])

  async function submitMatchResult(e: React.FormEvent) {
    e.preventDefault(); setMatchMsg('')
    try {
      const res = await fetch('/api/admin/match-result', { method: 'POST', headers, body: JSON.stringify({ player1: matchForm.player1, player2: matchForm.player2, sets1: parseInt(matchForm.sets1), sets2: parseInt(matchForm.sets2), stage: matchForm.stage }) })
      if (res.ok) { setMatchMsg('✅ Resultat lagret'); setMatchForm({ player1: '', player2: '', sets1: '', sets2: '', stage: 'r1' }) }
      else setMatchMsg('❌ Feil ved lagring')
    } catch { setMatchMsg('❌ Serverfeil') }
  }

  async function submitBulkImport() {
    setBulkBusy(true); setBulkResult(null)
    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean)
    const matches = lines.map((line) => {
      const [player1, player2, sets1, sets2, stage] = line.split(';').map((s) => s.trim())
      return { player1, player2, sets1: Number(sets1), sets2: Number(sets2), stage: stage || 'r1' }
    })
    try {
      const res = await fetch('/api/admin/match-result/bulk', { method: 'POST', headers, body: JSON.stringify({ matches }) })
      const data = await res.json()
      if (res.ok) {
        setBulkResult(data)
        if (data.failed === 0) setBulkText('')
      } else {
        setBulkResult({ succeeded: 0, failed: matches.length, results: [{ index: 0, ok: false, error: data.error ?? 'Ukjent feil' }] })
      }
    } catch {
      setBulkResult({ succeeded: 0, failed: matches.length, results: [{ index: 0, ok: false, error: 'Serverfeil' }] })
    } finally {
      setBulkBusy(false)
    }
  }

  return (
    <>
      {/* Kampresultat-skjema */}
      <div style={{ ...card, overflow: 'visible' }}>
        <div style={cardHead}><span style={label}>Legg inn kampresultat manuelt</span></div>
        <div style={{ padding: '16px 18px' }}>
          <form onSubmit={submitMatchResult} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(['player1', 'player2'] as const).map((key) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>{key === 'player1' ? 'Spiller 1' : 'Spiller 2'}</label>
                  <select style={selectStyle} value={matchForm[key]} onChange={(e) => setMatchForm((f) => ({ ...f, [key]: e.target.value }))} required>
                    <option value="">Velg spiller</option>
                    {ALL_MATCH_PLAYERS.map((name) => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(['sets1', 'sets2'] as const).map((key) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>{key === 'sets1' ? 'Sett 1' : 'Sett 2'}</label>
                  <input style={inputStyle} type="number" min={0} placeholder="0" value={matchForm[key]} onChange={(e) => setMatchForm((f) => ({ ...f, [key]: e.target.value }))} required />
                </div>
              ))}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>Fase</label>
              <select style={selectStyle} value={matchForm.stage} onChange={(e) => setMatchForm((f) => ({ ...f, stage: e.target.value }))}>
                {MATCH_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </select>
            </div>
            <button type="submit" style={btn('primary')}>Lagre resultat</button>
            {matchMsg && <div style={{ fontSize: 13, color: matchMsg.startsWith('✅') ? '#22c55e' : '#ef4444', textAlign: 'center' }}>{matchMsg}</div>}
          </form>
        </div>
      </div>

      {/* Bulk-import kampresultater */}
      <div style={{ ...card, overflow: 'visible' }}>
        <div style={cardHead}><span style={label}>Importer flere kamper samtidig</span></div>
        <div style={{ padding: '16px 18px' }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 0, marginBottom: 10, lineHeight: 1.5 }}>
            Én kamp per linje: <code>spiller1;spiller2;sett1;sett2;fase</code> — fase er valgfri, standard er r1.
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={'Luke Littler;Gerwyn Price;6;2;r1\nMichael van Gerwen;Rob Cross;6;4;r1'}
            rows={6}
            style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
          />
          <button
            type="button"
            style={{ ...btn('primary'), marginTop: 10, opacity: bulkBusy || !bulkText.trim() ? 0.5 : 1 }}
            disabled={bulkBusy || !bulkText.trim()}
            onClick={submitBulkImport}
          >
            {bulkBusy ? 'Importerer...' : 'Importer'}
          </button>
          {bulkResult && (
            <div style={{ marginTop: 12, fontSize: 12 }}>
              <div style={{ color: bulkResult.failed === 0 ? '#22c55e' : '#f59e0b', fontWeight: 700, marginBottom: bulkResult.failed ? 8 : 0 }}>
                {bulkResult.succeeded} lagret, {bulkResult.failed} feilet
              </div>
              {bulkResult.results.filter((r) => !r.ok).map((r) => (
                <div key={r.index} style={{ color: '#ef4444', marginBottom: 2 }}>
                  Linje {r.index + 1}: {r.error}
                </div>
              ))}
            </div>
          )}
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
