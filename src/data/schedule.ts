export interface Match {
  id: string
  date: string // "2026-06-11"
  time: string // "HH:MM" (CEST / norsk sommertid)
  home: string
  away: string
  venue: string
  group: string
  stage: 'group'
  channel?: 'NRK1' | 'TV 2' // norsk TV-kanal (NRK/TV2 deler rettighetene)
}

export const GROUP_SCHEDULE: Match[] = [
  // ── Gruppe A ──────────────────────────────────────────────────────────────
  { id: 'm001', date: '2026-06-11', time: '21:00', home: 'Mexico',     away: 'Sør-Afrika', venue: 'Estadio Azteca, Mexico City',     group: 'A', stage: 'group' },
  { id: 'm002', date: '2026-06-12', time: '04:00', home: 'Sør-Korea',  away: 'Tsjekkia',   venue: 'Estadio Akron, Guadalajara',      group: 'A', stage: 'group' },
  { id: 'm003', date: '2026-06-18', time: '18:00', home: 'Tsjekkia',   away: 'Sør-Afrika', venue: 'Mercedes-Benz Stadium, Atlanta',  group: 'A', stage: 'group' },
  { id: 'm004', date: '2026-06-19', time: '03:00', home: 'Mexico',     away: 'Sør-Korea',  venue: 'Estadio Akron, Guadalajara',      group: 'A', stage: 'group' },
  { id: 'm005', date: '2026-06-25', time: '03:00', home: 'Tsjekkia',   away: 'Mexico',     venue: 'Estadio Azteca, Mexico City',     group: 'A', stage: 'group' },
  { id: 'm006', date: '2026-06-25', time: '03:00', home: 'Sør-Afrika', away: 'Sør-Korea',  venue: 'Estadio BBVA, Monterrey',         group: 'A', stage: 'group' },

  // ── Gruppe B ──────────────────────────────────────────────────────────────
  { id: 'm007', date: '2026-06-12', time: '21:00', home: 'Canada',            away: 'Bosnia-Hercegovina', venue: 'BMO Field, Toronto',           group: 'B', stage: 'group' },
  { id: 'm008', date: '2026-06-13', time: '21:00', home: 'Qatar',             away: 'Sveits',             venue: 'Levi\'s Stadium, San Jose',    group: 'B', stage: 'group' },
  { id: 'm009', date: '2026-06-18', time: '21:00', home: 'Sveits',            away: 'Bosnia-Hercegovina', venue: 'SoFi Stadium, Los Angeles',    group: 'B', stage: 'group' },
  { id: 'm010', date: '2026-06-19', time: '00:00', home: 'Canada',            away: 'Qatar',              venue: 'BC Place, Vancouver',          group: 'B', stage: 'group' },
  { id: 'm011', date: '2026-06-24', time: '21:00', home: 'Sveits',            away: 'Canada',             venue: 'BC Place, Vancouver',          group: 'B', stage: 'group' },
  { id: 'm012', date: '2026-06-24', time: '21:00', home: 'Bosnia-Hercegovina', away: 'Qatar',             venue: 'Lumen Field, Seattle',         group: 'B', stage: 'group' },

  // ── Gruppe C ──────────────────────────────────────────────────────────────
  { id: 'm013', date: '2026-06-14', time: '00:00', home: 'Brasil',   away: 'Marokko',   venue: 'MetLife Stadium, New York',            group: 'C', stage: 'group' },
  { id: 'm014', date: '2026-06-14', time: '03:00', home: 'Haiti',    away: 'Skottland', venue: 'Gillette Stadium, Boston',             group: 'C', stage: 'group' },
  { id: 'm015', date: '2026-06-20', time: '00:00', home: 'Skottland', away: 'Marokko',  venue: 'Gillette Stadium, Boston',             group: 'C', stage: 'group' },
  { id: 'm016', date: '2026-06-20', time: '02:30', home: 'Brasil',   away: 'Haiti',     venue: 'Lincoln Financial Field, Philadelphia', group: 'C', stage: 'group' },
  { id: 'm017', date: '2026-06-25', time: '00:00', home: 'Skottland', away: 'Brasil',   venue: 'Hard Rock Stadium, Miami',             group: 'C', stage: 'group' },
  { id: 'm018', date: '2026-06-25', time: '00:00', home: 'Marokko',  away: 'Haiti',     venue: 'Mercedes-Benz Stadium, Atlanta',       group: 'C', stage: 'group' },

  // ── Gruppe D ──────────────────────────────────────────────────────────────
  { id: 'm019', date: '2026-06-13', time: '03:00', home: 'USA',       away: 'Paraguay',  venue: 'SoFi Stadium, Los Angeles',  group: 'D', stage: 'group' },
  { id: 'm020', date: '2026-06-14', time: '06:00', home: 'Australia', away: 'Tyrkia',    venue: 'BC Place, Vancouver',        group: 'D', stage: 'group' },
  { id: 'm021', date: '2026-06-19', time: '21:00', home: 'USA',       away: 'Australia', venue: 'Lumen Field, Seattle',       group: 'D', stage: 'group' },
  { id: 'm022', date: '2026-06-20', time: '05:00', home: 'Tyrkia',    away: 'Paraguay',  venue: 'Levi\'s Stadium, San Jose',  group: 'D', stage: 'group' },
  { id: 'm023', date: '2026-06-26', time: '04:00', home: 'Tyrkia',    away: 'USA',       venue: 'SoFi Stadium, Los Angeles',  group: 'D', stage: 'group' },
  { id: 'm024', date: '2026-06-26', time: '04:00', home: 'Paraguay',  away: 'Australia', venue: 'Levi\'s Stadium, San Jose',  group: 'D', stage: 'group' },

  // ── Gruppe E ──────────────────────────────────────────────────────────────
  { id: 'm025', date: '2026-06-14', time: '19:00', home: 'Tyskland',        away: 'Curaçao',        venue: 'NRG Stadium, Houston',                 group: 'E', stage: 'group' },
  { id: 'm026', date: '2026-06-15', time: '01:00', home: 'Elfenbenskysten', away: 'Ecuador',        venue: 'Lincoln Financial Field, Philadelphia', group: 'E', stage: 'group' },
  { id: 'm027', date: '2026-06-20', time: '22:00', home: 'Tyskland',        away: 'Elfenbenskysten', venue: 'BMO Field, Toronto',                   group: 'E', stage: 'group' },
  { id: 'm028', date: '2026-06-21', time: '02:00', home: 'Ecuador',         away: 'Curaçao',        venue: 'Arrowhead Stadium, Kansas City',        group: 'E', stage: 'group' },
  { id: 'm029', date: '2026-06-25', time: '22:00', home: 'Curaçao',         away: 'Elfenbenskysten', venue: 'Lincoln Financial Field, Philadelphia', group: 'E', stage: 'group' },
  { id: 'm030', date: '2026-06-25', time: '22:00', home: 'Ecuador',         away: 'Tyskland',       venue: 'MetLife Stadium, New York',             group: 'E', stage: 'group' },

  // ── Gruppe F ──────────────────────────────────────────────────────────────
  { id: 'm031', date: '2026-06-14', time: '22:00', home: 'Nederland', away: 'Japan',    venue: 'AT&T Stadium, Dallas',       group: 'F', stage: 'group' },
  { id: 'm032', date: '2026-06-15', time: '04:00', home: 'Sverige',   away: 'Tunisia',  venue: 'Estadio BBVA, Monterrey',    group: 'F', stage: 'group' },
  { id: 'm033', date: '2026-06-20', time: '19:00', home: 'Nederland', away: 'Sverige',  venue: 'NRG Stadium, Houston',       group: 'F', stage: 'group' },
  { id: 'm034', date: '2026-06-21', time: '06:00', home: 'Tunisia',   away: 'Japan',    venue: 'Estadio BBVA, Monterrey',    group: 'F', stage: 'group' },
  { id: 'm035', date: '2026-06-26', time: '01:00', home: 'Japan',     away: 'Sverige',  venue: 'AT&T Stadium, Dallas',       group: 'F', stage: 'group' },
  { id: 'm036', date: '2026-06-26', time: '01:00', home: 'Tunisia',   away: 'Nederland', venue: 'Arrowhead Stadium, Kansas City', group: 'F', stage: 'group' },

  // ── Gruppe G ──────────────────────────────────────────────────────────────
  { id: 'm037', date: '2026-06-15', time: '21:00', home: 'Belgia',      away: 'Egypt',       venue: 'Lumen Field, Seattle',      group: 'G', stage: 'group' },
  { id: 'm038', date: '2026-06-16', time: '03:00', home: 'Iran',        away: 'New Zealand', venue: 'SoFi Stadium, Los Angeles', group: 'G', stage: 'group' },
  { id: 'm039', date: '2026-06-21', time: '21:00', home: 'Belgia',      away: 'Iran',        venue: 'SoFi Stadium, Los Angeles', group: 'G', stage: 'group' },
  { id: 'm040', date: '2026-06-22', time: '03:00', home: 'New Zealand', away: 'Egypt',       venue: 'BC Place, Vancouver',       group: 'G', stage: 'group' },
  { id: 'm041', date: '2026-06-27', time: '05:00', home: 'Egypt',       away: 'Iran',        venue: 'Lumen Field, Seattle',      group: 'G', stage: 'group' },
  { id: 'm042', date: '2026-06-27', time: '05:00', home: 'New Zealand', away: 'Belgia',      venue: 'BC Place, Vancouver',       group: 'G', stage: 'group' },

  // ── Gruppe H ──────────────────────────────────────────────────────────────
  { id: 'm043', date: '2026-06-15', time: '18:00', home: 'Spania',       away: 'Kapp Verde',   venue: 'Mercedes-Benz Stadium, Atlanta', group: 'H', stage: 'group' },
  { id: 'm044', date: '2026-06-16', time: '00:00', home: 'Saudi-Arabia', away: 'Uruguay',      venue: 'Hard Rock Stadium, Miami',       group: 'H', stage: 'group' },
  { id: 'm045', date: '2026-06-21', time: '18:00', home: 'Spania',       away: 'Saudi-Arabia', venue: 'Mercedes-Benz Stadium, Atlanta', group: 'H', stage: 'group' },
  { id: 'm046', date: '2026-06-22', time: '00:00', home: 'Uruguay',      away: 'Kapp Verde',   venue: 'Hard Rock Stadium, Miami',       group: 'H', stage: 'group' },
  { id: 'm047', date: '2026-06-27', time: '02:00', home: 'Kapp Verde',   away: 'Saudi-Arabia', venue: 'NRG Stadium, Houston',           group: 'H', stage: 'group' },
  { id: 'm048', date: '2026-06-27', time: '02:00', home: 'Uruguay',      away: 'Spania',       venue: 'Estadio Akron, Guadalajara',     group: 'H', stage: 'group' },

  // ── Gruppe I ──────────────────────────────────────────────────────────────
  { id: 'm049', date: '2026-06-16', time: '21:00', home: 'Frankrike', away: 'Senegal', venue: 'MetLife Stadium, New York',            group: 'I', stage: 'group' },
  { id: 'm050', date: '2026-06-17', time: '00:00', home: 'Irak',      away: 'Norge',   venue: 'Gillette Stadium, Boston',             group: 'I', stage: 'group' },
  { id: 'm051', date: '2026-06-22', time: '23:00', home: 'Frankrike', away: 'Irak',    venue: 'Lincoln Financial Field, Philadelphia', group: 'I', stage: 'group' },
  { id: 'm052', date: '2026-06-23', time: '02:00', home: 'Norge',     away: 'Senegal', venue: 'MetLife Stadium, New York',            group: 'I', stage: 'group' },
  { id: 'm053', date: '2026-06-26', time: '21:00', home: 'Norge',     away: 'Frankrike', venue: 'Gillette Stadium, Boston',           group: 'I', stage: 'group' },
  { id: 'm054', date: '2026-06-26', time: '21:00', home: 'Senegal',   away: 'Irak',    venue: 'BMO Field, Toronto',                   group: 'I', stage: 'group' },

  // ── Gruppe J ──────────────────────────────────────────────────────────────
  { id: 'm055', date: '2026-06-17', time: '03:00', home: 'Argentina', away: 'Algerie',  venue: 'Arrowhead Stadium, Kansas City', group: 'J', stage: 'group' },
  { id: 'm056', date: '2026-06-17', time: '06:00', home: 'Østerrike', away: 'Jordan',   venue: 'Levi\'s Stadium, San Jose',      group: 'J', stage: 'group' },
  { id: 'm057', date: '2026-06-22', time: '19:00', home: 'Argentina', away: 'Østerrike', venue: 'AT&T Stadium, Dallas',          group: 'J', stage: 'group' },
  { id: 'm058', date: '2026-06-23', time: '05:00', home: 'Jordan',    away: 'Algerie',  venue: 'Levi\'s Stadium, San Jose',      group: 'J', stage: 'group' },
  { id: 'm059', date: '2026-06-28', time: '04:00', home: 'Algerie',   away: 'Østerrike', venue: 'AT&T Stadium, Dallas',          group: 'J', stage: 'group' },
  { id: 'm060', date: '2026-06-28', time: '04:00', home: 'Jordan',    away: 'Argentina', venue: 'Arrowhead Stadium, Kansas City', group: 'J', stage: 'group' },

  // ── Gruppe K ──────────────────────────────────────────────────────────────
  { id: 'm061', date: '2026-06-17', time: '19:00', home: 'Portugal',  away: 'Congo DR',   venue: 'NRG Stadium, Houston',          group: 'K', stage: 'group' },
  { id: 'm062', date: '2026-06-18', time: '04:00', home: 'Usbekistan', away: 'Colombia',  venue: 'Estadio Azteca, Mexico City',   group: 'K', stage: 'group' },
  { id: 'm063', date: '2026-06-23', time: '19:00', home: 'Portugal',  away: 'Usbekistan', venue: 'NRG Stadium, Houston',          group: 'K', stage: 'group' },
  { id: 'm064', date: '2026-06-24', time: '04:00', home: 'Colombia',  away: 'Congo DR',   venue: 'Estadio Akron, Guadalajara',    group: 'K', stage: 'group' },
  { id: 'm065', date: '2026-06-28', time: '01:30', home: 'Colombia',  away: 'Portugal',   venue: 'Hard Rock Stadium, Miami',      group: 'K', stage: 'group' },
  { id: 'm066', date: '2026-06-28', time: '01:30', home: 'Congo DR',  away: 'Usbekistan', venue: 'Mercedes-Benz Stadium, Atlanta', group: 'K', stage: 'group' },

  // ── Gruppe L ──────────────────────────────────────────────────────────────
  { id: 'm067', date: '2026-06-17', time: '22:00', home: 'England', away: 'Kroatia', venue: 'AT&T Stadium, Dallas',                group: 'L', stage: 'group' },
  { id: 'm068', date: '2026-06-18', time: '01:00', home: 'Ghana',   away: 'Panama',  venue: 'BMO Field, Toronto',                  group: 'L', stage: 'group' },
  { id: 'm069', date: '2026-06-23', time: '22:00', home: 'England', away: 'Ghana',   venue: 'Gillette Stadium, Boston',            group: 'L', stage: 'group' },
  { id: 'm070', date: '2026-06-24', time: '01:00', home: 'Panama',  away: 'Kroatia', venue: 'BMO Field, Toronto',                  group: 'L', stage: 'group' },
  { id: 'm071', date: '2026-06-27', time: '23:00', home: 'Panama',  away: 'England', venue: 'MetLife Stadium, New York',           group: 'L', stage: 'group' },
  { id: 'm072', date: '2026-06-27', time: '23:00', home: 'Kroatia', away: 'Ghana',   venue: 'Lincoln Financial Field, Philadelphia', group: 'L', stage: 'group' },
]

