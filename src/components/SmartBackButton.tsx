'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLocale } from '@/lib/i18n/useLocale'

export default function SmartBackButton() {
  const { dict } = useLocale()
  const [href, setHref] = useState('/')
  const [isMyPage, setIsMyPage] = useState(false)

  // Leses etter mount med vilje — localStorage finnes ikke under SSR, en lazy
  // useState-initializer ville gitt hydration-mismatch mellom server og klient.
  useEffect(() => {
    try {
      const id = localStorage.getItem('vm_participant_id')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (id) { setHref(`/deltaker/${id}`); setIsMyPage(true) }
    } catch {}
  }, [])

  return <Link href={href} className="back-btn">{isMyPage ? dict.common.nav.myPage : dict.common.nav.home}</Link>
}
