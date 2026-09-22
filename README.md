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

## Trekning

PDC har ikke publisert den faktiske trekningen ennå (kommer normalt medio november). `src/lib/bracketProjection.ts` genererer en deterministisk eksempel-trekning for hele 128-spiller-braketten (rent utslagsspill, ingen walkover) basert på standard turneringsseeding, tydelig merket som eksempel i UI-et — under `/vm-info` (fanen «Trekning») og når man velger spiller i `/tipp`. Bytt ut med ekte data når trekningen er kjent.

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
