const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const find = (t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(t))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
localStorage.removeItem('vm_tipp_intro_seen')
for (let i = 0; i < 80; i++) { if (isReact(find('Hopp over'))) break; await sleep(250) }
const t0 = performance.now()
// Vent til «Laget ditt»-finalen er på plass (maks 25 s)
let done = false
for (let i = 0; i < 100; i++) { if (document.body.innerText.includes('LAGET DITT')) { done = true; break } await sleep(250) }
await sleep(1200)
const neste = find('Neste')
const strip = document.querySelector('.card-mini > div')
return {
  finishedAfterMs: Math.round(performance.now() - t0),
  finaleShown: done,
  nestePulses: neste?.className.includes('cta-pulse'),
  stripAnimation: strip ? getComputedStyle(strip).animationName : null,
  labels: [...document.querySelectorAll('.card-mini span')].map((s) => s.textContent.trim()).filter((t) => /^[A-ZÆØÅ]/.test(t)).slice(0, 6),
}
