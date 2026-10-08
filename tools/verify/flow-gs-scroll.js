// Generisk: scroller til y fra URL-hash (#y=1200) og skriver ut sidehøyde. Setter språk via #lang=en.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const h = Object.fromEntries(location.hash.slice(1).split('&').filter(Boolean).map((kv) => kv.split('=')))
if (h.lang) { document.cookie = `vm_locale=${h.lang}; path=/`; location.reload(); await sleep(100) }
await sleep(2500)
if (h.id) { localStorage.setItem('vm_participant_id', h.id); window.dispatchEvent(new Event('vm-participant-changed')); await sleep(500) }
window.scrollTo(0, Number(h.y || 0)); await sleep(1200)
return { sidehøyde: document.documentElement.scrollHeight, vinduhøyde: innerHeight, scrollY: Math.round(scrollY) }
