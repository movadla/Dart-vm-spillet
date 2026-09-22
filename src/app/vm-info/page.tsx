'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import SmartBackButton from '@/components/SmartBackButton'
import { POTS, getIso2 } from '@/data/pots'
import Flag from '@/components/Flag'
import { supabase } from '@/lib/supabase'
import { STAGE_ORDER, STAGE_LABELS, SCORING, type Stage } from '@/config/scoring'
import type { MatchResult } from '@/lib/scoring'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

const KICKOFF = new Date('2026-12-11T19:00:00Z')

const POT_COLORS = ['#d97706', '#2563eb', '#16a34a', '#ea580c', '#7c3aed']

type Tab = 'spillere' | 'kamper' | 'regler'
const TABS: { id: Tab; label: string }[] = [
  { id: 'spillere', label: 'Spillere' },
  { id: 'kamper',   label: 'Kamper'   },
  { id: 'regler',   label: 'Regler'   },
]

const CARD: React.CSSProperties = {
  background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)',
  padding: '16px 18px',
}

const LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.38)',
  marginBottom: 14,
}

export default function VmInfoPage() {
  // Etter kickoff: Kamper som standard. Før: Regler (forklarer spillet).
  const [activeTab, setActiveTab] = useState<Tab>(() => (KICKOFF <= new Date() ? 'kamper' : 'regler'))
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const rulesRef = useRef<HTMLDivElement>(null)

  // Påmelding stenger ved kickoff — CTA-lenker peker til Min side i stedet for stengt /tipp.
  const isLive = KICKOFF <= new Date()
  const ctaHref = participantId ? `/deltaker/${participantId}` : isLive ? '/finn' : '/tipp'
  const ctaLabel = participantId ? 'Din side →' : isLive ? 'Min side →' : 'Velg spillere →'

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vm_participant_id')
      if (saved) setParticipantId(saved)
    } catch {}
  }, [])

  useEffect(() => {
    if (activeTab !== 'kamper') return
    supabase
      .from('match_results')
      .select('player1, player2, sets1, sets2, stage, winner')
      .order('played_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMatches(data as MatchResult[])
      })
  }, [activeTab])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('regler') === '1') {
      setActiveTab('regler')
      setTimeout(() => rulesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    }
    const tab = params.get('tab')
    if (tab === 'spillere' || tab === 'nivaer') {
      setActiveTab('spillere')
    } else if (tab === 'kamper' || tab === 'sluttspill' || tab === 'grupper' || tab === 'stadioner' || tab === 'vmguide' || tab === 'land') {
      // Gamle lenker fra fotball-versjonen pekte til grupper/sluttspill/stadioner/land —
      // alt dette er nå slått sammen til én enkel "Kamper"-fane.
      setActiveTab('kamper')
    } else if (tab === 'regler') {
      setActiveTab('regler')
    }
  }, [])

  const matchesByStage = STAGE_ORDER
    .map((stage) => ({ stage, rows: matches.filter((m) => (m.stage ?? 'r1') === stage) }))
    .filter(({ rows }) => rows.length > 0)

  return (
    <div className="page-bg" style={{ minHeight: '100vh', color: '#fff', padding: '32px 16px 56px', position: 'relative' }}>

      {/* Brand banner — nav + VM-SPILLET */}
      <div style={{ position: 'relative', height: 150, overflow: 'hidden', marginBottom: 16, pointerEvents: 'none', zIndex: 1 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'auto' }}>
          <SmartBackButton />
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 4 }}>
          <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.3, paddingTop: 4, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)' }}>
            — PDC World Championship —
          </div>
          <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: 52, letterSpacing: '-1px', lineHeight: 1 }}>
            <span style={{ color: 'rgba(255,255,255,0.38)' }}>DART-VM-</span>
            <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, padding: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '9px 4px',
              background: activeTab === tab.id ? '#dc2626' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.45)',
              border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.02em',
              boxShadow: activeTab === tab.id ? '0 2px 8px rgba(220,38,38,0.35)' : 'none',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── SPILLERE ── */}
      {activeTab === 'spillere' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {POTS.map((pot) => {
            const color = POT_COLORS[pot.potNumber - 1]
            return (
              <div key={pot.potNumber} style={{ borderRadius: 14, overflow: 'hidden', background: '#111', border: `1px solid ${color}30` }}>
                <div style={{ background: color, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)' }}>
                  <span style={{ fontFamily: SPORT, fontSize: 32, fontWeight: 900, color: 'rgba(0,0,0,0.4)', lineHeight: 1 }}>{pot.potNumber}</span>
                  <div style={{ fontFamily: SPORT, fontSize: 18, fontWeight: 900, color: 'rgba(0,0,0,0.65)', textTransform: 'uppercase', lineHeight: 1 }}>{pot.name}</div>
                </div>
                {pot.players.map((player, i) => (
                  <div key={player.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: i < pot.players.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <Flag iso2={player.iso2} size={20} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.name}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{player.nationality}</div>
                    </div>
                    {player.seedNumber != null && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '2px 6px', flexShrink: 0 }}>
                        Seed {player.seedNumber}
                      </span>
                    )}
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', flexShrink: 0, width: 34, textAlign: 'right' }}>#{player.pdcRanking}</span>
                    <span style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, color: '#f59e0b', flexShrink: 0, width: 44, textAlign: 'right' }}>{player.odds}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* ── KAMPER ── */}
      {activeTab === 'kamper' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {matchesByStage.length === 0 && (
            <div style={{ ...CARD, textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
              Ingen kamper registrert ennå
            </div>
          )}
          {matchesByStage.map(({ stage, rows }) => (
            <div key={stage}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>{STAGE_LABELS[stage]}</div>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {rows.map((m, i) => {
                  const p1Wins = m.winner != null && m.winner === m.player1
                  const p2Wins = m.winner != null && m.winner === m.player2
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
                      <span style={{ flexShrink: 0 }}><Flag iso2={getIso2(m.player1)} size={18} /></span>
                      <span style={{ flex: 1, fontSize: 12, fontWeight: p1Wins ? 800 : 400, color: p1Wins ? '#fff' : 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.player1}
                      </span>
                      <span style={{ fontFamily: SPORT, fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', flexShrink: 0 }}>
                        {m.sets1}–{m.sets2}
                      </span>
                      <span style={{ flex: 1, fontSize: 12, fontWeight: p2Wins ? 800 : 400, color: p2Wins ? '#fff' : 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>
                        {m.player2}
                      </span>
                      <span style={{ flexShrink: 0 }}><Flag iso2={getIso2(m.player2)} size={18} /></span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── REGLER ── */}
      {activeTab === 'regler' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          <div ref={rulesRef} style={CARD}>
            <div style={LABEL}>Kort fortalt</div>
            {([
              'Du velger én spiller fra hver av 5 potter',
              'Pottene er basert på PDC-ranking og vinnerodds',
              'Valgene kan endres frem til VM starter',
              'Du får poeng for hver runde spilleren din vinner — poengene legges sammen etter hvert som han går videre',
            ] as string[]).map((t, i) => (
              <div key={t} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', padding: '9px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                {t}
              </div>
            ))}
          </div>

          <div style={CARD}>
            <div style={LABEL}>Poeng per runde</div>
            {STAGE_ORDER.map((stage, i) => (
              <div key={stage} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{STAGE_LABELS[stage]}</span>
                <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>+{SCORING.advancement[stage]}p</span>
              </div>
            ))}
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 10, lineHeight: 1.5 }}>
              Poengene er kumulative — en spiller som når kvartfinale får poeng for alle rundene frem til og med kvartfinalen.
            </div>
          </div>

          <div style={CARD}>
            <div style={LABEL}>Multiplikator</div>
            {POTS
              .filter((pot) => (SCORING.underdogMultiplier[pot.potNumber] ?? 1) > 1)
              .map((pot, i) => {
                const mult = SCORING.underdogMultiplier[pot.potNumber] ?? 1
                const col = mult >= 3 ? '#ef4444' : '#f59e0b'
                return (
                  <div key={pot.potNumber} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{pot.name}</span>
                    <span style={{ fontSize: 20, color: col, fontWeight: 900, fontFamily: SPORT }}>×{mult}</span>
                  </div>
                )
              })}
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 10, lineHeight: 1.5 }}>
              Poeng for spillere fra disse pottene ganges med faktoren — outsidere gir størst gevinst.
            </div>
          </div>

          <Link href={ctaHref} className="cta-btn" style={{ display: 'block', padding: '15px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontFamily: SPORT, fontSize: 20, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 14, textDecoration: 'none', textAlign: 'center', boxShadow: '0 4px 20px rgba(220,38,38,0.35)' }}>
            {ctaLabel}
          </Link>

        </div>
      )}

    </div>
  )
}
