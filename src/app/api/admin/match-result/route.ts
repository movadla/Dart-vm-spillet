import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = getSupabaseAdmin()
import { checkAdminAuth } from '@/lib/adminAuth'

const VALID_STAGES = ['group', 'r32', 'r16', 'qf', 'sf', 'final']

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError
  try {
    const body = await req.json()
    const { home, away, homeGoals, awayGoals, stage } = body

    if (!home || !away || homeGoals === undefined || awayGoals === undefined) {
      return NextResponse.json({ error: 'Mangler data' }, { status: 400 })
    }

    if (typeof homeGoals !== 'number' || typeof awayGoals !== 'number') {
      return NextResponse.json({ error: 'Mål må være tall' }, { status: 400 })
    }

    const matchStage = VALID_STAGES.includes(stage) ? stage : 'group'

    // Upsert: oppdater hvis kampen allerede finnes
    const { data: existing } = await supabase
      .from('match_results')
      .select('id')
      .eq('home_team', home)
      .eq('away_team', away)
      .single()

    const { error } = existing
      ? await supabase.from('match_results').update({ home_goals: homeGoals, away_goals: awayGoals, stage: matchStage }).eq('id', existing.id)
      : await supabase.from('match_results').insert({ home_team: home, away_team: away, home_goals: homeGoals, away_goals: awayGoals, stage: matchStage })

    if (error) {
      console.error('Match result insert error:', error)
      return NextResponse.json({ error: 'Kunne ikke lagre resultat' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Match result route error:', e)
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}
