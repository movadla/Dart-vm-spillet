# Todo

## Ting du (Morten) må gjøre selv — jeg kan ikke gjøre disse

- [ ] **Spillerfakta i tippe-flyten er eksempeldata** (lagt inn 2026-09-24): `src/data/playerStats.ts` har snitt (three-dart average) og «beste prestasjon» for de 18 valgbare spillerne, alle med `verified: false` — panelet viser en gul «Eksempeldata»-merkelapp så lenge det står slik. Sjekk hver linje mot pdc.tv/Wikipedia, rett opp, og sett `verified: true`. **Snittet må oppdateres like før VM-start** (endrer seg gjennom sesongen). Det finnes ingen gratis PDC-API, så dette er manuelt.
- [ ] **«Vei til finalen» og brakett-pop-upen bygger på eksempel-trekningen** (`src/lib/bracketProjection.ts`) og blir automatisk riktige når den ekte trekningen legges inn medio november — se README «Trekning — oppdatere med ekte data». Fjern «eksempel-trekning»-merknadene i `PlayerDetailPanel.tsx`/`BracketModal.tsx` når det er gjort.
- [ ] **Bildekreditering:** «i»-knappen er fjernet fra kortene (2026-09-24); krediteringen (påkrevd av CC-lisensene) vises nå i spillerpanelet («Foto: …»). Lag i tillegg en samlet liste på info-siden (`/vm-info`) med alle spillerfoto + fotograf + lisens — trygt uansett hvor kortene vises (oppsummering, Min side, leaderboard).
- [ ] **«% valgt»** (`/api/pick-share`) vises først fra 10 deltakere (`MIN_PARTICIPANTS_FOR_SHARE`). Bestem om du vil ha den synlig i det hele tatt før VM — tallet påvirker hva folk velger (flokkeffekt). Ved mange tusen deltakere bør endepunktet flyttes til en DB-view/RPC med `group by` i stedet for å hente alle picks-rader (cachet 60 s nå, så det holder lenge).

- [ ] `! gh auth login` — logg inn på GitHub, så kan jeg opprette repo og pushe
- [ ] **KOBLE TIL SUPABASE (VM-tipping-prosjektet gjenbrukes, egen atskilt
      del) — gjør denne når du er ved PC, steg for steg:**

      **1. Logg inn og finn prosjektet**
      1. Gå til supabase.com/dashboard og logg inn.
      2. Klikk på prosjektet som heter noe med «VM-tipping» (det gamle
         fotball-VM-prosjektet).

      **2. Hent de tre nøklene**
      1. Venstre meny → tannhjulet **Project Settings** (nederst) → **API**.
      2. Kopier ut, én om gangen:
         - **Project URL** (`https://xxxxx.supabase.co`)
         - **anon public** key (under «Project API keys»)
         - **service_role** key (rett under anon — klikk «Reveal» for å vise)
      3. La fanen stå åpen, du trenger den igjen i steg 4.

      **3. Kjør databaseoppsettet**
      1. Venstre meny → **SQL Editor** → **New query**.
      2. Åpne `supabase/schema.sql` i prosjektmappen (i Notisblokk, VS Code
         e.l.), merk alt (Ctrl+A) og kopier (Ctrl+C).
      3. Lim inn i SQL Editor-vinduet (Ctrl+V) og klikk **Run**
         (eller Ctrl+Enter).
      4. Skal gi en grønn «Success»-melding. Feilmelding i stedet? Ikke
         prøv å fikse den selv — lim hele feilteksten inn til meg.

      **4. Eksponer det nye skjemaet (kan IKKE gjøres med SQL)**
      1. Tilbake til **Project Settings → API** (samme sted som steg 2).
      2. Finn seksjonen **Exposed schemas** (kan også hete «Data API» →
         «Exposed schemas», avhengig av Supabase-versjon).
      3. `public` (og kanskje `graphql_public`) står der fra før — legg til
         `dart_vm` i samme liste, og lagre.

      **5. Send meg nøklene**
      Lim inn Project URL + anon key + service role key her i chatten (eller
      opprett `.env.local` selv basert på `.env.example` og si fra), så
      setter jeg opp resten og verifiserer at ekte påmelding fungerer.
- [ ] Bytt ut placeholder-e-posten `kontakt@dart-vm-spillet.no` med din egen, i:
  - `src/app/page.tsx`
  - `src/app/personvern/page.tsx`
  - `reply_to` i `src/app/api/send-daily-email/route.ts` og `src/app/api/admin/send-status-email/route.ts`
