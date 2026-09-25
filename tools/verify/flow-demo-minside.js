// /deltaker/demo?fase=live: rader, utvidelse, spillerpanel, faser
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
const out = {}
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('button.pick-row'))) break; await sleep(250) }
await sleep(1200)
out.header = document.body.innerText.replace(/\s+/g, ' ').slice(0, 420)
const rows = [...document.querySelectorAll('button.pick-row')]
out.rowCount = rows.length
out.rows = rows.map((r) => r.innerText.replace(/\s+/g, ' '))
rows[0]?.click(); await sleep(500)
out.expanded = document.body.innerText.replace(/\s+/g, ' ').match(/Videre til [^A]*?Alle kamper →/)?.[0]?.slice(0, 300)
const tile = document.querySelector('button[aria-label^="Spillerinfo"]')
tile?.click(); await sleep(1500)
const d = document.querySelector('[role=dialog]')
out.sheet = d ? d.innerText.replace(/\s+/g, ' ').slice(0, 240) : null
;[...(d?.querySelectorAll('button') ?? [])].find((b) => /Neste spiller/.test(b.textContent))?.click(); await sleep(600)
out.sheetAfterNext = document.querySelector('[role=dialog]')?.innerText.replace(/\s+/g, ' ').slice(0, 80)
window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await sleep(400)
out.sheetClosed = !document.querySelector('[role=dialog]')
await sleep(1500)
out.leagues = [...document.querySelectorAll('a[href^="/liga/"]')].map((a) => a.innerText.replace(/\s+/g, ' '))
out.leaderboardCard = [...document.querySelectorAll('a[href="/leaderboard"]')].map((a) => a.innerText.replace(/\s+/g, ' '))
out.smallFonts = [...document.querySelectorAll('body *')].filter((e) => e.children.length === 0 && e.textContent.trim() && parseFloat(getComputedStyle(e).fontSize) < 11).map((e) => e.textContent.trim().slice(0, 30) + '@' + getComputedStyle(e).fontSize).slice(0, 10)
out.overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth
// Next dev-overlay: hva sier «Issue»-merket etter interaksjonene?
await sleep(1500)
const root = document.querySelector('nextjs-portal')?.shadowRoot
const badge = root && [...root.querySelectorAll('button, [role=button]')].find((b) => /Issue/i.test(b.textContent))
out.issueBadge = badge?.textContent?.trim() ?? null
badge?.click(); await sleep(1200)
const all = root ? root.textContent.replace(/\s+/g, ' ') : ''
const idx = all.search(/Console Error|Runtime Error|Unhandled|Warning:|Error:/)
out.issueText = idx >= 0 ? all.slice(idx, idx + 700) : all.slice(-900)
return out
