// «Overrask meg»: tilfeldig valg i tippe-flyten. Rene funksjoner med
// injiserbar tilfeldighetskilde, så de kan enhetstestes deterministisk.

/** Tilfeldig element. Kaster hvis listen er tom (en pott uten spillere er en feil i dataene). */
export function pickRandom<T>(list: readonly T[], rng: () => number = Math.random): T {
  if (list.length === 0) throw new Error('pickRandom: tom liste')
  // Math.min sikrer at en rng som returnerer akkurat 1 ikke gir indeks utenfor listen.
  return list[Math.min(list.length - 1, Math.floor(rng() * list.length))]
}

/** Ett tilfeldig valg per pott: { potNumber: spillernavn }. Tomme potter hoppes over. */
export function pickRandomTeam(
  pots: readonly { potNumber: number; players: readonly { name: string }[] }[],
  rng: () => number = Math.random,
): Record<number, string> {
  const team: Record<number, string> = {}
  for (const pot of pots) {
    if (pot.players.length === 0) continue
    team[pot.potNumber] = pickRandom(pot.players, rng).name
  }
  return team
}