- [ ] Sett repo-secreten `APP_BASE_URL` i GitHub (Settings → Secrets and variables → Actions) når appen er deployet, så `snapshot-ranks.yml` fungerer
- [ ] Fysisk mappenavn-bytte (`cl-spillet` → `dart-vm-spillet`) — kan ikke gjøres fra en økt som selv kjører i mappen. Gjør `Rename-Item` selv, eller be meg gjøre det i en ny økt som starter et annet sted
- [ ] Sett opp Vercel-prosjekt og fyll inn alle miljøvariablene fra `.env.example` der
- [ ] Når Vercel-prosjektet er satt opp: bytt lenken i `src/app/admin/page.tsx` («Trafikk»-kortet) fra den generelle `vercel.com/dashboard` til den direkte `/analytics`-lenken for RIKTIG prosjekt — den pekte tidligere feilaktig til det gamle fotball-VM-prosjektets dashbord
- [ ] Nærmere desember: sjekk PDC sin offisielle seeding mot `src/data/pots.ts` (rangeringen der er et øyeblikksbilde fra september og vil ha glidd)
- [ ] Spillerinfo-panelet i tippe-flyten (vises når du velger en spiller) har tre nye felt i `Player`-typen (`src/data/pots.ts`): `titles` (antall PDC-titler), `bestResult2026` (beste resultat så langt i 2026, f.eks. "Kvartfinale i World Matchplay") og `form` (`'dårlig' | 'middels' | 'bra'`). INGEN spiller har noen av disse satt ennå — panelet viser "—"/"Ukjent" for alle. Gi meg tallene/tekstene (eller kilder jeg kan sjekke) så fyller jeg dem inn — ikke noe jeg finner på selv.
- [ ] Fyll inn navn/foretak og adresse under «Behandlingsansvarlig» i `src/app/personvern/page.tsx` (påkrevd etter GDPR art. 13) — kan ikke gjette dette selv
- [ ] Når PDC publiserer den faktiske trekningen (normalt medio november): følg steg-for-steg-oppskriften i `README.md` → «Trekning — oppdatere med ekte data»
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
Littler, resten uten foto ennå).

**Implementert 2026-09-23:** alle 6 potter har nå sin egen fargede kortmal
(`public/cards/template-pot1..6.webp`) — pott 3 er den opprinnelige blå malen
du laget, pott 1/2/4/5/6 er generert programmatisk ved å hue-rotere KUN
is-teksturen (ikke gullkanten/mynt-ikonet) til pottens farge fra
`src/config/potColors.ts`. Ikke håndtegnet kunst, men samme stil/proporsjon
gjenbrukt konsekvent — si fra om du heller vil ha ekte håndlagde maler for
noen/alle pottene senere.

**Implementert 2026-09-23:** antall valgbare kandidater per pott er trimmet fra
2/3/5/6/8/40 til 2/3/4/4/5/5 (topp-N etter PDC-ranking beholdt per pott) — se
`getPickablePlayers()` i `src/data/pots.ts`. De resterende spillerne er fortsatt
med i selve 128-spiller-braketten (eksempel-trekningen viser fortsatt ekte navn),
bare ikke valgbare som tips lenger.

## Revisjonsfunn som gjenstår (2026-09-23)

Fra en 5-delt gjennomgang av hele appen med sikte på internasjonal skala
(tusenvis av deltakere). Det som var reelle, ferdig-fiksbare bugs er
allerede rettet og committet i denne økten (kontoovertakelse-hullene,
race condition i picks-lagring, manglende DB-indekser/constraints,
rate-limiting, tie-breaker, dødt PIN-system som blokkerte all påmelding,
manglende `leagues`/`league_members`-migrasjon, StepSlideshow-
tilgjengelighet m.m.). Det som står igjen under er enten avhengig av
ekte tilkoblinger (Supabase/Resend/Vercel/Sentry) jeg ikke har i denne
økten, eller er større arkitektur-/produktbeslutninger som fortjener
et bevisst valg fra deg fremfor at jeg griper inn på egen hånd.

**Blokkerer for stor/internasjonal skala:**
- [ ] Ingen flerspråklighet — hardkodet norsk tekst i rundt 40 filer,
      `<html lang="no">` hardkodet i `src/app/layout.tsx`. Det klart
      største gjenstående arbeidet; fortjener en egen beslutning om
      bibliotek/locale-routing før noen begynner å kode på det.
- [ ] Leaderboardets poengberegning kjører i Node ved hver sidevisning
      (`src/lib/scoring.ts` + `src/app/leaderboard/page.tsx`) i stedet
      for en DB-view/materialized view — ikke flyttet siden det ikke
      er en ekte database å teste opp mot i denne økten.
- [ ] Manuell resultatinnlegging (admin) skalerer ikke til tusenvis av
      ventende deltakere — organisatorisk begrensning, ikke en kodefiks.
