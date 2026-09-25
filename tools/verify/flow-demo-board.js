// Start på /deltaker/demo?fase=live (setter demo-cookien), klikk «Plassering» → /leaderboard (klient-navigasjon)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
const out = {}
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('button.pick-row'))) break; await sleep(250) }
await sleep(800)
out.cookieBefore = document.cookie
document.querySelector('a[href="/leaderboard"]')?.click()
for (let i = 0; i < 80; i++) { if (location.pathname === '/leaderboard' && document.querySelector('.lb-rows a')) break; await sleep(250) }
await sleep(1000)
out.path = location.pathname
out.head = document.body.innerText.replace(/\s+/g, ' ').slice(0, 220)
const rows = [...document.querySelectorAll('.lb-rows > a')]
out.rowCount = rows.length
out.first3 = rows.slice(0, 3).map((a) => a.getAttribute('aria-label'))
out.me = rows.find((a) => /\(deg\)/.test(a.getAttribute('aria-label') || ''))?.getAttribute('aria-label')
out.deltas = rows.slice(0, 5).map((a) => a.querySelector('[aria-label^="opp"],[aria-label^="ned"],[aria-label="uendret"]')?.textContent)
out.demoChip = !!document.querySelector('a[href="/deltaker/demo"]')
out.minSideCard = document.querySelector('a[href="/deltaker/demo"].lb-card')?.innerText.replace(/\s+/g, ' ')
out.overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth
// Tilbake til Min side via egen rad
rows.find((a) => /\(deg\)/.test(a.getAttribute('aria-label') || ''))?.click()
for (let i = 0; i < 80; i++) { if (location.pathname.startsWith('/deltaker/') && document.querySelector('button.pick-row')) break; await sleep(250) }
await sleep(600)
out.backPath = location.pathname + location.search
out.backLabel = document.querySelector('a.back-btn')?.textContent
return out
