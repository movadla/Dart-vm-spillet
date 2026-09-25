'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Countdown from '@/components/Countdown'
import { KICKOFF_DATE_LABEL } from '@/config/tournament'
import { SPORT, CARD_GRADIENT, CARD_SHADOW } from '@/config/theme'

/** Før VM: leaderboardet er tomt — vis nedtelling, antall påmeldte og påmeldingsknapp. */
export default function LeaderboardCountdown({ participants }: { participants: number }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // localStorage finnes ikke under SSR — sjekkes med vilje etter mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { if (localStorage.getItem('vm_participant_id')) setIsLoggedIn(true) } catch {}
  }, [])

  return (
    <div style={{ background: CARD_GRADIENT, borderRadius: 20, padding: '28px 20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.12)', boxShadow: CARD_SHADOW }}>
      <div style={{ marginBottom: 18 }}>
        <Countdown size={40} boxed align="center" label="Første poeng deles ut om" />
      </div>

      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: isLoggedIn ? 0 : 20, lineHeight: 1.5 }}>
        Dart-VM starter {KICKOFF_DATE_LABEL}. {participants > 0 ? `${participants} ${participants === 1 ? 'deltaker er' : 'deltakere er'} påmeldt så langt.` : 'Bli den første som melder seg på.'}
      </div>

      {!isLoggedIn && (
        <Link href="/tipp" className="cta-btn" style={{ display: 'inline-block', padding: '12px 26px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 999, textDecoration: 'none', fontFamily: SPORT, boxShadow: '0 4px 16px rgba(220,38,38,0.3)' }}>
          Meld deg på →
        </Link>
      )}
    </div>
  )
}
