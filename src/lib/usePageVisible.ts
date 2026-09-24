'use client'

import { useEffect, useState } from 'react'

/**
 * true når fanen er synlig. Tidsstyrte intro-animasjoner venter med å starte
 * til fanen faktisk vises — ellers løper setTimeout-kjedene ferdig i en skjult
 * fane mens CSS-animasjonene står stille, og brukeren kommer tilbake til en
 * halvferdig tilstand.
 */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(() => (typeof document === 'undefined' ? true : document.visibilityState === 'visible'))
  useEffect(() => {
    const update = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  return visible
}
