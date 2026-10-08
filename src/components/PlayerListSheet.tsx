'use client'

// Bunnark med HELE potten som en liste (navn, snitt, odds) — brukes i tippe-
// flyten for pott 4, der de 5 beste vises som kort og resten ligger her.
// Samme sheet-mønster som PlayerDetailPanel (sveip ned/Escape/klikk utenfor).

import { useEffect, useRef, useState } from 'react'
import Flag from '@/components/Flag'
import type { Player } from '@/data/pots'
import { PLAYER_STATS } from '@/data/playerStats'
import { formatAvg, formatOdds } from '@/lib/format'
import { SPORT } from '@/config/theme'
import { useLocale } from '@/lib/i18n/useLocale'
import { translatePotName } from '@/lib/i18n/translatePlayer'

export default function PlayerListSheet({ players, potNumber, potName, color, selectedName, onSelect, onClose }: {
  players: Player[]
  potNumber: number
  potName: string
  color: string
  selectedName: string | undefined
  onSelect: (name: string) => void
  onClose: () => void
}) {
  const { locale, dict } = useLocale()
  const [dragY, setDragY] = useState(0)
  const dragStart = useRef<number | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  function onTouchStart(e: React.TouchEvent) {
    if (bodyRef.current && bodyRef.current.scrollTop > 0) return
    dragStart.current = e.touches[0].clientY
  }
  function onTouchMove(e: React.TouchEvent) {
    if (dragStart.current == null) return
    const dy = e.touches[0].clientY - dragStart.current
    if (dy > 0) setDragY(dy)
  }
  function onTouchEnd() {
    const dy = dragY
    dragStart.current = null
    setDragY(0)
    if (dy > 90) onClose()
  }

  const title = translatePotName(dict.players, potNumber, potName)

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 250, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'backdrop-in 0.25s ease both' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={dict.tipp.step.list.dialogAriaLabel(title)}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          width: '100%', maxWidth: 480, maxHeight: '86dvh', display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(180deg, #171c28 0%, #0f1219 100%)',
          borderTop: `1px solid ${color}55`, borderLeft: `1px solid ${color}55`, borderRight: `1px solid ${color}55`, borderBottom: 'none',
          borderRadius: '18px 18px 0 0', boxShadow: `0 -12px 40px rgba(0,0,0,0.5), 0 -1px 0 ${color}66`,
          animation: dragY ? 'none' : 'sheet-up 0.32s cubic-bezier(0.22,1,0.36,1) both',
          transform: `translateY(${dragY}px)`, transition: dragY ? 'none' : 'transform 0.25s cubic-bezier(0.22,1,0.36,1)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div style={{ padding: '8px 16px 10px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)', margin: '0 auto 10px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>{title}</div>
              <div style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>{dict.tipp.step.list.title}</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={dict.tipp.step.list.close}
              style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 15, cursor: 'pointer', flexShrink: 0 }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Kolonneoverskrifter — samme kolonnebredder som radene under */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px 6px', flexShrink: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
          <span style={{ width: 20 }} />
          <span style={{ flex: 1 }} />
          <span style={{ width: 52, textAlign: 'right' }}>{dict.tipp.step.list.avg}</span>
          <span style={{ width: 52, textAlign: 'right' }}>{dict.tipp.step.list.odds}</span>
        </div>

        <div ref={bodyRef} role="radiogroup" aria-label={dict.tipp.step.list.dialogAriaLabel(title)} style={{ overflowY: 'auto', padding: '0 10px 12px' }}>
          {players.map((player) => {
            const selected = selectedName === player.name
            return (
              <button
                key={player.name}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onSelect(player.name)}
                className="pick-row"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                  padding: '10px 6px', minHeight: 48, cursor: 'pointer', color: '#fff',
                  background: selected ? `${color}22` : 'transparent',
                  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: selected ? 10 : 0,
                  boxShadow: selected ? `inset 0 0 0 1.5px ${color}` : 'none',
                }}
              >
                <Flag iso2={player.iso2} size={20} />
                <span style={{ flex: 1, minWidth: 0, fontFamily: SPORT, fontSize: 17, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {player.name}
                </span>
                <span style={{ width: 52, textAlign: 'right', fontFamily: SPORT, fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'rgba(255,255,255,0.85)' }}>
                  {formatAvg(PLAYER_STATS[player.name]?.avg, locale)}
                </span>
                <span style={{ width: 52, textAlign: 'right', fontFamily: SPORT, fontSize: 15, fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: '#f3d576' }}>
                  {formatOdds(player.odds, locale)}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
