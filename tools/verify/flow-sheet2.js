const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const find = (t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(t))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
localStorage.setItem('vm_tipp_intro_seen', '1')
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('button.player-card')) || isReact(find('Hopp over'))) break; await sleep(250) }
find('Hopp over')?.click(); await sleep(600)
document.querySelectorAll('button.player-card')[2]?.click(); await sleep(500)
find('Detaljer')?.click(); await sleep(1800)
const d = document.querySelector('[role=dialog]')
return { sheetOpen: !!d, height: d ? Math.round(d.getBoundingClientRect().height) : null, text: d?.innerText.replace(/\s+/g, ' ').slice(0, 200) }
