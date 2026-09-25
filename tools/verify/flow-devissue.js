// Leser ut Next.js-dev-overlayets «Issue»-tekst (shadow DOM i <nextjs-portal>)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
await sleep(4000)
const portal = document.querySelector('nextjs-portal')
const root = portal?.shadowRoot
if (!root) return { overlay: 'ingen portal' }
const before = root.textContent.replace(/\s+/g, ' ').slice(0, 200)
const btn = [...root.querySelectorAll('button, [role=button]')].find((b) => /Issue/i.test(b.textContent))
btn?.click()
await sleep(1200)
const text = root.textContent.replace(/\s+/g, ' ')
return { before, hasBadge: !!btn, text: text.slice(0, 2500) }
