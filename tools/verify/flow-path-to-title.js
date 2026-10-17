// Min side (demo, live): åpne første spillerrad og se «Veien til tittel»-trappa
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('button.pick-row'))) break; await sleep(250) }
await sleep(1200)
const rows = [...document.querySelectorAll('button.pick-row')]
rows[0]?.click(); await sleep(600)
const expanded = rows[0]?.getAttribute('aria-expanded')
const svg = document.querySelector('svg[aria-label*=":"]')
svg?.scrollIntoView({ block: 'center' })
await sleep(2200)
return { expanded, rows: rows.length, label: svg?.getAttribute('aria-label'), nodesOn: document.querySelectorAll('.ptt-on').length }
