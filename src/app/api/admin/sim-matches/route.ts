import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = getSupabaseAdmin()
import { checkAdminAuth } from '@/lib/adminAuth'
import { GROUP_SCHEDULE } from '@/data/schedule'

function poisson(lambda: number): number {
  const L = Math.exp(-lambda)
  let k = 0, p = 1
  do { k++; p *= Math.random() } while (p > L)
  return k - 1
}

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  try {
    const matches = GROUP_SCHEDULE.slice(0, 10)
    let inserted = 0

    for (const m of matches) {
      const homeGoals = poisson(1.3)
      const awayGoals = poisson(1.3)

      const { data: existing } = await supabase
        .from('match_results')
        .select('id')
        .eq('home_team', m.home)
        .eq('away_team', m.away)
        .maybeSingle()

      const payload = { home_goals: homeGoals, away_goals: awayGoals, stage: 'group' }

      const { error } = existing
        ? await supabase.from('match_results').update(payload).eq('id', existing.id)
        : await supabase.from('match_results').insert({ home_team: m.home, away_team: m.away, ...payload })

      if (error) {
        console.error(`Match insert error (${m.home} vs ${m.away}):`, error)
      } else {
        inserted++
      }
    }

    return NextResponse.json({ success: true, matches: inserted })
  } catch (e) {
    console.error('sim-matches error:', e)
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}
