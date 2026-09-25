// Delte konstanter, typer og stiler for admin-fanene (src/app/admin/tabs/*).

import { POTS, getIso2 } from '@/data/pots'
import { R1_MATCHES } from '@/lib/bracketProjection'
import { STAGE_ORDER, STAGE_LABELS } from '@/config/scoring'
import { SPORT } from '@/config/theme'

export const ALL_PLAYERS = POTS.flatMap((p) => p.players.map((pl) => pl.name)).sort((a, b) => a.localeCompare(b, 'no'))
// Runde 1 inneholder også 64 plasseringsspillere ("Kvalifisert spiller N") som ikke er valgbare
// i pott-listene — de må likevel kunne velges her, ellers kan admin ikke registrere resultatet
// for halvparten av runde 1-kampene.
export const ALL_MATCH_PLAYERS = Array.from(new Set([...ALL_PLAYERS, ...R1_MATCHES.flat()])).sort((a, b) => a.localeCompare(b, 'no'))
export const MATCH_STAGES = STAGE_ORDER
// Statisk — auth går via httpOnly-cookien fra innlogging, ikke denne headeren. Hoistet til
// modulnivå slik at den har stabil identitet på tvers av rerendere (unngår at useEffect/
// useCallback-avhengighetslister må inkludere et objekt som ellers ville vært nytt hver gang).
export const ADMIN_HEADERS = { 'Content-Type': 'application/json' } as const

export type Tab = 'deltakere' | 'ligaer' | 'statistikk' | 'verktøy' | 'epost'

export interface Participant { id: string; name: string; email: string; created_at: string }
export interface League { id: string; name: string; invite_code: string; created_at: string; member_count: number; hidden_until_kickoff: boolean }
export interface LeagueMember { id: string; name: string; email: string; points: number }
export interface MagicLink { token: string; participant_id: string; expires_at: string; used_at: string | null; participants: { name: string; email: string } | null }

export const card: React.CSSProperties = { background: '#141414', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden', marginBottom: 16 }
export const cardHead: React.CSSProperties = { padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
export const label: React.CSSProperties = { fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#dc2626' }
export const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }
export const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none' as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36 }
export const btn = (variant: 'primary' | 'ghost' | 'danger' = 'ghost'): React.CSSProperties => ({
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

export function csvExport(participants: Participant[]) {
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
