# Grand Slam of Darts 2026 — hva som gjenstår

Gren: `grand-slam` (ikke pushet/deployet per 2026-10-08). Spillet: velg 4 spillere
(én fra hver av 4 potter), vinneren deler premien; har ingen vinneren, går den til
dem som har spilleren som kom lengst. Turnering: 2026-11-14 → 2026-11-22.
Se også `WGP_PIVOT_REVERT.md` (hva grenen har slettet/skrevet om) og
`LESSONS_LEARNED_WGP.md` (feil vi ikke skal gjenta).

Merkelapper: **[Morten]** kun du kan gjøre det · **[PDC]** venter på ekstern info ·
**[Beslutning]** du må velge · **[Claude]** kan gjøres i en økt.

## 1. Blokkert av ekstern info (kan ikke gjøres før)

- [ ] **[PDC] De 48 spillerne** — endelig felt kjent etter Tour Card Holder Qualifier **2026-11-06**; trekningen kommer etter det. Bytt hele `FIELD` i `src/data/pots.ts` (navn, nasjonalitet, `pdcRanking`, `seedNumber`, odds). Nå står de 32 fra World Grand Prix som plassholder.
- [ ] **[PDC] Vinnerodds fra en ekte, navngitt kilde.** Ingen Grand Slam-marked var publisert 2026-10-08 (Oddschecker sin `/winner`-side finnes ikke ennå). Pott-rekkefølgen er plassholder til da. Bestem et fast «frysetidspunkt» etter trekningen slik at pottene ikke endrer seg mens folk melder seg på, og kreditér kilden i appen. Aldri gjett (leksjon 4 og 11).
- [ ] **[PDC] Klokkeslett for første kamp.** `KICKOFF` er konservativt 00:00 norsk tid 2026-11-14 (= `2026-11-13T23:00:00Z`). Oppdater når programmet er publisert, og kjør tidssone-sjekken i kommentaren i `tournament.ts` (leksjon 1). Sjekk også om grupperundene spilles over flere kvelder (leksjon 2).
- [ ] **[PDC] Stadienavn og format i PDC-APIet (turnering 10871).** `stages` var tom. Kontroller at `STAGE_NAME_MAP`/`stageKeyFor` i `api/sync-pdc-results` treffer, og hvor mange som går videre fra de 16 gruppene (`STAGE_ORDER` antar 16 → «Siste 16», IKKE bekreftet). Test synken mot ekte fixtures så snart de finnes.
- [ ] **[Claude, men trenger feltet] Snitt og beste prestasjon** for spillere som mangler i `playerStats.ts` — ingen gratis API, må legges inn manuelt og kryssjekkes.
- [ ] **[Claude, men trenger feltet] Spillerfoto** for nye spillere (kun CC-lisens fra Wikimedia Commons, kreditert i `playerPhotos.ts`; se `docs/PLAYER_PHOTO_DATABANK.md`). Uten foto vises initialer-plassholderen.
- [ ] **Tidsvindu:** feltet er ferdig 11-06, turneringen starter 11-14 → påmeldingen kan åpne tidligst da og er åpen i høyst ~8 dager. Planlegg lanseringen deretter.

## 2. Beslutninger du må ta

- [ ] **[Beslutning] Penger/premie.** Hvem betaler inn, hva er premien, hvordan utbetales den? Avklar mot norsk regelverk (Lotteritilsynet / pengespill) FØR lansering — jeg er ikke sikker på hvor grensen går. Hvis det samles inn utbetalingsinfo må personvernerklæringen (`legal.ts`) og påmeldingsflyten utvides (GDPR art. 13).
- [ ] **[Beslutning] Spiller trekker seg/blir diskvalifisert etter påmelding.** Ingen endringer er tillatt etter start. Skal deltakere med en slik spiller beholde den (og bare ha tre i live), eller få bytte før første kamp? Trenger en regel i «Regler».
- [ ] **[Beslutning] Vis hvor mye hver får?** Beløp per deltaker («Din andel: X kr») krever kjent premiebeløp.
- [ ] **[Beslutning] Skal «% valgt» vises etter at påmeldingen er stengt?** (Skjult nå, av strategiske grunner.)
- [ ] **[Beslutning] Navnet «Grand Slam-Spillet»** er mitt forslag (følger mønsteret fra «World Grand Prix-Spillet»). Bekreft, og se om domenet/lenker skal følge.
- [ ] **[Beslutning] Potstørrelsene 4/4/6/resten** med 48 spillere gir en pott 4 på 34. Greit, eller flere/færre i de øverste pottene? (`POT_SIZES` i `pots.ts`.)
- [ ] **[Beslutning] Overføring til VM:** «ingen kom ut av gruppespillet → premien overføres» er min tolkning av grensetilfellet. Bekreft.

## 3. Data og drift

