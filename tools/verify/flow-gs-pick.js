// Tippe-flyten via URL-hash: #s=1..4 (steg), #detail=1 (åpne spillerpanel), #s=sum (oppsummering), #s=reg (registrering), #s=intro0|1|2 (introslide)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const find = (t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(t))
const h = Object.fromEntries(location.hash.slice(1).split('&').filter(Boolean).map((kv) => kv.split('=')))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
if (String(h.s || '').startsWith('intro')) {
  await sleep(2500)
  find('Guide')?.click(); await sleep(1200)
  const n = Number(h.s.slice(5))
  for (let i = 0; i < n; i++) { find('Neste')?.click(); await sleep(700) }
  await sleep(n === 0 ? 9000 : 8000)
  return { slide: n }
}
localStorage.setItem('vm_tipp_intro_seen', '1')
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('button.player-card')) || isReact(find('Hopp over'))) break; await sleep(250) }
find('Hopp over')?.click(); await sleep(600)
const target = h.s === 'sum' || h.s === 'reg' ? 4 : Number(h.s || 1)
for (let step = 1; step < target + (h.s === 'sum' || h.s === 'reg' ? 1 : 0); step++) {
  document.querySelector('button.player-card')?.click(); await sleep(450)
  find('Neste')?.click(); await sleep(700)
}
if (h.s === 'sum' || h.s === 'reg') {
  document.querySelector('button.player-card')?.click(); await sleep(450)
  find('Se oppsummering')?.click(); await sleep(900)
}
if (h.s === 'reg') { find('Gå videre')?.click() ?? [...document.querySelectorAll('button')].find((b) => /fortsett|neste|gå videre/i.test(b.textContent))?.click(); await sleep(900) }
if (h.pick) { document.querySelectorAll('button.player-card')[Number(h.pick)]?.click(); await sleep(600) }
if (h.detail) { find('Detaljer')?.click(); await sleep(1200) }
return { tekst: document.body.innerText.replace(/\s+/g, ' ').slice(0, 300) }
