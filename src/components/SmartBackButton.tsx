'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function SmartBackButton() {
  const [href, setHref] = useState('/')
  const [label, setLabel] = useState('← Hjem')

  useEffect(() => {
    try {
      const id = localStorage.getItem('vm_participant_id')
      if (id) { setHref(`/deltaker/${id}`); setLabel('← Min side') }
    } catch {}
  }, [])

  return <Link href={href} className="back-btn">{label}</Link>
}
