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
  // Resten lagt til 2026-09-24, samme rembg/U2Net-utklipp som Littler. Kilder
  // se PLAYER_PHOTO_DATABANK.md. Kevin Doets har MED VILJE ingen oppføring:
  // eneste tilgjengelige Doets-foto fikk ikke ren utklipping (nær-hvit
  // bakgrunn) og har et tydelig PDC-merket mikrofonflagg helt inntil ansiktet
  // — faller tilbake til initial-plassholderen til et bedre kildebilde er
  // funnet.
  'Jonny Clayton': {
    // Det først vurderte Clayton-bildet i databanken (samme fotosesjon, Sven
    // Mandel) viste et privat kyssøyeblikk med partneren hans — upassende og
    // ansiktet knapt synlig selv beskåret. Dette bildet, fra samme kamp/
    // fotograf, er et rent solo-utklipp med ansiktet tydelig synlig.
    src: '/players/jonny-clayton-cutout.webp',
    credit: 'Sven Mandel · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Jonny_Clayton_-_2022337185714_2022-12-03_1.Mannheim_Darts_Gala_-_Sven_-_1D_X_MK_II_-_0878_-_B70I1771.jpg',
  },
  'Luke Humphries': {
    src: '/players/luke-humphries-cutout.webp',
    credit: 'Darts Actueel · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Luke_Humphries_Darts_Actueel_2023.jpg',
  },
  'Gian van Veen': {
    src: '/players/gian-van-veen-cutout.webp',
    credit: 'DARTS NOW · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Gian_van_Veen_2025.png',
  },
  'Gerwyn Price': {
    src: '/players/gerwyn-price-cutout.webp',
    credit: 'Sandro Halank · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:2025-04-03_Premier_League_Darts_Berlin_2025_by_Sandro_Halank%E2%80%93167.jpg',
  },
  'James Wade': {
    src: '/players/james-wade-cutout.webp',
    credit: 'DARTS NOW · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:James_Wade_2025.png',
  },
  'Michael van Gerwen': {
    src: '/players/michael-van-gerwen-cutout.webp',
    credit: 'DARTS NOW · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Michael_van_Gerwen_2025.png',
  },
  'Josh Rock': {
    src: '/players/josh-rock-cutout.webp',
    credit: 'Darts Actueel · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Josh_Rock_Darts_Actueel_2023.jpg',
  },
  'Stephen Bunting': {
    src: '/players/stephen-bunting-cutout.webp',
    credit: 'DARTS NOW · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Stephen_Bunting_2024.png',
  },
  'Gary Anderson': {
    src: '/players/gary-anderson-cutout.webp',
    credit: 'Jakob Gottfried · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Gary_Anderson_(Exeter_2016)_(cropped).jpg',
  },
  'Wessel Nijman': {
    src: '/players/wessel-nijman-cutout.webp',
    credit: 'Darts Actueel · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Wessel_Nijman.png',
  },
  'Ryan Searle': {
    src: '/players/ryan-searle-cutout.webp',
    credit: 'Darts Actueel · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Ryan_Searle_Darts_Actueel_2023.jpg',
  },
  'Ross Smith': {
    src: '/players/ross-smith-cutout.webp',
    credit: 'DARTS NOW · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Ross_Smith_2024_2.png',
  },
  'Jermaine Wattimena': {
    src: '/players/jermaine-wattimena-cutout.webp',
    credit: 'Darts Actueel · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Jermaine_Wattimena.png',
  },
  'Luke Woodhouse': {
    src: '/players/luke-woodhouse-cutout.webp',
    credit: 'DARTS NOW · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Luke_Woodhouse_2024.png',
  },
  'Martin Schindler': {
    src: '/players/martin-schindler-cutout.webp',
    credit: 'Darts Actueel · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Martin_Schindler_Darts_Actueel_2023.jpg',
  },
  'Krzysztof Ratajski': {
    src: '/players/krzysztof-ratajski-cutout.webp',
    credit: 'Darts Actueel · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Ratajski_2021.png',
  },
  'Rob Cross': {
    src: '/players/rob-cross-cutout.webp',
    credit: 'Sven Mandel · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Rob_Cross_(darts_player),_2017_(cropped).jpg',
  },
  'Ryan Joyce': {
    src: '/players/ryan-joyce-cutout.webp',
    credit: 'Darts Actueel · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Ryan_Joyce_Darts_Actueel_2022.jpg',
  },
  'Cameron Menzies': {
    src: '/players/cameron-menzies-cutout.webp',
    credit: 'DARTS NOW · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Cameron_Menzies_2024.png',
  },
  'Andrew Gilding': {
    src: '/players/andrew-gilding-cutout.webp',
    credit: 'DARTS NOW · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Andrew_Gilding_2024.png',
  },
  'Daryl Gurney': {
    src: '/players/daryl-gurney-cutout.webp',
    credit: 'DARTS NOW · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Team_NI_Darts_WC_2025_(Gurney_cropped).png',
  },
  // Lagt til 2026-09-27 (World Grand Prix-generalprøven) — se
  // docs/PLAYER_PHOTO_DATABANK.md for research-notater per spiller.
  'Chris Dobey': {
    src: '/players/chris-dobey-cutout.webp',
    credit: 'DARTS NOW · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Chris_Dobey_2025.png',
  },
  'Nathan Aspinall': {
    src: '/players/nathan-aspinall-cutout.webp',
    credit: 'DARTS NOW · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Nathan_Aspinall_2024.png',
  },
  'Damon Heta': {
    src: '/players/damon-heta-cutout.webp',
    credit: 'DARTS NOW · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Damon_Heta_2025.png',
  },
  'Niels Zonneveld': {
    src: '/players/niels-zonneveld-cutout.webp',
    credit: 'Darts Actueel · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Niels_Zonneveld.png',
  },
  'Danny Noppert': {
    src: '/players/danny-noppert-cutout.webp',
    credit: 'DARTS NOW · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Danny_Noppert_2025.png',
  },
  'Niko Springer': {
    // Eneste kandidat funnet, men høyeste tillitsnivå (★ egen fotografering,
    // "Own work" bekreftet i Summary-feltet) — se PLAYER_PHOTO_DATABANK.md.
    src: '/players/niko-springer-cutout.webp',
    credit: 'PhilippFips · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Niko_Springer.jpg',
  },
  'Dave Chisnall': {
    src: '/players/dave-chisnall-cutout.webp',
    credit: 'Sven Mandel · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Dave_Chisnall_6-2_Ryan_Meikle_-_Dave_Chisnall_-_2019250131009_2019-09-07_PDC_European_Darts_Matchplay_-_0068_-_B70I6438_(cropped).jpg',
  },
  'Joe Cullen': {
    src: '/players/joe-cullen-cutout.webp',
    credit: 'Sandro Halank · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:2022-06-13_Play-offs_(2022_Premier_League_Darts)_by_Sandro_Halank%E2%80%93110.jpg',
  },
  'Dirk van Duijvenbode': {
    // Research-agenten fant kun tvetydige kandidater fra samme fotoserie
    // (mange viser walk-on/publikum med flere personer) — selv lastet ned og
    // sjekket flere bilder fra samme Commons-kategori 2026-09-27 og fant
    // denne: en ren solo jubel-scene fra selve kampen, ingen andre spillere.
    src: '/players/dirk-van-duijvenbode-cutout.webp',
    credit: 'Sven Mandel · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Adrian_Lewis_6-2_Dirk_van_Duijvenbode_-_Dirk_van_Duijvenbode_-_2019250142814_2019-09-07_PDC_European_Darts_Matchplay_-_0407_-_AK8I8915.jpg',
  },
  "William O'Connor": {
    // Research-agenten kunne ikke bekrefte solo via tekst-metadata alene
    // (fryktet Max Hopp var med i bildet) — selv lastet ned og sett på
    // pikslene 2026-09-27: ren solo, ingen andre spillere i bildet.
    src: "/players/william-oconnor-cutout.webp",
    credit: 'Sven Mandel · CC BY-SA 4.0',
    creditUrl: "https://commons.wikimedia.org/wiki/File:William_O%27Connor_(darts_player)_(cropped).jpg",
  },
}
