'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { DEMO_COOKIE, DEMO_ID, DEMO_PHASES, type DemoPhase } from '@/lib/demo'
import { SPORT } from '@/config/theme'
import { useLocale } from '@/lib/i18n/useLocale'

/**
 * Banner øverst på demo-deltakerens Min side: viser at dette er en demo, og
 * lar deg bytte fase (før VM / underveis / etter finalen). Fasen lagres i
 * cookien `vm_demo`, som leaderboard/liga-sidene leser for å vise samme
 * demo-verden — og som slettes ved «Bytt bruker» og ved ekte innlogging.
 */
export default function DemoBanner({ phase, participantId }: { phase: DemoPhase; participantId: string }) {
  const { dict } = useLocale()
  useEffect(() => {
    try {
      document.cookie = `${DEMO_COOKIE}=${phase}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`
      // Gjør demo-deltakeren «innlogget» (for «Din side»-lenker, «isMe»-rad i
      // leaderboardet osv.) — men overskriv aldri en ekte innlogging.
      if (participantId === DEMO_ID && !localStorage.getItem('vm_participant_id')) {
        localStorage.setItem('vm_participant_id', DEMO_ID)
      }
    } catch {}
  }, [phase, participantId])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 6px 6px 12px', marginBottom: 12, borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
      <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b', flexShrink: 0 }}>{dict.deltaker.demoBanner.badge}</span>
      <div role="tablist" aria-label={dict.deltaker.demoBanner.tabsAriaLabel} style={{ display: 'flex', gap: 3, marginLeft: 'auto', padding: 2, borderRadius: 9, background: 'rgba(0,0,0,0.25)' }}>
        {DEMO_PHASES.map((p) => {
          const active = p.id === phase
          return (
            <Link
              key={p.id}
              role="tab"
              aria-selected={active}
              href={`/deltaker/${participantId}?fase=${p.id}`}
              style={{
                padding: '5px 9px', borderRadius: 7, fontSize: 11, fontWeight: 700, letterSpacing: '0.02em', textDecoration: 'none', whiteSpace: 'nowrap',
                background: active ? '#f59e0b' : 'transparent', color: active ? '#1a1206' : 'rgba(255,255,255,0.7)',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {dict.deltaker.demoBanner.phases[p.id]}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
