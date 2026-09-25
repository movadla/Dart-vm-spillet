const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('button.pick-row'))) break; await sleep(250) }
await sleep(1200)
const out = {}
out.text = document.body.innerText.replace(/\s+/g, ' ').slice(0, 1400)
out.hasInviter = /Inviter/.test(document.body.innerText)
out.hasLigakode = /LIGAKODE|Ligakode/.test(document.body.innerText)
out.headings = [...document.querySelectorAll('span')].map((s) => s.textContent).filter((t) => /^(MITT LAG|NESTE KAMPER|LIGAER)$/.test(t))
out.overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth
return out
