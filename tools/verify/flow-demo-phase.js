// /deltaker/demo?fase=for  (og ?fase=ferdig via lenke) – tekst/tilstand per fase
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
const out = {}
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('button.pick-row'))) break; await sleep(250) }
await sleep(1200)
out.forText = document.body.innerText.replace(/\s+/g, ' ').slice(0, 700)
out.forCookie = document.cookie
out.forRows = [...document.querySelectorAll('button.pick-row')].map((r) => r.innerText.replace(/\s+/g, ' '))
// Rad-trykk før VM åpner spillerpanelet direkte
document.querySelector('button.pick-row')?.click(); await sleep(1500)
out.forSheet = !!document.querySelector('[role=dialog]')
window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await sleep(300)
// Bytt til «Etter finalen»
document.querySelector('a[href="/deltaker/demo?fase=ferdig"]')?.click()
for (let i = 0; i < 80; i++) { if (/Etter finalen/.test(document.querySelector('[role=tab][aria-selected=true]')?.textContent || '')) break; await sleep(250) }
await sleep(1500)
out.doneText = document.body.innerText.replace(/\s+/g, ' ').slice(0, 700)
out.doneRows = [...document.querySelectorAll('button.pick-row')].map((r) => r.innerText.replace(/\s+/g, ' '))
out.doneCookie = document.cookie
return out
