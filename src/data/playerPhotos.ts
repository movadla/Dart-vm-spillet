// Ekte spillerfoto — kun for spillere der vi har et bilde med en klarert,
// verifiserbar lisens (Creative Commons fra Wikimedia Commons). ALDRI legg til
// et bilde her uten å sjekke lisensfeltet på selve Commons-filsiden og fylle ut
// `creditUrl` til den siden — kreditering er et lisensvilkår, ikke valgfritt.
// Spillere uten oppføring her faller tilbake til flagg-medaljongen i PlayerCard.
export const PLAYER_PHOTOS: Record<string, { src: string; credit: string; creditUrl: string }> = {
  'Luke Littler': {
    // Bakgrunnen er fjernet fra originalfotoet (AI-basert utklipp, rembg/U2Net) slik
    // at spilleren sitter direkte på kortets egen bakgrunn i stedet for å ligge i en
    // synlig rektangel-boks med sin egen fotobakgrunn — se PlayerCard.tsx.
    src: '/players/luke-littler-cutout.webp',
    credit: 'Sandro Halank · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:2026-03-26_Premier_League_Darts_%E2%80%93_Night_8_%E2%80%93_Berlin_2026_by_Sandro_Halank%E2%80%93168.jpg',
  },
}
