'use client'

import { useState } from 'react'
import LeagueSection, { Mode } from './LeagueSection'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

export interface UpcomingMatch {
  id: string
  date: string
  time: string
  home: string
  homeIso2: string
  away: string
  awayIso2: string
  isHome: boolean
  channel?: 'NRK1' | 'TV 2'
}

interface Props {
  participantId: string
  overallRank?: number
  overallTotal?: number
  header?: React.ReactNode
  actionsHidden?: boolean
}

export default function MinSideAccordions({ participantId, overallRank, overallTotal, header, actionsHidden }: Props) {
  const [mode, setMode] = useState<Mode>('idle')

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #1a2030 0%, #151924 100%)',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.22)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)',
    overflow: 'hidden',
  }

  // Etter kickoff: knapper skjult, valgfri header (totalpoeng) øverst, kun liga-lista.
  if (actionsHidden) {
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={cardStyle}>
          {header && (
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{header}</div>
          )}
          <div style={{ padding: '10px' }}>
            <LeagueSection participantId={participantId} showHeader={false} mode="idle" onModeChange={() => {}} overallRank={overallRank} overallTotal={overallTotal} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={cardStyle}>
        {mode === 'idle' ? (
          <>
            <div style={{ display: 'flex', gap: 10, padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                className="btn-hover"
                onClick={() => setMode('join')}
                style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.28)', borderRadius: 12, color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: SPORT, letterSpacing: '0.06em', textTransform: 'uppercase' }}
              >
                Bli med
              </button>
              <button
                className="btn-hover"
                onClick={() => setMode('create')}
                style={{ flex: 1, padding: '11px', background: 'rgba(220,38,38,0.52)', border: '1px solid rgba(220,38,38,0.82)', borderRadius: 12, color: 'rgba(255,255,255,0.92)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: SPORT, letterSpacing: '0.06em', textTransform: 'uppercase' }}
              >
                Opprett
              </button>
            </div>
            <div style={{ padding: '10px 0' }}>
              <LeagueSection participantId={participantId} showHeader={false} mode={mode} onModeChange={setMode} overallRank={overallRank} overallTotal={overallTotal} />
            </div>
          </>
        ) : (
          <>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }} />
            <div style={{ padding: '12px 16px' }}>
              <LeagueSection participantId={participantId} showHeader={false} mode={mode} onModeChange={setMode} overallRank={overallRank} overallTotal={overallTotal} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
