export default function DeltakerLoading() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '32px 16px 56px' }}>

      <div style={{ marginBottom: 24 }}>
        <div className="skeleton" style={{ width: 56, height: 14, borderRadius: 6 }} />
      </div>

      {/* Name + points header */}
      <div style={{ marginBottom: 20 }}>
        <div className="skeleton" style={{ width: 200, height: 58, borderRadius: 10, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 76, borderRadius: 16 }} />
      </div>

      {/* Picks label */}
      <div className="skeleton" style={{ width: 70, height: 10, borderRadius: 4, marginBottom: 10 }} />

      {/* Pick cards */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <div key={i} className="skeleton" style={{ height: 72, borderRadius: 16, marginBottom: 8 }} />
      ))}
    </div>
  )
}
