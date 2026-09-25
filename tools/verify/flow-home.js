const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('a[href="/tipp"]'))) break; await sleep(250) }
const demo = document.querySelector('.card-mini')
demo?.scrollIntoView({ block: 'center', behavior: 'instant' })
let done = false
for (let i = 0; i < 120; i++) { if (document.body.innerText.includes('LAGET DITT')) { done = true; break } await sleep(250) }
await sleep(800)
return { demoFound: !!demo, finaleShown: done, tiles: document.querySelectorAll('.card-mini img').length }
