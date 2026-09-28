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

import { useState, useEffect, useLayoutEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import SmartBackButton from '@/components/SmartBackButton'
import { POTS, getPickablePlayers } from '@/data/pots'
import Flag from '@/components/Flag'
import { SCORING } from '@/config/scoring'
import { PlayerCard, TEMPLATE_ASPECT } from '@/components/PlayerCard'
import PlayerDetailPanel from '@/components/PlayerDetailPanel'
import TeamTile from '@/components/TeamTile'
import { PLAYER_STATS } from '@/data/playerStats'
import { formatAvg, formatPoints } from '@/lib/format'
import StepSlideshow, { INTRO_LAST_SLIDE } from '@/components/StepSlideshow'
import LeagueSection from '@/components/LeagueSection'
import ShareButton from '@/components/ShareButton'
import { POT_COLORS, POT_COLORS_DARK } from '@/config/potColors'
import { KICKOFF } from '@/config/tournament'
import { Confetti, ProgressDots } from './ProgressDots'
import { SPORT, CARD_GRADIENT, CARD_SHADOW } from '@/config/theme'
import { useLocale } from '@/lib/i18n/useLocale'
import { translatePotName, translateBestAchievement } from '@/lib/i18n/translatePlayer'
import LocaleSwitch from '@/components/LocaleSwitch'

const POT_COUNT = POTS.length
const REGISTRATION_STEP = POT_COUNT + 1
const SUMMARY_STEP = POT_COUNT + 2

function TippContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { locale, dict } = useLocale()
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

  // Kort-gridets faktiske tilgjengelige plass i pikker-steget — MÅLT, ikke
  // gjettet. Et fast px-tak (uansett hvor mye vi finjusterte det) traff
  // enten for stort (scroll på ekte mobil med adressefelt synlig) eller for
  // lite (stort tomrom over kortene når nettleseren senere kollapser
  // adressefeltet/verktøylinjen, eller på et device med mer plass) — de
  // varierer for mye seg imellom til at én konstant kan dekke begge. Denne
  // diven er en flex:1-unge av hurtiginfo-linjen (som selv beholder sin
  // naturlige høyde), så ResizeObserver-målingen er nøyaktig "det som er
  // igjen" etter header/knapper/hurtiginfo — uansett faktisk synlig
  // nettleserhøyde. cardsAreaSize er null helt til første måling kommer inn
  // (ren layout-effekt, kjører før maling — praktisk talt ingen synlig
  // "hopp" til riktig størrelse).
  const cardsAreaRef = useRef<HTMLDivElement>(null)
  const [cardsAreaSize, setCardsAreaSize] = useState<{ w: number; h: number } | null>(null)
  useLayoutEffect(() => {
    const el = cardsAreaRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentBoxSize?.[0]
      if (box) setCardsAreaSize({ w: box.inlineSize, h: box.blockSize })
      else setCardsAreaSize({ w: el.clientWidth, h: el.clientHeight })
    })
    ro.observe(el)
    return () => ro.disconnect()
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
        else { setVerifyingToken(false); setTokenError(data.error ?? dict.tipp.loginLink.invalidLink) }
      })
      .catch(() => { setVerifyingToken(false); setTokenError(dict.tipp.loginLink.genericError) })
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
          throw new Error(data.error ?? dict.tipp.registration.genericError)
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
          throw new Error(data.error || dict.tipp.registration.genericError)
        }
        setParticipantId(data.participantId)
        setSubmitted(true)
        try { localStorage.setItem('vm_participant_id', data.participantId) } catch {}
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : dict.tipp.registration.genericError)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Stengt etter deadline ──
  if (new Date() > KICKOFF) {
    return (
      <div className="page-bg" style={{ minHeight: '100vh', color: '#fff', padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 20 }}>
          <div style={{ fontSize: 48, color: '#fff' }}>{dict.tipp.closed.title1}</div>
          <div style={{ fontSize: 48, color: '#dc2626' }}>{dict.tipp.closed.title2}</div>
        </div>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 32, maxWidth: 280 }}>
          {dict.tipp.closed.body}
        </p>
        <Link href="/leaderboard" style={{ display: 'inline-block', padding: '14px 28px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 12, textDecoration: 'none', fontFamily: SPORT, boxShadow: '0 4px 20px rgba(220,38,38,0.3)', marginBottom: 12 }}>
          {dict.tipp.closed.leaderboardCta}
        </Link>
        <Link href="/" className="back-btn">{dict.common.nav.home}</Link>
      </div>
    )
  }

  // ── Innloggingslenke / token-verifisering (edit mode) ──
  if (isEditMode && !pinVerified) {
    if (verifyingToken) {
      return (
        <div className="page-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
          {dict.tipp.loginLink.verifying}
        </div>
      )
    }

    return (
      <div className="page-bg" style={{ minHeight: '100vh', padding: '40px 20px 56px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ marginBottom: 24 }}>
          <Link href={`/deltaker/${editId}`} className="back-btn">{dict.tipp.loginLink.back}</Link>
        </div>

        <div style={{ fontFamily: SPORT, fontSize: 52, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 16 }}>
          <div style={{ color: 'rgba(255,255,255,0.3)' }}>{dict.tipp.loginLink.title1}</div>
          <div style={{ color: '#fff' }}>{dict.tipp.loginLink.title2}</div>
          <div style={{ color: '#dc2626' }}>{dict.tipp.loginLink.title3}</div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 32, fontSize: 14, lineHeight: 1.6 }}>
          {dict.tipp.loginLink.intro}
        </p>

        {tokenError && (
          <div style={{ padding: '12px 16px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 12, color: '#ef4444', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
            {tokenError} {dict.tipp.loginLink.tokenErrorSuffix}
          </div>
        )}

        {!linkSentTo ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 8 }}>{dict.tipp.loginLink.emailLabel}</label>
              <input
                type="email"
                value={linkEmail}
                onChange={e => setLinkEmail(e.target.value)}
                placeholder={dict.tipp.loginLink.emailPlaceholder}
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
                  if (!res.ok) { setSendLinkError(data.error ?? dict.tipp.loginLink.genericError); return }
                  setLinkSentTo(data.maskedEmail)
                } catch {
                  setSendLinkError(dict.tipp.loginLink.genericError)
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
              {sendingLink ? dict.tipp.loginLink.submitSending : dict.tipp.loginLink.submitIdle}
            </button>
            {sendLinkError && (
              <div style={{ padding: '12px 16px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 12, color: '#ef4444', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                {sendLinkError}
              </div>
            )}
          </>
        ) : (
          <div style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 16, padding: '20px 18px', marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#22c55e', marginBottom: 6 }}>{dict.tipp.loginLink.sent.title}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{dict.tipp.loginLink.sent.checkInboxBefore} <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{linkSentTo}</strong>{dict.tipp.loginLink.sent.checkInboxAfter}<br />{dict.tipp.loginLink.sent.validFor}</div>
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

        {/* Brand banner — WORLD GRAND PRIX-SPILLET */}
        <div style={{ position: 'relative', height: 145, marginBottom: 20, pointerEvents: 'none', zIndex: 1 }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.3, paddingTop: 4, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #eff6ff 0%, #93c5fd 14%, #3b82f6 45%, #1e3a8a 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(59,130,246,0.45), 0 0 5px rgba(59,130,246,0.55)' }}>
              — PDC World Grand Prix —
            </div>
            <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: 'clamp(30px, 8.5vw, 52px)', letterSpacing: '-1px', lineHeight: 1 }}>
              <span style={{ color: 'rgba(147,197,253,0.45)' }}>WORLD GRAND PRIX-</span>
              <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, #bfdbfe 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: SPORT, fontSize: 56, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.88, letterSpacing: '-2px', marginBottom: 14 }}>
            <div style={{ color: 'rgba(255,255,255,0.45)' }}>{dict.tipp.confirmation.heading1}</div>
            <div style={{ color: '#fff' }}>{dict.tipp.confirmation.heading2}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '10px 8px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {POTS.map((pot, i) => {
              const player = pot.players.find((p) => p.name === picks[pot.potNumber])
              return (
                <div key={pot.potNumber} style={{ width: 48 }}>
                  <TeamTile player={player} potNumber={pot.potNumber} color={POT_COLORS[i % POT_COLORS.length]} colorDark={POT_COLORS_DARK[i % POT_COLORS_DARK.length]} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Picks */}
        <div style={{ background: CARD_GRADIENT, borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', marginBottom: 20, boxShadow: CARD_SHADOW }}>
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>
            {dict.tipp.confirmation.yourPicks}
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
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{dict.common.teamTile.level(pot.potNumber)}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Link href={`/deltaker/${participantId}`} style={{ display: 'block', padding: '16px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 12, textDecoration: 'none', fontFamily: SPORT, textAlign: 'center', boxShadow: '0 4px 20px rgba(220,38,38,0.35)', marginBottom: 24 }}>
          {dict.tipp.confirmation.seeMyPage}
        </Link>

        <LeagueSection participantId={participantId} showHeader={true} />

        {/* ShareButton fantes ferdig bygget men var aldri koblet på noe sted i
            appen — viktig for organisk vekst mot et større, internasjonalt
            deltakerfelt. Naturlig plassering: rett etter påmelding, mens
            entusiasmen er størst. */}
        <div style={{ marginBottom: 12 }}>
          <ShareButton
            url="/"
            text={dict.tipp.confirmation.inviteText}
            label={dict.tipp.confirmation.inviteLabel}
            variant="primary"
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href="/" className="back-btn">{dict.tipp.confirmation.backToStart}</Link>
        </div>
      </div>
    )
  }

  // ── Steg 0: Slideshow-intro (kun nye deltakere) ──
  if (step === 0) {
    return (
      <div className="page-bg app-frame" style={{ height: '100dvh', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <Link href="/" className="back-btn">{dict.common.nav.home}</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LocaleSwitch />
            {slideshowSlide < INTRO_LAST_SLIDE && (
              <button
                onClick={() => {
                  try { localStorage.setItem('vm_tipp_intro_seen', '1') } catch {}
                  setStep(1)
                }}
                style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, cursor: 'pointer', padding: '7px 14px', letterSpacing: '0.02em' }}
              >
                {dict.tipp.stepSlideshow.skip}
              </button>
            )}
          </div>
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
            <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.3, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #eff6ff 0%, #93c5fd 14%, #3b82f6 45%, #1e3a8a 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(59,130,246,0.45), 0 0 5px rgba(59,130,246,0.55)' }}>
              — PDC World Grand Prix —
            </div>
            <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: 'clamp(20px, 6vw, 34px)', letterSpacing: '-1px', lineHeight: 1 }}>
              <span style={{ color: 'rgba(147,197,253,0.45)' }}>WORLD GRAND PRIX-</span>
              <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, #bfdbfe 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
          <button onClick={() => setStep(SUMMARY_STEP)} className="back-btn" style={{ cursor: 'pointer' }}>{dict.tipp.registration.back}</button>
        </div>
        <div style={{ marginBottom: 16 }}>
          {/* Samme eyebrow-plass som «Min side»/«Liga» over tittelen */}
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>{dict.tipp.registration.lastStep}</div>
          <div style={{ fontFamily: SPORT, fontSize: 34, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.95, marginBottom: 8 }}>
            <span style={{ color: '#fff' }}>{dict.tipp.registration.title1} </span>
            <span style={{ color: '#dc2626' }}>{dict.tipp.registration.title2}</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            {dict.tipp.registration.intro}
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
            <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 8 }}>{dict.tipp.registration.nameLabel}</label>
            <input style={inputStyle} type="text" placeholder={dict.tipp.registration.namePlaceholder} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 8 }}>{dict.tipp.registration.emailLabel}</label>
            <input style={inputStyle} type="email" placeholder={dict.tipp.registration.emailPlaceholder} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
                      setError(dict.tipp.registration.notFoundError)
                      setDuplicateEmail(false)
                    }
                  } catch {
                    setError(dict.tipp.registration.genericError)
                    setDuplicateEmail(false)
                  } finally {
                    setFindingPage(false)
                  }
                }}
                style={{ display: 'inline-block', padding: '9px 18px', background: '#dc2626', color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', borderRadius: 8, border: 'none', cursor: findingPage ? 'not-allowed' : 'pointer', fontFamily: SPORT, opacity: findingPage ? 0.6 : 1 }}
              >
                {findingPage ? dict.tipp.registration.findingPage : dict.tipp.registration.goToMyPage}
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
          {submitting ? dict.tipp.registration.submitSaving : !valid ? dict.tipp.registration.submitFillIn : dict.tipp.registration.submitIdle}
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 12 }}>
          {dict.tipp.registration.consentBefore}{' '}
          <Link href="/personvern" style={{ color: 'rgba(255,255,255,0.4)' }}>{dict.tipp.registration.consentLink}</Link> {dict.tipp.registration.consentAfter}
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
            <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.3, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #eff6ff 0%, #93c5fd 14%, #3b82f6 45%, #1e3a8a 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(59,130,246,0.45), 0 0 5px rgba(59,130,246,0.55)' }}>
              — PDC World Grand Prix —
            </div>
            <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: 'clamp(20px, 6vw, 34px)', letterSpacing: '-1px', lineHeight: 1 }}>
              <span style={{ color: 'rgba(147,197,253,0.45)' }}>WORLD GRAND PRIX-</span>
              <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, #bfdbfe 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
          {isEditMode
            ? <Link href={`/deltaker/${editId}`} className="back-btn">{dict.common.nav.myPage}</Link>
            : <Link href="/" className="back-btn">{dict.common.nav.home}</Link>
          }
          <Link href="/vm-info?tab=regler" target="_blank" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            {dict.tipp.summary.rulesAndPoints}
          </Link>
        </div>
        <div style={{ fontFamily: SPORT, fontSize: 26, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.95, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.55)', fontSize: 15, letterSpacing: '0.15em', marginBottom: 2 }}>
            {isEditMode ? dict.tipp.summary.confirmChanges : dict.tipp.summary.heading}
            {/* Grønn hake = laget er komplett (erstatter «6 av 6 valgt») */}
            {allPicked && (
              <span aria-label={dict.tipp.summary.allPickedAriaLabel} title={dict.tipp.summary.allPickedAriaLabel} style={{ width: 18, height: 18, borderRadius: '50%', background: '#22c55e', color: '#052e16', fontSize: 11, fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', letterSpacing: 0, animation: 'flag-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>✓</span>
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
              <button key={pot.potNumber} type="button" onClick={() => setStep(pot.potNumber)} className="pick-row" aria-label={dict.tipp.summary.changeAriaLabel(pot.potNumber)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: 0, background: 'none', border: 'none', color: 'inherit', textAlign: 'left', cursor: 'pointer', borderBottom: pot.potNumber < POT_COUNT ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                {/* Samme lag-brikke som i introen (foto på pott-farge) */}
                <div style={{ width: 62, flexShrink: 0, padding: '6px 0 6px 10px', background: `${color}12`, borderRight: `2px solid ${color}30`, alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 44 }}>
                    <TeamTile player={player} potNumber={pot.potNumber} color={color} colorDark={colorDark} label={false} />
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', minWidth: 0 }}>
                  <Flag iso2={player?.iso2 ?? ''} size={20} />
                  <div style={{ flex: 1, minWidth: 0, fontFamily: SPORT, fontSize: 16, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: player ? '#fff' : 'rgba(255,255,255,0.45)' }}>
                    {playerName ?? dict.tipp.summary.notSelected}
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
                    {dict.tipp.summary.change}
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
          {submitting ? dict.tipp.summary.submitSaving : isEditMode ? dict.tipp.summary.submitSaveChanges : dict.tipp.summary.submitContinue}
        </button>
        <button
          onClick={() => setStep(POT_COUNT)}
          style={{ display: 'block', width: '100%', padding: '13px', background: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          {dict.tipp.summary.back}
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
  // Potter med 4+ kandidater i én rad ble for trangt/lite kortene fylte for
  // lite av skjermen — split i to rader i stedet (4 → 2+2, 6 → 3+3, 5 → 3+2
  // osv. via generell formel/ceil av halvparten). Potter med ≤3 (pott 1)
  // beholder én rad uendret.
  const rowSize = pickablePlayers.length > 3 ? Math.ceil(pickablePlayers.length / 2) : pickablePlayers.length
  const playerRows: (typeof pickablePlayers)[] = []
  for (let i = 0; i < pickablePlayers.length; i += rowSize) playerRows.push(pickablePlayers.slice(i, i + rowSize))

  // Kort-bredde: fyller den MÅLTE tilgjengelige plassen (cardsAreaSize over)
  // i stedet for et gjettet fast tak — et fast pikseltall traff enten for
  // stort (scroll på ekte mobil med adressefelt synlig) eller ga et stort
  // tomrom over kortene (når nettleseren senere kollapser adressefeltet,
  // eller på et device med mer plass) — reelle nettlesere varierer for mye
  // til at én konstant kan dekke begge. FALLBACK_CARD_WIDTH brukes kun i
  // det aller første oppslaget, før ResizeObserver har målt noe.
  const rowGap = playerRows.length > 1 ? 8 : 14
  const colGap = playerRows.length > 1 ? 8 : 14
  const ROW_PADDING_V = 8
  const ROW_PADDING_H = 12
  const FALLBACK_CARD_WIDTH = playerRows.length > 1 ? 95 : 176
  const ABS_MAX_CARD_WIDTH = 200
  const ABS_MIN_CARD_WIDTH = 68
  let cardWidth = FALLBACK_CARD_WIDTH
  if (cardsAreaSize) {
    const rows = playerRows.length
    const availableCardsH = cardsAreaSize.h - (rows - 1) * rowGap - rows * ROW_PADDING_V
    const heightDerivedWidth = (availableCardsH / rows) * TEMPLATE_ASPECT
    const widthDerivedWidth = Math.min(
      ...playerRows.map((row) => (cardsAreaSize.w - (row.length - 1) * colGap - ROW_PADDING_H) / row.length),
    )
    cardWidth = Math.max(ABS_MIN_CARD_WIDTH, Math.min(heightDerivedWidth, widthDerivedWidth, ABS_MAX_CARD_WIDTH))
  }

  function goNext() {
    if (step < POT_COUNT) setStep(s => s + 1)
    else setStep(SUMMARY_STEP)
  }

  return (
    <div className="page-bg app-frame" style={{ height: '100dvh', padding: '14px 16px 10px', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <ProgressDots
        step={step}
        multiplier={multiplier}
        picks={picks}
        onGuide={() => { setStep(0); setSlideshowSlide(0) }}
        onStep={setStep}
        onTogglePoeng={() => setShowScoreInfo(s => !s)}
        poengActive={showScoreInfo}
      />

      {/* Pot-header — kompakt (badge+tittel på 38px) siden den ekte
          begrensningen på mobil ikke er 900px logisk høyde (headless-
          emulering), men den faktiske synlige høyden i Safari/Chrome MED
          adressefelt/verktøylinje synlig, ofte 150-250px mindre. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: showScoreInfo ? 6 : 8 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12, background: color, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 16px ${color}55`,
        }}>
          <span style={{ fontFamily: SPORT, fontSize: 19, fontWeight: 900, color: 'rgba(0,0,0,0.45)', lineHeight: 1 }}>{step}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Pottens navn som tittel — «Velg din spiller» gjentok bare
              steg-linjen; nå får hvert steg sin egen identitet */}
          <div style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>
            {translatePotName(dict.players, pot.potNumber, pot.name)}
          </div>
          {/* Multiplikatoren står i steg-linjen over («Steg 3 av 6 · ×2»);
              her kun en rolig forklaring i vanlig tekst når den er > 1 */}
          {multiplier > 1 && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
              {dict.tipp.step.multiplierNote(multiplier === 2 ? dict.tipp.step.multiplierWords.double : multiplier === 3 ? dict.tipp.step.multiplierWords.triple : dict.tipp.step.multiplierWords.quadruple)}
            </div>
          )}
        </div>
      </div>
      {showScoreInfo && (
        <div style={{ marginBottom: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', fontSize: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>{dict.tipp.step.scoreInfo.title}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{dict.tipp.step.scoreInfo.perSet}</span>
            <span style={{ fontFamily: SPORT, fontWeight: 600, color: '#f59e0b' }}>+{formatPoints(SCORING.perSetWon, locale)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{dict.tipp.step.scoreInfo.perAdvancement}</span>
            <span style={{ fontFamily: SPORT, fontWeight: 600, color: '#f59e0b' }}>+{formatPoints(SCORING.perAdvancement, locale)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{dict.tipp.step.scoreInfo.forWinning}</span>
            <span style={{ fontFamily: SPORT, fontWeight: 600, color: '#f59e0b' }}>+{formatPoints(SCORING.tournamentWinner, locale)}</span>
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
              const label = dict.tipp.step.scoreInfo.potLabel(g.pots[0], g.pots.length > 1 ? g.pots[g.pots.length - 1] : undefined)
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i === groups.length - 1 ? 0 : 4 }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>{label} ×{g.mult}</span>
                  <span style={{ fontFamily: SPORT, fontWeight: 600, color: g.mult >= 3 ? '#ef4444' : '#f59e0b' }}>×{g.mult}</span>
                </div>
              )
            })
          })()}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '8px 0' }} />
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, lineHeight: 1.5 }}>
            {dict.tipp.step.scoreInfo.tieBreak}
          </div>
        </div>
      )}

      {/* Spillerliste som grid — flere kort side om side, mindre hver — pluss en
          utvidbar detalj-/bracket-seksjon under gridet når en spiller er valgt,
          i stedet for et alltid-synlig sidepanel. Hele denne midtsonen scroller
          som én enhet, så både gridet og detalj-seksjonen er tilgjengelig uten
          at Neste-knappen flytter seg. */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, marginBottom: 8, overflowY: 'auto' }}>
        {/* cardsAreaRef måler NØYAKTIG det som er igjen etter at
            hurtiginfo-linjen under (flexShrink: 0, egen naturlige høyde) har
            tatt sin plass — flex: '1 1 auto' på denne diven betyr at
            ResizeObserveren over ser den EKTE tilgjengelige høyden/bredden
            for kortene på akkurat dette nettleser-vinduet, ikke en gjettet
            konstant. justifyContent: center sentrerer radene i det tilfellet
            bredden (ikke høyden) er den trangeste begrensningen, slik at det
            ikke blir tomrom KUN i bunnen eller KUN i toppen. */}
        <div ref={cardsAreaRef} style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {playerRows.map((row, rowIndex) => (
          <div key={rowIndex} style={{ width: '100%', maxWidth: row.length * cardWidth, margin: '0 auto' }}>
            <div
              role="radiogroup"
              aria-label={dict.tipp.step.chooseAriaLabel(translatePotName(dict.players, pot.potNumber, pot.name), playerRows.length > 1 ? rowIndex + 1 : undefined)}
              style={{
                display: 'grid', gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
                gap: colGap, padding: '4px 6px',
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
        </div>

        {/* Hurtiginfo for valgt spiller + «Detaljer» som åpner bunnarket.
            Trykk på kortet er KUN valg — arket er et frivillig dypdykk. */}
        {/* Fast høyde: linjen finnes alltid, så kortene ikke hopper oppover
            idet den fylles ved første valg. flexShrink: 0 — denne skal ALDRI
            ofres for å gi kortene mer plass, det er omvendt (kortene måler
            seg etter det som er igjen når denne har tatt sitt). */}
        <div style={{ minHeight: 44, marginTop: 8, flexShrink: 0 }}>
        {selectedPlayer && (() => {
          const selectedPlayerData = pot.players.find(p => p.name === selectedPlayer)
          if (!selectedPlayerData) return null
          const stats = PLAYER_STATS[selectedPlayerData.name]
          return (
            <>
              {/* flexWrap fjernet: lange bestAchievement-tekster («European
                  Championship-vinner 2021») fikk «Detaljer»-knappen til å
                  hoppe ned på en egen linje under — en hel ekstra linjehøyde
                  som ikke er der plass til på et ekte mobilvindu med
                  adressefelt/verktøylinje synlig. Linjen er nå alltid étt
                  fast-høyt rad; for lang tekst klippes med ellipsis i
                  stedet (full tekst ligger uansett i «Detaljer»-arket). */}
              <div key={selectedPlayer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '0 6px', animation: 'slide-enter 0.3s cubic-bezier(0.22,1,0.36,1) both', minWidth: 0 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontVariantNumeric: 'tabular-nums', textAlign: 'center', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <span style={{ fontFamily: SPORT, fontWeight: 900, color: '#fff', fontSize: 15 }}>#{selectedPlayerData.pdcRanking}</span>
                  <span style={{ color: 'rgba(255,255,255,0.35)', margin: '0 7px' }}>·</span>
                  {dict.tipp.step.avgLabel} <span style={{ fontFamily: SPORT, fontWeight: 900, color: '#fff', fontSize: 15 }}>{formatAvg(stats?.avg, locale)}</span>
                  {stats?.bestAchievement && (
                    <>
                      <span style={{ color: 'rgba(255,255,255,0.35)', margin: '0 7px' }}>·</span>
                      {translateBestAchievement(dict.players, selectedPlayerData.name, stats.bestAchievement)}
                    </>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setPanelOpen(true)}
                  className="btn-hover"
                  style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: '#fff', background: 'rgba(255,255,255,0.08)', border: `1px solid ${color}88`, borderRadius: 999, padding: '7px 14px', cursor: 'pointer', flexShrink: 0 }}
                >
                  {dict.tipp.step.details}
                </button>
              </div>
              <PlayerDetailPanel
                player={selectedPlayerData}
                color={color}
                open={panelOpen}
                onClose={() => setPanelOpen(false)}
                onNext={() => { setPanelOpen(false); goNext() }}
                nextLabel={step < POT_COUNT ? dict.tipp.step.next : dict.tipp.step.seeSummary}
                potNumber={pot.potNumber}
              />
            </>
          )
        })()}
        </div>
      </div>

      {/* Neste-knapp */}
      <button
        disabled={!selectedPlayer}
        onClick={goNext}
        className={selectedPlayer ? 'btn-hover' : undefined}
        style={{
          display: 'block', width: '100%', padding: '13px',
          background: selectedPlayer ? 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)' : 'transparent',
          color: selectedPlayer ? '#fff' : 'rgba(255,255,255,0.5)',
          // Deaktivert = tydelig «tom» tilstand (stiplet ramme), ikke en mørk
          // variant av den aktive knappen
          border: selectedPlayer ? '1px solid transparent' : '1px dashed rgba(255,255,255,0.3)',
          borderRadius: 12, fontSize: 15, fontWeight: 800,
          cursor: selectedPlayer ? 'pointer' : 'not-allowed',
          fontFamily: SPORT, letterSpacing: '0.06em', textTransform: 'uppercase' as const,
          marginBottom: 6,
          boxShadow: selectedPlayer ? '0 4px 20px rgba(220,38,38,0.35)' : 'none',
          transition: 'background 0.2s, box-shadow 0.2s, filter 0.12s, border-color 0.2s',
        }}
      >
        {!selectedPlayer ? dict.tipp.step.choosePlayer : step < POT_COUNT ? dict.tipp.step.next : dict.tipp.step.seeSummary}
      </button>
      <button
        onClick={() => setStep(step === 1 ? 0 : step - 1)}
        className="btn-hover"
        style={{ display: 'block', width: '100%', padding: '9px', background: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
      >
        {dict.tipp.step.back}
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
