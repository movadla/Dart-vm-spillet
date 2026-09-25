const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const find = (t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(t))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
const out = {}
localStorage.setItem('vm_tipp_intro_seen', '1')
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('button.player-card')) || isReact(find('Hopp over'))) break; await sleep(250) }
find('Hopp over')?.click(); await sleep(600)
out.autoSkippedIntro = document.querySelectorAll('button.player-card').length === 3
out.title = document.body.innerText.match(/\n(FAVORITTENE|TOPPSEEDET)\n/)?.[1]
out.nesteDisabledText = find('Velg en spiller')?.textContent.trim()
document.querySelector('button.player-card')?.click(); await sleep(600)
out.sheetOpenedOnCardClick = !!document.querySelector('[role=dialog]')
out.quickInfo = [...document.querySelectorAll('span')].map((s) => s.textContent).find((t) => /Snitt/.test(t))?.replace(/\s+/g, ' ')
find('Detaljer')?.click(); await sleep(800)
const d = document.querySelector('[role=dialog]')
out.sheetOpenedOnDetails = !!d
out.sheetText = d?.innerText.replace(/\s+/g, ' ').slice(0, 420)
;[...(d?.querySelectorAll('button') ?? [])].find((b) => b.textContent.includes('Se hele trekningen'))?.click(); await sleep(1200)
const dialogs = document.querySelectorAll('[role=dialog]')
out.bracketOpen = dialogs.length === 2
const br = dialogs[dialogs.length - 1]
out.bracketFirstSection = br?.innerText.replace(/\s+/g, ' ').match(/Runde 1 – din seksjon (.{0,90})/)?.[1]
out.collapsedSections = br?.querySelectorAll('details').length
window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await sleep(400)
out.afterEscape = document.querySelectorAll('[role=dialog]').length
;[...document.querySelectorAll('[role=dialog] button')].find((b) => b.textContent.includes('Neste'))?.click(); await sleep(800)
out.stegAfterSheetNext = (document.body.innerText.match(/STEG \d AV \d[^\n]*/) || [])[0]
out.progressFlags = document.querySelectorAll('button[aria-label^="Gå til steg"]').length
for (let s = 2; s <= 6; s++) { document.querySelector('button.player-card')?.click(); await sleep(350); (find('Neste') || find('Se oppsummering'))?.click(); await sleep(500) }
;[...document.querySelectorAll('button')].find((b) => b.textContent.includes('Fortsett'))?.click(); await sleep(900)
out.registration = { text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 200), tiles: document.querySelectorAll('img[src*="/players/"]').length, button: [...document.querySelectorAll('button')].find((b) => /Fyll inn|Meld meg/.test(b.textContent))?.textContent.trim() }
window.scrollTo(0, 0)
return out
