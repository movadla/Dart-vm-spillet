const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const find = (t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(t))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
localStorage.setItem('vm_tipp_intro_seen', '1')
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('button.player-card')) || isReact(find('Hopp over'))) break; await sleep(250) }
find('Hopp over')?.click(); await sleep(600)
// gå til pott 5 (5 kort? nei, 3) – velg pott 3 for blå
find('Neste'); // no-op
document.querySelector('button.player-card')?.click(); await sleep(700)
;[...document.querySelectorAll('[role=dialog] button')].find((b) => b.textContent.trim() === 'Lukk')?.click(); await sleep(500)
return { stegLine: (document.body.innerText.match(/STEG \d AV \d[^\n]*/) || [])[0], neste: find('Neste')?.textContent.trim(), sheetOpen: !!document.querySelector('[role=dialog]') }
