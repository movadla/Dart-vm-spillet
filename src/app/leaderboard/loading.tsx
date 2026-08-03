const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

export default function LeaderboardLoading() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '32px 16px 56px' }}>

      <div style={{ marginBottom: 24 }}>
        <div className="skeleton" style={{ width: 56, height: 14, borderRadius: 6 }} />
      </div>

      <div style={{ marginBottom: 28 }}>
        <div className="skeleton" style={{ width: 160, height: 50, borderRadius: 10, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: 200, height: 13, borderRadius: 6 }} />
      </div>

      {/* #1 featured card skeleton */}
      <div className="skeleton" style={{ height: 136, borderRadius: 20, marginBottom: 8 }} />

      {/* Row skeletons */}
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className="skeleton" style={{ height: 70, borderRadius: 18, marginBottom: 8 }} />
      ))}
    </div>
  )
}
