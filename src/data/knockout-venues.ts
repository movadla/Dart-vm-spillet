export interface KnockoutVenueMatch {
  round: 'r32' | 'r16' | 'qf' | 'sf' | 'bronze' | 'final'
  label: string
  venue: string   // matcher venues.ts name-felt
  date?: string   // YYYY-MM-DD
  time?: string   // HH:MM CEST
}

// FIFA 2026 sluttspill — venue-tildelinger og resultater.
// Verifisert 2026-07-05 mot FIFA.com, ESPN, Sky Sports og Al Jazeera sine kamprapporter
// (se også KNOCKOUT_CHANNEL i schedule.ts, som har de samme R32/R16-datoene i CEST).
// Tidligere versjon av denne filen hadde R32 satt til 21.-28. juni og R16 til 28. juni
// – 2. juli, én uke for tidlig i begge tilfeller (reelt: R32 28.06-04.07, R16 04.-07.07).
// SF2 var også satt til Levi's Stadium — feil, FIFA bekreftet Mercedes-Benz Stadium (Atlanta).
export const KNOCKOUT_VENUES: KnockoutVenueMatch[] = [
  // ── Finale ──
  { round: 'final',  label: 'Finale',        venue: 'MetLife Stadium',       date: '2026-07-19', time: '21:00' },

  // ── Semifinaler ──
  { round: 'sf',     label: 'Semifinale 1',  venue: 'AT&T Stadium',          date: '2026-07-14', time: '21:00' },
  { round: 'sf',     label: 'Semifinale 2',  venue: 'Mercedes-Benz Stadium', date: '2026-07-15', time: '21:00' },

  // ── Bronsefinale ──
  { round: 'bronze', label: 'Bronsefinale',  venue: 'Hard Rock Stadium',     date: '2026-07-18', time: '23:00' },

  // ── Kvartfinaler ──
  { round: 'qf', label: 'Marokko/Frankrike – vinner går til SF1',              venue: 'Gillette Stadium',   date: '2026-07-09', time: '22:00' },
  { round: 'qf', label: 'Spania/Portugal – USA/Belgia',                        venue: 'SoFi Stadium',       date: '2026-07-10', time: '21:00' },
  { round: 'qf', label: 'Brasil/Norge – Mexico/England',                       venue: 'Hard Rock Stadium',  date: '2026-07-11', time: '23:00' },
  { round: 'qf', label: 'Argentina/Egypt – Sveits/Colombia',                   venue: 'Arrowhead Stadium',  date: '2026-07-12', time: '03:00' },

  // ── Åttendedelsfinaler (R16) ──
  { round: 'r16', label: 'Canada 0–3 Marokko',        venue: 'NRG Stadium',             date: '2026-07-04', time: '19:00' },
  { round: 'r16', label: 'Paraguay 0–1 Frankrike',     venue: 'Lincoln Financial Field',  date: '2026-07-04' },
  { round: 'r16', label: 'Norge – Brasil',              venue: 'MetLife Stadium',          date: '2026-07-05', time: '22:00' },
  { round: 'r16', label: 'Mexico – England',            venue: 'Estadio Azteca',           date: '2026-07-06', time: '02:00' },
  { round: 'r16', label: 'Portugal – Spania',           venue: 'AT&T Stadium',             date: '2026-07-06', time: '21:00' },
  { round: 'r16', label: 'USA – Belgia',                 venue: 'Lumen Field',              date: '2026-07-07', time: '02:00' },
  { round: 'r16', label: 'Argentina/Kapp Verde – Egypt', venue: 'Mercedes-Benz Stadium',    date: '2026-07-07', time: '18:00' },
  { round: 'r16', label: 'Sveits – Colombia',            venue: 'BC Place',                 date: '2026-07-07', time: '22:00' },

  // ── Sekstendedelsfinaler (R32) ──
  { round: 'r32', label: 'Sør-Afrika 0–1 Canada',            venue: 'SoFi Stadium',            date: '2026-06-28', time: '21:00' },
  { round: 'r32', label: 'Brasil 2–1 Japan',                  venue: 'NRG Stadium',             date: '2026-06-29', time: '19:00' },
  { round: 'r32', label: 'Tyskland 1–1 Paraguay (str.)',       venue: 'Gillette Stadium',        date: '2026-06-29', time: '22:30' },
  { round: 'r32', label: 'Nederland 1–1 Marokko (str.)',       venue: 'Estadio BBVA',            date: '2026-06-30', time: '03:00' },
  { round: 'r32', label: 'Elfenbenskysten 1–2 Norge',          venue: 'AT&T Stadium',            date: '2026-06-30', time: '19:00' },
  { round: 'r32', label: 'Frankrike 3–0 Sverige',              venue: 'MetLife Stadium',         date: '2026-06-30', time: '23:00' },
  { round: 'r32', label: 'Mexico 2–0 Ecuador',                 venue: 'Estadio Azteca',          date: '2026-07-01', time: '03:00' },
  { round: 'r32', label: 'England 2–1 Congo DR',               venue: 'Mercedes-Benz Stadium',   date: '2026-07-01', time: '18:00' },
  { round: 'r32', label: 'Belgia 3–2 Senegal (e.o.)',          venue: 'Lumen Field',             date: '2026-07-01', time: '22:00' },
  { round: 'r32', label: 'USA 2–0 Bosnia-Hercegovina',         venue: 'Lumen Field',             date: '2026-07-02', time: '02:00' },
  { round: 'r32', label: 'Spania 3–0 Østerrike',               venue: 'SoFi Stadium',            date: '2026-07-02', time: '21:00' },
  { round: 'r32', label: 'Portugal 2–1 Kroatia',               venue: 'BMO Field',               date: '2026-07-03', time: '01:00' },
  { round: 'r32', label: 'Sveits 2–0 Algerie',                 venue: 'BC Place',                date: '2026-07-03', time: '05:00' },
  { round: 'r32', label: 'Australia 1–1 Egypt (str.)',         venue: 'AT&T Stadium',            date: '2026-07-03', time: '20:00' },
  { round: 'r32', label: 'Argentina 3–2 Kapp Verde (e.o.)',    venue: 'Hard Rock Stadium',       date: '2026-07-04', time: '00:00' },
  { round: 'r32', label: 'Colombia 1–0 Ghana',                 venue: 'Arrowhead Stadium',       date: '2026-07-04', time: '03:30' },
]
