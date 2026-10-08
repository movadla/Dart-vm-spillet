// Grand Slam-intro: slide 2 («Treffer du vinneren, deler du premien») etter at animasjonen er ferdig.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const find = (t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(t))
localStorage.removeItem('vm_tipp_intro_seen'); localStorage.removeItem('vm_participant_id')
await sleep(1500)
find('Neste')?.click(); await sleep(8000)
return { tekst: document.body.innerText.replace(/\s+/g, ' ').slice(0, 500) }