- [ ] **[Claude + din godkjenning] Nullstille databasen.** `picks`, `match_results` og deltakere inneholder World Grand Prix-data (6 valg per deltaker, andre potter, gamle stadier som `r1`/`r2`). `.env.local` peker på PRODUKSJON — ikke send inn ekte påmelding lokalt. Ta backup først, slett deretter (destruktivt — spør før jeg kjører det).
- [ ] **[Claude] De 96 botene** lages på nytt med 4 valg (én per pott, varierte navn og lag — verifiser variasjon, leksjon 5). Domenet `@dart-vm-test.no` beholdes. De teller med i premiedelingen (avgjort).
- [ ] **[Beslutning/Claude] Utrullingsrekkefølge.** Vercel deployer fra GitHub og deler Supabase-prosjekt/miljøvariabler: nullstill databasen FØR grenen merges til `master`, ellers viser produksjon 6-valgs-data i 4-pott-grensesnittet. Alternativ: eget Vercel-prosjekt/skjema for Grand Slam.
- [ ] **[Morten] GitHub-secrets** `APP_BASE_URL` og `SYNC_SECRET` (se `TODO.md`) — uten dem kjører ikke den automatiske resultatsynken (hvert 10. minutt).
- [ ] **[Claude] Synken** (`api/sync-pdc-results`): (a) normaliser diakritiske tegn i navn i stedet for `NAME_FIXUPS`-listen (flere navn = flere avvik), (b) la svaret liste navn som ikke traff noen spiller, (c) enhetstester for `stageKeyFor` (ingen tester finnes), (d) bruk gruppetabellen fra APIet hvis den finnes i stedet for å utlede «ute» fra kvartfinalestart.
- [ ] **[Claude] Admin: premie-visning.** Det finnes ingen admin-side som viser «hvem deler premien nå» (nivå, antall, e-poster til utbetaling). `computePrizeStanding` finnes — mangler bare visning (og eksport).
- [ ] **[Claude] Admin: bulk-registrering** av gruppespillkamper (48+ kamper) — test `api/admin/match-result/bulk` med realistisk datamengde.
- [ ] `stage` i DB har `default 'r1'` (`schema.sql`) — ufarlig siden alt sendes med stage, men misvisende; rydd ved neste skjemaendring.

## 4. E-post (bevisst utsatt, men må gjøres før den skrus på)

- [ ] **[Claude] Skriv om malene** `src/lib/email-welcome.ts`, `email-daily.ts`, `email-broadcast.ts` — dagsmailen forteller fortsatt om poeng og «poeng siden i går» (satt til 0 midlertidig i rutene, med TODO). Ny innhold: beste nivå, hvem som deler, gårsdagens resultater.
- [ ] **[Morten] Resend + domene** (DNS i Domeneshop) — se `TODO.md`. `vercel.json` kjører `/api/send-daily-email` kl. 07:00 UTC hver dag, så snart `RESEND_API_KEY` er satt.
- [ ] Botene må ekskluderes fra utsendelser (`@dart-vm-test.no`).
- [ ] Admin → E-post: teksten «statusmailen med poeng» (`EpostTab.tsx`).

## 5. Kvalitet og opprydding

- [ ] **[Claude] Døde rester etter poengmodellen:** `TeamTile` sin `points`-prop, `formatPoints`/`POINTS_SUFFIX` i `lib/format.ts`, ubrukte dictionary-nøkler (`deltaker.pointsDelta`, `playerDetailPanel.pathToFinal/potentialPathTitle/noTop16/seeFullDraw/nextMatch`, `vmInfo.tabs.draw`), `lib/rankSnapshot`-navngivning.
- [ ] **[Claude] Navngivning:** `RankEntry.points` og API-feltene `points` betyr nå «nivå» — omdøp til `level` så ingen misforstår (berører `RankList`, `leaderboard-preview`, `league/*`, admin).
- [ ] **[Claude] Mobil (390×600):** pott 4 med valg fra listen passer uten scroll, men hurtiginfo-linjen kutter «beste prestasjon» til «…» når «Se alle»-knappen står ved siden av «Detaljer». Det tomme stat-feltet på «Se alle»-kortet viser en liten myntkant øverst til venstre.
- [ ] **[Claude] Tilgjengelighet:** nye `PlayerListSheet` trenger fokusfelle og tastaturtest; kjør Lighthouse på pick-steget (som i revisjonen 2026-09-25).
- [ ] **[Claude] Tester:** ingen komponent-/ende-til-ende-tester finnes (kun manuell `tools/verify`). Legg til test for `finishLabel`/`finishShortLabel`, og en ende-til-ende for «velg 4 → registrer» mot en test-database (ikke produksjon).
- [ ] **[Claude] Språk:** engelske tekster jeg skrev raskt trenger en gjennomlesning av noen med engelsk som førstespråk.
- [ ] **[Claude] README.md** beskriver fortsatt 6 potter og poeng (AGENTS.md er oppdatert).
- [ ] **[Claude] Statusmerkelapp:** en gruppevinner som venter på første sluttspillkamp vises som «Gruppespill» — «Venter på siste 16» ville vært tydeligere når programmet er kjent.

## 6. Forbedringer som passer formatet (valgfritt)

- [ ] **Gruppe-visning:** vis hver spillers gruppe («Gruppe C») i Spillere-fanen og på Min side når trekningen er ute, og neste kamp/klokkeslett fra APIets fixtures — erstatter «neste kamper»-seksjonen som ble fjernet. Spesielt nyttig for folk som ikke kjenner spillerne.
- [ ] **Avsløring etter stengt påmelding:** vis «de mest valgte spillerne» når påmeldingen er lukket (spillet er da ikke lenger påvirkelig).
- [ ] **Delbar «din andel»-kort** etter finalen (bruker `ShareButton` + OG-bilde).

## 7. Før lansering — kjør alltid

- [ ] `npm run check` (grønt) og `git grep -n -i "world grand prix" -- src public` (kun kommentarer/spillerfakta skal gjenstå).
- [ ] Verifiser KICKOFF med `toLocaleString('nb-NO', {timeZone:'Europe/Oslo'})` rett før lansering og igjen rett før første kamp.
- [ ] Test pick-flyten på 430×900 OG 390×600; test med ekte (ikke demo-)data mot en test-database.
- [ ] Ny grundig gjennomgang (`TODO.md → Periodisk`) etter at det ekte feltet er lagt inn.
