// Snitt (three-dart average) og beste prestasjon per valgbar spiller — vises
// i spillerinfo-panelet i tippe-flyten (PlayerDetailPanel).
//
// ALT HER ER EKSEMPELDATA (verified: false) lagt inn 2026-09-24 fra
// hukommelse/åpne kilder — IKKE kontrollert mot PDC. Det finnes ingen gratis
// PDC-API, så dette må vedlikeholdes manuelt: sjekk hver linje mot pdc.tv /
// Wikipedia, sett `verified: true`, og oppdater `avg` like før VM-start
// (snittet endrer seg gjennom sesongen). Se TODO.md. Panelet viser en liten
// «Eksempeldata»-merkelapp så lenge verified er false.
export interface PlayerStats {
  /** Three-dart average for inneværende sesong, f.eks. 98.42 */
  avg?: number
  /** Spillerens beste prestasjon noensinne, én kort linje */
  bestAchievement: string
  /** false = eksempeldata som må kontrolleres før lansering */
  verified: boolean
}

export const PLAYER_STATS: Record<string, PlayerStats> = {
  'Luke Littler':        { avg: 101.2, bestAchievement: 'VM-vinner 2025', verified: false },
  'Luke Humphries':      { avg: 100.9, bestAchievement: 'VM-vinner 2024', verified: false },
  'Gian van Veen':       { avg: 97.8,  bestAchievement: 'PDC World Youth Champion 2023', verified: false },
  'Michael van Gerwen':  { avg: 98.6,  bestAchievement: 'VM-vinner 2014, 2017 og 2019', verified: false },
  'Gerwyn Price':        { avg: 97.9,  bestAchievement: 'VM-vinner 2021', verified: false },
  'Jonny Clayton':       { avg: 96.4,  bestAchievement: 'Premier League-vinner 2021', verified: false },
  'James Wade':          { avg: 95.8,  bestAchievement: 'World Matchplay-vinner 2007', verified: false },
  'Josh Rock':           { avg: 97.1,  bestAchievement: 'World Cup-vinner 2023 (Nord-Irland)', verified: false },
  'Stephen Bunting':     { avg: 96.9,  bestAchievement: 'BDO-verdensmester 2014', verified: false },
  'Wessel Nijman':       { avg: 95.6,  bestAchievement: 'Players Championship-vinner 2024', verified: false },
  'Gary Anderson':       { avg: 96.2,  bestAchievement: 'VM-vinner 2015 og 2016', verified: false },
  'Ryan Searle':         { avg: 95.1,  bestAchievement: 'Players Championship-vinner', verified: false },
  'Ross Smith':          { avg: 95.4,  bestAchievement: 'European Championship-vinner 2022', verified: false },
  'Rob Cross':           { avg: 96.0,  bestAchievement: 'VM-vinner 2018', verified: false },
  'Jermaine Wattimena':  { avg: 94.7,  bestAchievement: 'Players Championship-vinner', verified: false },
  'Luke Woodhouse':      { avg: 94.3,  bestAchievement: 'Players Championship-vinner', verified: false },
  'Martin Schindler':    { avg: 94.9,  bestAchievement: 'European Tour-vinner 2024', verified: false },
  'Krzysztof Ratajski':  { avg: 94.5,  bestAchievement: 'World Grand Prix-semifinalist 2020', verified: false },
  'Danny Noppert':       { avg: 95.7,  bestAchievement: 'European Championship-vinner 2021', verified: false },
  'Chris Dobey':         { avg: 94.8,  bestAchievement: 'Players Championship-vinner', verified: false },
  'Nathan Aspinall':     { avg: 94.6,  bestAchievement: 'UK Open-vinner 2022', verified: false },
}
