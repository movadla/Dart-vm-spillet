import { NextResponse } from 'next/server'
import { fetchUpcomingSchedule } from '@/lib/knockout-schedule'

export const revalidate = 900

const STAGE_LABEL: Record<string, string> = {
  group:  'Gruppe',
  r32:    '1/16-finale',
  r16:    '1/8-finale',
  qf:     'Kvartfinale',
  sf:     'Semifinale',
  bronze: 'Bronsefinale',
  final:  'Finale',
}

export async function GET(req: Request) {
  const limit = new URL(req.url).searchParams.get('limit')
  const all = await fetchUpcomingSchedule()
  const matches = all
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, limit ? parseInt(limit, 10) : undefined)
    .map(m => ({ ...m, stage: STAGE_LABEL[m.stage] ?? m.stage }))

  return NextResponse.json(
    { matches },
    { headers: { 'Cache-Control': 's-maxage=900, stale-while-revalidate=1800' } },
  )
}
