// Venter til siden er hydrert og tegnet (brukes til skjermbilder av ferdigrendrede sider).
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
await sleep(2500)
return { tittel: document.title, tekstStart: document.body.innerText.slice(0, 200).replace(/\s+/g, ' ') }
