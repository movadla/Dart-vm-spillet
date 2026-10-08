// Åpner «Se alle»-listen på steg 4 og velger spiller nr. 10 fra listen —
// valget skal ta det sjette kortets plass i gridet.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const find = (t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(t))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
localStorage.setItem('vm_tipp_intro_seen', '1')
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('button.player-card')) || isReact(find('Hopp over'))) break; await sleep(250) }
find('Hopp over')?.click(); await sleep(600)
for (let step = 1; step <= 3; step++) {
  document.querySelector('button.player-card')?.click(); await sleep(500)
  find('Neste')?.click(); await sleep(700)
}
const cards = [...document.querySelectorAll('button.player-card')]
cards[cards.length - 1].click(); await sleep(700)
const rows = [...document.querySelectorAll('[role=dialog] [role=radio]')]
const valgt = rows[9]?.innerText.replace(/\s+/g, ' ')
rows[9]?.click(); await sleep(900)
const after = [...document.querySelectorAll('button.player-card')]
return {
  valgt,
  sheetLukket: !document.querySelector('[role=dialog]'),
  kort: after.length,
  sisteAria: after[after.length - 1]?.getAttribute('aria-label'),
  sisteValgt: after[after.length - 1]?.getAttribute('aria-checked'),
  seAlleKnapp: !!find('Se alle'),
}
