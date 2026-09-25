// /vm-info → Regler-fanen → åpne fotokreditering
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('[role=tab]'))) break; await sleep(250) }
const out = {}
out.tabs = [...document.querySelectorAll('[role=tab]')].map((t) => t.textContent + (t.getAttribute('aria-selected') === 'true' ? '*' : ''))
;[...document.querySelectorAll('[role=tab]')].find((t) => /Regler/.test(t.textContent))?.click(); await sleep(400)
const det = document.querySelector('details'); if (det) det.open = true
await sleep(300)
out.credits = det?.innerText.replace(/\s+/g, ' ').slice(0, 300)
out.creditCount = det?.querySelectorAll('li').length
out.small = [...document.querySelectorAll('body *')].filter((e) => e.children.length === 0 && e.textContent.trim() && parseFloat(getComputedStyle(e).fontSize) < 11).map((e) => e.textContent.trim().slice(0, 25) + '@' + getComputedStyle(e).fontSize).slice(0, 8)
out.overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth
window.scrollTo(0, 0)
return out
