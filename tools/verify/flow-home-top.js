const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('a[href="/tipp"]'))) break; await sleep(250) }
await sleep(1500)
return { text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 300) }
