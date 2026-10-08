// VM-guiden: åpne fane via hash (#tab=Spillere|Kamper|Regler), demo-cookie for kamper.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const h = Object.fromEntries(location.hash.slice(1).split('&').filter(Boolean).map((kv) => kv.split('=')))
document.cookie = 'vm_demo=live; path=/'
await sleep(2200)
const tab = (t) => [...document.querySelectorAll('[role=tab]')].find((b) => b.textContent.trim() === t)
tab(decodeURIComponent(h.tab || 'Spillere'))?.click(); await sleep(2200)
window.scrollTo(0, Number(h.y || 0)); await sleep(600)
return { høyde: document.documentElement.scrollHeight }
