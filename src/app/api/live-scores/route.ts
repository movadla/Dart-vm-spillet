import { NextResponse } from 'next/server'
import { ESPN_TO_NO } from '@/lib/espnNames'

export const revalidate = 30

export interface GoalEvent {
  scorer: string
  minute: string
  team: string
  isPenalty: boolean
  isOwnGoal: boolean
}

export interface LiveMatch {
  home: string
  away: string
  homeGoals: number
  awayGoals: number
  minute: string
  state: 'in' | 'post'
  goals: GoalEvent[]
  venue: string
}

function toNo(name: string): string {
  return ESPN_TO_NO[name] ?? name
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isGoalEvent(p: any): boolean {
  if (!p) return false
  if ((p.scoreValue ?? 0) > 0) return true
  return ['Goal', 'PK Goal', 'Own Goal', 'Header Goal'].includes(p.type?.text ?? '')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGoal(p: any): GoalEvent {
  return {
    scorer:
      p.athletesInvolved?.[0]?.displayName ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      p.participants?.find((x: any) => x.type?.text === 'scorer')?.athlete?.displayName ??
      '',
    minute: p.clock?.displayValue ?? '',
    team: toNo(p.team?.displayName ?? ''),
    isPenalty: p.penaltyKick === true || p.type?.text === 'PK Goal',
    isOwnGoal: p.ownGoal === true || p.type?.text === 'Own Goal',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractGoals(summary: any, boardDetails: any[]): GoalEvent[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sources: any[][] = [
    summary?.scoringPlays ?? [],
    summary?.header?.competitions?.[0]?.details ?? [],
    summary?.keyPlays ?? [],
    boardDetails,
  ]
  const seen = new Set<string>()
  const goals: GoalEvent[] = []
  for (const source of sources) {
    for (const p of source) {
      if (!isGoalEvent(p)) continue
      const g = mapGoal(p)
      const key = `${g.scorer}|${g.minute}`
      if (seen.has(key)) continue
      seen.add(key)
      goals.push(g)
    }
  }
  return goals.sort((a, b) => (parseInt(a.minute) || 0) - (parseInt(b.minute) || 0))
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

export async function GET() {
  try {
    const today = new Date()

    // Only fetch today's scoreboard — historical results are stored in the DB via sync-results
    const board = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr(today)}`,
      { next: { revalidate: 30 } }
    ).then(r => r.ok ? r.json() : null).catch(() => null)

    // Keep only in/post events from today
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeEvents: any[] = (board?.events ?? []).filter((e: any) => {
      const state = e.competitions?.[0]?.status?.type?.state ?? 'pre'
      return state !== 'pre'
    })

    // Fetch summaries in parallel (post matches cached 1h, live 30s)
    const summaries = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      activeEvents.map((e: any) => {
        const state = e.competitions?.[0]?.status?.type?.state ?? 'post'
        return fetch(
          `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${e.id}`,
          { next: { revalidate: state === 'in' ? 30 : 3600 } }
        ).then(r => r.ok ? r.json() : null).catch(() => null)
      })
    )

    const matches: LiveMatch[] = []
    for (let i = 0; i < activeEvents.length; i++) {
      const comp = activeEvents[i].competitions?.[0]
      if (!comp) continue
      const state: string = comp.status?.type?.state ?? 'pre'

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const home = comp.competitors?.find((c: any) => c.homeAway === 'home')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const away = comp.competitors?.find((c: any) => c.homeAway === 'away')
      if (!home || !away) continue

      const venueName = comp.venue?.fullName ?? ''
      const venueCity = comp.venue?.address?.city ?? ''
      const venue = [venueName, venueCity].filter(Boolean).join(', ')

      matches.push({
        home: toNo(home.team?.displayName ?? ''),
        away: toNo(away.team?.displayName ?? ''),
        homeGoals: parseInt(home.score ?? '0', 10),
        awayGoals: parseInt(away.score ?? '0', 10),
        minute: state === 'in' ? (comp.status?.displayClock ?? '') : '',
        state: state as 'in' | 'post',
        goals: extractGoals(summaries[i], comp.details ?? []),
        venue,
      })
    }

    return NextResponse.json({ matches })
  } catch {
    return NextResponse.json({ matches: [] })
  }
}
