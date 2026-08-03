export const SCORING = {
  match: {
    win: 3,
    draw: 1,
    goal: 1,
  },
  advancement: {
    group: 5,
    r32: 10,
    r16: 15,
    qf: 20,
  },
  medal: {
    bronze: 15,
    silver: 20,
    gold: 40,
  },
  underdogMultiplier: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2, 7: 3, 8: 3 } as Record<number, number>,
}
