'use client'

// Kompakt trekningsvisning i klassisk dart-brakett-stil: rader med spillernavn og
// seed-nummer i parentes, koblet med en strek inn til neste rundes rute — samme
// mønster som PDC selv bruker på sine trekningsgrafikker.
//
// Viser 2 runde 1-kamper (4 bokser, i to par) og 2 «vinner»-plasser i runde 2 —
// siden ingen spillere har walkover, er begge runde 2-motstanderne ukjente
// (avhenger av hvem som vinner den andre kampen).

export interface DrawSlot {
  name: string
  seedLabel?: string
  highlighted?: boolean
  faded?: boolean
}

interface RowProps { slot: DrawSlot; compact?: boolean }

function Row({ slot, compact }: RowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 5 : 8,
        padding: compact ? '6px 8px' : '8px 10px',
        background: slot.highlighted ? 'rgba(220,38,38,0.22)' : '#15181f',
        borderLeft: slot.highlighted ? '3px solid #dc2626' : '3px solid transparent',
      }}
    >
      {slot.seedLabel && (
        <span style={{ fontSize: compact ? 8 : 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
          {slot.seedLabel}
        </span>
      )}
      <span
        style={{
          fontSize: compact ? 10 : 12.5,
          fontWeight: slot.highlighted ? 800 : 600,
          color: slot.highlighted ? '#fff' : slot.faded ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0,
        }}
      >
        {slot.name}
      </span>
      <span
        style={{
          width: compact ? 12 : 14, height: compact ? 12 : 14, borderRadius: '50%', flexShrink: 0,
          background: '#d97706', opacity: slot.highlighted ? 1 : 0.55,
        }}
      />
    </div>
  )
}

/** To spillere i samme kamp, stablet med en tynn skillelinje. Eksportert for gjenbruk (f.eks. i en full bracket-liste). */
export function PairBox({ a, b, compact }: { a: DrawSlot; b: DrawSlot; compact?: boolean }) {
  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
      <Row slot={a} compact={compact} />
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
      <Row slot={b} compact={compact} />
    </div>
  )
}

function WinnerSlot({ label, compact }: { label: string; compact?: boolean }) {
  return (
    <div style={{ borderRadius: 8, border: '1px dashed rgba(217,119,6,0.4)', padding: compact ? '10px 8px' : '14px 10px', textAlign: 'center' }}>
      <span style={{ fontSize: compact ? 9 : 11, fontWeight: 700, color: 'rgba(217,119,6,0.85)', letterSpacing: '0.02em' }}>{label}</span>
    </div>
  )
}

/**
 * Viser runde 1 sitt par (den valgte spilleren + motstander), det andre runde
 * 1-paret som venter i runde 2, og to «vinner»-plasser som markerer at de to
 * kampenes vinnere møtes i runde 2.
 */
export function DrawBracket({
  pairA,
  pairB,
  compact,
  vertical,
}: {
  pairA: { a: DrawSlot; b: DrawSlot }
  pairB: { a: DrawSlot; b: DrawSlot }
  compact?: boolean
  /** Stables under hverandre i stedet for side om side — for trange kolonner. */
  vertical?: boolean
}) {
  const connectorColor = '#d97706'

  const col1 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 6 : 10 }}>
      <PairBox a={pairA.a} b={pairA.b} compact={compact} />
      <PairBox a={pairB.a} b={pairB.b} compact={compact} />
    </div>
  )

  const col2 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 6 : 10 }}>
      <WinnerSlot label="Vinner kamp 1" compact={compact} />
      <WinnerSlot label="Vinner kamp 2" compact={compact} />
    </div>
  )

  if (vertical) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {col1}
        <div style={{ alignSelf: 'center', width: 2, height: 12, background: connectorColor, flexShrink: 0 }} />
        {col2}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <div style={{ flex: 1, minWidth: 0 }}>{col1}</div>
      <div style={{ width: 18, height: 2, background: connectorColor, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>{col2}</div>
    </div>
  )
}
