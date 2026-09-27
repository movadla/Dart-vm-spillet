'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import SmartBackButton from '@/components/SmartBackButton'
import BrandBanner from '@/components/BrandBanner'
import { PLAYER_PHOTOS } from '@/data/playerPhotos'
import { POTS, getPickablePlayers, type Player } from '@/data/pots'
import { POT_COLORS } from '@/config/potColors'
import { formatOdds, formatPoints } from '@/lib/format'
import Flag from '@/components/Flag'
import { STAGE_ORDER, SCORING } from '@/config/scoring'
import type { MatchResult } from '@/lib/scoring'
import MatchBracket from '@/components/MatchBracket'
import { KICKOFF } from '@/config/tournament'
import { SPORT, CARD_GRADIENT, CARD_SHADOW } from '@/config/theme'
import { useLocale } from '@/lib/i18n/useLocale'
import { translateNationality } from '@/lib/i18n/translatePlayer'
import LocaleSwitch from '@/components/LocaleSwitch'

type Tab = 'spillere' | 'kamper' | 'regler'

const CARD: React.CSSProperties = {
  background: CARD_GRADIENT,
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: CARD_SHADOW,
  padding: '16px 18px',
}

// Regel-fanens 3 hovedkort brukte identisk CARD med ingen visuell forskjell —
// fire like grå bokser etter hverandre var vanskelig å skanne. Toppkanten
// farges nå til samme aksentfarge som tallene inni kortet (samme prinsipp
// som pott-fargebåndene i spillere-fanen), så øyet kan skille dem fra hverandre.
function cardWithAccent(color: string): React.CSSProperties {
  // Ikke bland `border`-shorthand med `borderTop` i samme style-objekt (React-advarsel) —
  // hver kant settes derfor for seg i stedet for å gjenbruke CARD sin shorthand.
  return {
    background: CARD_GRADIENT,
    borderRadius: 16,
    boxShadow: CARD_SHADOW,
    padding: '16px 18px',
    borderTop: `2px solid ${color}`,
    borderRight: '1px solid rgba(255,255,255,0.12)',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
    borderLeft: '1px solid rgba(255,255,255,0.12)',
  }
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

function PlayerRow({ player, last, muted = false }: { player: Player; last: boolean; muted?: boolean }) {
  const { locale, dict } = useLocale()
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 40px 44px', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)', opacity: muted ? 0.7 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <Flag iso2={player.iso2} size={20} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{translateNationality(dict.players, player.nationality)}</div>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: player.seedNumber != null ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '2px 6px', whiteSpace: 'nowrap' }}>
        {player.seedNumber != null ? dict.vmInfo.playersTab.seedLabel(player.seedNumber) : dict.vmInfo.playersTab.unseeded}
      </span>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>#{player.pdcRanking}</span>
      <span style={{ fontFamily: SPORT, fontSize: 15, fontWeight: 900, color: '#f59e0b', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatOdds(player.odds, locale)}</span>
    </div>
  )
}

