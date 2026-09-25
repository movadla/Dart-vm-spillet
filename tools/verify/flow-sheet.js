const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const find = (t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(t))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
for (let i = 0; i < 80; i++) { if (isReact(find('Hopp over')) || isReact(document.querySelector('button.player-card'))) break; await sleep(250) }
find('Hopp over')?.click()
await sleep(900)
const cards = document.querySelectorAll('button.player-card')
cards[2]?.click()
await sleep(2500)
const d = document.querySelector('[role=dialog]')
const sel = [...document.querySelectorAll('button.player-card')].find((b) => b.className.includes('selected'))
const chk = sel && [...sel.querySelectorAll('div')].find((el) => el.textContent.trim() === '✓')
return {
  cards: cards.length,
  sheetOpen: !!d,
  text: d?.innerText.replace(/\s+/g, ' ').slice(0, 320),
  sheetHeight: d ? Math.round(d.getBoundingClientRect().height) : null,
  checkLeftOffset: chk && sel ? Math.round(chk.getBoundingClientRect().left - sel.getBoundingClientRect().left) : null,
}