- [ ] Delt admin-hemmelighet, ingen individuelle admin-kontoer, ingen
      audit-trail for admin-handlinger (hvem endret hva er usporbart).
- [ ] Synkron masseutsending av e-post uten kø (`broadcast/route.ts`,
      `send-daily-email/route.ts`) — risiko for at sendingen stopper
      midtveis ved mange mottakere, uten resume/retry.
- [ ] Ingen 2FA på admin-innlogging.

**Bør ha:**
- [ ] `POTS`-spillerdata er en statisk kodefil (`src/data/pots.ts`) —
      krever kodeendring + deploy for hver oppdatering. Bør inn i DB
      ved stor skala.
- [ ] Ingen bekreftet backup-rutine eller overvåkning for
      `participants`/`picks` (uerstattelig data).
- [ ] Sentry er satt opp i kode (`sentry.*.config.ts`) men ikke
      aktivert — mangler `NEXT_PUBLIC_SENTRY_DSN`.
- [ ] E-post faller tilbake til delt `resend.dev`-domene — dårlig
      leveringsgrad i stor skala uten eget verifisert domene
      (SPF/DKIM/DMARC i Resend).
- [ ] Ingen skalerbar support-kanal utover én placeholder-e-post.
- [ ] `admin_login_attempts`-tabellen vokser ubegrenset — ingen
      opprydding/TTL.
- [ ] `snapshot-ranks.yml` har ingen reell feilvarsling ved feil (kun
      GitHubs standard-e-post til repo-eier).
- [ ] `admin_session`-sammenligningen i `src/middleware.ts:10` bruker
      `!==`, ikke konstant-tid. Lav praktisk risiko, men triviell å
      bytte til `secureCompare()` (finnes allerede i
      `src/lib/adminAuth.ts`, brukt i admin-login).
- [ ] Tilgjengelighet er fortsatt tynt dekket i resten av appen (kun
      `StepSlideshow.tsx` er gjennomgått denne runden) — få
      `aria-label`, uverifisert tastaturnavigasjon andre steder.
- [ ] Personvernerklæringen dokumenterer ikke cookie-bruk eksplisitt
      (`admin_session`, `vm_auth` — trolig "strengt nødvendige" og
      dermed unntatt samtykke, men bør stå der for et
      internasjonalt/EU-publikum).
- [ ] `vm_auth`-cookien er den rå, usignerte deltaker-UUID-en —
      fungerer i praksis siden UUID-er er ugjettbare, men selve
      identiteten ER sesjonshemmeligheten. Vurder en signert/kortlevd
      sesjon i tillegg ved større skala.
- [ ] `preview-email`/`send-status-email` er ikke sjekket for samme
      batching/timeout-sårbarhet som `broadcast`/`send-daily-email`.
- [ ] README mangler en "kamp-dag"-runbook for admin (steg-for-steg
      per runde: hent resultater → legg inn → verifiser leaderboard →
      send status-e-post).
- [ ] `KickButton.tsx` sin synlighet ("er jeg liga-eier?") er kun en
      `localStorage`-hint — kan vise/skjule knappen feil ved
      utløpt/manglende økt. Selve kicket er trygt (backend håndhever
      ekte identitet via `vm_auth`) — dette er ren UX-polish.

**Kan vente:**
- [ ] Ligasystemet har medlemstak og kick, men ingen "rapporter
      misbruk"-mekanisme.
- [ ] StepSlideshow: ingen auto-advance (bevisst utelatt — subjektiv
      UX-avgjørelse, si fra om du vil ha det), og eksempelscenarioet
      (Littler vs. samme motstander) er statisk/repeteres likt for
      alle — kan roteres for et stort, gjentakende publikum.
- [ ] Appnavnet "DART-VM-SPILLET" signaliserer norsk "Verdensmesterskap"
      — henger sammen med i18n-/merkevare-arbeidet over.
- [ ] `vm-info/page.tsx` har tidligere vært lappet for gamle
      fotball-lenker — verdt å dobbeltsjekke at alle delte/eksterne
      lenker faktisk peker riktig.

## Periodisk

- [ ] Kjør en ny grundig gjennomgang av hele appen (som den 31-punkts-revisjonen 2026-09-22/23) — sikkerhet, feilhåndtering, testdekning, GDPR, tilgjengelighet, ytelse, admin-UX, leftover-referanser til gamle prosjekter. Gjør dette:
  - [ ] Én gang til før spillet faktisk åpnes for ekte deltakere
  - [ ] Én gang til etter at ekte PDC-trekning og spillerfelt er lagt inn i november
  - [ ] Deretter med jevne mellomrom (f.eks. hver måned) så lenge spillet er aktivt, eller når du ber om det
