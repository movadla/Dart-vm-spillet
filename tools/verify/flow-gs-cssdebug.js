const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
await sleep(2500)
localStorage.setItem('vm_participant_id', 'demo'); window.dispatchEvent(new Event('vm-participant-changed')); await sleep(800)
const nav = document.querySelector('nav.bottom-nav')
const rules = []
for (const sheet of document.styleSheets) { try { for (const r of sheet.cssRules) if (r.cssText.includes('bottom-nav')) rules.push(r.cssText.slice(0, 90)) } catch {} }
return { finnes: !!nav, position: nav && getComputedStyle(nav).position, display: nav && getComputedStyle(nav).display, antallRegler: rules.length, regler: rules.slice(0, 3), bodyKlasse: document.body.className }
