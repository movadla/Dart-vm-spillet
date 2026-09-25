const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const find = (t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(t))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
const out = {}

localStorage.removeItem('vm_tipp_intro_seen')
localStorage.removeItem('vm_participant_id')

let hydrated = false
for (let i = 0; i < 80; i++) { if (isReact(find('Hopp over'))) { hydrated = true; break } await sleep(250) }
out.hydrated = hydrated
const panel = document.getElementById('step-slideshow-panel')
out.slide0 = panel?.innerText.split('\n').slice(0, 2)
document.querySelectorAll('[role=tab]')[1].click(); await sleep(700)
out.slide1 = panel?.innerText.replace(/\s+/g, ' ').slice(0, 110)
document.querySelectorAll('[role=tab]')[2].click(); await sleep(700)
out.slide2 = panel?.innerText.replace(/\s+/g, ' ').slice(0, 70)
out.hoppOverOnLast = !!find('Hopp over')
out.ctaOnLast = [...document.querySelectorAll('button, a')].some((b) => b.textContent.includes('VELG SPILLERE'))
document.querySelectorAll('[role=tab]')[0].click(); await sleep(400)
find('Hopp over')?.click(); await sleep(900)

// Steg 1: velg kort → bunnark
out.stegLine1 = (document.body.innerText.match(/STEG \d AV \d[^\n]*/) || [])[0]
out.nesteBefore = find('Velg en spiller') ? 'Velg en spiller' : find('Neste')?.textContent.trim()
document.querySelector('button.player-card')?.click(); await sleep(900)
const d = document.querySelector('[role=dialog]')
out.sheetOpen = !!d
out.sheetText = d?.innerText.replace(/\s+/g, ' ').slice(0, 260)
out.sheetHasSkeletonOrValue = !!d?.querySelector('.skeleton') || /% valgt/i.test(d?.innerText ?? '')
;[...(d?.querySelectorAll('button') ?? [])].find((b) => b.textContent.includes('Neste'))?.click(); await sleep(900)
out.afterSheetNext = { stegLine: (document.body.innerText.match(/STEG \d AV \d[^\n]*/) || [])[0], sheetClosed: !document.querySelector('[role=dialog]') }

// Steg 2–6: velg første kort, lukk arket, trykk Neste/Se oppsummering
for (let s = 2; s <= 6; s++) {
  document.querySelector('button.player-card')?.click(); await sleep(500)
  const dd = document.querySelector('[role=dialog]')
  ;[...(dd?.querySelectorAll('button') ?? [])].find((b) => b.textContent.trim() === 'Lukk')?.click(); await sleep(400)
  ;(find('Neste') || find('Se oppsummering'))?.click(); await sleep(700)
}
out.summary = {
  heading: document.body.innerText.replace(/\s+/g, ' ').slice(0, 140),
  tiles: document.querySelectorAll('img[src*="/players/"]').length,
  multChips: [...document.querySelectorAll('div')].filter((el) => /^×\d$/.test(el.textContent.trim())).map((el) => el.textContent.trim()),
  endreButtons: [...document.querySelectorAll('button')].filter((b) => b.textContent.trim() === 'Endre').length,
  check: !!document.querySelector('[aria-label="Alle seks spillere er valgt"]'),
  fortsett: [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Fortsett'))?.textContent.trim(),
  hint: document.body.innerText.includes('Neste: oppgi'),
  scrollHeight: document.documentElement.scrollHeight,
  viewportH: document.documentElement.clientHeight,
}
window.scrollTo(0, 0)
return out
