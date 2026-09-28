// Snitt (three-dart average) og beste prestasjon per valgbar spiller — vises
// i spillerinfo-panelet i tippe-flyten (PlayerDetailPanel).
//
// Kryssjekket 2026-09-27 mot dartsorakel.com/Wikipedia for World Grand
// Prix 2026-generalprøven (rullerende 12-måneders snitt, ikke et offisielt
// PDC-sesongsnitt — finnes ikke). Det finnes ingen gratis PDC-API, så dette
// må vedlikeholdes manuelt: oppdater `avg` like før hver turnering (snittet
// endrer seg gjennom sesongen). Se WGP_PIVOT_REVERT.md for hva som må inn
// igjen for det ekte VM-feltet i desember.
export interface PlayerStats {
  /** Three-dart average for inneværende sesong, f.eks. 98.42 */
  avg?: number
  /** Spillerens beste prestasjon noensinne, én kort linje */
  bestAchievement: string
}

export const PLAYER_STATS: Record<string, PlayerStats> = {
  'Luke Littler':        { avg: 101.2, bestAchievement: 'VM-vinner 2025' },
  'Luke Humphries':      { avg: 100.9, bestAchievement: 'VM-vinner 2024' },
  'Gian van Veen':       { avg: 97.8,  bestAchievement: 'PDC World Youth Champion 2023' },
  'Michael van Gerwen':  { avg: 98.6,  bestAchievement: 'VM-vinner 2014, 2017 og 2019' },
  'Gerwyn Price':        { avg: 97.9,  bestAchievement: 'VM-vinner 2021' },
  'Jonny Clayton':       { avg: 96.4,  bestAchievement: 'Premier League-vinner 2021' },
  'James Wade':          { avg: 95.8,  bestAchievement: 'World Matchplay-vinner 2007' },
  'Josh Rock':           { avg: 97.1,  bestAchievement: 'World Cup-vinner 2023 (Nord-Irland)' },
  'Stephen Bunting':     { avg: 96.9,  bestAchievement: 'BDO-verdensmester 2014' },
  'Wessel Nijman':       { avg: 95.6,  bestAchievement: 'Players Championship-vinner 2024' },
  'Gary Anderson':       { avg: 96.2,  bestAchievement: 'VM-vinner 2015 og 2016' },
  'Ryan Searle':         { avg: 95.1,  bestAchievement: 'Players Championship-vinner' },
  'Ross Smith':          { avg: 95.4,  bestAchievement: 'European Championship-vinner 2022' },
  'Rob Cross':           { avg: 96.0,  bestAchievement: 'VM-vinner 2018' },
  'Jermaine Wattimena':  { avg: 94.7,  bestAchievement: 'Players Championship-vinner' },
  'Luke Woodhouse':      { avg: 94.3,  bestAchievement: 'Players Championship-vinner' },
  'Krzysztof Ratajski':  { avg: 94.5,  bestAchievement: 'World Grand Prix-semifinalist 2020' },
  'Danny Noppert':       { avg: 95.7,  bestAchievement: 'European Championship-vinner 2021' },
  'Chris Dobey':         { avg: 94.8,  bestAchievement: 'Players Championship-vinner' },
  'Nathan Aspinall':     { avg: 94.6,  bestAchievement: 'UK Open-vinner 2022' },
  'Kevin Doets':            { avg: 95.6, bestAchievement: 'Players Championship 13-vinner 2026' },
  'Andrew Gilding':         { avg: 93.0, bestAchievement: 'UK Open-vinner 2023' },
  "William O'Connor":       { avg: 93.1, bestAchievement: 'Players Championship 13-vinner 2019' },
  'Damon Heta':             { avg: 94.2, bestAchievement: 'World Cup of Darts-vinner 2022 (Australia)' },
  'Ryan Joyce':             { avg: 91.4, bestAchievement: 'VM-kvartfinalist 2019' },
  'Dirk van Duijvenbode':   { avg: 95.5, bestAchievement: 'World Grand Prix-finalist 2020' },
  'Niels Zonneveld':        { avg: 94.2, bestAchievement: 'Players Championship 22-finalist 2025' },
  'Cameron Menzies':        { avg: 92.9, bestAchievement: 'WDF VM-semifinalist 2022' },
  'Niko Springer':          { avg: 91.9, bestAchievement: 'Hungarian Darts Trophy-vinner 2025' },
  'Dave Chisnall':          { avg: 90.5, bestAchievement: 'VM-semifinalist 2021' },
  'Sebastian Białecki':     { avg: 92.0, bestAchievement: 'Players Championship 22-vinner 2025' },
  'Joe Cullen':             { avg: 92.6, bestAchievement: 'Masters-vinner 2022' },
}
