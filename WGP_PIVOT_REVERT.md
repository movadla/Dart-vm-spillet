# ⚠️ Grand Slam-grenen (`grand-slam`, 2026-10-08) — les først

Denne grenen bygger **Grand Slam of Darts 2026** (14.–22. nov) med et NYTT
spillformat («4 valg, vinneren deler premien»), ikke bare en ny turnering.
Sjekklisten under (World Grand Prix → VM) gjelder fortsatt for `master`, men
på denne grenen er flere av filene den nevner **slettet eller skrevet om**.
Ved retur til VM i desember må man derfor bestemme om VM også skal bruke dette
formatet (da er det meste allerede gjort) eller gå tilbake til poengmodellen
(da hentes den fra `master`/git-historikken).

**Slettet på denne grenen** (finnes i git-historikken, f.eks. `git show master:src/lib/bracketProjection.ts`):
`bracketProjection.ts` (+ tester), `config/schedule.ts` (+ test), `BracketModal`,
`DrawBracket`, `MatchBracket`, `deltaker/[id]/NextMatches`, `CountUp`, `PointsDelta`,
`api/my-stats`, `api/pick-share`, `scripts/simulate-scoring-suspense.ts`.

**Skrevet om:** `lib/prize.ts` (ny premiemodell), `lib/scoring.ts` (poeng fjernet),
`config/scoring.ts` (STAGE_ORDER = group/r16/qf/sf/final — FORELØPIG, 16 videre fra
gruppene er IKKE bekreftet), `data/pots.ts` (4 potter fra flat `FIELD` sortert på odds),
tippe-flyten (pott 4 = 5 kort + liste), leaderboard/Min side/RankList (viser «nivå»,
ikke poeng), intro-slideshow, forside, VM-guide (Kamper = resultatliste, Regler = premiedeling).

## Åpent før lansering av Grand Slam — se nå [`GRAND_SLAM_CHECKLIST.md`](GRAND_SLAM_CHECKLIST.md) (denne listen er foreldet)

Gammel kortliste (beholdt for historikk):

- [ ] `FIELD` i `data/pots.ts` er fortsatt World Grand Prix-feltet (PLASSHOLDER) — bytt til de 48 etter Tour Card Holder Qualifier 2026-11-06, med odds fra en ekte, navngitt kilde (ingen Grand Slam-marked var publisert 2026-10-08).
- [ ] `KICKOFF` er satt konservativt til 00:00 norsk tid 2026-11-14 — oppdater med verifisert klokkeslett for første kamp (PDC-program).
- [ ] `STAGE_NAME_MAP` i `api/sync-pdc-results` er UVERIFISERT mot API 10871 (stages var tom) — sjekk når trekningen er ute. Samme for om det er 16 eller flere som går videre fra gruppene.
- [ ] **Databasen må nullstilles** (`picks`, `match_results`, deltakere): den inneholder World Grand Prix-data (6 valg per deltaker, andre potter) og 96 bot-deltakere med 6 valg. `.env.local` peker på PRODUKSJONS-databasen — ikke send inn ekte påmelding lokalt. Botene bør lages på nytt med 4 valg (de skal fortsatt telle med i premiedelingen, avgjort 2026-10-08).
- [ ] E-postmalene (`lib/email-*.ts`) og e-postrutene beskriver fortsatt poeng — skriv om før e-post skrus på.
- [ ] Branding: all tekst/farge sier fortsatt «World Grand Prix» (blått tema) — se `git grep -l "World Grand Prix" -- src`.
- [ ] «% valgt» er fjernet fra kortene (avgjort 2026-10-08, gir strategisk informasjon i et spill der delt premie belønner unike valg).
- [ ] Juridisk: avklar om premien/innsatsen trenger lotteritillatelse (Lotteritilsynet) før den utbetales — utsatt av Morten 2026-10-08.

---

# Tilbake til det ekte VM i desember — full sjekkliste

Denne fila finnes fordi et tidligere forsøk på å spore reverteringen (kode-
kommentarer merket «MIDLERTIDIG» i noen få filer) viste seg å dekke under en
tredjedel av det som faktisk ble endret. Stol IKKE på å bare søke etter
«MIDLERTIDIG» — bruk lista under, eller regenerer den selv:

```
git grep -l "World Grand Prix" -- src
```

Denne ga **40 treff** 2026-09-28 (listen under). Kjør kommandoen på nytt før
du reverterer — hvis den gir flere/færre treff enn 40, har noe endret seg
siden denne fila ble skrevet, og lista må oppdateres.

## Bakgrunn

For å teste at hele appen (ekte data, ekte odds, ekte bilder, faktisk
utsendelse) fungerer FØR det ekte VM i desember, ble appen 2026-09-27/28
midlertidig pekt mot en ekte, nært forestående turnering: **PDC World Grand
Prix 2026** (28. sep–4. okt, Mattioli Arena, Leicester — 32 spillere, 5
runder), i stedet for det vanlige oppsettet mot **PDC World Darts
Championship** i desember (128 spillere, 7 runder). Se
[`project_dart_vm_spillet.md`](../../.claude/projects) (Claude-minnet, ikke i
dette repoet) for hele historikken bak avgjørelsen.

## Strukturelle endringer (mest risiko — gjør disse FØRST, i denne rekkefølgen)

Disse har alle en `MIDLERTIDIG`-kommentar i selve filen som forklarer nøyaktig
hva som må endres:

