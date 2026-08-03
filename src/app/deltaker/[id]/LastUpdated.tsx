'use client'

export default function LastUpdated({ fetchedAt }: { fetchedAt: string }) {
  const d = new Date(fetchedAt)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return (
    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em' }}>
      Oppdatert {hh}:{mm}
    </span>
  )
}
