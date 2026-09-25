'use client'

// Tippe-flyten — én klientkomponent med seksjoner (søk på «── » for å hoppe):
//   TippContent()      state, auth/edit-modus, lagring
//   ── Stengt          etter frist
//   ── Innloggingslenke / token (edit-modus)
//   ── Bekreftelsesskjerm
//   ── Steg 0          intro-slideshow (StepSlideshow)
//   ── Registrering    navn/e-post
//   ── Oppsummering    laget + «Endre»
//   ── Steg 1–6        velg spiller (PlayerCard + PlayerDetailPanel)
// Fremdriftsprikker/konfetti: ./ProgressDots.tsx

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import SmartBackButton from '@/components/SmartBackButton'
import { POTS, getPickablePlayers } from '@/data/pots'
import Flag from '@/components/Flag'
import { SCORING } from '@/config/scoring'
import { PlayerCard } from '@/components/PlayerCard'
import PlayerDetailPanel from '@/components/PlayerDetailPanel'
import TeamTile from '@/components/TeamTile'
import { PLAYER_STATS } from '@/data/playerStats'
import { formatAvg } from '@/lib/format'
import StepSlideshow, { INTRO_LAST_SLIDE } from '@/components/StepSlideshow'
import LeagueSection from '@/components/LeagueSection'
import ShareButton from '@/components/ShareButton'
import { POT_COLORS, POT_COLORS_DARK } from '@/config/potColors'
import { KICKOFF } from '@/config/tournament'
import { Confetti, ProgressDots } from './ProgressDots'
import { SPORT, CARD_GRADIENT, CARD_SHADOW } from '@/config/theme'

const POT_COUNT = POTS.length
const REGISTRATION_STEP = POT_COUNT + 1
const SUMMARY_STEP = POT_COUNT + 2

function TippContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const editId = searchParams.get('edit')
  const isEditMode = !!editId

  // 0: intro (new users only), 1–POT_COUNT: picks, REGISTRATION_STEP: registration (non-edit), SUMMARY_STEP: summary
  const [step, setStep] = useState(isEditMode ? 1 : 0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [picks, setPicks] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [duplicateEmail, setDuplicateEmail] = useState(false)
  const [findingPage, setFindingPage] = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(false)
  const [pinVerified, setPinVerified] = useState(false)
  const [showScoreInfo, setShowScoreInfo] = useState(false)
  const [sendingLink, setSendingLink] = useState(false)
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null)
  const [sendLinkError, setSendLinkError] = useState<string | null>(null)
  const [linkEmail, setLinkEmail] = useState('')
  const [verifyingToken, setVerifyingToken] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const tokenParam = searchParams.get('token')
  const [slideshowSlide, setSlideshowSlide] = useState(0)

  // Henter eksisterende picks for redigering — «start lasting, så fetch»-mønsteret er korrekt.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!editId || !pinVerified) return
    setLoadingEdit(true)
    async function load() {
      try {
        const res = await fetch('/api/participant-edit-data')
        if (res.ok) {
          const data = await res.json()
          if (data.participant) { setName(data.participant.name); setEmail(data.participant.email) }
          if (data.picks) {
            const existing: Record<number, string> = {}
            data.picks.forEach((p: { pot_number: number; player_name: string }) => { existing[p.pot_number] = p.player_name })
            setPicks(existing)
          }
        }
      } catch {}
      setLoadingEdit(false)
      setStep(1)
    }
    load()
  }, [editId, pinVerified])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Kjøres med vilje kun ved mount (ikke når isEditMode/step endres senere) — sjekker om
  // brukeren allerede har en lagret deltaker-id i localStorage (finnes ikke under SSR).
  useEffect(() => {
    if (isEditMode || step !== 0) return
    try {
      // Har man en lagret deltaker-id ELLER har sett introen før, starter man
      // rett på steg 1 — «Guide»-knappen viser introen igjen ved behov.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem('vm_participant_id') || localStorage.getItem('vm_tipp_intro_seen')) setStep(1)
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Spillerpanelet (bunnark) lukkes når man bytter steg.
  const [panelOpen, setPanelOpen] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPanelOpen(false)
  }, [step])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!tokenParam || !editId || pinVerified) return
    setVerifyingToken(true)
    fetch('/api/magic-link/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tokenParam, participantId: editId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok) setPinVerified(true)
        else { setVerifyingToken(false); setTokenError(data.error ?? 'Ugyldig lenke') }
      })
      .catch(() => { setVerifyingToken(false); setTokenError('Noe gikk galt') })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#fff', fontSize: 16,
    boxSizing: 'border-box',
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    setDuplicateEmail(false)
    try {
      if (isEditMode && editId) {
        // participantId sendes ikke lenger — /api/tipp/update henter identitet
        // fra den verifiserte vm_auth-cookien (satt av magic-link/verify like
        // over i denne flyten), aldri fra body.
        const res = await fetch('/api/tipp/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ picks }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? 'Kunne ikke lagre picks')
        }
        router.push(`/deltaker/${editId}`)
      } else {
        const res = await fetch('/api/tipp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, picks }),
        })
        const data = await res.json()
        if (!res.ok) {
          if (data.duplicate) setDuplicateEmail(true)
          throw new Error(data.error || 'Noe gikk galt')
        }
        setParticipantId(data.participantId)
        setSubmitted(true)
        try { localStorage.setItem('vm_participant_id', data.participantId) } catch {}
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Noe gikk galt')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Stengt etter deadline ──
  if (new Date() > KICKOFF) {
    return (
      <div className="page-bg" style={{ minHeight: '100vh', color: '#fff', padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 20 }}>
          <div style={{ fontSize: 48, color: '#fff' }}>Påmelding</div>
          <div style={{ fontSize: 48, color: '#dc2626' }}>stengt</div>
        </div>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 32, maxWidth: 280 }}>
          Dart-VM 2026 er i gang. Påmelding og endring av picks er ikke lenger mulig.
        </p>
        <Link href="/leaderboard" style={{ display: 'inline-block', padding: '14px 28px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 12, textDecoration: 'none', fontFamily: SPORT, boxShadow: '0 4px 20px rgba(220,38,38,0.3)', marginBottom: 12 }}>
          Se leaderboard →
        </Link>
        <Link href="/" className="back-btn">← Hjem</Link>
      </div>
    )
  }

  // ── Innloggingslenke / token-verifisering (edit mode) ──
  if (isEditMode && !pinVerified) {
    if (verifyingToken) {
      return (
        <div className="page-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
          Verifiserer lenke…
        </div>
      )
    }

    return (
      <div className="page-bg" style={{ minHeight: '100vh', padding: '40px 20px 56px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ marginBottom: 24 }}>
          <Link href={`/deltaker/${editId}`} className="back-btn">← Tilbake</Link>
        </div>

        <div style={{ fontFamily: SPORT, fontSize: 52, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 16 }}>
          <div style={{ color: 'rgba(255,255,255,0.3)' }}>Endre</div>
          <div style={{ color: '#fff' }}>dine</div>
          <div style={{ color: '#dc2626' }}>valg</div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 32, fontSize: 14, lineHeight: 1.6 }}>
          Vi sender en innloggingslenke til e-posten din. Klikk lenken for å endre valgene dine.
        </p>

        {tokenError && (
          <div style={{ padding: '12px 16px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 12, color: '#ef4444', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
            {tokenError} — Send en ny lenke under.
          </div>
        )}

        {!linkSentTo ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 8 }}>Din e-postadresse</label>
              <input
                type="email"
                value={linkEmail}
                onChange={e => setLinkEmail(e.target.value)}
                placeholder="din@epost.no"
                autoComplete="email"
                style={{ width: '100%', padding: '13px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 16, boxSizing: 'border-box' as const }}
              />
            </div>
            <button
              disabled={sendingLink || !linkEmail.includes('@')}
              onClick={async () => {
                setSendingLink(true)
                setSendLinkError(null)
                try {
                  const res = await fetch('/api/magic-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ participantId: editId, email: linkEmail.trim() }),
                  })
                  const data = await res.json()
                  if (!res.ok) { setSendLinkError(data.error ?? 'Noe gikk galt'); return }
                  setLinkSentTo(data.maskedEmail)
                } catch {
                  setSendLinkError('Noe gikk galt')
                } finally {
                  setSendingLink(false)
                }
              }}
              style={{
                display: 'block', width: '100%', padding: '16px',
                background: !sendingLink && linkEmail.includes('@') ? '#dc2626' : 'rgba(255,255,255,0.07)',
                color: !sendingLink && linkEmail.includes('@') ? '#fff' : 'rgba(255,255,255,0.25)',
                border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800,
                cursor: !sendingLink && linkEmail.includes('@') ? 'pointer' : 'not-allowed',
                fontFamily: SPORT, letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                boxShadow: !sendingLink && linkEmail.includes('@') ? '0 4px 20px rgba(220,38,38,0.35)' : 'none',
                marginBottom: 12,
              }}
            >
              {sendingLink ? 'Sender…' : 'Send innloggingslenke →'}
            </button>
            {sendLinkError && (
              <div style={{ padding: '12px 16px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 12, color: '#ef4444', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                {sendLinkError}
              </div>
            )}
          </>
        ) : (
          <div style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 16, padding: '20px 18px', marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#22c55e', marginBottom: 6 }}>Lenke er sendt!</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>Sjekk innboksen til <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{linkSentTo}</strong>.<br />Lenken er gyldig i 1 time.</div>
          </div>
        )}
      </div>
    )
  }

  if (loadingEdit) {
    // Skjelett i stedet for ren "Laster..."-tekst — matcher formen på
    // siden som straks vises (topplinje + pott-header + kortrad), samme
    // .skeleton-mønster som resten av appen (forsiden, leaderboard/liga).
    return (
      <div className="page-bg" style={{ minHeight: '100vh', padding: '24px 16px 20px', color: '#fff' }}>
        <div className="skeleton" style={{ width: 140, height: 5, borderRadius: 3, margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0 }} />
          <div className="skeleton" style={{ flex: 1, height: 26, borderRadius: 8 }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[0, 1].map(i => <div key={i} className="skeleton" style={{ flex: 1, aspectRatio: 1007 / 1562, borderRadius: 12 }} />)}
        </div>
      </div>
    )
  }

  // ── Bekreftelsesskjerm ──
  if (submitted && participantId) {
    return (
      <div className="page-bg" style={{ minHeight: '100vh', padding: '40px 20px 56px', color: '#fff', position: 'relative' }}>
        <Confetti />

        {/* Brand banner — VM-SPILLET */}
        <div style={{ position: 'relative', height: 145, marginBottom: 20, pointerEvents: 'none', zIndex: 1 }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.3, paddingTop: 4, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)' }}>
              — PDC World Championship —
            </div>
            <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: 52, letterSpacing: '-1px', lineHeight: 1 }}>
              <span style={{ color: 'rgba(255,255,255,0.38)' }}>DART-VM-</span>
              <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: SPORT, fontSize: 56, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.88, letterSpacing: '-2px', marginBottom: 14 }}>
            <div style={{ color: 'rgba(255,255,255,0.45)' }}>Du er</div>
            <div style={{ color: '#fff' }}>påmeldt!</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, fontSize: 22 }}>
            {POTS.map(pot => {
              const player = pot.players.find(p => p.name === picks[pot.potNumber])
              return <Flag key={pot.potNumber} iso2={player?.iso2 ?? ''} size={22} />
            })}
          </div>
        </div>

        {/* Picks */}
        <div style={{ background: CARD_GRADIENT, borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', marginBottom: 20, boxShadow: CARD_SHADOW }}>
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>
            Dine valg
          </div>
          {POTS.map((pot) => {
            const player = pot.players.find((p) => p.name === picks[pot.potNumber])
            const color = POT_COLORS[(pot.potNumber - 1) % POT_COLORS.length]
            return (
              <div key={pot.potNumber} style={{ display: 'flex', borderBottom: pot.potNumber < POT_COUNT ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ width: 44, flexShrink: 0, background: `${color}18`, borderRight: `2px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: SPORT, fontSize: 18, fontWeight: 900, color, lineHeight: 1 }}>{pot.potNumber}</span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px' }}>
                  <Flag iso2={player?.iso2 ?? ''} size={24} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{picks[pot.potNumber]}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Nivå {pot.potNumber}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Hva skjer nå? */}
        <div style={{ background: CARD_GRADIENT, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '14px 16px', marginBottom: 24, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 12 }}>Hva skjer nå?</div>
          {([
            ['1', 'Dart-VM starter 11. desember 2026, kl. 19:00'],
            ['2', 'Du kan endre valg frem til turneringen begynner'],
          ] as [string, string][]).map(([n, text]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
              <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 900, color: '#dc2626', lineHeight: 1.5, flexShrink: 0 }}>{n}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>

        <LeagueSection participantId={participantId} showHeader={true} />

        {/* ShareButton fantes ferdig bygget men var aldri koblet på noe sted i
            appen — viktig for organisk vekst mot et større, internasjonalt
            deltakerfelt. Naturlig plassering: rett etter påmelding, mens
            entusiasmen er størst. */}
        <div style={{ marginBottom: 12 }}>
          <ShareButton
            url="/"
            text="Jeg er påmeldt Dart-VM-spillet — bli med du også!"
            label="Inviter venner →"
            variant="primary"
          />
        </div>

        <Link href={`/deltaker/${participantId}`} style={{ display: 'block', padding: '16px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 12, textDecoration: 'none', fontFamily: SPORT, textAlign: 'center', boxShadow: '0 4px 20px rgba(220,38,38,0.35)', marginBottom: 12 }}>
          Se min side →
        </Link>
        <div style={{ textAlign: 'center' }}>
          <Link href="/" className="back-btn">← Tilbake til start</Link>
        </div>
      </div>
    )
  }

  // ── Steg 0: Slideshow-intro (kun nye deltakere) ──
  if (step === 0) {
    return (
      <div className="page-bg app-frame" style={{ height: '100dvh', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <Link href="/" className="back-btn">← Hjem</Link>
          {slideshowSlide < INTRO_LAST_SLIDE && (
            <button
              onClick={() => {
                try { localStorage.setItem('vm_tipp_intro_seen', '1') } catch {}
                setStep(1)
              }}
              style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, cursor: 'pointer', padding: '7px 14px', letterSpacing: '0.02em' }}
            >
              Hopp over
            </button>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0, padding: '0 20px' }}>
          <StepSlideshow
            onStart={() => {
              try { localStorage.setItem('vm_tipp_intro_seen', '1') } catch {}
              setStep(1)
            }}
            onSlide={(s) => setSlideshowSlide(s)}
          />
        </div>

      </div>
    )
  }

  // ── Registrering (kun nye deltakere) ──
  if (step === REGISTRATION_STEP) {
    const valid = name.trim().length > 1 && email.includes('@')
    return (
      <div className="page-bg app-frame" style={{ minHeight: '100vh', padding: '20px 20px 40px', color: '#fff', position: 'relative' }}>
        {/* Samme kompakte banner og knapperad som oppsummeringen */}
        <div style={{ position: 'relative', height: 70, marginBottom: 6, pointerEvents: 'none', zIndex: 1 }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.3, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)' }}>
              — PDC World Championship —
            </div>
            <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: 34, letterSpacing: '-1px', lineHeight: 1 }}>
              <span style={{ color: 'rgba(255,255,255,0.38)' }}>DART-VM-</span>
              <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
          <button onClick={() => setStep(SUMMARY_STEP)} className="back-btn" style={{ cursor: 'pointer' }}>← Tilbake</button>
        </div>
        <div style={{ marginBottom: 16 }}>
          {/* Samme eyebrow-plass som «Min side»/«Liga» over tittelen */}
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>Siste steg</div>
          <div style={{ fontFamily: SPORT, fontSize: 34, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.95, marginBottom: 8 }}>
            <span style={{ color: '#fff' }}>Registrer </span>
            <span style={{ color: '#dc2626' }}>deg</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            E-posten brukes til å finne siden din igjen.
          </div>
        </div>

        {/* Laget du melder på — så det er tydelig hva som registreres */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '10px 8px', marginBottom: 16, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {POTS.map((pot, i) => {
            const player = pot.players.find((p) => p.name === picks[pot.potNumber])
            return (
              <div key={pot.potNumber} style={{ width: 48 }}>
                <TeamTile player={player} potNumber={pot.potNumber} color={POT_COLORS[i % POT_COLORS.length]} colorDark={POT_COLORS_DARK[i % POT_COLORS_DARK.length]} />
              </div>
            )
          })}
        </div>

        <div style={{ background: CARD_GRADIENT, borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)', padding: '24px 20px', marginBottom: 16, boxShadow: CARD_SHADOW }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 8 }}>Navn</label>
            <input style={inputStyle} type="text" placeholder="Ola Nordmann" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 8 }}>E-post</label>
            <input style={inputStyle} type="email" placeholder="ola@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        {error && (
          <div style={{ padding: '14px 16px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 12, marginBottom: 16 }}>
            <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 600, marginBottom: duplicateEmail ? 10 : 0 }}>{error}</div>
            {duplicateEmail && (
              <button
                disabled={findingPage}
                onClick={async () => {
                  setFindingPage(true)
                  try {
                    const res = await fetch('/api/finn', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email }),
                    })
                    const data = await res.json()
                    if (res.ok && data.id) {
                      router.push(`/deltaker/${data.id}`)
                    } else {
                      setError('Fant ikke siden din. Ta kontakt.')
                      setDuplicateEmail(false)
                    }
                  } catch {
                    setError('Noe gikk galt')
                    setDuplicateEmail(false)
                  } finally {
                    setFindingPage(false)
                  }
                }}
                style={{ display: 'inline-block', padding: '9px 18px', background: '#dc2626', color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', borderRadius: 8, border: 'none', cursor: findingPage ? 'not-allowed' : 'pointer', fontFamily: SPORT, opacity: findingPage ? 0.6 : 1 }}
              >
                {findingPage ? 'Leter...' : 'Gå til min side →'}
              </button>
            )}
          </div>
        )}
        <button
          disabled={!valid || submitting}
          onClick={handleSubmit}
          style={{
            display: 'block', width: '100%', padding: '16px',
            background: valid && !submitting ? 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)' : 'rgba(255,255,255,0.07)',
            color: valid && !submitting ? '#fff' : 'rgba(255,255,255,0.25)',
            border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800,
            cursor: valid && !submitting ? 'pointer' : 'not-allowed',
            fontFamily: SPORT, letterSpacing: '0.06em', textTransform: 'uppercase' as const,
            boxShadow: valid && !submitting ? '0 4px 20px rgba(220,38,38,0.35)' : 'none',
          }}
        >
          {submitting ? 'Lagrer…' : !valid ? 'Fyll inn navn og e-post' : 'Meld meg på →'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 12 }}>
          Ved å melde deg på godtar du at vi lagrer navn og e-post for å drive spillet. Se{' '}
          <Link href="/personvern" style={{ color: 'rgba(255,255,255,0.4)' }}>personvernsiden</Link> for detaljer.
        </p>
      </div>
    )
  }

  // ── Oppsummering ──
  if (step === SUMMARY_STEP) {
    const allPicked = Object.keys(picks).length === POT_COUNT
    return (
      <div className="page-bg app-frame" style={{ minHeight: '100vh', padding: '20px 20px 40px', color: '#fff', position: 'relative' }}>
        {/* Brand banner — komprimert: dette er bare en oppsummering, alt
            skal helst være synlig uten skrolling */}
        <div style={{ position: 'relative', height: 70, marginBottom: 6, pointerEvents: 'none', zIndex: 1 }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.3, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)' }}>
              — PDC World Championship —
            </div>
            <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: 34, letterSpacing: '-1px', lineHeight: 1 }}>
              <span style={{ color: 'rgba(255,255,255,0.38)' }}>DART-VM-</span>
              <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
          {isEditMode
            ? <Link href={`/deltaker/${editId}`} className="back-btn">← Min side</Link>
            : <Link href="/" className="back-btn">← Hjem</Link>
          }
          <Link href="/vm-info?tab=regler" target="_blank" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Regler og poeng →
          </Link>
        </div>
        <div style={{ fontFamily: SPORT, fontSize: 26, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.95, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.55)', fontSize: 15, letterSpacing: '0.15em', marginBottom: 2 }}>
            {isEditMode ? 'Bekreft endringer' : 'Oppsummering'}
            {/* Grønn hake = laget er komplett (erstatter «6 av 6 valgt») */}
            {allPicked && (
              <span aria-label="Alle seks spillere er valgt" title="Alle seks spillere er valgt" style={{ width: 18, height: 18, borderRadius: '50%', background: '#22c55e', color: '#052e16', fontSize: 11, fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', letterSpacing: 0, animation: 'flag-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>✓</span>
            )}
          </div>
          {name && <div style={{ color: '#fff' }}>{name}</div>}
        </div>
        <div style={{ background: CARD_GRADIENT, borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', marginBottom: 20, boxShadow: CARD_SHADOW }}>
          {POTS.map((pot) => {
            const playerName = picks[pot.potNumber]
            const player = pot.players.find((p) => p.name === playerName)
            const color = POT_COLORS[(pot.potNumber - 1) % POT_COLORS.length]
            const colorDark = POT_COLORS_DARK[(pot.potNumber - 1) % POT_COLORS_DARK.length]
            const multiplier = SCORING.underdogMultiplier[pot.potNumber]
            return (
              // Hele raden er trykkflate (ikke bare «Endre»-pillen) — går til pottens steg.
              <button key={pot.potNumber} type="button" onClick={() => setStep(pot.potNumber)} className="pick-row" aria-label={`Endre valg for nivå ${pot.potNumber}`} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: 0, background: 'none', border: 'none', color: 'inherit', textAlign: 'left', cursor: 'pointer', borderBottom: pot.potNumber < POT_COUNT ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                {/* Samme lag-brikke som i introen (foto på pott-farge) */}
                <div style={{ width: 62, flexShrink: 0, padding: '6px 0 6px 10px', background: `${color}12`, borderRight: `2px solid ${color}30`, alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 44 }}>
                    <TeamTile player={player} potNumber={pot.potNumber} color={color} colorDark={colorDark} label={false} />
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', minWidth: 0 }}>
                  <Flag iso2={player?.iso2 ?? ''} size={20} />
                  <div style={{ flex: 1, minWidth: 0, fontFamily: SPORT, fontSize: 16, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: player ? '#fff' : 'rgba(255,255,255,0.45)' }}>
                    {playerName ?? 'Ikke valgt'}
                  </div>
                  {/* Fast kolonne, så «Endre» står på samme sted i alle rader; ×1 vises ikke (tom plass) */}
                  <div style={{ width: 34, textAlign: 'center', flexShrink: 0, padding: '3px 0', borderRadius: 6, fontFamily: SPORT, fontSize: 13, fontWeight: 900, fontVariantNumeric: 'tabular-nums',
                    background: multiplier > 1 ? (multiplier === 2 ? 'rgba(245,158,11,0.12)' : 'rgba(220,38,38,0.12)') : 'transparent',
                    border: `1px solid ${multiplier > 1 ? (multiplier === 2 ? 'rgba(245,158,11,0.3)' : 'rgba(220,38,38,0.3)') : 'transparent'}`,
                    color: multiplier === 2 ? '#f59e0b' : '#ef4444' }}>
                    {multiplier > 1 ? `×${multiplier}` : ''}
                  </div>
                  <span
                    className="btn-hover"
                    style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '6px 10px', flexShrink: 0, letterSpacing: '0.04em' }}
                  >
                    Endre
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {error && (
          <div style={{ padding: 12, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, color: '#ef4444', fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          disabled={!allPicked || submitting}
          onClick={isEditMode ? handleSubmit : () => setStep(REGISTRATION_STEP)}
          style={{
            display: 'block', width: '100%', padding: '16px',
            background: allPicked && !submitting ? 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)' : 'rgba(255,255,255,0.07)',
            color: allPicked && !submitting ? '#fff' : 'rgba(255,255,255,0.25)',
            border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800,
            cursor: allPicked && !submitting ? 'pointer' : 'not-allowed',
            fontFamily: SPORT, letterSpacing: '0.06em', textTransform: 'uppercase' as const,
            marginBottom: 10,
            boxShadow: allPicked && !submitting ? '0 4px 20px rgba(220,38,38,0.35)' : 'none',
          }}
        >
          {submitting ? 'Lagrer…' : isEditMode ? 'Lagre endringer →' : 'Fortsett til registrering →'}
        </button>
        <button
          onClick={() => setStep(POT_COUNT)}
          style={{ display: 'block', width: '100%', padding: '13px', background: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          ← Tilbake
        </button>
      </div>
    )
  }

  // ── Steg 1–POT_COUNT: Velg spiller ──
  const potIndex = step - 1
  const pot = POTS[potIndex]
  const selectedPlayer = picks[pot.potNumber]
  const multiplier = SCORING.underdogMultiplier[pot.potNumber]
  const color = POT_COLORS[potIndex % POT_COLORS.length]
  const colorDark = POT_COLORS_DARK[potIndex % POT_COLORS_DARK.length]
  const pickablePlayers = getPickablePlayers(pot)
  // Potter med 5 kandidater (pott 5/6) i én rad ble for trangt — split i to
  // rader (3 øverst, 2 under) i stedet. Potter med ≤4 beholder én rad
  // uendret. Generell formel (ceil av halvparten) i tilfelle et fremtidig
  // pott-oppsett skulle gi enda flere kandidater.
  const rowSize = pickablePlayers.length > 4 ? Math.ceil(pickablePlayers.length / 2) : pickablePlayers.length
  const playerRows: (typeof pickablePlayers)[] = []
  for (let i = 0; i < pickablePlayers.length; i += rowSize) playerRows.push(pickablePlayers.slice(i, i + rowSize))

  function goNext() {
    if (step < POT_COUNT) setStep(s => s + 1)
    else setStep(SUMMARY_STEP)
  }

  return (
    <div className="page-bg app-frame" style={{ height: '100dvh', padding: '24px 16px 20px', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <ProgressDots
        step={step}
        multiplier={multiplier}
        picks={picks}
        onGuide={() => { setStep(0); setSlideshowSlide(0) }}
        onStep={setStep}
        onTogglePoeng={() => setShowScoreInfo(s => !s)}
        poengActive={showScoreInfo}
      />

      {/* Pot-header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: showScoreInfo ? 8 : 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14, background: color, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 16px ${color}55`,
        }}>
          <span style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, color: 'rgba(0,0,0,0.45)', lineHeight: 1 }}>{step}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Pottens navn (uten emoji) som tittel — «Velg din spiller» gjentok
              bare steg-linjen; nå får hvert steg sin egen identitet */}
          <div style={{ fontFamily: SPORT, fontSize: 26, fontWeight: 900, textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>
            {pot.name.replace(/^[^\p{L}]+/u, '')}
          </div>
          {/* Multiplikatoren står i steg-linjen over («Steg 3 av 6 · ×2»);
              her kun en rolig forklaring i vanlig tekst når den er > 1 */}
          {multiplier > 1 && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
              {multiplier === 2 ? 'Dobbelt' : multiplier === 3 ? 'Trippelt' : 'Firedobbelt'} poeng i denne potten
            </div>
          )}
        </div>
      </div>
      {showScoreInfo && (
        <div style={{ marginBottom: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', fontSize: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>Poeng</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Per vunnet sett</span>
            <span style={{ fontFamily: SPORT, fontWeight: 600, color: '#f59e0b' }}>{SCORING.perSetWon}p</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Per kampseier (avansement)</span>
            <span style={{ fontFamily: SPORT, fontWeight: 600, color: '#f59e0b' }}>{SCORING.perAdvancement}p</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>For å vinne turneringen</span>
            <span style={{ fontFamily: SPORT, fontWeight: 600, color: '#f59e0b' }}>+{SCORING.tournamentWinner}p</span>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '8px 0' }} />
          {(() => {
            // Grupper sammenhengende potter med samme multiplikator til én linje.
            const groups: { pots: number[]; mult: number }[] = []
            for (const pot of POTS) {
              const mult = SCORING.underdogMultiplier[pot.potNumber] ?? 1
              const last = groups[groups.length - 1]
              if (last && last.mult === mult) last.pots.push(pot.potNumber)
              else groups.push({ pots: [pot.potNumber], mult })
            }
            return groups.map((g, i) => {
              const label = g.pots.length === 1 ? `Pott ${g.pots[0]}` : `Pott ${g.pots[0]}–${g.pots[g.pots.length - 1]}`
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i === groups.length - 1 ? 0 : 4 }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>{label} scorer ×{g.mult}</span>
                  <span style={{ fontFamily: SPORT, fontWeight: 600, color: g.mult >= 3 ? '#ef4444' : '#f59e0b' }}>×{g.mult}</span>
                </div>
              )
            })
          })()}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '8px 0' }} />
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, lineHeight: 1.5 }}>
            Ved lik poengsum vinner den som meldte seg på tidligst.
          </div>
        </div>
      )}

      {/* Spillerliste som grid — flere kort side om side, mindre hver — pluss en
          utvidbar detalj-/bracket-seksjon under gridet når en spiller er valgt,
          i stedet for et alltid-synlig sidepanel. Hele denne midtsonen scroller
          som én enhet, så både gridet og detalj-seksjonen er tilgjengelig uten
          at Neste-knappen flytter seg. */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, marginBottom: 14, overflowY: 'auto' }}>
        {/* margin: auto 0 sentrerer kortene + hurtiginfoen vertikalt i sonen
            mellom header og Neste-knappen (ellers ble det et stort tomrom
            under kortene på høye skjermer) */}
        <div style={{ margin: 'auto 0' }}>
        {/* Ytre wrapper (vanlig blokk-element, ikke selv en flex-item med
            display:grid) håndterer maks-bredde + sentrering — å sette
            maxWidth+margin:auto DIREKTE på selve grid-diven, som var en
            flex-item i kolonnen over, kollapset hele gridet til 0px bredde
            (auto-margin på tvers-aksen i en flex-kontekst overstyrer
            stretch-oppførselen som ellers ville gitt gridet reell bredde). */}
        {/* 176px per kort (var 128): på desktop ble kortene små og "bortkomne" i
            all luften rundt — mer presens uten å miste én-rad-garantien
            (1fr-kolonnene krymper fortsatt fritt på smale skjermer). Potter
            med 5 kandidater rendres nå som TO separate rad-grid (3 øverst,
            2 under, se playerRows over) i stedet for én trang 5-kolonners
            rad — hver rad er sin egen sentrerte grid, ikke én stor grid med
            et ufullstendig siste rad-forsøk. */}
        {playerRows.map((row, rowIndex) => (
          <div key={rowIndex} style={{ width: '100%', maxWidth: Math.min(row.length * 176, 400), margin: '0 auto' }}>
            <div
              role="radiogroup"
              aria-label={`Velg spiller fra ${pot.name}${playerRows.length > 1 ? `, rad ${rowIndex + 1}` : ''}`}
              style={{
                display: 'grid', gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
                gap: 14, padding: rowIndex === 0 ? '6px 6px 8px' : '0 6px 8px',
              }}
            >
              {row.map((player) => {
                const index = pickablePlayers.indexOf(player)
                return (
                  <PlayerCard
                    key={player.name}
                    player={player}
                    index={index}
                    color={color}
                    colorDark={colorDark}
                    potNumber={pot.potNumber}
                    selected={selectedPlayer === player.name}
                    dimmed={selectedPlayer != null && selectedPlayer !== player.name}
                    onClick={() => setPicks(prev => ({ ...prev, [pot.potNumber]: player.name }))}
                  />
                )
              })}
            </div>
          </div>
        ))}

        {/* Hurtiginfo for valgt spiller + «Detaljer» som åpner bunnarket.
            Trykk på kortet er KUN valg — arket er et frivillig dypdykk. */}
        {/* Fast høyde: linjen finnes alltid, så kortene ikke hopper oppover
            idet den fylles ved første valg. */}
        <div style={{ minHeight: 48, marginTop: 12 }}>
        {selectedPlayer && (() => {
          const selectedPlayerData = pot.players.find(p => p.name === selectedPlayer)
          if (!selectedPlayerData) return null
          const stats = PLAYER_STATS[selectedPlayerData.name]
          return (
            <>
              <div key={selectedPlayer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', padding: '0 6px', animation: 'slide-enter 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontVariantNumeric: 'tabular-nums', textAlign: 'center' }}>
                  <span style={{ fontFamily: SPORT, fontWeight: 900, color: '#fff', fontSize: 15 }}>#{selectedPlayerData.pdcRanking}</span>
                  <span style={{ color: 'rgba(255,255,255,0.35)', margin: '0 7px' }}>·</span>
                  Snitt <span style={{ fontFamily: SPORT, fontWeight: 900, color: '#fff', fontSize: 15 }}>{formatAvg(stats?.avg)}</span>
                  {stats?.bestAchievement && (
                    <>
                      <span style={{ color: 'rgba(255,255,255,0.35)', margin: '0 7px' }}>·</span>
                      {stats.bestAchievement}
                    </>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setPanelOpen(true)}
                  className="btn-hover"
                  style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: '#fff', background: 'rgba(255,255,255,0.08)', border: `1px solid ${color}88`, borderRadius: 999, padding: '7px 14px', cursor: 'pointer', flexShrink: 0 }}
                >
                  Detaljer →
                </button>
              </div>
              <PlayerDetailPanel
                player={selectedPlayerData}
                color={color}
                open={panelOpen}
                onClose={() => setPanelOpen(false)}
                onNext={() => { setPanelOpen(false); goNext() }}
                nextLabel={step < POT_COUNT ? 'Neste →' : 'Se oppsummering →'}
                potNumber={pot.potNumber}
              />
            </>
          )
        })()}
        </div>
        </div>
      </div>

      {/* Neste-knapp */}
      <button
        disabled={!selectedPlayer}
        onClick={goNext}
        className={selectedPlayer ? 'btn-hover' : undefined}
        style={{
          display: 'block', width: '100%', padding: '16px',
          background: selectedPlayer ? 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)' : 'transparent',
          color: selectedPlayer ? '#fff' : 'rgba(255,255,255,0.5)',
          // Deaktivert = tydelig «tom» tilstand (stiplet ramme), ikke en mørk
          // variant av den aktive knappen
          border: selectedPlayer ? '1px solid transparent' : '1px dashed rgba(255,255,255,0.3)',
          borderRadius: 12, fontSize: 15, fontWeight: 800,
          cursor: selectedPlayer ? 'pointer' : 'not-allowed',
          fontFamily: SPORT, letterSpacing: '0.06em', textTransform: 'uppercase' as const,
          marginBottom: 10,
          boxShadow: selectedPlayer ? '0 4px 20px rgba(220,38,38,0.35)' : 'none',
          transition: 'background 0.2s, box-shadow 0.2s, filter 0.12s, border-color 0.2s',
        }}
      >
        {!selectedPlayer ? 'Velg en spiller' : step < POT_COUNT ? 'Neste →' : 'Se oppsummering →'}
      </button>
      <button
        onClick={() => setStep(step === 1 ? 0 : step - 1)}
        className="btn-hover"
        style={{ display: 'block', width: '100%', padding: '13px', background: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
      >
        ← Tilbake
      </button>
    </div>
  )
}

// Generisk skjelett (vi vet ikke ennå om intro/plukker/registrering/oppsummering
// skal vises) — samme .skeleton-mønster som resten av appen i stedet for ren
// "Laster..."-tekst. Vises normalt svært kort (kun til useSearchParams er klar).
function TippLoading() {
  return (
    <div className="page-bg" style={{ minHeight: '100vh', padding: '24px 16px 20px' }}>
      <div className="skeleton" style={{ width: 140, height: 5, borderRadius: 3, margin: '0 auto 24px' }} />
      <div className="skeleton" style={{ height: 46, borderRadius: 10, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
    </div>
  )
}

export default function TippPage() {
  return (
    <Suspense fallback={<TippLoading />}>
      <TippContent />
    </Suspense>
  )
}
