'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

const COLORS = [
  '#60a5fa','#f59e0b','#34d399','#f87171','#a78bfa',
  '#fb923c','#38bdf8','#4ade80','#e879f9','#fbbf24',
  '#2dd4bf','#f472b6','#c084fc','#86efac','#fca5a5',
  '#93c5fd','#fdba74','#6ee7b7',
]
const MONTHS = ['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des']
const fmtDate = (d: string) => {
  const [, m, day] = d.split('-')
  return `${parseInt(day)}. ${MONTHS[parseInt(m) - 1]}`
}

interface Participant { id: string; name: string; points: number }
type DataPoint = Record<string, number | string>

export default function DemoGrafPage() {
  const [series, setSeries] = useState<DataPoint[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/demo-graf')
      .then(r => r.json())
      .then(data => {
        setSeries(data.series)
        setParticipants(data.participants)
        setSelected(new Set(data.participants.slice(0, 5).map((p: Participant) => p.id)))
        setLoading(false)
      })
  }, [])

  const colorMap = useMemo(() => {
    const map: Record<string, string> = {}
    participants.forEach((p, i) => { map[p.id] = COLORS[i % COLORS.length] })
    return map
  }, [participants])

  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const active = participants.filter(p => selected.has(p.id))

  return (
    <div style={{
      minHeight: '100vh', background: '#0f0f0f', color: '#fff',
      padding: '40px 28px', fontFamily: '"Inter", system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Demo
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Poengutvikling</h1>
          <p style={{ color: '#666', marginTop: 6, fontSize: 14 }}>
            Sammenlign hvordan deltakernes poeng har utviklet seg kamp for kamp
          </p>
        </div>

        {loading ? (
          <div style={{ color: '#555', padding: 48 }}>Laster data…</div>
        ) : series.length === 0 ? (
          <div style={{ color: '#555', padding: 48 }}>Ingen kampresultater ennå.</div>
        ) : (
          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Deltakerliste */}
            <div style={{
              width: 220, background: '#1a1a1a', borderRadius: 12,
              padding: '16px 12px', flexShrink: 0,
            }}>
              <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, paddingLeft: 4 }}>
                Deltakere
              </div>
              {participants.map(p => {
                const on = selected.has(p.id)
                return (
                  <button key={p.id} onClick={() => toggle(p.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    width: '100%', padding: '7px 8px', borderRadius: 7,
                    border: 'none', background: on ? 'rgba(255,255,255,0.07)' : 'transparent',
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                      background: colorMap[p.id], opacity: on ? 1 : 0.2,
                    }} />
                    <span style={{
                      flex: 1, fontSize: 13,
                      color: on ? '#e5e5e5' : '#555',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {p.name}
                    </span>
                    <span style={{ fontSize: 12, color: '#444' }}>{p.points}p</span>
                  </button>
                )
              })}
            </div>

            {/* Graf */}
            <div style={{ flex: 1, minWidth: 300 }}>
              {active.length === 0 ? (
                <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 14 }}>
                  Velg minst én deltaker
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={440}>
                  <LineChart data={series} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                    <CartesianGrid stroke="#1f1f1f" vertical={false} />
                    <XAxis
                      dataKey="date" tickFormatter={fmtDate}
                      tick={{ fill: '#555', fontSize: 12 }}
                      axisLine={{ stroke: '#2a2a2a' }} tickLine={false} minTickGap={40}
                    />
                    <YAxis
                      tick={{ fill: '#555', fontSize: 12 }}
                      axisLine={false} tickLine={false} width={38}
                    />
                    <Tooltip
                      contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px' }}
                      labelStyle={{ color: '#888', fontSize: 11, marginBottom: 8 }}
                      labelFormatter={(label) => fmtDate(String(label))}
                      itemStyle={{ fontSize: 13, padding: '2px 0' }}
                      formatter={(value, id) => {
                        const name = participants.find(p => p.id === String(id))?.name ?? String(id)
                        return [`${value}p`, name]
                      }}
                    />
                    {active.map(p => (
                      <Line
                        key={p.id} dataKey={p.id}
                        stroke={colorMap[p.id]} strokeWidth={2}
                        dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
