// Rendrer landflagg som bilde fra flagcdn.com – fungerer på alle plattformer inkl. Windows
// som ikke støtter flagg-emoji nativt.
// Henter alltid et bilde på ca. 3× visningsstørrelsen (og skalerer ned med CSS) for at
// flagget skal se skarpt ut på retina/høy-DPI-skjermer — ellers blir et 20–24px bilde
// synlig uskarpt når nettleseren må skalere det OPP til enhetens faktiske pikseltetthet.
// "w{bredde}"-endepunktet (i motsetning til det faste "BxH"-endepunktet) støtter alle
// bredder (20/40/80/160/…) for BÅDE vanlige landkoder og UK-under-flagg (gb-eng/gb-sct/
// gb-wls/gb-nir).
const SOURCE_WIDTHS = [20, 40, 80, 160, 320, 640, 1280, 2560]

export default function Flag({ iso2, size = 20 }: { iso2: string; size?: number }) {
  if (!iso2) return null
  const h = Math.round(size * 0.75)
  const srcW = SOURCE_WIDTHS.find((w) => w >= size * 3) ?? SOURCE_WIDTHS[SOURCE_WIDTHS.length - 1]
  return (
    // next/image gir ingen reell gevinst for et 20–64px ikon fra en ekstern CDN vi ikke
    // kontrollerer, og krever remotePatterns-oppsett for flagcdn.com — vanlig <img> holder.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w${srcW}/${iso2.toLowerCase()}.png`}
      width={size}
      height={h}
      alt=""
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: 2, flexShrink: 0, width: size, height: h }}
    />
  )
}
