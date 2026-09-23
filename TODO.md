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
- [ ] Når Vercel-prosjektet er satt opp: bytt lenken i `src/app/admin/page.tsx` («Trafikk»-kortet) fra den generelle `vercel.com/dashboard` til den direkte `/analytics`-lenken for RIKTIG prosjekt — den pekte tidligere feilaktig til det gamle fotball-VM-prosjektets dashbord
- [ ] Nærmere desember: sjekk PDC sin offisielle seeding mot `src/data/pots.ts` (rangeringen der er et øyeblikksbilde fra september og vil ha glidd)
- [ ] Fyll inn navn/foretak og adresse under «Behandlingsansvarlig» i `src/app/personvern/page.tsx` (påkrevd etter GDPR art. 13) — kan ikke gjette dette selv
- [ ] Når PDC publiserer den faktiske trekningen (normalt medio november): følg steg-for-steg-oppskriften i `README.md` → «Trekning — oppdatere med ekte data»
- [ ] Spillerkortet bruker nå én ekte bildemal (`public/cards/template-1.webp`, blå/is-stil
      med 2 ikoner — mynt/ODDS og globus/RANKING) for ALLE 6 potter — du sa du ville ha
      én mal PER pott (6 stk), så 5 gjenstår. Lag dem i samme stil/proporsjon
      (1007×1562px, transparent bakgrunn utenfor skjoldformen, ingen tekst bakt inn,
      samme plassering av gull-linjer/ikon-rad som malen du allerede har laget), i
      pottenes farger (rød/gull/blå/grønn/oransje/lilla — se `src/config/potColors.ts`).
      Gi meg filene så kobler jeg dem til riktig pott i `PlayerCard.tsx`.
- [ ] Kun Luke Littler har et ekte spillerfoto på kortet sitt (`src/data/playerPhotos.ts`,
      bildefil i `public/players/`) — hentet fra Wikimedia Commons med verifisert
      CC BY-SA 4.0-lisens, kreditering, og AI-basert bakgrunnsfjerning (rembg). Vil du ha
      foto på flere spillere: finn et CC-lisensiert bilde på Wikimedia Commons (sjekk
      lisensfeltet på filsiden!), gi meg lenken, så laster jeg det ned, fjerner bakgrunnen
      og legger det inn på samme måte. IKKE legg til bilder fra andre kilder (Google-søk,
      pressebilder, sosiale medier) uten at jeg har verifisert lisensen.

**Implementert 2026-09-23:** spillervalget vises som fullstørrelses showcase-kort
i et sentrert grid, bygget på en ekte designet bildemal (ikke lenger CSS/SVG-tegnet
skjoldform) — se `src/components/PlayerCard.tsx`. Ferdig for pott 1 (foto på
Littler, resten uten foto ennå). Trenger 5 flere pott-fargede maler for full
dekning, se punktet over.

**Implementert 2026-09-23:** antall valgbare kandidater per pott er trimmet fra
2/3/5/6/8/40 til 2/3/4/4/5/5 (topp-N etter PDC-ranking beholdt per pott) — se
`getPickablePlayers()` i `src/data/pots.ts`. De resterende spillerne er fortsatt
med i selve 128-spiller-braketten (eksempel-trekningen viser fortsatt ekte navn),
bare ikke valgbare som tips lenger.

## Periodisk

- [ ] Kjør en ny grundig gjennomgang av hele appen (som den 31-punkts-revisjonen 2026-09-22/23) — sikkerhet, feilhåndtering, testdekning, GDPR, tilgjengelighet, ytelse, admin-UX, leftover-referanser til gamle prosjekter. Gjør dette:
  - [ ] Én gang til før spillet faktisk åpnes for ekte deltakere
  - [ ] Én gang til etter at ekte PDC-trekning og spillerfelt er lagt inn i november
  - [ ] Deretter med jevne mellomrom (f.eks. hver måned) så lenge spillet er aktivt, eller når du ber om det
