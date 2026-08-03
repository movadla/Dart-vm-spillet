import Link from 'next/link'
import { GROUP_SCHEDULE } from '@/data/schedule'

// ─────────────────────────────────────────────────────────────────────────────
// DEMO-SIDE for landingssiden ETTER kickoff (ikke-innlogget bruker).
// Viser «Påmelding stengt»-tilstanden + live-info med eksempeldata.
// Påvirker ikke den ekte landingssiden.
// ─────────────────────────────────────────────────────────────────────────────

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

// De neste tre kampene i VM (fra kampoppsettet).
const nextMatches = GROUP_SCHEDULE.slice(0, 3)

export default function LandingDemoPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', backgroundImage: 'radial-gradient(ellipse 80% 40% at 50% 25%, rgba(255,255,255,0.025) 0%, transparent 70%)', color: '#fff' }}>
      <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 140% 90% at 10% 0%, #0a3fa8 0%, transparent 52%), radial-gradient(ellipse 140% 90% at 90% 0%, #c41230 0%, transparent 52%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to bottom, transparent, #0a0a0a)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0.45) 0%, transparent 65%)' }} />
        </div>

        <div style={{ flex: 1, position: 'relative', padding: '24px 20px 72px', textAlign: 'center' }}>
          {/* DEMO-merke */}
          <div style={{ position: 'relative', zIndex: 2, marginBottom: 16 }}>
            <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fbbf24', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.35)', borderRadius: 100, padding: '4px 12px' }}>
              Demo — landingssiden etter kickoff
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/snåsamannen.png" alt="" aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '55%', transform: 'translateX(-50%) translateY(-50%)', width: 380, height: 'auto', opacity: 0.24, pointerEvents: 'none', userSelect: 'none', zIndex: 0, filter: 'brightness(1.0) saturate(0.7) contrast(1.05)', maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 0%, black 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 0%, black 30%, transparent 75%)' }} />

            {/* FIFA-label + flagg */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>FIFA World Cup 2026</span>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8, opacity: 0.75 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://flagcdn.com/28x21/us.png" width="28" height="21" alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://flagcdn.com/28x21/ca.png" width="28" height="21" alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://flagcdn.com/28x21/mx.png" width="28" height="21" alt="" />
              </div>
            </div>

            {/* Tittel */}
            <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', marginBottom: 24, lineHeight: 1 }}>
              <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.3, paddingTop: 4, marginBottom: 6, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)' }}>
                — Snåsamannen 2026 —
              </div>
              <div style={{ fontSize: 76, letterSpacing: '-2px', lineHeight: 1 }}>
                <span style={{ color: 'rgba(255,255,255,0.38)' }}>VM-</span>
                <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
              </div>
            </div>

            <div style={{ marginTop: 100 }} />

            {/* CTA — Påmelding stengt (etter kickoff, ikke-innlogget) */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                Påmelding er stengt
              </div>
              <Link href="/finn" className="cta-pulse" style={{ display: 'block', padding: '20px', background: 'linear-gradient(180deg, #ff4444 0%, #c81e1e 100%)', color: '#fff', fontFamily: SPORT, fontWeight: 900, fontSize: 20, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 14, textDecoration: 'none', marginBottom: 20, boxShadow: '0 6px 36px rgba(220,38,38,0.75)' }}>
                Min side →
              </Link>
              {/* Nyhetsbrev (statisk i demo) */}
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, padding: '11px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>din@epost.no</div>
                <div style={{ padding: '11px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 12, letterSpacing: '0.04em', flexShrink: 0 }}>Varsle meg om neste spill</div>
              </div>
            </div>

            {/* Neste kamper */}
            <div style={{ marginTop: 24, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 6 }}>Neste kamper</div>
              {nextMatches.map((m, i) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: i > 0 ? 4 : 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{m.home} – {m.away}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>{m.date.slice(8, 10)}.{m.date.slice(5, 7)} · {m.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info-knapp nederst */}
      <div style={{ padding: '8px 20px 0', display: 'flex', justifyContent: 'center' }}>
        <Link href="/vm-info" style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', letterSpacing: '0.02em', padding: '12px 28px', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 24 }}>
          Info og regler →
        </Link>
      </div>

      <div style={{ padding: '24px 20px 48px', textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
        Demo med eksempeldata. «Slik fungerer det» og footer er uendret fra før kickoff. Påvirker ikke ekte landingsside.
      </div>
    </div>
  )
}
