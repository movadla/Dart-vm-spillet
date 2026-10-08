// Som flow-gs-pot4.js, men åpner «Se alle»-listen på steg 4.
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
return { rader: rows.length, første: rows[0]?.innerText.replace(/\s+/g, ' '), siste: rows[rows.length - 1]?.innerText.replace(/\s+/g, ' ') }
