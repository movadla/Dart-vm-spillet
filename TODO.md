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

## Idéer til senere (produktvurderinger, ikke bestemt ennå)

- [ ] Færre kandidater per pott (i dag: 2/3/5/6/8/mange i pott 6) — vurder et mer kuratert,
      strammere utvalg per nivå
- [ ] Til gjengjeld: vis flere detaljer per spiller når man utforsker/velger (i dag bare
      navn, nasjonalitet, PDC-ranking, odds) — f.eks. nylig form, historikk, statistikk

## Periodisk

- [ ] Kjør en ny grundig gjennomgang av hele appen (som den 31-punkts-revisjonen 2026-09-22/23) — sikkerhet, feilhåndtering, testdekning, GDPR, tilgjengelighet, ytelse, admin-UX, leftover-referanser til gamle prosjekter. Gjør dette:
  - [ ] Én gang til før spillet faktisk åpnes for ekte deltakere
  - [ ] Én gang til etter at ekte PDC-trekning og spillerfelt er lagt inn i november
  - [ ] Deretter med jevne mellomrom (f.eks. hver måned) så lenge spillet er aktivt, eller når du ber om det
