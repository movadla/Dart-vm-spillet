# Todo

## Ting du (Morten) må gjøre selv — jeg kan ikke gjøre disse

- [ ] `! gh auth login` — logg inn på GitHub, så kan jeg opprette repo og pushe
- [ ] Opprett et Supabase-prosjekt (eller gi meg nøklene til et eksisterende) og fyll ut `.env.local`
- [ ] Kjør migrasjonene i `supabase/` mot den ekte databasen, i rekkefølge — se `README.md` → «Database-tabeller»
- [ ] Bytt ut placeholder-e-posten `kontakt@dart-vm-spillet.no` med din egen, i:
  - `src/app/page.tsx`
  - `src/app/personvern/page.tsx`
  - `reply_to` i `src/app/api/send-daily-email/route.ts` og `src/app/api/admin/send-status-email/route.ts`
- [ ] Sett repo-secreten `APP_BASE_URL` i GitHub (Settings → Secrets and variables → Actions) når appen er deployet, så `snapshot-ranks.yml` fungerer
- [ ] Fysisk mappenavn-bytte (`cl-spillet` → `dart-vm-spillet`) — kan ikke gjøres fra en økt som selv kjører i mappen. Gjør `Rename-Item` selv, eller be meg gjøre det i en ny økt som starter et annet sted
- [ ] Sett opp Vercel-prosjekt og fyll inn alle miljøvariablene fra `.env.example` der
- [ ] Nærmere desember: sjekk PDC sin offisielle seeding mot `src/data/pots.ts` (rangeringen der er et øyeblikksbilde fra september og vil ha glidd)
- [ ] Når PDC publiserer den faktiske trekningen (normalt medio november): følg steg-for-steg-oppskriften i `README.md` → «Trekning — oppdatere med ekte data»
- [ ] Spillerkortene (`src/components/PlayerCard.tsx`) viser nå «SNITT 2026» og «STØRSTE
      HINDER» som «—» — vi har ikke ekte data for disse to for noen av de 64 spillerne.
      Enten research/fyll inn dette selv (per spiller: three-dart average for 2026-sesongen,
      og hvilken runde/motstander som historisk har vært vanskeligst), eller si fra om
      feltene skal fjernes/erstattes hvis det blir for mye jobb å vedlikeholde per spiller.
- [ ] Kun Luke Littler har et ekte spillerfoto på kortet sitt (`src/data/playerPhotos.ts`,
      bildefil i `public/players/`) — hentet fra Wikimedia Commons med verifisert
      CC BY-SA 4.0-lisens og kreditering. Vil du ha foto på flere spillere: finn et
      CC-lisensiert bilde på Wikimedia Commons (sjekk lisensfeltet på filsiden!), gi meg
      lenken, så laster jeg det ned og legger det inn på samme måte. IKKE legg til bilder
      fra andre kilder (Google-søk, pressebilder, sosiale medier) uten at jeg har
      verifisert lisensen — se `PLAYER_PHOTOS`-kommentaren for hvorfor.

## Idéer til senere (produktvurderinger, ikke bestemt ennå)

- [ ] Færre kandidater per pott (i dag: 2/3/5/6/8/mange i pott 6) — vurder et mer kuratert,
      strammere utvalg per nivå. Blir ekstra aktuelt nå som spillerkortene er store
      «Ultimate Darts»-stil showcase-kort (se under) — pott 6 sine 40 kort gir mye scrolling.

**Implementert 2026-09-23:** spillervalget vises nå som fullstørrelses, «Ultimate
Darts»-inspirerte kort (skjoldform, gullramme, pott-farget bakgrunn, stats) —
se `src/components/PlayerCard.tsx`. Bygget og visuelt verifisert for pott 1 og 2;
resten av pottene bruker samme komponent uendret, men er ikke separat visuelt
gjennomgått ennå (jf. punktet over om usikkerhet rundt endelig kandidatantall).

## Periodisk

- [ ] Kjør en ny grundig gjennomgang av hele appen (som den 31-punkts-revisjonen 2026-09-22/23) — sikkerhet, feilhåndtering, testdekning, GDPR, tilgjengelighet, ytelse, admin-UX, leftover-referanser til gamle prosjekter. Gjør dette:
  - [ ] Én gang til før spillet faktisk åpnes for ekte deltakere
  - [ ] Én gang til etter at ekte PDC-trekning og spillerfelt er lagt inn i november
  - [ ] Deretter med jevne mellomrom (f.eks. hver måned) så lenge spillet er aktivt, eller når du ber om det
