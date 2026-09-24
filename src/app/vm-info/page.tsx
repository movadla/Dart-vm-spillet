'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import SmartBackButton from '@/components/SmartBackButton'
import BrandBanner from '@/components/BrandBanner'
import { PLAYER_PHOTOS } from '@/data/playerPhotos'
import { POTS, getIso2 } from '@/data/pots'
import Flag from '@/components/Flag'
import { getSupabaseClient } from '@/lib/supabase'
import { STAGE_ORDER, STAGE_LABELS, SCORING, CHAMPION_LABEL } from '@/config/scoring'
import type { MatchResult } from '@/lib/scoring'
import { getFirstMatchInfo, getBracketSection, getSeedLabel, R1_MATCHES } from '@/lib/bracketProjection'
import { DrawBracket, PairBox } from '@/components/DrawBracket'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

const KICKOFF = new Date('2026-12-11T19:00:00Z')

const POT_COLORS = ['#dc2626', '#d97706', '#2563eb', '#16a34a', '#ea580c', '#7c3aed']

type Tab = 'spillere' | 'kamper' | 'trekning' | 'regler'
const TABS: { id: Tab; label: string }[] = [
  { id: 'spillere', label: 'Spillere' },
  { id: 'kamper',   label: 'Kamper'   },
  { id: 'trekning', label: 'Trekning' },
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
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.7)',
  marginBottom: 12,
}

// Fotokreditering: påkrevd av CC-lisensene, samlet på ett sted uansett hvor
// kortene/brikkene vises (se TODO.md → «Bildekreditering»).
const PHOTO_CREDITS = Object.entries(PLAYER_PHOTOS)
  .map(([name, p]) => ({ name, credit: p.credit, url: p.creditUrl }))
  .sort((a, b) => a.name.localeCompare(b.name, 'nb'))

