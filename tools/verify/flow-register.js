const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const find = (t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(t))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
localStorage.setItem('vm_tipp_intro_seen', '1')
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('button.player-card')) || isReact(find('Hopp over'))) break; await sleep(250) }
find('Hopp over')?.click(); await sleep(600)
for (let s = 1; s <= 6; s++) {
  document.querySelector('button.player-card')?.click(); await sleep(400)
  ;[...document.querySelectorAll('[role=dialog] button')].find((b) => b.textContent.trim() === 'Lukk')?.click(); await sleep(300)
  ;(find('Neste') || find('Se oppsummering'))?.click(); await sleep(500)
}
;[...document.querySelectorAll('button')].find((b) => b.textContent.includes('Fortsett'))?.click(); await sleep(900)
window.scrollTo(0, 0)
return { text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 500), inputs: [...document.querySelectorAll('input')].map((i) => i.placeholder || i.type), scrollHeight: document.documentElement.scrollHeight }
