// «Overrask meg»: trykker terningen på steg 1 og leser ut valget; #mode=all går via oppsummeringen
// («Overrask hele laget», så «Angre»). Skjermbildet viser sluttilstanden.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const find = (t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(t))
const h = Object.fromEntries(location.hash.slice(1).split('&').filter(Boolean).map((kv) => kv.split('=')))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
localStorage.setItem('vm_tipp_intro_seen', '1')
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('button.player-card')) || isReact(find('Hopp over'))) break; await sleep(250) }
find('Hopp over')?.click(); await sleep(600)
const selected = () => document.querySelector('button.player-card[aria-checked=true]')?.getAttribute('aria-label')
if (h.mode !== 'all') {
  const før = selected() ?? null
  find('Overrask meg')?.click(); await sleep(1500)
  return { før, etter: selected() ?? null, nesteKnapp: find('Neste')?.disabled === false }
}
// hele laget: velg første kort på alle steg, gå til oppsummering, trykk «Overrask hele laget»
for (let step = 1; step <= 4; step++) {
  document.querySelector('button.player-card')?.click(); await sleep(400)
  find(step < 4 ? 'Neste' : 'Se oppsummering')?.click(); await sleep(700)
}
const lag = () => [...document.querySelectorAll('button.pick-row')].map((b) => b.innerText.replace(/\s+/g, ' ').slice(0, 28))
const før = lag()
find('Overrask hele laget')?.click(); await sleep(600)
const etter = lag()
const angreSynlig = !!find('Angre')
find('Angre')?.click(); await sleep(500)
return { før, etter, angreSynlig, tilbake: JSON.stringify(lag()) === JSON.stringify(før) }