export default function VmInfoPage() {
  // Etter kickoff: Kamper som standard. Før: Regler (forklarer spillet).
  const [activeTab, setActiveTab] = useState<Tab>(() => (KICKOFF <= new Date() ? 'kamper' : 'regler'))
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [drawPlayer, setDrawPlayer] = useState<string>('')
  const [showFullBracket, setShowFullBracket] = useState(false)
  const rulesRef = useRef<HTMLDivElement>(null)

  // Påmelding stenger ved kickoff — CTA-lenker peker til Min side i stedet for stengt /tipp.
  const isLive = KICKOFF <= new Date()
  const ctaHref = participantId ? `/deltaker/${participantId}` : isLive ? '/finn' : '/tipp'
  const ctaLabel = participantId ? 'Din side →' : isLive ? 'Min side →' : 'Velg spillere →'

  // localStorage finnes ikke under SSR — sjekkes med vilje etter mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vm_participant_id')
      if (saved) setParticipantId(saved)
    } catch {}
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (activeTab !== 'kamper') return
    // Klienten lages her (ikke på modulnivå) og feiler stille — uten Supabase
    // konfigurert crashet hele siden tidligere (se getSupabaseClient()),
    // også for faner som ikke trenger noen database.
    let client: ReturnType<typeof getSupabaseClient>
    try {
      client = getSupabaseClient()
    } catch {
      return
    }
    client
      .from('match_results')
      .select('player1, player2, sets1, sets2, stage, winner')
      .order('played_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMatches(data as MatchResult[])
      })
  }, [activeTab])

  // Leser URL-parametre etter mount med vilje — window finnes ikke under SSR, en lazy
  // useState-initializer ville gitt hydration-mismatch mellom server og klient.
  /* eslint-disable react-hooks/set-state-in-effect */
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
    } else if (tab === 'trekning') {
      setActiveTab('trekning')
    }
    const spiller = params.get('spiller')
    if (spiller) {
      setActiveTab('trekning')
      setDrawPlayer(spiller)
    }
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Sluttspillet vises som en horisontalt scrollbar bracket: én kolonne per runde
  // (r1 → final), pluss en avsluttende VM-vinner-kolonne. Vi kjenner ikke fremtidige
  // parringer (ingen datakilde for det), så runder uten registrerte kamper får bare
  // én "Ikke spilt"-plassholderboks — det er nok til å vise bracket-formen.
  const bracketColumns = STAGE_ORDER.map((stage) => ({
    stage,
    rows: matches.filter((m) => (m.stage ?? 'r1') === stage),
  }))
  const finalRows = bracketColumns.find((c) => c.stage === 'final')?.rows ?? []
  const champion = finalRows.find((m) => m.winner != null)?.winner ?? null

  return (
    <div className="page-bg app-frame" style={{ minHeight: '100vh', color: '#fff', padding: '16px 20px 40px', position: 'relative' }}>

      <BrandBanner compact />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '6px 0 14px' }}>
        <SmartBackButton />
        <h1 style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1, margin: 0, letterSpacing: '0.02em', color: 'rgba(255,255,255,0.85)' }}>VM-guide</h1>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Innhold" style={{ display: 'flex', gap: 4, marginBottom: 16, padding: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '9px 4px',
              background: activeTab === tab.id ? '#dc2626' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.65)',
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
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{player.nationality}</div>
                    </div>
                    {player.seedNumber != null && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '2px 6px', flexShrink: 0 }}>
                        Seed {player.seedNumber}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', flexShrink: 0, width: 34, textAlign: 'right' }}>#{player.pdcRanking}</span>
                    <span style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, color: '#f59e0b', flexShrink: 0, width: 44, textAlign: 'right' }}>{player.odds}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* ── KAMPER (bracket) ── */}
      {activeTab === 'kamper' && (
        <div>
          {matches.length === 0 && (
            <div style={{ ...CARD, textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16 }}>
              Ingen kamper registrert ennå — sluttspilltreet fylles ut etter hvert som resultater legges inn.
            </div>
          )}

          <div style={{ overflowX: 'auto', paddingBottom: 10, marginLeft: -16, marginRight: -16, paddingLeft: 16, paddingRight: 16 }}>
            <div style={{ display: 'flex', gap: 10, width: 'max-content' }}>

              {bracketColumns.map(({ stage, rows }) => (
                <div key={stage} style={{ width: 148, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '0 2px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 10 }}>
                    {STAGE_LABELS[stage]}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, justifyContent: 'center' }}>
                    {rows.length > 0 ? (
                      rows.map((m, i) => {
                        const p1Wins = m.winner != null && m.winner === m.player1
                        const p2Wins = m.winner != null && m.winner === m.player2
                        return (
                          <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 8px', background: p1Wins ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
                              <span style={{ flexShrink: 0 }}><Flag iso2={getIso2(m.player1)} size={14} /></span>
                              <span style={{ flex: 1, fontSize: 11, fontWeight: p1Wins ? 800 : 400, color: p1Wins ? '#fff' : 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {m.player1}
                              </span>
                              <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 900, color: p1Wins ? '#fff' : 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
                                {m.sets1}
                              </span>
                            </div>
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 8px', background: p2Wins ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
                              <span style={{ flexShrink: 0 }}><Flag iso2={getIso2(m.player2)} size={14} /></span>
                              <span style={{ flex: 1, fontSize: 11, fontWeight: p2Wins ? 800 : 400, color: p2Wins ? '#fff' : 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {m.player2}
                              </span>
                              <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 900, color: p2Wins ? '#fff' : 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
                                {m.sets2}
                              </span>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div style={{ border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 10, padding: '14px 6px', textAlign: 'center', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
                        Ikke spilt
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* VM-vinner */}
              <div style={{ width: 148, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', textAlign: 'center', padding: '0 2px 8px', borderBottom: '1px solid rgba(245,158,11,0.25)', marginBottom: 10 }}>
                  {CHAMPION_LABEL}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
                  {champion ? (
                    <div style={{ background: 'linear-gradient(180deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.05) 100%)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 12, padding: '16px 8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 22, lineHeight: 1 }}>🏆</span>
                      <Flag iso2={getIso2(champion)} size={20} />
                      <span style={{ fontSize: 12, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.2 }}>
                        {champion}
                      </span>
                    </div>
                  ) : (
                    <div style={{ border: '1px dashed rgba(245,158,11,0.2)', borderRadius: 10, padding: '14px 6px', textAlign: 'center', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(245,158,11,0.6)' }}>
                      Ikke avgjort
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── TREKNING (projisert eksempel-trekning) ── */}
      {activeTab === 'trekning' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...CARD, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.5 }}>
            Dette er en <strong style={{ color: '#fff' }}>eksempel-trekning</strong> — PDC har ikke publisert den faktiske
            trekningen ennå (kommer normalt medio november). Oppsettet under viser hvordan braketten kunne sett ut,
            og oppdateres når det ekte oppsettet er kjent.
          </div>

          <div style={CARD}>
            <div style={LABEL}>Velg en spiller</div>
            <select
              value={drawPlayer}
              onChange={(e) => setDrawPlayer(e.target.value)}
              style={{ width: '100%', padding: '11px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 14 }}
            >
              <option value="">— Velg spiller —</option>
              {POTS.map((pot) => (
                <optgroup key={pot.potNumber} label={pot.name}>
                  {pot.players.map((p) => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {drawPlayer && (() => {
            const info = getFirstMatchInfo(drawPlayer)
            const section = getBracketSection(drawPlayer)
            if (!info) return null
            const pairA = {
              a: { name: drawPlayer, seedLabel: getSeedLabel(drawPlayer), highlighted: true },
              b: { name: info.opponent.name, seedLabel: getSeedLabel(info.opponent.name), faded: info.opponent.isFiller },
            }
            const pairB = {
              a: { name: info.round2Pair[0].name, seedLabel: getSeedLabel(info.round2Pair[0].name), faded: info.round2Pair[0].isFiller },
              b: { name: info.round2Pair[1].name, seedLabel: getSeedLabel(info.round2Pair[1].name), faded: info.round2Pair[1].isFiller },
            }
            return (
              <>
                <div style={CARD}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>1. runde</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>2. runde</span>
                  </div>
                  <DrawBracket pairA={pairA} pairB={pairB} />
                </div>

                {section.length > 0 && (
                  <div style={CARD}>
                    <div style={LABEL}>Andre seedede spillere i samme del av braketten</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {section.map((name) => (
                        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                          <Flag iso2={getIso2(name)} size={18} />
                          {name}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 10 }}>
                      Dette er spillere du potensielt kan møte senere i turneringen dersom begge går langt.
                    </div>
                  </div>
                )}
              </>
            )
          })()}

          <button
            onClick={() => setShowFullBracket((s) => !s)}
            style={{ padding: '12px', background: showFullBracket ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', cursor: 'pointer' }}
          >
            {showFullBracket ? 'Skjul hele bracketen' : 'Vis hele bracketen →'}
          </button>

          {showFullBracket && (
            <div style={CARD}>
              <div style={LABEL}>Runde 1 — hele feltet ({R1_MATCHES.length} kamper, 128 spillere)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
                {R1_MATCHES.map(([a, b], i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>Kamp {i + 1}</div>
                    <PairBox
                      a={{ name: a, seedLabel: getSeedLabel(a), faded: a.startsWith('Kvalifisert spiller'), highlighted: a === drawPlayer }}
                      b={{ name: b, seedLabel: getSeedLabel(b), faded: b.startsWith('Kvalifisert spiller'), highlighted: b === drawPlayer }}
                      compact
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── REGLER ── */}
      {activeTab === 'regler' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          <div ref={rulesRef} style={CARD}>
            <div style={LABEL}>Kort fortalt</div>
            {([
              'Du velger én spiller fra hver av 6 potter',
              'Pottene er basert på PDC-ranking og vinnerodds',
              'Valgene kan endres frem til VM starter',
              'Du får poeng for hvert sett spilleren din vinner og for hver kampseier — pluss bonus om han vinner hele turneringen',
            ] as string[]).map((t, i) => (
              <div key={t} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', padding: '9px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                {t}
              </div>
            ))}
          </div>

          <div style={CARD}>
            <div style={LABEL}>Poengoversikt</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>Per vunnet sett</span>
              <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>+{SCORING.perSetWon}p</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>Per kampseier (avansement)</span>
              <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>+{SCORING.perAdvancement}p</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>For å vinne hele turneringen</span>
              <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>+{SCORING.tournamentWinner}p</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 10, lineHeight: 1.5 }}>
              Alt legges sammen fortløpende gjennom turneringen, og summen ganges med pott-multiplikatoren.
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
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 10, lineHeight: 1.5 }}>
              Poeng for spillere fra disse pottene ganges med faktoren — outsidere gir størst gevinst.
            </div>
          </div>

          <Link href={ctaHref} className="cta-btn" style={{ display: 'block', padding: '15px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontFamily: SPORT, fontSize: 20, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 999, textDecoration: 'none', textAlign: 'center', boxShadow: '0 4px 20px rgba(220,38,38,0.35)' }}>
            {ctaLabel}
          </Link>

          <details style={CARD}>
            <summary style={{ ...LABEL, marginBottom: 0, cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Fotokreditering</span>
              <span aria-hidden style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>▾</span>
            </summary>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: '10px 0 8px' }}>
              Spillerfotoene er hentet fra Wikimedia Commons under Creative Commons-lisenser og beskåret/frilagt for kortene. Fotograf og lisens per bilde:
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {PHOTO_CREDITS.map((c) => (
                <li key={c.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, padding: '5px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#fff', fontWeight: 600, flexShrink: 0 }}>{c.name}</span>
                  <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.65)', textAlign: 'right', textDecoration: 'underline', textUnderlineOffset: 2 }}>{c.credit}</a>
                </li>
              ))}
            </ul>
          </details>

        </div>
      )}

    </div>
  )
}
