const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
for (let i = 0; i < 60; i++) { if ([...document.querySelectorAll('a,button')].some(isReact)) break; await sleep(250) }
await sleep(2500)
window.scrollTo(0, 3200); await sleep(700)
return { y: window.scrollY, h: document.documentElement.scrollHeight, ox: document.documentElement.scrollWidth > document.documentElement.clientWidth }
