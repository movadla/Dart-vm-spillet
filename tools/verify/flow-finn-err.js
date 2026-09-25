const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('#finn-epost')) || location.pathname !== '/finn') break; await sleep(250) }
const inp = document.querySelector('#finn-epost')
if (!inp) return { path: location.pathname, local: localStorage.getItem('vm_participant_id') }
const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
setter.call(inp, 'finnes-ikke@example.com'); inp.dispatchEvent(new Event('input', { bubbles: true }))
await sleep(200); document.querySelector('form button[type=submit]')?.click(); await sleep(2500)
return { err: document.querySelector('#finn-feil')?.innerText.replace(/\s+/g, ' '), inCard: !!document.querySelector('#finn-feil')?.parentElement?.querySelector('#finn-epost') }
