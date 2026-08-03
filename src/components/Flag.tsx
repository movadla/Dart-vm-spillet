// Rendrer landflagg som bilde fra flagcdn.com – fungerer på alle plattformer inkl. Windows
// som ikke støtter flagg-emoji nativt.
// Støttede størrelser (bredde × høyde): 20×15, 24×18, 32×24, 40×30, 48×36, 64×48
export default function Flag({ iso2, size = 20 }: { iso2: string; size?: number }) {
  if (!iso2) return null
  const h = Math.round(size * 0.75)
  // Velg nærmeste støttede størrelse
  const supported = [20, 24, 32, 40, 48, 64]
  const w = supported.reduce((prev, curr) => Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev)
  const hSnapped = Math.round(w * 0.75)
  return (
    <img
      src={`https://flagcdn.com/${w}x${hSnapped}/${iso2.toLowerCase()}.png`}
      width={size}
      height={h}
      alt=""
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: 2, flexShrink: 0 }}
    />
  )
}
