// Grand Slam-formatet: pott 4 = 5 kort + «Se alle»-kort. Kjør med variant via
// hash i URL-en? Nei — denne flyten tar steg 1–3 (første kort + Neste) og
// stopper på steg 4, så skjermbildet viser kortene. Se flow-gs-pot4-list.js
// og flow-gs-pot4-picked.js for listen og et valg fra listen.
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
return {
  steg: (document.body.innerText.match(/STEG \d AV \d/) || [])[0],
  kort: document.querySelectorAll('button.player-card').length,
  seAlle: [...document.querySelectorAll('button.player-card')].map((b) => b.getAttribute('aria-label')).slice(-1)[0],
}
