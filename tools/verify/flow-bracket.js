const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const find = (t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(t))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
localStorage.setItem('vm_tipp_intro_seen', '1')
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('button.player-card')) || isReact(find('Hopp over'))) break; await sleep(250) }
find('Hopp over')?.click(); await sleep(600)
document.querySelectorAll('button.player-card')[1]?.click(); await sleep(700)
;[...document.querySelectorAll('[role=dialog] button')].find((b) => b.textContent.includes('Se bracketen'))?.click(); await sleep(1500)
const dialogs = document.querySelectorAll('[role=dialog]')
return { dialogs: dialogs.length, bracketText: dialogs[dialogs.length - 1]?.innerText.replace(/\s+/g, ' ').slice(0, 200) }