// Norsk TV-kanal per sluttspillkamp. Kilde: strim.no «Sendeskjema 16.-/8.-delsfinaler
// fotball-VM» (hentet 2026-07-03) + tidligere nrk.no-kampplan for 1/16-finale.
// Nøkkel: "YYYY-MM-DD HH:MM" (CEST / norsk sommertid).
export const KNOCKOUT_CHANNEL: Record<string, 'NRK1' | 'TV 2'> = {
  // 1/16-finale
  '2026-06-28 21:00': 'NRK1',  // Sør-Afrika – Canada
  '2026-06-29 19:00': 'TV 2',  // Brasil – Japan
  '2026-06-29 22:30': 'NRK1',  // Tyskland – Paraguay
  '2026-06-30 03:00': 'TV 2',  // Nederland – Marokko
  '2026-06-30 19:00': 'TV 2',  // Elfenbenskysten – Norge
  '2026-06-30 23:00': 'TV 2',  // Frankrike – Sverige
  '2026-07-01 03:00': 'TV 2',  // Mexico – Ecuador
  '2026-07-01 18:00': 'NRK1',  // England – DR Kongo
  '2026-07-01 22:00': 'TV 2',  // Belgia – Senegal
  '2026-07-02 02:00': 'NRK1',  // USA – Bosnia-Hercegovina
  '2026-07-02 21:00': 'TV 2',  // Spania – Østerrike
  '2026-07-03 01:00': 'NRK1',  // Portugal – Kroatia
  '2026-07-03 05:00': 'NRK1',  // Sveits – Algerie
  '2026-07-03 20:00': 'TV 2',  // Australia – Egypt
  '2026-07-04 00:00': 'NRK1',  // Argentina – Kapp Verde
  '2026-07-04 03:30': 'TV 2',  // Colombia – Ghana
  // 1/8-finale
  '2026-07-04 19:00': 'NRK1',  // Canada – Marokko
  '2026-07-05 22:00': 'NRK1',  // Norge – Brasil
  '2026-07-06 02:00': 'TV 2',  // Mexico – England
  '2026-07-06 21:00': 'TV 2',  // Portugal – Spania
  '2026-07-07 02:00': 'NRK1',  // USA – Belgia
  '2026-07-07 18:00': 'TV 2',  // Argentina/Kapp Verde – Australia/Egypt
  '2026-07-07 22:00': 'NRK1',  // Sveits – Colombia/Ghana
  // Paraguay – Frankrike (1/8-finale) manglet dato/kanal på strim.no per 2026-07-03
  // Semifinale
  '2026-07-14 21:00': 'TV 2',
  '2026-07-15 21:00': 'TV 2',
  // Bronsefinale og finale
  '2026-07-18 23:00': 'NRK1',
  '2026-07-19 21:00': 'NRK1',
}

