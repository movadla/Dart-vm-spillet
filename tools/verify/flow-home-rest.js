const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
await sleep(2000); window.scrollTo(0, 800); await sleep(32000)
return { y: window.scrollY, h: document.documentElement.scrollHeight }
