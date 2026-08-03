import sharp from 'sharp'

const SOURCE = 'public/snåsamannen.png'
const OUTPUT = 'public/snaasamannen-email.png'
const BG = { r: 13, g: 17, b: 23 }
const TARGET_W = 180

const meta = await sharp(SOURCE).metadata()
const targetH = Math.round(TARGET_W * (meta.height / meta.width))

// Gradient mask: controls both edge fade and overall opacity.
// Fades to fully transparent at edges so composite onto BG gives a seamless blend.
const maskSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${TARGET_W}" height="${targetH}">
  <defs>
    <radialGradient id="g" cx="50%" cy="28%" rx="60%" ry="68%">
      <stop offset="0%"   stop-color="white" stop-opacity="0.38"/>
      <stop offset="45%"  stop-color="white" stop-opacity="0.22"/>
      <stop offset="75%"  stop-color="white" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${TARGET_W}" height="${targetH}" fill="url(#g)"/>
</svg>`)

// Step 1: resize and apply gradient as alpha mask
const masked = await sharp(SOURCE)
  .resize(TARGET_W)
  .ensureAlpha()
  .composite([{ input: maskSvg, blend: 'dest-in' }])
  .toBuffer()

// Step 2: composite masked image onto solid dark background
// Result has NO transparency — edges literally are #0d1117
await sharp({ create: { width: TARGET_W, height: targetH, channels: 3, background: BG } })
  .composite([{ input: masked, blend: 'over' }])
  .png({ compressionLevel: 9 })
  .toFile(OUTPUT)

console.log(`Ferdig: ${OUTPUT} (${TARGET_W}x${targetH}px)`)
