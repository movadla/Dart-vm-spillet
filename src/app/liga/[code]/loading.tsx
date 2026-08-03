export default function LigaLoading() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '32px 16px 56px' }}>

      <div style={{ marginBottom: 24 }}>
        <div className="skeleton" style={{ width: 56, height: 14, borderRadius: 6 }} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="skeleton" style={{ width: 180, height: 48, borderRadius: 10, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: 140, height: 13, borderRadius: 6, marginBottom: 14 }} />
        <div className="skeleton" style={{ width: 130, height: 40, borderRadius: 10 }} />
      </div>

      {/* Featured card */}
      <div className="skeleton" style={{ height: 130, borderRadius: 20, marginBottom: 8 }} />

      {/* Row skeletons */}
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="skeleton" style={{ height: 68, borderRadius: 18, marginBottom: 8 }} />
      ))}
    </div>
  )
}
