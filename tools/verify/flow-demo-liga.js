// /liga/DEMO01
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
const out = {}
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('.lb-rows a'))) break; await sleep(250) }
await sleep(800)
out.head = document.body.innerText.replace(/\s+/g, ' ').slice(0, 200)
const rows = [...document.querySelectorAll('.lb-rows > a')]
out.rowCount = rows.length
out.labels = rows.map((a) => a.getAttribute('aria-label'))
out.kickButtons = [...document.querySelectorAll('button')].filter((b) => /Kick/.test(b.textContent)).length
out.overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth
return out
