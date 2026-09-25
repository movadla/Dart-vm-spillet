# Verifisering i headless Chrome

`cdp-check.js` starter brukerens Chrome headless (mobil-emulering 430×900),
kjører et lite async-skript i siden og skriver returverdien + et skjermbilde.
Ingen puppeteer/playwright — bare rå CDP over port 9333.

```bash
npm run verify -- http://localhost:3001/deltaker/demo?fase=live tools/verify/flow-demo-minside.js shot.jpg
```

Dev-serveren må kjøre (`npx next dev -p 3001`). Skriptene (`flow-*.js`) er
funksjonskropper: de kan `await`, og det de `return`-er printes som JSON.

Nyttige flyter:

| Fil | Hva |
|---|---|
| `flow-y-<px>.js` | Vent på hydrering, scroll til `<px>`, skjermbilde |
| `flow-tipp2.js` | Hele tippe-flyten: hopp over intro → velg → spillerpanel → brakett → registrering |
| `flow-tipp-summary.js` / `flow-tipp-reg.js` | Oppsummering / registrering |
| `flow-demo-login.js` | `/finn` → demo-deltaker → Min side |
| `flow-demo-minside.js` | Min side: rader, spillerpanel, «Neste spiller», Next-overlayets feil |
| `flow-demo-board.js` | Min side → leaderboard via klient-navigasjon (cookien må settes først) |
| `flow-demo-phase.js` | Bytte demo-fase (før/underveis/etter) |
| `flow-vminfo-*.js` | VM-guidens faner |
| `flow-devissue.js` | Leser ut hva Next sitt «N Issues»-merke sier |

Fallgruver: Chrome-profilen mister localStorage/cookies mellom kjøringer (prosessen
drepes før flush) — sett tilstanden i selve flyten. Navigasjon med `location.href`
dreper evalueringskonteksten; klikk på Next-`<Link>` (klient-navigasjon) beholder den.
Skjermbildet tas også når skriptet kaster.
