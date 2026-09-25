const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
await sleep(3500)
const root = document.querySelector('nextjs-portal')?.shadowRoot
const badge = root && [...root.querySelectorAll('button, [role=button]')].find((b) => /Issue/i.test(b.textContent))
badge?.click(); await sleep(1000)
const all = root ? root.textContent.replace(/\s+/g, ' ') : ''
const idx = all.search(/Console Error|Runtime Error|Unhandled|Warning:|Error:|Hydration/)
return { badge: badge?.textContent?.trim() ?? null, text: idx >= 0 ? all.slice(idx, idx + 500) : null }