1. `src/config/tournament.ts` — `KICKOFF`-datoen. Sett tilbake til den ekte
   VM-datoen (var `2026-12-11T19:00:00Z` — bekreft mot PDC sin offisielle
   kunngjøring, den kan ha endret seg). **VIKTIG:** `Z` betyr UTC, IKKE norsk
   tid — den samme feilen (Z-suffiks brukt som om det var norsk klokkeslett)
   ble funnet og fikset i WGP-datoen 2026-09-28 (var 2 timer feil, se
   commit-historikk samme dag). `2026-12-11T19:00:00Z` er derfor mistenkt å
   faktisk bety kl. 20:00 norsk tid (CET, UTC+1 i desember), ikke 19:00 som
   trolig var meningen — regn om for hånd før du bruker denne verdien igjen:
   ønsket norsk klokkeslett minus 1 time (CET) = riktig UTC-verdi. Sjekk med
   `node -e "console.log(new Date('<ISO>Z').toLocaleString('nb-NO', {timeZone:'Europe/Oslo', hour:'2-digit', minute:'2-digit'}))"`.
2. `src/data/pots.ts` — HELE fila må byttes tilbake til 128-spiller-feltet
   med de 6 opprinnelige pottene (`git log -- src/data/pots.ts` for å finne
   commit-en rett før pivoten, som utgangspunkt — men sjekk PDC sin ekte
   seeding for desember, den vil ha endret seg siden september).
3. `src/config/scoring.ts` — `STAGE_ORDER` fra `['r1','r2','qf','sf','final']`
   (5 runder) tilbake til `['r1','r2','r3','r4','qf','sf','final']`
   (7 runder). `CHAMPION_LABEL` kan beholdes eller settes tilbake til
   opprinnelig tekst.
4. `src/config/schedule.ts` — `STAGE_SCHEDULE`-datoene for hver runde.
5. `src/lib/bracketProjection.ts` — tilbake til 128-spiller/7-runde
   eksempel-trekningen (`BRACKET_SIZE`, `seedOrder()`-bruken,
   `isFiller()`-logikken for plasseringsspillere finnes fortsatt i git-
   historikken). **Dette er trolig den mest arbeidskrevende enkeltfilen** —
   se README.md → «Trekning — oppdatere med ekte data i november», som er
   skrevet for nettopp dette 128-spiller-formatet.
6. `src/lib/demo.ts` — demo-verdenens 12 deltakere og kampresultater bygger
   på World Grand Prix-feltet og må bygges om mot det ekte VM-feltet (eller
   forenkles/fjernes, se TODO.md-punktet om demo-deltakeren).
7. `src/data/playerPhotos.ts` / `src/data/playerStats.ts` — inneholder nå
   KUN World Grand Prix-feltet (32 spillere). Det gamle 128-spiller-
   innholdet må hentes fra git-historikken igjen (`git log -p -- src/data/playerStats.ts`).

## Rebrand-tekst (World Grand Prix → VM) — resten av de 40 filene

Alle disse har bokstavelig «World Grand Prix» (eller «World Grand
Prix-Spillet») hardkodet et sted, uten egen kode-kommentar. Fellesnevner: søk
og erstatt med riktig VM-ordlyd, og bytt blått fargeskjema tilbake til det
opprinnelige (grønn/rød) der det er nevnt.

**i18n-ordbøker** (norsk + engelsk versjon av hver — se etter `appName`,
tittel-tekster, «PDC World Grand Prix»-referanser):
`src/i18n/dictionaries/{no,en}/common.ts`,
`src/i18n/dictionaries/{no,en}/deltaker.ts`,
`src/i18n/dictionaries/{no,en}/tipp.ts`,
`src/i18n/dictionaries/{no,en}/players.ts`,
`src/i18n/dictionaries/{no,en}/legal.ts`

**Side-metadata (browser-tittel/description):**
`src/app/finn/layout.tsx`, `src/app/tipp/layout.tsx`, `src/app/vm-info/layout.tsx`

**E-post:**
`src/lib/email-welcome.ts`, `src/lib/email-broadcast.ts`
(`src/lib/email-daily.ts` har allerede en MIDLERTIDIG-kommentar)

**Admin-panel:**
`src/app/admin/page.tsx`, `src/app/admin/login/page.tsx`,
`src/app/admin/tabs/EpostTab.tsx`

**API-ruter (feilmeldinger/e-post-tekst, ikke logikk):**
`src/app/api/tipp/route.ts`, `src/app/api/send-daily-email/route.ts`,
`src/app/api/magic-link/route.ts`, `src/app/api/admin/send-status-email/route.ts`,
`src/app/api/admin/broadcast/route.ts`, `src/app/api/unsubscribe/route.ts`

**Diverse:**
`src/app/liga/[code]/page.tsx`, `src/components/ShareButton.tsx`,
`src/app/tipp/page.tsx` (kun tekst her — layout-arbeidet fra 2026-09-28
skal IKKE reverteres, bare eventuelle WGP-navn/tall)

## Etter reverteringen

- Kjør `git grep -l "World Grand Prix" -- src` igjen — skal gi **0 treff**.
- Kjør `npm run check` — må være grønt.
- Verifiser visuelt med `tools/verify/` mot noen av de samme flytene som ble
  brukt under generalprøven (se `tools/verify/README.md`).
- Slett denne fila når reverteringen er verifisert og committet.
