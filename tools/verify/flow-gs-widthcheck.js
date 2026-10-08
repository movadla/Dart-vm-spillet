// Sjekker at siden ikke er bredere enn skjermen (sidescroll) — etter scroll gjennom hele siden.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
await sleep(2200)
let max = 0
for (let y = 0; y <= document.documentElement.scrollHeight; y += 500) { window.scrollTo(0, y); await sleep(350); max = Math.max(max, document.documentElement.scrollWidth) }
const W = document.documentElement.clientWidth
return { side: location.pathname + location.search, clientWidth: W, størsteScrollWidth: max, sidescroll: max > W }
