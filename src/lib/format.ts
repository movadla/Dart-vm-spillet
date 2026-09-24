// Én norsk tallkonvensjon for hele appen: komma som desimaltegn, og et smalt
// hardt mellomrom (U+202F) mellom tall og enhet («41 p», «12 %»), så tall og
// enhet aldri brytes fra hverandre og ser likt ut overalt.
const NNBSP = ' '

export function formatPoints(n: number): string {
  return `${n.toLocaleString('nb-NO')}${NNBSP}p`
}

export function formatPercent(n: number): string {
  return `${Math.round(n).toLocaleString('nb-NO')}${NNBSP}%`
}

export function formatAvg(avg: number | undefined): string {
  return avg == null ? '—' : avg.toLocaleString('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
