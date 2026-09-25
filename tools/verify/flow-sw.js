const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
await sleep(4000)
const entries = performance.getEntriesByType('resource').filter((e) => /sw\.js/.test(e.name)).map((e) => ({ name: e.name, initiatorType: e.initiatorType }))
let swRegs = null
try { swRegs = (await navigator.serviceWorker.getRegistrations()).map((r) => r.active?.scriptURL ?? r.installing?.scriptURL ?? 'pending') } catch (e) { swRegs = 'err ' + e.message }
const scriptsWithSw = [...document.scripts].filter((s) => /sw\.js|serviceWorker/.test(s.textContent)).map((s) => s.textContent.slice(0, 120))
return { entries, swRegs, scriptsWithSw, links: [...document.querySelectorAll('link')].map((l) => l.rel + ':' + l.getAttribute('href')).filter((h) => /sw|manifest/.test(h)) }
