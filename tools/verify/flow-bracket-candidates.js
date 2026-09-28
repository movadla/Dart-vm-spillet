// /deltaker/demo?fase=live: åpne Gary Anderson-spillerpanelet og sjekk at
// kvartfinale-raden i «Potensiell vei til finalen» viser «Humphries/Wattimena»
// (kandidat-par) i stedet for ett gjettet navn, siden den avgjørende kampen
// (Humphries mot Wattimena i runde 2) ikke er spilt ennå i «live»-fasen.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const isReact = (el) => !!(el && Object.keys(el).some((k) => k.startsWith('__reactProps')))
const out = {}
for (let i = 0; i < 80; i++) { if (isReact(document.querySelector('button.pick-row'))) break; await sleep(250) }
await sleep(800)
const rows = [...document.querySelectorAll('button.pick-row')]
const row = rows.find((r) => /Anderson/.test(r.textContent))
out.rowFound = !!row
row?.click(); await sleep(500)
const rowContainer = row?.closest('div')?.parentElement ?? row?.parentElement
const infoBtn = [...(rowContainer?.querySelectorAll('button') ?? [])].find((b) => /Spillerinfo/.test(b.textContent))
out.infoBtnFound = !!infoBtn
infoBtn?.click(); await sleep(1200)
const dialog = document.querySelector('[role=dialog]')
out.dialogText = dialog?.innerText.replace(/\s+/g, ' ').slice(0, 700) ?? null

const seeDraw = [...(dialog?.querySelectorAll('button') ?? [])].find((b) => /trekning|bracket/i.test(b.textContent))
seeDraw?.click(); await sleep(1200)
const dialogs = document.querySelectorAll('[role=dialog]')
out.bracketDialogText = dialogs[dialogs.length - 1]?.innerText.replace(/\s+/g, ' ').slice(0, 700) ?? null
return out
