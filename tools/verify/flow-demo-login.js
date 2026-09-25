// /finn → demo-knapp → /deltaker/demo (live-fasen)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
localStorage.removeItem('vm_participant_id')
document.cookie = 'vm_demo=; path=/; max-age=0'
const out = {}
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('#finn-epost'))) break; await sleep(250) }
out.finnText = document.body.innerText.replace(/\s+/g, ' ').slice(0, 260)
const demoBtn = [...document.querySelectorAll('button')].find((b) => /demo-deltakeren/.test(b.textContent))
out.hasDemoButton = !!demoBtn
demoBtn?.click()
for (let i = 0; i < 80; i++) { if (location.pathname.startsWith('/deltaker/')) break; await sleep(250) }
await sleep(2500)
out.path = location.pathname
out.localId = localStorage.getItem('vm_participant_id')
out.cookie = document.cookie
out.text = document.body.innerText.replace(/\s+/g, ' ').slice(0, 900)
out.tiles = document.querySelectorAll('img[src*="/players/"]').length
out.h1 = document.querySelector('h1')?.textContent
return out
