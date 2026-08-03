# VM-tipping 2026

Fantasy-sport-app for FIFA World Cup 2026. Deltakere velger 8 lag (ett fra hver seedingspott) og følger dem gjennom mesterskapet. Poeng beregnes automatisk basert på kampresultater og avansement.

## Tech stack

- **Frontend/Backend:** Next.js 16 (App Router) — TypeScript
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Resultatsync:** football-data.org API (automatisk via cron)
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
| `FOOTBALL_DATA_API_KEY` | API-nøkkel fra football-data.org | ✅ |
| `SYNC_SECRET` | Tilfeldig hemmelighet for å trigge manuell resultatsync | ✅ |
| `ADMIN_SECRET` | Hemmelighet for admin-API-endepunkter | ✅ |
| `RESEND_API_KEY` | API-nøkkel fra Resend (daglig e-post) | ✅ |
| `NEXT_PUBLIC_BASE_URL` | Full URL til appen, f.eks. `https://vm.example.com` | ✅ |

## Arkitektur

```
src/
├── app/
│   ├── page.tsx               # Forside
│   ├── tipp/                  # Registreringsflyten (8-stegs slideshow)
│   ├── deltaker/[id]/         # "Min side" for hver deltaker
│   ├── leaderboard/           # Poengtoppen
│   ├── vm-info/               # Info om VM og regler
│   ├── liga/                  # Private ligaer
│   └── api/
│       ├── sync-results/      # Automatisk resultatsync fra football-data.org
│       ├── admin/             # Admin-endepunkter (krever ADMIN_SECRET)
│       └── ...
├── data/
│   ├── pots.ts                # 48 lag fordelt på 8 potter
│   └── schedule.ts            # Kampprogram (gruppespillet)
├── lib/
│   ├── scoring.ts             # Poengberegning
│   └── teamNames.ts           # Mapping fra football-data.org navn til norske navn
└── config/
    └── scoring.ts             # Poengkonfigurasjon
```

## Poengberegning

Konfigureres i `src/config/scoring.ts`:

| Hendelse | Poeng |
|---|---|
| Mål scoret | 1p per mål |
| Seier | 4p |
| Uavgjort | 1p |
| Videre fra gruppe | 5p |
| Vinner R32 | +8p (kumulativt) |
| Vinner R16 | +12p |
| Vinner QF | +17p |
| Vinner SF | +24p |
| VM-vinner | +32p |

Kamppoeng multipliseres med en underdogs-multiplikator per pott (konfigurerbar). Avansementspoeng er kumulative — et lag som vinner VM får poeng for alle runder.

## Automatisk resultatsync

Kampresultater hentes fra football-data.org og skrives til Supabase automatisk.

**Cron-jobb** (konfigurert i `vercel.json`) kaller `/api/sync-results` regelmessig.

**Manuell trigger:**
```
GET /api/sync-results?secret=<SYNC_SECRET>
```

**Avansement** (hvilken runde et lag nådde) oppdateres via admin-APIet:
```
POST /api/admin/advancement
Headers: x-admin-secret: <ADMIN_SECRET>
Body: { "team": "Brasil", "stage": "sf" }
```

Gyldige stages: `group`, `r32`, `r16`, `qf`, `sf`, `final`, `winner`

## Kjør tester

```bash
npm test
```

25 enhetstester dekker all poengberegningslogikk.

## Database-tabeller (Supabase)

| Tabell | Beskrivelse |
|---|---|
| `participants` | Påmeldte deltakere |
| `picks` | Lagvalg per deltaker (8 rader per person) |
| `match_results` | Kampresultater fra football-data.org |
| `advancement` | Hvilken runde hvert lag nådde |
| `leagues` | Private ligaer |
| `league_members` | Deltakere i ligaer |
