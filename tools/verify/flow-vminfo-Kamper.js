const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('[role=tab]'))) break; await sleep(250) }
document.cookie = 'vm_demo=live; path=/'
;[...document.querySelectorAll('[role=tab]')].find((t) => /Kamper/.test(t.textContent))?.click(); await sleep(600)
const sel = document.querySelector('select'); if (sel) { const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set; setter.call(sel, 'Luke Littler'); sel.dispatchEvent(new Event('change', { bubbles: true })); await sleep(600) }
window.scrollTo(0, 0)
return { text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 200), h: document.documentElement.scrollHeight }
