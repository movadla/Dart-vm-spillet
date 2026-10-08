// Grand Slam: VM-guiden — setter demo-cookien (etter finalen), viser Kamper-fanen,
// og leser deretter ut Regler-fanen. Skjermbildet viser Regler-fanen.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const tab = (t) => [...document.querySelectorAll('[role=tab]')].find((b) => b.textContent.trim() === t)
document.cookie = 'vm_demo=ferdig; path=/'
await sleep(2000)
tab('Kamper')?.click(); await sleep(2500)
const kamper = document.querySelector('[role=tabpanel]')?.innerText.replace(/\s+/g, ' ').slice(0, 260)
tab('Regler')?.click(); await sleep(800)
return { kamper, regler: document.querySelector('[role=tabpanel]')?.innerText.replace(/\s+/g, ' ').slice(0, 600) }
