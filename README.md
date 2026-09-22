# Dart-VM-spillet

Fantasy-tippespill for PDC World Darts Championship. Deltakere velger én dartspiller fra hver av 6 potter (seedingsnivåer) og følger dem gjennom det rene utslagsbrakettet. Poeng beregnes ut fra hvor langt hver spiller avanserer i turneringen.

## Tech stack

- **Frontend/Backend:** Next.js 16 (App Router) — TypeScript
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Resultater:** lagt inn manuelt av admin (ingen fri live-API for PDC-darts)
- **E-post:** Resend
- **Tester:** Vitest

## Kom i gang lokalt

```bash
npm install
cp .env.example .env.local   # fyll inn verdier (se under)
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000).

## Miljøvariabler

Alle miljøvariabler settes i Vercel-dashboardet (Settings → Environment Variables). For lokal utvikling, lag en `.env.local`-fil.

| Variabel | Beskrivelse | Påkrevd |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side) | ✅ |
| `ADMIN_SECRET` | Hemmelighet for admin-API-endepunkter | ✅ |
| `RESEND_API_KEY` | API-nøkkel fra Resend (daglig e-post) | ✅ |
| `NEXT_PUBLIC_BASE_URL` | Full URL til appen, f.eks. `https://dartvm.example.com` | ✅ |

## Arkitektur

```
src/
├── app/
│   ├── page.tsx               # Forside
│   ├── tipp/                  # Registreringsflyten (6-stegs slideshow, ett per pott)
│   ├── deltaker/[id]/         # "Min side" for hver deltaker
│   ├── leaderboard/           # Poengtoppen
│   ├── vm-info/               # Info om turneringen, reglene og trekningen
│   ├── liga/                  # Private ligaer
│   ├── admin/                 # Manuell registrering av kampresultater
│   └── api/
│       ├── admin/             # Admin-endepunkter (krever ADMIN_SECRET)
│       └── ...
├── data/
│   └── pots.ts                 # 6 potter med dartspillere (PDC-seeding)
├── lib/
│   ├── scoring.ts               # Poengberegning (avledet direkte fra match_results)
│   └── bracketProjection.ts     # Deterministisk eksempel-trekning (128 spillere, ingen walkover)
└── config/
    └── scoring.ts               # Poengkonfigurasjon
```

## Poengberegning

Konfigureres i `src/config/scoring.ts`. Enkel modell — alt avledes direkte fra registrerte kampresultater, ingen separat avansement-tracking:

| Hendelse | Poeng |
|---|---|
| Per vunnet sett | 1p |
| Per kampseier (avansement) | 2p |
| For å vinne hele turneringen | +5p |

Alt legges sammen fortløpende gjennom turneringen, og summen ganges med en underdogs-multiplikator per pott: pott 1–2 = ×1, pott 3–4 = ×2, pott 5 = ×3, pott 6 = ×4.

Pott 1 er kun en duell mellom verdens to beste (#1 og #2), deretter utvides potten nedover: pott 2 (3 spillere), pott 3 (5), pott 4 (6), pott 5 (8), pott 6 (resten — useedede/kvalifiserte).

Validert med `scripts/simulate-scoring-suspense.ts` — 1000 simulerte turneringer med 50 tilfeldige deltakere for å sjekke at ledelsen ikke låses for tidlig.

## Trekning — oppdatere med ekte data i november

PDC har ikke publisert den faktiske trekningen ennå (kommer normalt medio november). `src/lib/bracketProjection.ts` genererer en deterministisk eksempel-trekning for hele 128-spiller-braketten (rent utslagsspill, ingen walkover) basert på standard turneringsseeding, tydelig merket som eksempel i UI-et — under `/vm-info` (fanen «Trekning») og når man velger spiller i `/tipp`.

Slik oppdaterer du med ekte data når trekningen er kjent:

1. **Sjekk feltstørrelsen først.** Hele modellen (`STAGE_ORDER` i `src/config/scoring.ts`, antall runder i braketten) er bygget for **128 spillere uten walkover**. Sjekk PDC sin offisielle trekning — er det et annet antall spillere, eller har noen bye i runde 1, må `bracketProjection.ts` og `STAGE_ORDER` justeres strukturelt, ikke bare data-verdiene. Dette er den delen som mest sannsynlig krever hjelp fra Claude/en utvikler, ikke en ren tekst-oppdatering.
2. **Oppdater spillerlisten i `src/data/pots.ts`.** Pott 1–5 (de 32 seedede) bør stemme med PDC sin offisielle seeding-liste på trekningstidspunktet — juster `seedNumber`/`pdcRanking` om noen har flyttet på seg siden `pots.ts` sist ble oppdatert (kommentaren øverst i filen viser datoen for gjeldende øyeblikksbilde). Pott 6 sine 32 navngitte useedede spillere og de resterende plasseringsspillerne (`Kvalifisert spiller 1`–`64` i `bracketProjection.ts`) erstattes med det faktiske kvalifiserte feltet.
3. **Erstatt selve trekningen.** `R1_MATCHES` i `bracketProjection.ts` er i dag *generert* (via `seedOrder()` + en deterministisk stokking) — ikke den ekte trekningen. Når PDC sin offisielle trekning foreligger, bytt ut generering-logikken med en hardkodet liste av de 64 faktiske runde 1-parene, i samme format: `[navn, navn][]`. Resten av filen (seed-labels, bracket-seksjoner) fungerer uendret så lenge `R1_MATCHES` har riktig format og alle 32 seedede spillerne faktisk finnes i den.
4. **Kjør testene** (`npm test`) — `bracketProjection.test.ts` sjekker strukturelle invarianter (64 kamper, 128 distinkte spillere, seed 1/2 i hver sin halvdel) som bør holde uansett hvor dataene kommer fra.

## Cron-jobber

`vercel.json` har en tom `crons`-liste med vilje — de to daglige jobbene (statusmail,
rang-snapshot) kjøres i stedet via GitHub Actions (`.github/workflows/`), siden Vercel sin
gratis Hobby-plan begrenser cron til én jobb i døgnet. Se kommentaren øverst i
`.github/workflows/snapshot-ranks.yml` for hvilke repo-secrets som må settes.

## Manuell resultatregistrering

Det finnes ingen fri live-API for PDC-darts, så alle kampresultater legges inn manuelt via `/admin`: spiller 1/spiller 2, sett 1/sett 2, runde — skrives til `match_results`. Poengsum, hvilken runde en spiller har nådd, og hvem som er slått ut, avledes automatisk derfra.

## Kjør tester

```bash
npm test
```

Enhetstester dekker poengberegningslogikken (`src/lib/scoring.test.ts`) og trekningslogikken (`src/lib/bracketProjection.test.ts`).

## Database-tabeller (Supabase)

| Tabell | Beskrivelse |
|---|---|
| `participants` | Påmeldte deltakere |
| `picks` | Spillervalg per deltaker (6 rader per person) |
| `match_results` | Manuelt registrerte kampresultater — eneste kilde til poeng og status |
| `leagues` | Private ligaer |
| `league_members` | Deltakere i ligaer |

Se `supabase/schema.sql` for et nytt oppsett, eller `supabase/migrate_to_darts.sql` for å migrere en eksisterende `cl-spillet`/`vm-tipping`-database.