// Norsk TV-kanal per gruppekamp. Kilde: strim.no / nettavisen.no «komplett sendeskjema»
// (validert mot NTB: Irak–Norge på TV 2, Norge–Senegal og Norge–Frankrike på NRK1).
export const MATCH_CHANNEL: Record<string, 'NRK1' | 'TV 2'> = {
  m001: 'TV 2', m002: 'NRK1', m003: 'NRK1', m004: 'TV 2', m005: 'TV 2', m006: 'TV 2',
  m007: 'NRK1', m008: 'NRK1', m009: 'TV 2', m010: 'TV 2', m011: 'NRK1', m012: 'NRK1',
  m013: 'TV 2', m014: 'TV 2', m015: 'NRK1', m016: 'NRK1', m017: 'NRK1', m018: 'NRK1',
  m019: 'TV 2', m020: 'TV 2', m021: 'NRK1', m022: 'NRK1', m023: 'NRK1', m024: 'NRK1',
  m025: 'NRK1', m026: 'TV 2', m027: 'TV 2', m028: 'TV 2', m029: 'TV 2', m030: 'TV 2',
  m031: 'TV 2', m032: 'TV 2', m033: 'NRK1', m034: 'NRK1', m035: 'TV 2', m036: 'TV 2',
  m037: 'NRK1', m038: 'NRK1', m039: 'TV 2', m040: 'TV 2', m041: 'TV 2', m042: 'TV 2',
  m043: 'TV 2', m044: 'NRK1', m045: 'NRK1', m046: 'TV 2', m047: 'NRK1', m048: 'NRK1',
  m049: 'TV 2', m050: 'TV 2', m051: 'NRK1', m052: 'NRK1', m053: 'NRK1', m054: 'NRK1',
  m055: 'NRK1', m056: 'NRK1', m057: 'TV 2', m058: 'TV 2', m059: 'NRK1', m060: 'NRK1',
  m061: 'NRK1', m062: 'TV 2', m063: 'TV 2', m064: 'TV 2', m065: 'NRK1', m066: 'NRK1',
  m067: 'TV 2', m068: 'TV 2', m069: 'NRK1', m070: 'NRK1', m071: 'TV 2', m072: 'TV 2',
}
for (const m of GROUP_SCHEDULE) {
  const ch = MATCH_CHANNEL[m.id]
  if (ch) m.channel = ch
}
