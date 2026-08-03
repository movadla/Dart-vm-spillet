'use client'
import { useEffect } from 'react'

export default function IosStandaloneFix() {
  useEffect(() => {
    const nav = window.navigator as Navigator & { standalone?: boolean }
    if (nav.standalone !== true) return

    const el = document.querySelector<HTMLElement>('.app-container')
    if (!el) return

    // Read env(safe-area-inset-top) via CSS custom property
    const satStr = getComputedStyle(document.documentElement)
      .getPropertyValue('--sat').trim()
    const sat = parseFloat(satStr) || 0

    // If env() returned 0 (viewport-fit may not be active), use 54px fallback
    // which covers Dynamic Island iPhones; harmless excess for older devices
    el.style.paddingTop = sat > 4 ? `${sat}px` : '54px'
  }, [])
  return null
}