export default function VmInfoPage() {
  const { locale, dict } = useLocale()
  const TABS: { id: Tab; label: string }[] = [
    { id: 'spillere', label: dict.vmInfo.tabs.players },
    { id: 'kamper', label: dict.vmInfo.tabs.matches },
    { id: 'regler', label: dict.vmInfo.tabs.rules },
  ]

  // Etter kickoff: Kamper som standard. Før: Regler (forklarer spillet).
  const [activeTab, setActiveTab] = useState<Tab>(() => (KICKOFF <= new Date() ? 'kamper' : 'regler'))
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const rulesRef = useRef<HTMLDivElement>(null)

  // Påmelding stenger ved kickoff — CTA-lenker peker til Min side i stedet for stengt /tipp.
  const isLive = KICKOFF <= new Date()
  const ctaHref = participantId ? `/deltaker/${participantId}` : isLive ? '/finn' : '/tipp'
  const ctaLabel = participantId ? dict.vmInfo.ctaLabel.yourPage : isLive ? dict.vmInfo.ctaLabel.myPage : dict.vmInfo.ctaLabel.pickPlayers

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
    // Samme datalag som Min side/leaderboardet (inkl. demo-verdenen), så
    // braketten viser den turneringen brukeren faktisk følger.
    let alive = true
    fetch('/api/matches')
      .then((r) => (r.ok ? r.json() : { matches: [] }))
      .then((d) => { if (alive && Array.isArray(d.matches)) setMatches(d.matches as MatchResult[]) })
      .catch(() => {})
    return () => { alive = false }
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
    }
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div className="page-bg app-frame" style={{ minHeight: '100vh', color: '#fff', padding: '16px 20px 40px', position: 'relative' }}>

      <BrandBanner compact />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '6px 0 14px' }}>
        <SmartBackButton />
        <h1 style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1, margin: 0, letterSpacing: '0.02em', color: 'rgba(255,255,255,0.85)' }}>{dict.vmInfo.title}</h1>
        <LocaleSwitch />
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label={dict.vmInfo.tabsAriaLabel} style={{ display: 'flex', gap: 4, marginBottom: 16, padding: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
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
        <div role="tabpanel" id="panel-spillere" aria-labelledby="tab-spillere" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 40px 44px', gap: 10, padding: '0 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
            <span>{dict.vmInfo.playersTab.columnHeaders.player}</span><span>{dict.vmInfo.playersTab.columnHeaders.seed}</span><span style={{ textAlign: 'right' }}>{dict.vmInfo.playersTab.columnHeaders.rank}</span><span style={{ textAlign: 'right' }}>{dict.vmInfo.playersTab.columnHeaders.odds}</span>
          </div>
          {POTS.map((pot) => {
            const color = POT_COLORS[(pot.potNumber - 1) % POT_COLORS.length]
            const pickable = getPickablePlayers(pot)
            const rest = pot.players.filter((p) => !pickable.includes(p))
            return (
              <div key={pot.potNumber} style={{ borderRadius: 14, overflow: 'hidden', background: '#111', border: `1px solid ${color}30` }}>
                <div style={{ background: color, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)' }}>
                  <span style={{ fontFamily: SPORT, fontSize: 32, fontWeight: 900, color: 'rgba(0,0,0,0.4)', lineHeight: 1 }}>{pot.potNumber}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{dict.vmInfo.playersTab.pickableCount(pickable.length)}</span>
                </div>
                {pickable.map((player, i) => <PlayerRow key={player.name} player={player} last={i === pickable.length - 1 && rest.length === 0} />)}
                {rest.length > 0 && (
                  <details>
                    <summary style={{ listStyle: 'none', cursor: 'pointer', padding: '10px 16px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{dict.vmInfo.playersTab.others(rest.length)}</span><span aria-hidden>▾</span>
                    </summary>
                    {rest.map((player, i) => <PlayerRow key={player.name} player={player} last={i === rest.length - 1} muted />)}
                  </details>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── KAMPER (bracket) ── */}
      {activeTab === 'kamper' && (
        <div role="tabpanel" id="panel-kamper" aria-labelledby="tab-kamper">
          <MatchBracket stages={STAGE_ORDER} matches={matches} />
        </div>
      )}

      {/* ── REGLER ── */}
      {activeTab === 'regler' && (
        <div role="tabpanel" id="panel-regler" aria-labelledby="tab-regler" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          <div ref={rulesRef} style={cardWithAccent('#3b82f6')}>
            <div style={LABEL}>{dict.vmInfo.rulesTab.inShort}</div>
            {dict.vmInfo.rulesTab.bullets.map((t, i) => (
              <div key={t} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', padding: '9px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                {t}
              </div>
            ))}
          </div>

          <div style={cardWithAccent('#f59e0b')}>
            <div style={LABEL}>{dict.vmInfo.rulesTab.pointsOverview}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{dict.vmInfo.rulesTab.perSet}</span>
              <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>+{formatPoints(SCORING.perSetWon, locale)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{dict.vmInfo.rulesTab.perAdvancement}</span>
              <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>+{formatPoints(SCORING.perAdvancement, locale)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{dict.vmInfo.rulesTab.forWinning}</span>
              <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>+{formatPoints(SCORING.tournamentWinner, locale)}</span>
            </div>
          </div>

          <div style={cardWithAccent('#ef4444')}>
            <div style={LABEL}>{dict.vmInfo.rulesTab.multiplier}</div>
            {POTS
              .filter((pot) => (SCORING.underdogMultiplier[pot.potNumber] ?? 1) > 1)
              .map((pot, i) => {
                const mult = SCORING.underdogMultiplier[pot.potNumber] ?? 1
                const col = mult >= 3 ? '#ef4444' : '#f59e0b'
                return (
                  <div key={pot.potNumber} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{dict.common.teamTile.level(pot.potNumber)}</span>
                    <span style={{ fontSize: 20, color: col, fontWeight: 900, fontFamily: SPORT }}>×{mult}</span>
                  </div>
                )
              })}
          </div>

          <Link href={ctaHref} className="cta-btn" style={{ display: 'block', padding: '15px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontFamily: SPORT, fontSize: 20, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 999, textDecoration: 'none', textAlign: 'center', boxShadow: '0 4px 20px rgba(220,38,38,0.35)' }}>
            {ctaLabel}
          </Link>

          {/* Bevisst svært lite fremtredende (ikke i et CARD, minimal skrift) —
              men ikke fjernet: CC-lisensene på spillerbildene krever
              kreditering et sted brukeren kan finne den, og de fleste stedene
              bildene vises (lagkort, tippe-flyten) har ingen kreditering ved
              siden av selve bildet. */}
          <details style={{ padding: '2px 4px' }}>
            <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
              <span>{dict.vmInfo.rulesTab.photoCredit.summary}</span>
              <span aria-hidden style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>▾</span>
            </summary>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, margin: '8px 0 6px' }}>
              {dict.vmInfo.rulesTab.photoCredit.intro}
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {PHOTO_CREDITS.map((c) => (
                <li key={c.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 10, padding: '4px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, flexShrink: 0 }}>{c.name}</span>
                  <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'right', textDecoration: 'underline', textUnderlineOffset: 2 }}>{c.credit}</a>
                </li>
              ))}
            </ul>
          </details>

        </div>
      )}

    </div>
  )
}
