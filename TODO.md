# Todo

## Ting du (Morten) må gjøre selv — jeg kan ikke gjøre disse

**Løst 2026-09-27/28 (generalprøve mot World Grand Prix er nå live i produksjon):**
GitHub-repo opprettet og koblet til (`gh auth login` gjort), Vercel-prosjekt
satt opp med miljøvariabler, `dart_vm`-skjemaet kjørt og eksponert i Supabase,
og ekte påmelding verifisert på selve produksjons-URL-en
(https://dart-vm-spillet.vercel.app). De tidligere «HASTER»/«KOBLE TIL
SUPABASE»/«sett opp Vercel»-punktene som lå her er dermed unødvendige og
fjernet — se git-historikk (commit-ene rundt 2026-09-27) hvis du trenger
detaljene om hvordan det ble gjort.

**VIKTIG — full sjekkliste for å bytte tilbake til det ekte VM i desember
ligger nå i egen fil: [`WGP_PIVOT_REVERT.md`](WGP_PIVOT_REVERT.md).** Ikke
stol på å søke etter «MIDLERTIDIG» alene — den fila lister alle ~40 filer
med World Grand Prix-tekst, ikke bare de som har en kode-kommentar.

- [ ] **Spillerfakta i tippe-flyten er kryssjekket denne runden (2026-09-27),
      men verifiser på nytt før VM i desember**: `src/data/playerStats.ts`
      har snitt (three-dart average) og «beste prestasjon» for World Grand
      Prix-feltet. Den gule «Eksempeldata»-merkelappen og `verified`-feltet
      er fjernet fra grensesnittet (var dødt kode-spor) — snittet må uansett
      oppdateres manuelt like før hver turnering, siden det ikke finnes noen
      gratis PDC-API.
- [ ] **«Vei til finalen» og brakett-pop-upen bygger på den ekte, bekreftede
      runde 1-trekningen for World Grand Prix** (`src/lib/bracketProjection.ts`)
      — dette er IKKE lenger eksempeldata for denne turneringen. Se
      `WGP_PIVOT_REVERT.md` for hva som må inn igjen (eksempel-trekning) når
      appen peker mot VM i desember igjen, siden den ekte VM-trekningen ikke
      er kjent før medio november.
**Fjernet 2026-09-25:** «% valgt» i spillerpanelet (og `/api/pick-share`) — del av en opprydding for å gjøre panelet enklere/raskere å lese. Si fra om du vil ha den tilbake (den løste seg selv unna spørsmålet i den gamle TODO-linjen om flokkeffekt).

- [ ] **Demo-deltakeren** (lagt inn 2026-09-24, se README → «Demo-deltaker»): `/finn` med `demo@dart-vm-spillet.no` → `/deltaker/demo`. Bestem før lansering om demoen skal være tilgjengelig i produksjon (den er harmløs og helt atskilt fra ekte data, men `/deltaker/demo` er en offentlig URL). Vil du fjerne den: slett demo-grenene i `src/lib/participantData.ts` og `src/app/api/finn/route.ts` (+ `league/mine`), så er `src/lib/demo.ts` død kode.
- [ ] Bytt ut placeholder-e-posten `kontakt@dart-vm-spillet.no` med din egen, i:
  - `src/app/page.tsx`
  - `src/app/personvern/page.tsx`
  - `reply_to` i `src/app/api/send-daily-email/route.ts` og `src/app/api/admin/send-status-email/route.ts`
- [ ] Sett repo-secreten `APP_BASE_URL` i GitHub (Settings → Secrets and variables → Actions), så `snapshot-ranks.yml` fungerer
- [ ] Fysisk mappenavn-bytte (`cl-spillet` → `dart-vm-spillet`) — kan ikke gjøres fra en økt som selv kjører i mappen. Gjør `Rename-Item` selv, eller be meg gjøre det i en ny økt som starter et annet sted
- [ ] Bytt lenken i `src/app/admin/tabs/StatistikkTab.tsx` («Trafikk»-kortet) fra den generelle `vercel.com/dashboard` til den direkte `/analytics`-lenken for det ekte Vercel-prosjektet — jeg vet ikke team-slug-en din, så jeg vil ikke gjette URL-en
- [ ] Nærmere desember: sjekk PDC sin offisielle seeding mot `src/data/pots.ts` (rangeringen der er et øyeblikksbilde fra september og vil ha glidd)
- [ ] **E-post er bevisst utsatt til det ekte VM i desember** (avgjort 2026-09-28, midt i oppsettet mot `mail.vmspillet.com` i Resend — ingenting ble fullført: ingen DNS-poster ble lagt til i Domeneshop, `RESEND_API_KEY`/`EMAIL_DOMAIN` er fortsatt tomme i Vercel). Det halvferdige, uverifiserte `mail.vmspillet.com`-domenet kan trygt ignoreres eller slettes i Resend. Ta opp igjen tråden nærmere desember: Resend-konto finnes fra før (samme konto som ble brukt til det opprinnelige fotball-vm-spillet), bare legg til et nytt domene (f.eks. samme `mail.vmspillet.com`, eller `mail.<nytt domene>` hvis nettsiden da ligger et annet sted) og følg DNS-stegene på nytt.
- [ ] Fyll inn navn/foretak og adresse under «Behandlingsansvarlig» i `src/app/personvern/page.tsx` (påkrevd etter GDPR art. 13) — kan ikke gjette dette selv
- [ ] Når PDC publiserer den faktiske trekningen (normalt medio november): følg steg-for-steg-oppskriften i `README.md` → «Trekning — oppdatere med ekte data»

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
- [x] **Løst 2026-09-25:** Norsk/engelsk tospråklighet for hele deltaker-
      flaten (forsiden, /finn, /tipp inkl. hele intro-slideshowet, Min side,
      leaderboard, liga, vm-info-guiden, personvern, feilsider, alle 12
      ikke-admin API-rutenes feilmeldinger). Ingen URL-prefiks — én cookie
      (`vm_locale`) styrer språket, auto-detektert fra nettleserens
      Accept-Language ved første besøk (`src/proxy.ts`), med en synlig
      NO/EN-bryter brukeren selv kan overstyre den med. Hånd-rullet
      ordbok-arkitektur i `src/i18n/dictionaries/{no,en}/*.ts` — ikke et
      bibliotek som next-intl, se `src/app/layout.tsx` og
      `src/lib/i18n/getLocale.ts`/`useLocale.ts` for hvordan det henger
      sammen. Admin-panelet forblir bevisst norsk (kun du bruker det).
      **Uttrykkelig utenfor denne runden** (egen beslutning senere):
      - E-postmalene (`email-welcome.ts`/`email-daily.ts`/`email-broadcast.ts`)
        sendes asynkront (cron/påmelding) uten en request å lese språk-
        cookien fra — krever en lagret `participants.language`-kolonne for
        å vite hvilket språk en gitt e-post skal sendes på.
      - `src/app/api/unsubscribe/route.ts` sin frittstående HTML-side
        (rendres direkte fra ruten, ikke via React/dictionaries-laget).
      - `/`, `/finn`, `/personvern`, `/tipp` og `/vm-info` gikk fra statisk
        til dynamisk rendret (`next build` viser `ƒ` i stedet for `○`) siden
        de nå leser språk-cookien server-side — ubetydelig kostnad gitt
        appens skala, men verdt å vite om trafikken en dag blir stor nok
        til at det merkes.
- [ ] Leaderboardets poengberegning kjører i Node ved hver sidevisning
      (`src/lib/scoring.ts` + `src/app/leaderboard/page.tsx`) i stedet
      for en DB-view/materialized view — ikke flyttet siden det ikke
      er en ekte database å teste opp mot i denne økten.
- [ ] Manuell resultatinnlegging (admin) skalerer ikke til tusenvis av
      ventende deltakere — organisatorisk begrensning, ikke en kodefiks.
- [x] **Løst 2026-09-25:** Audit-logg for admin-handlinger lagt til
      (`admin_audit_log`-tabell, `src/lib/adminAudit.ts`, alle 7
      mutasjons-endepunkter i `/api/admin/*`, vises i admin → Verktøy).
      Delt admin-hemmelighet uten individuelle kontoer er fortsatt en
      begrensning — loggen sier HVA og NÅR, ikke HVEM.
- [ ] Synkron masseutsending av e-post uten kø (`broadcast/route.ts`,
      `send-daily-email/route.ts`) — risiko for at sendingen stopper
      midtveis ved mange mottakere, uten resume/retry.
- [ ] Ingen 2FA på admin-innlogging.
- [ ] Ingen Content-Security-Policy ennå (øvrige sikkerhetsheadere er på plass i `next.config.ts`) — krever at inline-stiler flyttes ut eller nonce-oppsett; flagcdn.com og Vercel Analytics må hvitelistes.
- [x] **Løst 2026-09-25:** Daglig e-post er nå satt opp som cron i `vercel.json` (`0 7 * * *`) — trer i kraft når prosjektet deployes til Vercel med `CRON_SECRET` satt som miljøvariabel.

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
- [ ] Tilgjengelighet er fortsatt tynt dekket i resten av appen. **Lagt
      til 2026-09-25:** en ekte Lighthouse-kjøring (produksjonsbygg, 5
      sider) fant og fikk fikset `label-content-name-mismatch` i
      `TeamBuildAnimation.tsx` og bildeforvrengning i `Flag.tsx`, pluss
      manglende `aria-label` på ✕-lukkeknappene i `DeltakereTab.tsx`/
      `LigaerTab.tsx`. Ingen flere Lighthouse-funn på de 5 sidene som
      ble testet, men resten av appen (spesielt admin) er ikke
      systematisk gjennomgått — uverifisert tastaturnavigasjon andre steder.
- [x] **Løst 2026-09-25:** Personvernerklæringen dokumenterer nå
      cookie-bruk eksplisitt (`vm_auth`, `admin_session`, `vm_demo` —
      alle "strengt nødvendige", ikke samtykkepliktige) i en egen
      seksjon i `src/app/personvern/page.tsx`.
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
