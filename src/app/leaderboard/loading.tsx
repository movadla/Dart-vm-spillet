export default function LeaderboardLoading() {
  return (
    <div className="page-bg app-frame" style={{ minHeight: '100vh', padding: '16px 20px 40px' }}>
      <div style={{ height: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <div className="skeleton" style={{ width: 150, height: 10, borderRadius: 4 }} />
        <div className="skeleton" style={{ width: 210, height: 30, borderRadius: 8 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0 14px' }}>
        <div className="skeleton" style={{ width: 96, height: 30, borderRadius: 20 }} />
      </div>
      <div className="skeleton" style={{ width: 230, height: 36, borderRadius: 8, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: 150, height: 12, borderRadius: 4, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 44, borderRadius: 14, marginBottom: 12 }} />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div key={i} className="skeleton" style={{ height: 66, borderRadius: 16, marginBottom: 8 }} />
      ))}
    </div>
  )
}
