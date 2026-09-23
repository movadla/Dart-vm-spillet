import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  // Samme sårbarhet som ble funnet og fikset i league/create og league/join
  // (ikke fanget opp av sikkerhetsgjennomgangen, men identisk mønster her):
  // "adminId" kom tidligere rett fra request body, uverifisert — hvem som
  // helst som kjente ligaens eier-id kunne kicke enhver deltaker fra enhver
  // liga. Identitet nå KUN fra verifisert vm_auth-cookie.
  const { leagueId, kickId } = await req.json()
  const adminId = req.cookies.get('vm_auth')?.value
  if (!adminId) return NextResponse.json({ error: 'Ikke innlogget — be om en ny innloggingslenke' }, { status: 401 })
  if (!leagueId || !kickId) return NextResponse.json({ error: 'Mangler data' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  const { data: league } = await supabase
    .from('leagues')
    .select('created_by')
    .eq('id', leagueId)
    .single()

  if (!league) return NextResponse.json({ error: 'Liga ikke funnet' }, { status: 404 })
  if (league.created_by !== adminId) return NextResponse.json({ error: 'Ikke tillatt' }, { status: 403 })
  if (kickId === adminId) return NextResponse.json({ error: 'Kan ikke kicke deg selv' }, { status: 400 })

  await supabase
    .from('league_members')
    .delete()
    .eq('league_id', leagueId)
    .eq('participant_id', kickId)

  return NextResponse.json({ ok: true })
}
