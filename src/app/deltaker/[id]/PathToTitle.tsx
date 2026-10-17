'use client'

import { useEffect, useRef } from 'react'
import { STAGE_ORDER } from '@/config/scoring'
import { useLocale } from '@/lib/i18n/useLocale'

const GREEN = '#4ade80'
const GOLD = '#fbbf24'
const RED = '#f87171'
const STEP_X = 54
const STEP_Y = 28
const X0 = 24
const Y0 = 180
const NODES = STAGE_ORDER.length + 1 // rundene + «Mester»
// Hver node er ett vannrett og ett loddrett trinn unna forrige.
const SEG = STEP_X + STEP_Y

const PATH = Array.from({ length: NODES }, (_, i) =>
  i === 0 ? `M${X0} ${Y0}` : `H${X0 + STEP_X * i} V${Y0 - STEP_Y * i}`,
).join(' ')

/**
 * Trappa fra gruppespill til tittel for én spiller. `level` er «nivået» fra
 * src/lib/prize.ts (0 = ikke spilt, 1 = gruppespill … 6 = vant finalen).
 * Linja tegner seg opp til nivået når raden åpnes; ved «reduser bevegelse»
 * står den ferdig tegnet.
 */
export default function PathToTitle({ name, level, eliminated }: { name: string; level: number; eliminated: boolean }) {
  const { dict } = useLocale()
  const trackRef = useRef<SVGPathElement>(null)
  const progRef = useRef<SVGPathElement>(null)
  const markerRef = useRef<SVGCircleElement>(null)
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([])

  const labels = [...STAGE_ORDER.map((s) => dict.deltaker.playerDetailPanel.shortStage[s]), dict.common.rankList.champion]
  const reached = Math.max(0, Math.min(NODES, level)) // antall noder nådd
  const champion = level > STAGE_ORDER.length
  const target = Math.max(0, reached - 1) * SEG
  const total = (NODES - 1) * SEG

  useEffect(() => {
    const track = trackRef.current
    const prog = progRef.current
    const marker = markerRef.current
    if (!track || !prog || !marker) return

    const paint = (len: number) => {
      prog.style.strokeDashoffset = String(total - len)
      const p = track.getPointAtLength(Math.min(total, len))
      marker.setAttribute('cx', String(p.x))
      marker.setAttribute('cy', String(p.y))
      nodeRefs.current.forEach((n, i) => n?.classList.toggle('ptt-on', reached > 0 && len >= SEG * i - 0.5))
    }

    const instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches || reached === 0
    if (instant) {
      paint(target)
      return
    }
    paint(0)
    const dur = 600 + target * 4
    const t0 = performance.now()
    let raf = requestAnimationFrame(function loop(now) {
      const t = Math.min(1, (now - t0) / dur)
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      paint(target * e)
      if (t < 1) raf = requestAnimationFrame(loop)
    })
    return () => cancelAnimationFrame(raf)
  }, [target, total, reached])

  const endIdx = reached - 1
  const endColor = champion ? GOLD : eliminated ? RED : GREEN
  const status = reached > 0 ? labels[endIdx] : dict.deltaker.myTeam.notPlayedYet

  return (
    <div style={{ marginBottom: 12 }}>
      <style>{`
        .ptt-node { fill: #0e131d; stroke: rgba(255,255,255,0.35); stroke-width: 2.5; transition: fill .2s, stroke .2s; }
        .ptt-node.ptt-on { fill: ${GREEN}; stroke: ${GREEN}; }
        @keyframes ptt-pulse { 0% { r: 8; opacity: .9 } 100% { r: 20; opacity: 0 } }
        .ptt-ring { fill: none; stroke-width: 2; animation: ptt-pulse 1.8s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) { .ptt-ring { animation: none; opacity: .5; r: 13px; } }
      `}</style>
      <svg viewBox="0 6 320 186" width="100%" role="img" aria-label={`${name}: ${status}`} style={{ display: 'block', maxHeight: 230 }}>
        <path ref={trackRef} d={PATH} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={4} strokeLinejoin="round" />
        <path ref={progRef} d={PATH} fill="none" stroke={endColor} strokeWidth={4} strokeLinejoin="round" strokeDasharray={total} strokeDashoffset={total} />
        {labels.map((label, i) => {
          const cx = X0 + STEP_X * i
          const cy = Y0 - STEP_Y * i
          const isEnd = i === endIdx
          return (
            <g key={label}>
              {isEnd && <circle className="ptt-ring" cx={cx} cy={cy} r={8} stroke={endColor} />}
              <circle
                ref={(el) => { nodeRefs.current[i] = el }}
                className="ptt-node"
                cx={cx}
                cy={cy}
                r={8}
                style={isEnd && (champion || eliminated) ? { fill: endColor, stroke: endColor } : undefined}
              />
              <text x={cx} y={cy - 15} textAnchor="middle" fontSize={11} fontWeight={isEnd ? 800 : 500} fill={isEnd ? '#fff' : 'rgba(255,255,255,0.7)'}>
                {label}
              </text>
            </g>
          )
        })}
        {reached > 0 && <circle ref={markerRef} r={5} fill="#fff" />}
      </svg>
    </div>
  )
}
