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
│   ├── tipp/                  # Registreringsflyten (5-stegs slideshow, ett per pott)
│   ├── deltaker/[id]/         # "Min side" for hver deltaker
│   ├── leaderboard/           # Poengtoppen
│   ├── vm-info/               # Info om turneringen og reglene
│   ├── liga/                  # Private ligaer
│   ├── admin/                 # Manuell registrering av kampresultater og avansement
│   └── api/
│       ├── admin/             # Admin-endepunkter (krever ADMIN_SECRET)
│       └── ...
├── data/
│   └── pots.ts                 # 6 potter med dartspillere (PDC-seeding)
├── lib/
│   └── scoring.ts               # Poengberegning (rent avansement-basert)
└── config/
    └── scoring.ts               # Poengkonfigurasjon
```

## Poengberegning

Konfigureres i `src/config/scoring.ts`. PDC-VM er et rent utslagsspill uten gruppespill, så poeng kommer utelukkende fra hvor langt en spiller avanserer — kumulativt gjennom rundene:

| Runde | Poeng (kumulativt) |
|---|---|
| 1. runde | 5 |
| 2. runde | 10 |
| 3. runde | 20 |
| 4. runde | 30 |
| Kvartfinale | 45 |
| Semifinale | 65 |
| Finale | 90 |
| VM-vinner | 125 |

Poengsummen multipliseres med en underdogs-multiplikator per pott: pott 1–2 = ×1, pott 3–4 = ×2, pott 5 = ×3, pott 6 = ×4.

Pott 1 er kun en duell mellom verdens to beste (#1 og #2), deretter utvides potten nedover: pott 2 (3 spillere), pott 3 (5), pott 4 (6), pott 5 (8), pott 6 (resten — useedede/kvalifiserte).

## Manuell resultatregistrering

Det finnes ingen fri live-API for PDC-darts, så alle kampresultater og avansement legges inn manuelt via `/admin`:

- **Kampresultat:** spiller 1/spiller 2, sett 1/sett 2, runde — skrives til `match_results`.
- **Avansement:** hvilken runde en spiller har nådd — skrives til `advancement` og styrer poengsummen direkte.

## Kjør tester

```bash
npm test
```

Enhetstester dekker poengberegningslogikken (`src/lib/scoring.test.ts`).

## Database-tabeller (Supabase)

| Tabell | Beskrivelse |
|---|---|
| `participants` | Påmeldte deltakere |
| `picks` | Spillervalg per deltaker (5 rader per person) |
| `match_results` | Manuelt registrerte kampresultater |
| `advancement` | Hvilken runde hver spiller har nådd |
| `leagues` | Private ligaer |
| `league_members` | Deltakere i ligaer |

Se `supabase/schema.sql` for et nytt oppsett, eller `supabase/migrate_to_darts.sql` for å migrere en eksisterende `cl-spillet`/`vm-tipping`-database.
