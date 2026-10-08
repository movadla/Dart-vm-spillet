import { SPORT } from '@/config/theme'
/**
 * «— PDC Grand Slam of Darts — / GRAND SLAM-SPILLET»-banneret som alle
 * sidene deler. Samme komponent (og samme mål) på Min side, leaderboard,
 * liga, Finn min side og info-siden, så merkevaren ser lik ut overalt.
 * `compact` = 70 px høy (oppsummering/Min side), ellers 100 px.
 *
 * MIDLERTIDIG (2026-10-08): navnet «Grand Slam-Spillet» og eyebrow «PDC
 * Grand Slam of Darts» mens appen peker mot Grand Slam — bytt tilbake til
 * «Dart-VM-spillet»/«PDC World Championship» når det nærmer seg VM i
 * desember (`git grep -l "Grand Slam-Spillet" -- src public`), se
 * src/config/tournament.ts.
 */
export default function BrandBanner({ compact = false, align = 'center' }: { compact?: boolean; align?: 'center' | 'left' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', justifyContent: 'center', gap: 2, height: compact ? 70 : 100, pointerEvents: 'none', position: 'relative', zIndex: 1 }}>
      <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: compact ? 10 : 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.3, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)' }}>
        — PDC Grand Slam of Darts —
      </div>
      <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: compact ? 'clamp(20px, 6vw, 34px)' : 'clamp(28px, 8vw, 44px)', letterSpacing: '-1px', lineHeight: 1, whiteSpace: 'nowrap' }}>
        <span style={{ color: 'rgba(255,255,255,0.38)' }}>GRAND SLAM-</span>
        <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
      </div>
    </div>
  )
}
