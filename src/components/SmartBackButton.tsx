'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function SmartBackButton() {
  const [href, setHref] = useState('/')
  const [label, setLabel] = useState('← Hjem')

  // Leses etter mount med vilje — localStorage finnes ikke under SSR, en lazy
  // useState-initializer ville gitt hydration-mismatch mellom server og klient.
  useEffect(() => {
    try {
      const id = localStorage.getItem('vm_participant_id')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (id) { setHref(`/deltaker/${id}`); setLabel('← Min side') }
    } catch {}
  }, [])

  return <Link href={href} className="back-btn">{label}</Link>
}
