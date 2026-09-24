export default function DeltakerLoading() {
  return (
    <div className="page-bg app-frame" style={{ minHeight: '100vh', padding: '16px 20px 40px' }}>
      {/* Banner */}
      <div style={{ height: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <div className="skeleton" style={{ width: 150, height: 10, borderRadius: 4 }} />
        <div className="skeleton" style={{ width: 210, height: 30, borderRadius: 8 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0 14px' }}>
        <div className="skeleton" style={{ width: 72, height: 30, borderRadius: 20 }} />
        <div className="skeleton" style={{ width: 64, height: 30, borderRadius: 20 }} />
      </div>
      {/* Navn */}
      <div className="skeleton" style={{ width: 60, height: 10, borderRadius: 4, marginBottom: 6 }} />
      <div className="skeleton" style={{ width: 200, height: 28, borderRadius: 8, marginBottom: 16 }} />
      {/* Poengkort */}
      <div className="skeleton" style={{ height: 110, borderRadius: 16, marginBottom: 30 }} />
      {/* Laget */}
      <div className="skeleton" style={{ width: 80, height: 10, borderRadius: 4, marginBottom: 10 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 6, marginBottom: 10 }}>
        {[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ aspectRatio: '4 / 5', borderRadius: 10 }} />)}
      </div>
      <div className="skeleton" style={{ height: 330, borderRadius: 16 }} />
    </div>
  )
}
