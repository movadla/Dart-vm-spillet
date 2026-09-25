<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Dart-VM-spillet — arbeidsregler for agenter

Tippespill for PDC World Darts Championship: deltakere velger én dartspiller fra
hver av 6 potter og får poeng per vunnet sett/kamp (× pott-multiplikator).
Norsk UI. Mappenavnet `cl-spillet` er historisk (fotball-VM-forløper) — appen
heter Dart-VM-spillet.

## Kommandoer

| Hva | Kommando |
|---|---|
| Alt som må være grønt før commit | `npm run check` (tsc + eslint + vitest) |
| Produksjonsbygg | `npm run build` |
| Dev-server (bruk port 3001 — 3000 er opptatt av et annet prosjekt) | `npx next dev -p 3001` |
| Dev + Cloudflare-tunnel til mobil | `npm run tunnel` (start-dev.ps1) |
| Visuell verifisering i headless Chrome | `npm run verify -- <url> tools/verify/<flow>.js [shot.jpg]` — se `tools/verify/README.md` |

Restart av dev-server fra en agent (Windows): `taskkill //PID <pid> //T //F` på
PID-en fra `netstat -ano | grep ":3001 "`, deretter `npx next dev -p 3001` i
bakgrunnen. Turbopack-HMR mister av og til endringer — restart før verifisering.

**Aldri `next build` mens dev-serveren kjører** — begge bruker samme `.next`-
mappe, og et bygg midt i en dev-økt korrumperer Turbopacks worker-prosesser
(«Jest worker encountered N child process exceptions» → alle sider 500, også
etter at bygget er ferdig). Skjer det: stopp dev-serveren, `rm -rf .next`, og
start den på nytt. Vil du kjøre `npm run build` for å verifisere et bygg,
stopp dev-serveren først (eller vent til økten er ferdig med den).

## Hvor ting ligger

```
src/config/      tournament.ts (KICKOFF — eneste kilde), scoring.ts, potColors.ts, theme.ts (SPORT, CARD_*)
src/data/        pots.ts (spillere/potter), playerStats.ts, playerPhotos.ts (CC-kreditering)
src/lib/         scoring.ts (poeng), ranking.ts (rene tabeller), participantData.ts (I/O: Supabase eller demo),
                 demo.ts (fiktiv deltaker/ligaer/kamper), bracketProjection.ts (eksempel-trekning), format.ts (nb-NO)
src/components/  delte UI-biter: BrandBanner, Countdown, TeamTile, RankList, PlayerCard, PlayerDetailPanel, LeagueSection …
src/app/         ruter. Sideinterne komponenter ligger ved siden av page.tsx (deltaker/[id]/MyTeam.tsx, tipp/ProgressDots.tsx)
src/app/api/     route handlers. admin/* krever checkAdminAuth(); skriving for deltakere krever vm_auth-cookie
supabase/        schema.sql = hele databasen (skjema dart_vm). legacy/ = historikk, ikke kjør
tools/verify/    CDP-harness + flyter
docs/            PLAYER_PHOTO_DATABANK.md (bildekilder/lisenser)
TODO.md          det brukeren må gjøre selv + åpne revisjonsfunn
```

## Harde regler

- **Supabase-prosjektet deles med vm-tipping.** Aldri rør `public`-skjemaet; alt vårt
  ligger i `dart_vm` (`db: { schema: 'dart_vm' }` i supabaseAdmin.ts).
- `getSupabaseAdmin()` kalles **inne i** handleren/siden, i `try/catch` der siden
  skal overleve manglende konfig. Aldri på modulnivå.
- Datoen for VM-start finnes **kun** i `src/config/tournament.ts`.
- Demo-verdenen (`src/lib/demo.ts`) slår bare inn for id `demo`/`demo-N`, kodene
  `DEMO01/02` og cookien `vm_demo`. Den skal aldri blande seg med ekte data.
- Åpne endepunkter rate-limites per IP med `src/lib/rateLimit.ts` (tabell `rate_limit_hits`).
- Spillerfoto: kun CC-lisensierte bilder fra Wikimedia Commons med kreditering i
  `playerPhotos.ts`. PDC/Paddy Power-logoer, plakater og merch er varemerker — aldri.
- Commit-meldinger på norsk, med Co-Authored-By-linjen fra system-reminderen.

## Design-konvensjoner (bruker-godkjent gjennom tre gjennomganger)

- Fonten `SPORT` (Barlow Condensed) kun på titler, navn og tall — aldri brødtekst.
- Minste tekst 11–12 px; dempet tekst aldri under `rgba(255,255,255,0.55)`.
- Tall på norsk via `src/lib/format.ts`: «41 p», «12 %», «2,50» (smalt hardt mellomrom, komma).
- Alle sider: `className="page-bg app-frame"`, `<BrandBanner compact />`, nav-rad med
  `back-btn`, eyebrow (12 px, 0.15em) over `<h1>` i SPORT. Knapper er piller (`borderRadius: 999`).
- Laget vises alltid med `TeamTile` (foto på pott-farge). Kort bruker `CARD_GRADIENT`/`CARD_SHADOW`.
- Ikke bland `border`-shorthand med `borderBottom` osv. i samme style-objekt (React-advarsel).
- Min side skal være ren for hjelpetekst (brukeren fjernet all forklaringstekst der).
- Verifiser visuelt med harnesset før du sier noe er ferdig; se på skjermbildene.
