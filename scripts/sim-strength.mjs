// Delt styrkemodell for alle simuleringsscripts
// Odds fra pots.ts — styrke = 1/odds

const ODDS = {
  'Frankrike': 5.5, 'Spania': 6.0, 'England': 7.5,
  'Brasil': 9.0, 'Argentina': 9.5, 'Portugal': 11.0, 'Tyskland': 15.0,
  'Nederland': 21.0, 'Norge': 26.0, 'Belgia': 34.0, 'USA': 41.0, 'Colombia': 41.0,
  'Uruguay': 51.0, 'Marokko': 51.0, 'Japan': 51.0, 'Mexico': 76.0, 'Sverige': 76.0, 'Kroatia': 81.0,
  'Sveits': 81.0, 'Ecuador': 91.0, 'Senegal': 101.0, 'Tyrkia': 101.0, 'Østerrike': 101.0, 'Canada': 151.0, 'Paraguay': 151.0,
  'Algerie': 201.0, 'Tsjekkia': 201.0, 'Elfenbenskysten': 201.0,
  'Sør-Korea': 251.0, 'Egypt': 251.0, 'Skottland': 251.0, 'Ghana': 251.0,
  'Bosnia-Hercegovina': 251.0, 'Iran': 501.0, 'Australia': 501.0, 'Tunisia': 501.0,
  'Congo DR': 751.0, 'Saudi-Arabia': 1001.0, 'New Zealand': 1001.0, 'Qatar': 1001.0,
  'Irak': 1001.0, 'Jordan': 1001.0, 'Kapp Verde': 1001.0, 'Usbekistan': 1001.0,
  'Panama': 1001.0, 'Sør-Afrika': 1001.0, 'Curaçao': 2501.0, 'Haiti': 2501.0,
}

function str(name) {
  const o = ODDS[name]
  if (!o) console.warn(`⚠️  Ukjent lag: "${name}" — bruker odds 500`)
  return 1 / (o ?? 500)
}

function poisson(lam) {
  if (lam <= 0) return 0
  const L = Math.exp(-lam); let p = 1, k = 0
  do { k++; p *= Math.random() } while (p > L)
  return k - 1
}

// Gruppespill: mål basert på relativ styrke, totalgjennomsnitt 2.7 mål per kamp
export function simGroup(home, away) {
  const sh = str(home), sa = str(away), tot = sh + sa
  return [poisson(2.7 * sh / tot), poisson(2.7 * sa / tot)]
}

// Sluttspill: som gruppe men ingen uavgjort — ekstraomganger/straffe vektet på styrke
export function simKnockout(home, away) {
  const sh = str(home), sa = str(away), tot = sh + sa
  let hg = poisson(2.7 * sh / tot), ag = poisson(2.7 * sa / tot)
  if (hg === ag) {
    if (Math.random() < sh / tot) hg++; else ag++
  }
  return [hg, ag]
}
