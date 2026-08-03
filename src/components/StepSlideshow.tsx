'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { POTS } from '@/data/pots'

const POT_COLORS = [
  '#d97706', '#2563eb', '#16a34a', '#ea580c',
  '#7c3aed', '#0891b2', '#dc2626', '#db2777',
]

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

interface Props {
  onStart?: () => void
  onCtaReady?: () => void
  onSlide?: (slide: number) => void
  ctaHref?: string
  ctaLabel?: string
}

export default function StepSlideshow({ onStart, onCtaReady, onSlide, ctaHref = '/tipp', ctaLabel = 'VELG LAG →' }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const outerContainerRef = useRef<HTMLDivElement>(null)
  const frSlotRef = useRef<HTMLSpanElement>(null)
  const ptSlotRef = useRef<HTMLSpanElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [enterKey, setEnterKey] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [frDest, setFrDest] = useState({ left: 72, top: 258 })
  const [ptDest, setPtDest] = useState({ left: 91, top: 258 })
  const N = 4

  // Start animations only when section scrolls into view
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.25 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Sync dots with native scroll position
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function onScroll() {
      const step = el!.offsetWidth - 48 + 12
      const idx = Math.round(el!.scrollLeft / step)
      const newSlide = Math.max(0, Math.min(N - 1, idx))
      setCurrentSlide(newSlide)
      onSlide?.(newSlide)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Trigger entrance-animasjon ved slide-skifte
  useEffect(() => { setEnterKey(k => k + 1) }, [currentSlide])
  useEffect(() => { setIsExiting(false) }, [currentSlide])

  function scrollToSlide(i: number) {
    const el = scrollRef.current
    if (!el) return
    const step = el.offsetWidth - 48 + 12
    el.scrollTo({ left: i * step, behavior: 'smooth' })
  }

  const FIXED_PICKS = [
    { flag: '🇫🇷', name: 'Frankrike',   iso2: 'fr' },
    { flag: '🇵🇹', name: 'Portugal',    iso2: 'pt' },
    { flag: '🇳🇴', name: 'Norge',       iso2: 'no' },
    { flag: '🇲🇦', name: 'Marokko',     iso2: 'ma' },
    { flag: '🇹🇷', name: 'Tyrkia',      iso2: 'tr' },
    { flag: '🇩🇿', name: 'Algerie',     iso2: 'dz' },
    { flag: '🇳🇿', name: 'New Zealand', iso2: 'nz' },
    { flag: '🇿🇦', name: 'Sør-Afrika',  iso2: 'za' },
  ]

  const [velgPhase, setVelgPhase] = useState(0)
  useEffect(() => {
    if (currentSlide !== 0 || !isVisible) { setVelgPhase(0); return }
    if (velgPhase >= 19) {
      const t = setTimeout(() => setVelgPhase(0), 2200)
      return () => clearTimeout(t)
    }
    // 0→1 text, 1→2 float, 2→3 grid visible (2s), 3→4 row0 frame,
    // 4→5 FR glow, 5→6 FR flies, 6→7 FR lands/defocus,
    // 7→8 row1 frame, 8→9 PT glow, 9→10 PT flies, 10→11 PT lands/defocus,
    // 11-17 fast picks rows 2-7, 18→done mine lag centers
    const delays = [500, 1200, 800, 1200, 350, 700, 700, 600, 350, 700, 700, 600, 320, 280, 240, 200, 170, 220, 800]
    const t = setTimeout(() => setVelgPhase(p => p + 1), delays[velgPhase] ?? 200)
    return () => clearTimeout(t)
  }, [currentSlide, velgPhase, isVisible])

  // Trigger CSS transition on overlay mount (30ms after fly phase starts)
  const [frFlyActive, setFrFlyActive] = useState(false)
  const [ptFlyActive, setPtFlyActive] = useState(false)
  const frFlying_derived = currentSlide === 0 && velgPhase === 6
  const ptFlying_derived = currentSlide === 0 && velgPhase === 10
  useEffect(() => {
    if (!frFlying_derived) { setFrFlyActive(false); return }
    const t = setTimeout(() => {
      const oc = outerContainerRef.current
      const slot = frSlotRef.current
      if (oc && slot) {
        const ocr = oc.getBoundingClientRect()
        const sr = slot.getBoundingClientRect()
        setFrDest({ left: sr.left - ocr.left + sr.width / 2, top: sr.top - ocr.top + sr.height / 2 })
      }
      setFrFlyActive(true)
    }, 30)
    return () => clearTimeout(t)
  }, [frFlying_derived])
  useEffect(() => {
    if (!ptFlying_derived) { setPtFlyActive(false); return }
    const t = setTimeout(() => {
      const oc = outerContainerRef.current
      const slot = ptSlotRef.current
      if (oc && slot) {
        const ocr = oc.getBoundingClientRect()
        const sr = slot.getBoundingClientRect()
        setPtDest({ left: sr.left - ocr.left + sr.width / 2, top: sr.top - ocr.top + sr.height / 2 })
      }
      setPtFlyActive(true)
    }, 30)
    return () => clearTimeout(t)
  }, [ptFlying_derived])

  const [scorePhase, setScorePhase] = useState(0)
  useEffect(() => {
    if (currentSlide !== 1 || !isVisible) { setScorePhase(0); return }
    const delays = [600, 1200, 700, 700, 900, 800, 800, 800, 1600, 5000]
    const t = setTimeout(() => setScorePhase(p => p >= 9 ? 0 : p + 1), delays[scorePhase] ?? 800)
    return () => clearTimeout(t)
  }, [currentSlide, scorePhase, isVisible])

  const [totalCount, setTotalCount] = useState(0)
  useEffect(() => {
    if (scorePhase < 8) { setTotalCount(0); return }
    if (scorePhase > 8) return
    const timers = [
      setTimeout(() => setTotalCount(3), 250),
      setTimeout(() => setTotalCount(5), 480),
    ]
    return () => timers.forEach(clearTimeout)
  }, [scorePhase])

  const [underdogPhase, setUnderdogPhase] = useState(0)
  useEffect(() => {
    if (currentSlide !== -1) { setUnderdogPhase(0); return }
    const delays = [600, 800, 900, 800, 800, 800, 700, 5000]
    const t = setTimeout(() => setUnderdogPhase(p => p >= 7 ? 0 : p + 1), delays[underdogPhase] ?? 800)
    return () => clearTimeout(t)
  }, [currentSlide, underdogPhase])

  const [advPhase, setAdvPhase] = useState(0)
  useEffect(() => {
    if (currentSlide !== -1) { setAdvPhase(0); return }
    const delays = [800, 1000, 900, 1000, 4500]
    const t = setTimeout(() => setAdvPhase(p => p >= 4 ? 0 : p + 1), delays[advPhase] ?? 800)
    return () => clearTimeout(t)
  }, [currentSlide, advPhase])

  const [minSidePhase, setMinSidePhase] = useState(0)
  useEffect(() => {
    if (currentSlide !== 2 || !isVisible) { setMinSidePhase(0); return }
    const delays = [300, 900, 1000, 900, 600, 600, 1000, 1100, 5000]
    const t = setTimeout(() => setMinSidePhase(p => p >= 9 ? 0 : p + 1), delays[minSidePhase] ?? 800)
    return () => clearTimeout(t)
  }, [currentSlide, minSidePhase, isVisible])

  // Auto-advance — kun når animasjonen på gjeldende slide er ferdig
  useEffect(() => {
    if (!isVisible || currentSlide !== 0 || velgPhase < 18) return
    const t1 = setTimeout(() => setIsExiting(true), 2950)
    const t2 = setTimeout(() => scrollToSlide(1), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [currentSlide, velgPhase, isVisible])

  useEffect(() => {
    if (!isVisible || currentSlide !== 1 || scorePhase < 9) return
    const t1 = setTimeout(() => setIsExiting(true), 2950)
    const t2 = setTimeout(() => scrollToSlide(2), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [currentSlide, scorePhase, isVisible])

  useEffect(() => {
    if (!isVisible || currentSlide !== 2 || minSidePhase < 8) return
    const t1 = setTimeout(() => setIsExiting(true), 2950)
    const t2 = setTimeout(() => scrollToSlide(3), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [currentSlide, minSidePhase, isVisible])

  const [ctaPhase, setCtaPhase] = useState(0)
  useEffect(() => {
    if (currentSlide !== 3 || !isVisible) { setCtaPhase(0); return }
    const delays = [250, 180, 180, 180, 180, 650, 500]
    const t = setTimeout(() => setCtaPhase(p => p >= 6 ? 6 : p + 1), delays[ctaPhase] ?? 200)
    return () => clearTimeout(t)
  }, [currentSlide, ctaPhase, isVisible])

  useEffect(() => {
    if (currentSlide === 3 && ctaPhase >= 6) onCtaReady?.()
  }, [currentSlide, ctaPhase])

  const [editPhase, setEditPhase] = useState(0)
  useEffect(() => {
    if (currentSlide !== -1) { setEditPhase(0); return }
    const delays = [900, 800, 3500]
    const t = setTimeout(() => setEditPhase(p => p >= 2 ? 0 : p + 1), delays[editPhase] ?? 800)
    return () => clearTimeout(t)
  }, [currentSlide, editPhase])

  const slides = [
    /* ── SLIDE 0: Velg 8 lag ── */
    {
      accent: '#dc2626',
      title: '',
      visual: (() => {
        const showText    = velgPhase >= 1
        const textFloated = velgPhase >= 2
        const potsVisible = velgPhase >= 3
        const centered    = velgPhase >= 18

        // Row highlighted: phases 4-7 → row 0, phases 8-11 → row 1
        const highlightRow = velgPhase >= 4 && velgPhase < 8 ? 0
          : velgPhase >= 8 && velgPhase < 12 ? 1
          : -1

        // frGlow: overlay big+glowing at row (grid cell hidden)
        // frFlying: overlay flies to Mine lag (grid cell shows again = "copy stays")
        const frGlow   = velgPhase === 5
        const frFlying = velgPhase === 6
        const ptGlow   = velgPhase === 9
        const ptFlying = velgPhase === 10

        // landPulse: Mine lag pulses when flag just arrived
        const landPulse = velgPhase === 7 || velgPhase === 11

        // FR shows in Mine lag from phase 7 (after landing), PT from phase 11
        const pickedCount = velgPhase < 7 ? 0
          : velgPhase < 11 ? 1
          : velgPhase < 12 ? 2
          : Math.min(8, velgPhase - 9)

        // During rapid-fire (phases 12-17), which row just got picked (potIdx 2-7)
        const rapidGlowRow = velgPhase >= 12 && velgPhase <= 17 ? velgPhase - 10 : -1

        return (
          <div style={{ width: '100%' }}>
          <div ref={outerContainerRef} style={{ width: '100%', height: 295, position: 'relative' }}>
            {/* Title text */}
            <div style={{
              position: 'absolute', left: 0, right: 0, textAlign: 'center',
              top: 0,
              opacity: centered ? 0 : 1,
              transform: textFloated ? 'translateY(0)' : showText ? 'translateY(117px)' : 'translateY(124px)',
              transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.45s ease',
            }}>
              <div style={{ opacity: showText ? 1 : 0, transition: 'opacity 0.5s ease' }}>
                <div style={{ fontFamily: SPORT, fontSize: 32, fontWeight: 900, textTransform: 'uppercase', color: '#fff', lineHeight: 1.0, letterSpacing: '-0.5px' }}>
                  Velg ett lag
                </div>
              </div>
              <div style={{ opacity: showText ? 1 : 0, transition: 'opacity 0.5s ease 0.12s', marginTop: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                  fra hvert av 8 seedingnivåer
                </div>
              </div>
            </div>

            {/* Grid rows */}
            <div style={{
              position: 'absolute', left: 0, right: 0, top: 66,
              display: 'flex', flexDirection: 'column', gap: 2,
              filter: centered ? 'blur(2px)' : 'none',
              transition: 'filter 0.55s ease',
            }}>
              {POTS.map((pot, potIdx) => {
                const isPicked = pickedCount > potIdx
                const isHighlighted = highlightRow === potIdx
                const color = POT_COLORS[potIdx]
                const selectedTeamIdx = pot.teams.findIndex(t => t.name === FIXED_PICKS[potIdx].name)
                const rowDimmed = highlightRow !== -1 && !isHighlighted && !isPicked

                return (
                  <div key={potIdx} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    opacity: potsVisible ? 1 : 0,
                    transform: !potsVisible ? 'translateY(-8px)' : 'scale(1)',
                    borderRadius: 5,
                    background: isHighlighted ? 'rgba(255,255,255,0.05)' : 'transparent',
                    boxShadow: isHighlighted
                      ? '0 0 0 1.5px rgba(255,255,255,0.22), 0 2px 12px rgba(0,0,0,0.4)'
                      : '0 0 0 1.5px transparent',
                    transition: (velgPhase >= 3 && velgPhase < 12)
                      ? `opacity 0.35s ease ${potIdx * 55}ms, transform 0.35s cubic-bezier(0.34,1.3,0.64,1) ${potIdx * 55}ms, box-shadow 0.3s ease, background 0.3s ease`
                      : 'opacity 0.2s ease, transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease',
                  }}>
                    <div style={{
                      width: 30, flexShrink: 0, fontSize: 11, fontWeight: 800,
                      fontFamily: SPORT, textAlign: 'right' as const,
                      color: POT_COLORS[potIdx],
                      opacity: isPicked ? 1 : isHighlighted ? 1 : rowDimmed ? 0.08 : 0.2,
                      transition: velgPhase >= 12 ? 'opacity 0.2s' : 'opacity 0.4s',
                    }}>{potIdx + 1}</div>
                    {Array.from({ length: pot.teams.length }, (_, teamIdx) => {
                      const team = pot.teams[teamIdx]
                      const isSelected = isPicked && teamIdx === selectedTeamIdx
                      // Cell glows in place during glow phase (no hiding, no gap)
                      const isCellGlowing = (frGlow && potIdx === 0 && teamIdx === selectedTeamIdx)
                        || (ptGlow && potIdx === 1 && teamIdx === selectedTeamIdx)
                      const isRapidGlowing = rapidGlowRow === potIdx && teamIdx === selectedTeamIdx

                      return (
                        <div key={teamIdx} style={{
                          flex: 1, height: 20, borderRadius: 4,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          position: 'relative',
                          zIndex: isCellGlowing ? 10 : 1,
                          background: team ? (isSelected ? `${color}22` : isHighlighted ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)') : 'transparent',
                          border: isSelected ? `1.5px solid ${color}60` : '1.5px solid transparent',
                          fontSize: 12,
                          transform: isCellGlowing ? 'scale(2.2)' : isRapidGlowing ? 'scale(1.5)' : 'scale(1)',
                          filter: isCellGlowing ? 'drop-shadow(0 0 6px rgba(255,255,255,0.85))' : isRapidGlowing ? 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' : 'none',
                          opacity: team ? (
                            isPicked ? (isSelected ? 1 : 0.15)
                            : isHighlighted ? (teamIdx === selectedTeamIdx ? 1 : 0.25)
                            : rowDimmed ? 0.08 : 0.35
                          ) : 0,
                          transition: isCellGlowing
                            ? 'transform 0.35s cubic-bezier(0.34,1.4,0.64,1), filter 0.3s ease, opacity 0.3s ease, background 0.2s ease, border 0.2s ease'
                            : isRapidGlowing
                              ? 'transform 0.18s cubic-bezier(0.34,1.4,0.64,1), filter 0.18s ease, opacity 0.15s ease, background 0.15s ease, border 0.15s ease'
                              : 'all 0.35s ease',
                        }}>
                          {team
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={`https://flagcdn.com/20x15/${team.iso2}.png`} width="16" height="12" alt="" style={{ display: 'block', margin: 'auto', borderRadius: 1 }} />
                            : null}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* Frankrike: fly from cell position, land and stay at Mine lag slot 0 */}
            {frFlying && (
              <div style={{
                position: 'absolute',
                left: `${frFlyActive ? frDest.left : 48}px`,
                top: frFlyActive ? frDest.top : 76,
                transform: `translate(-50%, -50%) scale(${frFlyActive ? 1 : 2.0})`,
                opacity: 1,
                pointerEvents: 'none',
                zIndex: 10,
                transition: frFlyActive
                  ? 'left 0.55s cubic-bezier(0.25,0.46,0.45,0.94), top 0.55s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)'
                  : 'none',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://flagcdn.com/20x15/fr.png" width="20" height="15" alt="" style={{ display: 'block' }} />
              </div>
            )}

            {/* Portugal: fly from cell position, land and stay at Mine lag slot 1 */}
            {ptFlying && (
              <div style={{
                position: 'absolute',
                left: `${ptFlyActive ? ptDest.left : 80}px`,
                top: ptFlyActive ? ptDest.top : 98,
                transform: `translate(-50%, -50%) scale(${ptFlyActive ? 1 : 2.0})`,
                opacity: 1,
                pointerEvents: 'none',
                zIndex: 10,
                transition: ptFlyActive
                  ? 'left 0.55s cubic-bezier(0.25,0.46,0.45,0.94), top 0.55s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)'
                  : 'none',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://flagcdn.com/20x15/pt.png" width="20" height="15" alt="" style={{ display: 'block' }} />
              </div>
            )}

            {/* Mine lag */}
            <div style={{
              position: 'absolute', left: 0, right: 0,
              top: 250,
              borderRadius: 10,
              background: centered ? 'rgba(14,14,14,0.92)' : pickedCount > 0 ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.05)',
              border: centered ? '1px solid rgba(255,255,255,0.5)' : pickedCount > 0 ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.09)',
              padding: centered ? '12px 14px' : '8px 10px',
              display: 'flex', alignItems: 'center', gap: 4, minHeight: 38,
              boxShadow: centered ? '0 6px 48px rgba(251,191,36,0.5)' : landPulse ? '0 2px 16px rgba(255,255,255,0.14)' : pickedCount > 0 ? '0 2px 12px rgba(255,255,255,0.06)' : 'none',
              opacity: potsVisible ? 1 : 0,
              transform: centered ? 'translateY(-132px)' : landPulse ? 'scale(1.05)' : 'scale(1)',
              transformOrigin: 'center',
              transition: 'transform 0.65s cubic-bezier(0.34,1.5,0.64,1), opacity 0.3s ease, box-shadow 0.5s ease, background 0.4s, border 0.4s, padding 0.4s',
            }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: pickedCount > 0 ? '#fff' : 'rgba(255,255,255,0.25)', marginRight: 4, flexShrink: 0, transition: 'color 0.4s' }}>Mine lag</span>
              <div style={{ display: 'flex', gap: 2, flex: 1, minWidth: 0, overflow: 'hidden', position: 'relative' }}>
                {FIXED_PICKS.map((pick, i) => {
                  const justPopped = velgPhase >= 12 && velgPhase <= 17 && i === velgPhase - 10
                  const isSlotTarget = (i === 0 && (frGlow || velgPhase === 6)) || (i === 1 && (ptGlow || velgPhase === 10))
                  return (
                    <span
                      key={pick.name}
                      ref={i === 0 ? frSlotRef : i === 1 ? ptSlotRef : null}
                      style={{ lineHeight: 1, flexShrink: 0, display: 'inline-block', opacity: i < pickedCount ? 1 : isSlotTarget ? 0.3 : 0, filter: isSlotTarget && !(i < pickedCount) ? 'drop-shadow(0 0 6px rgba(255,255,255,0.7))' : undefined, animation: justPopped ? 'flag-pop 0.38s cubic-bezier(0.34,1.5,0.64,1) forwards' : undefined, transition: 'opacity 0.2s ease, filter 0.2s ease' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://flagcdn.com/20x15/${pick.iso2}.png`} width="20" height="15" alt="" style={{ display: 'block', borderRadius: 1 }} />
                    </span>
                  )
                })}
                {pickedCount === 0 && (
                  <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: 'rgba(255,255,255,0.15)', pointerEvents: 'none' }}>Samles her…</span>
                )}
              </div>
            </div>
          </div>
          </div>
        )
      })(),
    },
    /* ── SLIDE 1: Scoring ── */
    {
      accent: '#3b82f6',
      title: '',
      visual: (() => {
        const showText      = scorePhase >= 1
        const showHighlight = scorePhase >= 2
        const frZoomed      = scorePhase >= 2 && scorePhase < 4
        const floated       = scorePhase >= 3
        const showMatch     = scorePhase >= 4
        const showScore     = scorePhase >= 5
        const showSeier     = scorePhase >= 6
        const showScoring   = scorePhase >= 7
        const showTotal     = scorePhase >= 8
        return (
          <div style={{ width: '100%', height: 335, position: 'relative' }}>
            <div style={{
              position: 'absolute', left: 0, right: 0,
              top: floated ? 68 : '50%',
              transform: floated ? 'translateY(0)' : 'translateY(-50%)',
              transition: 'top 0.55s cubic-bezier(0.4,0,0.2,1), transform 0.55s cubic-bezier(0.4,0,0.2,1)',
            }}>
              <div style={{
                position: 'absolute', bottom: '100%', left: 0, right: 0,
                paddingBottom: 8, textAlign: 'center',
                opacity: showText ? 1 : 0, transition: 'opacity 0.5s ease',
              }}>
                <div style={{ fontFamily: SPORT, fontSize: 28, fontWeight: 900, textTransform: 'uppercase', color: '#fff', lineHeight: 1.05, letterSpacing: '-0.5px' }}>
                  Du samler poeng
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4, letterSpacing: '0.02em', marginTop: 8 }}>
                  når lagene dine spiller
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '7px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginRight: 5, flexShrink: 0 }}>Mine lag</span>
                <div style={{ display: 'flex', gap: 2, flex: 1, minWidth: 0 }}>
                  {FIXED_PICKS.map((pick, i) => (
                    <span key={i} style={{
                      opacity: showHighlight ? (i === 0 ? 1 : 0.15) : 0.6,
                      transform: frZoomed && i === 0 ? 'scale(2.2)' : 'scale(1)',
                      transformOrigin: 'center', display: 'inline-block', transition: 'all 0.45s cubic-bezier(0.34,1.4,0.64,1)',
                      filter: frZoomed && i === 0 ? 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' : 'none',
                      position: 'relative', zIndex: frZoomed && i === 0 ? 2 : 1,
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://flagcdn.com/20x15/${pick.iso2}.png`} width="16" height="12" alt="" style={{ display: 'block', borderRadius: 1 }} />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              position: 'absolute', left: 0, right: 0, top: 116,
              opacity: showMatch ? 1 : 0, transform: showMatch ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.94)', transition: 'opacity 0.45s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1)',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 14px 4px' }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>Gruppespill</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, padding: '4px 14px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://flagcdn.com/24x18/fr.png" width="24" height="18" alt="" style={{ borderRadius: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Frankrike</span>
                </div>
                <div style={{
                  fontFamily: SPORT, fontSize: 28, fontWeight: 900, letterSpacing: '-1px', textAlign: 'center', lineHeight: 1,
                  color: showScore ? '#fff' : 'rgba(255,255,255,0.25)',
                  transform: showScore ? 'scale(1)' : 'scale(0.65)',
                  transition: showScore ? 'transform 0.45s cubic-bezier(0.34,1.6,0.64,1), color 0.25s ease' : 'none',
                }}>{showScore ? '2–0' : '–'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.35)', textAlign: 'right' }}>Senegal</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://flagcdn.com/20x15/sn.png" width="20" height="15" alt="" style={{ borderRadius: 1, flexShrink: 0 }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', opacity: showSeier ? 1 : 0, transform: showSeier ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)', transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}>Seier gruppespill</span>
                <span style={{ fontFamily: SPORT, fontSize: 20, fontWeight: 900, color: '#fff', lineHeight: 1, animation: showSeier ? 'score-flash 0.55s ease 0.1s both' : undefined }}>+3p</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', opacity: showScoring ? 1 : 0, transform: showScoring ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)', transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1) 0.08s' }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}>2 mål</span>
                <span style={{ fontFamily: SPORT, fontSize: 20, fontWeight: 900, color: '#fff', lineHeight: 1, animation: showScoring ? 'score-flash 0.55s ease 0.2s both' : undefined }}>+2p</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderTop: '1px solid rgba(251,191,36,0.2)', opacity: showTotal ? 1 : 0, transform: showTotal ? 'translateY(0)' : 'translateY(10px) scale(0.95)', transition: 'opacity 0.35s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.12s' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Totalt</span>
                <span style={{
                  fontFamily: SPORT, fontSize: 26, fontWeight: 900, color: '#fbbf24', letterSpacing: '-0.5px', lineHeight: 1,
                  display: 'inline-block',
                  transform: showTotal ? 'scale(1)' : 'scale(0.5)',
                  transition: showTotal ? 'transform 0.55s cubic-bezier(0.34,1.8,0.64,1)' : 'none',
                }}>{totalCount} poeng</span>
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', opacity: scorePhase >= 9 ? 1 : 0, transition: 'opacity 0.6s ease', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)' }}>sveip <span className="bounce-arrow-right">›</span></div>
          </div>
        )
      })(),
    },
    /* ── SLIDE 2: Min side ── */
    {
      accent: '#22c55e',
      title: '',
      visual: (() => {
        const showTitle  = minSidePhase >= 1
        const showCard   = minSidePhase >= 2
        const showEdit   = minSidePhase >= 3
        const zoomPt     = minSidePhase >= 4
        const exitDown   = minSidePhase >= 5
        const swapPt     = minSidePhase >= 6
        const showTitle2 = minSidePhase >= 7
        const showLeague = minSidePhase >= 8

        const EDIT_IDX = 1

        const LEAGUE = [
          { pos: 1, name: 'Sara Olsen',   pts: '0p', gold: true },
          { pos: 2, name: 'Ola Nordmann', pts: '0p', me: true   },
          { pos: 3, name: 'Lars Berg',    pts: '0p'              },
        ]

        return (
          <div style={{ width: '100%' }}>

            <div style={{ opacity: showTitle ? 1 : 0, transform: showTitle ? 'translateY(0)' : 'translateY(8px)', transition: 'all 0.45s ease', marginBottom: 14 }}>
              <div style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, textTransform: 'uppercase', color: '#fff', lineHeight: 1.0, letterSpacing: '-0.5px' }}>Hold oversikt – <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 700 }}>«min side»</span></div>
            </div>

            <div style={{ opacity: showCard ? 1 : 0, transform: showCard ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.45s ease', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Ola Nordmann</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>0p</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 3, overflow: 'visible' }}>
                {FIXED_PICKS.map((pick, i) => {
                  if (i === EDIT_IDX) {
                    return (
                      <span key={i} style={{ position: 'relative', display: 'inline-block', width: 20, height: 20 }}>
                        <span style={{
                          position: 'absolute', top: 0, left: 0, lineHeight: 1, display: 'inline-block',
                          opacity: swapPt ? 0 : exitDown ? 0.75 : 1,
                          transform: swapPt
                            ? 'translateX(44px) translateY(22px) rotate(22deg)'
                            : exitDown ? 'translateY(22px) rotate(5deg)'
                            : zoomPt ? 'scale(2.1)' : 'scale(1)',
                          transformOrigin: 'center',
                          filter: zoomPt && !exitDown ? 'drop-shadow(0 0 8px rgba(255,255,255,0.85))' : 'none',
                          transition: swapPt
                            ? 'transform 0.5s ease-in, opacity 0.45s ease-in, filter 0.2s ease'
                            : exitDown
                              ? 'all 0.4s ease-in'
                              : 'transform 0.5s cubic-bezier(0.34,1.4,0.64,1), opacity 0.3s ease, filter 0.4s ease',
                          zIndex: 2,
                        }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="https://flagcdn.com/20x15/pt.png" width="20" height="15" alt="" style={{ display: 'block', borderRadius: 1 }} />
                        </span>
                        <span style={{
                          position: 'absolute', top: 0, left: 0, lineHeight: 1, display: 'inline-block',
                          opacity: swapPt ? 1 : 0,
                          transform: swapPt ? 'translateY(0) scale(1)' : 'translateY(-18px) scale(0.8)',
                          transition: 'transform 0.55s cubic-bezier(0.34,1.7,0.64,1), opacity 0.45s ease',
                        }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="https://flagcdn.com/20x15/ar.png" width="20" height="15" alt="" style={{ display: 'block', borderRadius: 1 }} />
                        </span>
                      </span>
                    )
                  }
                  return (
                    <span key={i} style={{
                      lineHeight: 1, display: 'inline-block',
                      opacity: zoomPt ? 0.15 : 1,
                      transition: 'opacity 0.45s ease',
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://flagcdn.com/20x15/${pick.iso2}.png`} width="20" height="15" alt="" style={{ display: 'block', borderRadius: 1 }} />
                    </span>
                  )
                })}
              </div>
            </div>

            <div style={{ opacity: showEdit ? 1 : 0, transform: showEdit ? 'translateY(0)' : 'translateY(4px)', transition: 'all 0.4s ease', marginBottom: 28 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>Endre valg frem til VM-start ✏️</span>
            </div>

            <div style={{ opacity: showTitle2 ? 1 : 0, transform: showTitle2 ? 'translateY(0)' : 'translateY(8px)', transition: 'all 0.45s ease', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                Opprett egne ligaer
              </div>
            </div>

            <div style={{ opacity: showLeague ? 1 : 0, transition: 'opacity 0.25s ease', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ padding: '7px 12px 6px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>Jobben 2026</span>
              </div>
              {LEAGUE.map((row, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  borderBottom: i < LEAGUE.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  background: row.me ? 'rgba(34,197,94,0.08)' : 'transparent',
                  opacity: showLeague ? 1 : 0,
                  transform: showLeague ? 'translateY(0)' : 'translateY(6px)',
                  transition: `opacity 0.35s ease ${i * 80}ms, transform 0.35s ease ${i * 80}ms`,
                }}>
                  <span style={{ fontFamily: SPORT, fontSize: 13, fontWeight: 900, color: row.gold ? '#fbbf24' : row.me ? '#9ca3af' : 'rgba(255,255,255,0.25)', width: 14, flexShrink: 0 }}>{row.pos}</span>
                  <span style={{ fontSize: 11, fontWeight: row.me ? 700 : 500, flex: 1, color: row.me ? '#fff' : 'rgba(255,255,255,0.65)' }}>{row.name}</span>
                  <span style={{
                    fontFamily: SPORT, fontSize: 15, fontWeight: 900, color: '#f59e0b',
                    display: 'inline-block',
                    transform: row.me ? (showLeague ? 'scale(1)' : 'scale(0.4)') : undefined,
                    transition: row.me && showLeague ? `transform 0.55s cubic-bezier(0.34,1.8,0.64,1) ${i * 80 + 200}ms` : undefined,
                  }}>{row.pts}</span>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', opacity: showLeague ? 1 : 0, transition: 'opacity 0.8s ease 0.3s', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)' }}>sveip <span className="bounce-arrow-right">›</span></div>

          </div>
        )
      })(),
    },
    /* ── SLIDE 3: KLAR? CTA ── */
    {
      accent: '#dc2626',
      title: '',
      visual: (() => {
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '8px 0 4px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.22em', marginBottom: 10, opacity: ctaPhase >= 1 ? 1 : 0, transition: 'opacity 0.4s ease' }}>VM 2026</div>
            <div style={{ fontFamily: SPORT, fontSize: 80, fontWeight: 900, lineHeight: 0.88, letterSpacing: '-2px', marginBottom: 32 }}>
              {'KLAR?'.split('').map((ch, i) => (
                <span key={i} style={{
                  display: 'inline-block',
                  opacity: ctaPhase >= i + 1 ? 1 : 0,
                  transform: ctaPhase >= i + 1 ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.85)',
                  filter: ctaPhase >= i + 1
                    ? (i === 4 ? 'drop-shadow(0 0 14px rgba(220,38,38,0.75))' : 'blur(0px)')
                    : 'blur(8px)',
                  transition: i === 4
                    ? 'opacity 0.4s ease, transform 0.55s cubic-bezier(0.34,2.0,0.64,1), filter 0.6s ease'
                    : 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.4,0.64,1), filter 0.45s ease',
                  color: i === 4 ? '#dc2626' : '#fff',
                }}>{ch}</span>
              ))}
            </div>
            <div style={{ width: '100%', marginTop: 8, opacity: ctaPhase >= 6 ? 1 : 0, transform: ctaPhase >= 6 ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.45s cubic-bezier(0.34,1.4,0.64,1)' }}>
              {onStart
                ? <button onClick={onStart} className={ctaPhase >= 6 ? 'cta-pulse' : ''} style={{ display: 'block', width: '100%', padding: '16px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontFamily: SPORT, fontSize: 20, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 14, border: 'none', cursor: 'pointer' }}>
                    VELG LAG →
                  </button>
                : <Link href={ctaHref} className={`cta-btn ${ctaPhase >= 6 ? 'cta-pulse' : ''}`} style={{ display: 'block', width: '100%', padding: '16px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontFamily: SPORT, fontSize: 20, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 14, textDecoration: 'none' }}>
                    {ctaLabel}
                  </Link>
              }
            </div>
            <Link href="/vm-info?regler=1" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontWeight: 500, letterSpacing: '0.03em', opacity: ctaPhase >= 6 ? 1 : 0, transition: 'opacity 0.6s ease 0.4s', marginTop: 20 }}>
              Les mer om reglene ↗
            </Link>
          </div>
        )
      })(),
    },
  ]

  return (
    <div ref={sectionRef} style={{ position: 'relative' }}>
      {/* Snåsamannen — fader fritt over boksene */}
      <img src="/snåsamannen.png" alt="" style={{ position: 'absolute', right: -10, top: 0, width: 260, opacity: 0.38, pointerEvents: 'none', zIndex: 0, filter: 'brightness(1.0) saturate(0.7) contrast(1.05)', maskImage: 'radial-gradient(ellipse 62% 42% at 56% 23%, black 0%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 62% 42% at 56% 23%, black 0%, transparent 100%)' }} />
      {/* VM-Spillet brand above slides */}
      <div style={{ position: 'relative', height: 130, marginBottom: -18, pointerEvents: 'none', zIndex: 1 }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.3, paddingTop: 4, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)' }}>
            — Snåsamannen 2026 —
          </div>
          <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: 40, letterSpacing: '-1px', lineHeight: 1 }}>
            <span style={{ color: 'rgba(255,255,255,0.38)' }}>VM-</span>
            <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
          </div>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingLeft: 20,
            WebkitOverflowScrolling: 'touch',
          } as React.CSSProperties}
        >
          {slides.map((s, i) => (
            <div
              key={i}
              style={{
                minWidth: i === N - 1 ? '100%' : 'calc(100% - 52px)',
                marginLeft: i === N - 1 ? -20 : 0,
                flexShrink: 0,
                scrollSnapAlign: 'start',
                background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)',
                borderRadius: 18,
                border: `1px solid ${s.accent}40`,
                padding: '20px 18px 16px',
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.09), inset 0 0 24px ${s.accent}18, 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)`,
              }}
            >
              <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {i === currentSlide ? (
                  <div key={enterKey} style={{ width: '100%', animation: !isExiting ? 'slide-enter 0.22s ease forwards' : undefined, transform: isExiting ? 'translateX(-16px)' : undefined, opacity: isExiting ? 0.3 : undefined, transition: isExiting ? 'transform 0.28s ease-in, opacity 0.28s ease-in' : undefined }}>
                    {s.visual}
                  </div>
                ) : (
                  <div style={{ width: '100%' }}>{s.visual}</div>
                )}
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, marginTop: 14 }}>
                {s.title
                  ? <div style={{ fontFamily: SPORT, fontSize: 16, fontWeight: 900, textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', lineHeight: 1, letterSpacing: '0.04em' }}>{s.title}</div>
                  : <div style={{ height: 16 }} />
                }
              </div>
            </div>
          ))}
          <div style={{ minWidth: 40, flexShrink: 0 }} />
        </div>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 52, background: 'linear-gradient(to right, transparent, #0a0a0a)', pointerEvents: 'none', opacity: currentSlide === N - 1 ? 0 : 1, transition: 'opacity 0.3s ease' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 0' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {slides.map((s, i) => (
            <div
              key={i}
              onClick={() => scrollToSlide(i)}
              className="nav-dot"
              style={{ width: i === currentSlide ? 20 : 6, height: 6, borderRadius: 3, background: i === currentSlide ? `${s.accent}55` : 'rgba(255,255,255,0.12)', cursor: 'pointer', position: 'relative' as const, overflow: 'hidden' }}
            >
              {i === currentSlide && isVisible && (() => {
                const dur = i === 0 ? '10.6s' : i === 1 ? '13.1s' : i === 2 ? '11.4s' : null
                return dur ? (
                  <div
                    key={`prog-${currentSlide}`}
                    style={{ position: 'absolute' as const, inset: 0, background: s.accent, transform: 'translateX(-100%)', animation: `dot-fill ${dur} linear forwards`, borderRadius: 3 }}
                  />
                ) : null
              })()}
            </div>
          ))}
        </div>
        {currentSlide < N - 1 ? (
          <button
            onClick={() => scrollToSlide(currentSlide + 1)}
            className="btn-hover"
            style={{
              fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 8, padding: '5px 12px', cursor: 'pointer', letterSpacing: '0.02em',
            }}
          >
            Neste →
          </button>
        ) : (
          <div style={{ width: 1 }} />
        )}
      </div>
    </div>
  )
}
