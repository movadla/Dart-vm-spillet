const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const find = (t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(t))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
localStorage.removeItem('vm_tipp_intro_seen')
for (let i = 0; i < 80; i++) { if (isReact(find('Hopp over'))) break; await sleep(250) }
document.querySelectorAll('[role=tab]')[2].click()
await sleep(9500)
const panel = document.getElementById('step-slideshow-panel')
const text = panel.innerText.replace(/\s+/g, ' ')
const tilePoints = [...text.matchAll(/(\d+) p/g)].map((m) => Number(m[1]))
return {
  text: text.slice(0, 400),
  rank: (text.match(/(\d+)\. plass/) || [])[1],
  tilePointsSum: tilePoints.slice(0, 6).reduce((a, b) => a + b, 0),
  yourRowPoints: (text.match(/Laget ditt (\d+) p/) || [])[1],
  panelBottom: Math.round(panel.getBoundingClientRect().bottom),
  viewportH: document.documentElement.clientHeight,
}
