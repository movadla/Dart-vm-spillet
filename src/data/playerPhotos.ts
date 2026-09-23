// Ekte spillerfoto — kun for spillere der vi har et bilde med en klarert,
// verifiserbar lisens (Creative Commons fra Wikimedia Commons). ALDRI legg til
// et bilde her uten å sjekke lisensfeltet på selve Commons-filsiden og fylle ut
// `creditUrl` til den siden — kreditering er et lisensvilkår, ikke valgfritt.
// Spillere uten oppføring her faller tilbake til flagg-medaljongen i PlayerCard.
export const PLAYER_PHOTOS: Record<string, { src: string; credit: string; creditUrl: string }> = {
  'Luke Littler': {
    src: '/players/luke-littler.jpg',
    credit: 'Sandro Halank · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:2026-03-26_Premier_League_Darts_%E2%80%93_Night_8_%E2%80%93_Berlin_2026_by_Sandro_Halank%E2%80%93168.jpg',
  },
}
