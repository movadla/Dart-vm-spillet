import { mapTeamName } from '@/lib/teamNames'
import { KNOCKOUT_CHANNEL } from '@/data/schedule'

const FD_API_KEY = process.env.FOOTBALL_DATA_API_KEY
const FD_BASE = 'https://api.football-data.org/v4'

const STAGE_MAP: Record<string, string> = {
  GROUP_STAGE:       'group',
  ROUND_OF_32:       'r32',
  LAST_16:           'r16',
  QUARTER_FINALS:    'qf',
  SEMI_FINALS:       'sf',
  THIRD_PLACE_MATCH: 'bronze',
  FINAL:             'final',
}

export interface ScheduledMatch {
  id: number
  date: string   // YYYY-MM-DD CEST
  time: string   // HH:MM CEST
  home: string
  away: string
  stage: string  // 'r32', 'r16', etc.
  channel?: 'NRK1' | 'TV 2'
}

export async function fetchUpcomingSchedule(): Promise<ScheduledMatch[]> {
  if (!FD_API_KEY) return []
  try {
    const res = await fetch(`${FD_BASE}/competitions/WC/matches?status=SCHEDULED`, {
      headers: { 'X-Auth-Token': FD_API_KEY },
      next: { revalidate: 900 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return ((json.matches ?? []) as Record<string, unknown>[]).map(m => {
      const utc = new Date(m.utcDate as string)
      const cest = new Date(utc.getTime() + 2 * 60 * 60 * 1000)
      const date = cest.toISOString().slice(0, 10)
      const time = cest.toISOString().slice(11, 16)
      return {
        id: m.id as number,
        date,
        time,
        home: mapTeamName((m.homeTeam as Record<string, string>)?.name ?? '') || 'TBD',
        away: mapTeamName((m.awayTeam as Record<string, string>)?.name ?? '') || 'TBD',
        stage: STAGE_MAP[m.stage as string] ?? (m.stage as string),
        channel: KNOCKOUT_CHANNEL[`${date} ${time}`],
      }
    })
  } catch {
    return []
  }
}

// Build a lookup: teamName → { date, time, channel? } for their next scheduled match
export function buildTeamScheduleMap(matches: ScheduledMatch[]): Record<string, { date: string; time: string; channel?: 'NRK1' | 'TV 2' }> {
  const map: Record<string, { date: string; time: string; channel?: 'NRK1' | 'TV 2' }> = {}
  for (const m of matches) {
    if (m.home !== 'TBD' && !map[m.home]) map[m.home] = { date: m.date, time: m.time, channel: m.channel }
    if (m.away !== 'TBD' && !map[m.away]) map[m.away] = { date: m.date, time: m.time, channel: m.channel }
  }
  return map
}
