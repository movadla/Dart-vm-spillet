const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
await sleep(2500); window.scrollTo(0, 900); await sleep(5000)
const W = document.documentElement.clientWidth
const clipped = (e) => { for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p); if (/(hidden|auto|scroll|clip)/.test(o.overflowX)) return true } return false }
const wide = [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > W + 1 && !clipped(e) && getComputedStyle(e).position !== 'fixed' }).slice(0, 8).map((e) => `${e.tagName}.${(e.className || '').toString().slice(0, 40)} left=${Math.round(e.getBoundingClientRect().left)} right=${Math.round(e.getBoundingClientRect().right)} w=${Math.round(e.getBoundingClientRect().width)} :: ${(e.textContent || '').trim().slice(0, 30)}`)
return { clientWidth: W, scrollWidth: document.documentElement.scrollWidth, bredeElementer: wide }
