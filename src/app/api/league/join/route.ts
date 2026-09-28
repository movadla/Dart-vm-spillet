import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { KICKOFF } from '@/config/tournament'
import { clientIp, tryRecordRateLimitHit } from '@/lib/rateLimit'
import { getLocale } from '@/lib/i18n/getLocale'
import { getDictionary } from '@/i18n/dictionaries'

// Ingen grense fantes tidligere — én liga kunne i praksis vokse til å romme
// hele deltakerfeltet, noe leaderboardet i en liga (samme RankList-komponent
// som hovedleaderboardet) ikke er designet for å vise pent/ytelsesmessig.
const MAX_LEAGUE_MEMBERS = 200

export async function POST(req: NextRequest) {
  // Klienten lages per kall — manglende Supabase-konfigurasjon skal gi et
  // forståelig svar fra handleren, ikke crash ved import av ruten.
  const supabase = getSupabaseAdmin()
  const { leagueJoin: dict } = getDictionary(await getLocale()).errors
  if (new Date() >= KICKOFF) {
    return NextResponse.json({ error: dict.locked }, { status: 403 })
  }

  // Identitet KUN fra verifisert vm_auth-cookie — se league/create/route.ts og
  // tipp/update/route.ts for samme fiks og begrunnelse.
  const { inviteCode } = await req.json()
  const participantId = (await cookies()).get('vm_auth')?.value

  if (!participantId) return NextResponse.json({ error: dict.notLoggedIn }, { status: 401 })
  if (!inviteCode?.trim()) {
    return NextResponse.json({ error: dict.missingData }, { status: 400 })
  }

  // Koden er 6 tegn fra 32 mulige — uten grense kunne den gjettes med et
  // skript. 30 forsøk/time per IP er rikelig for ekte bruk.
  const ip = clientIp(req)
  if (!(await tryRecordRateLimitHit(supabase, 'league-join', ip, 30, 60 * 60 * 1000))) {
    return NextResponse.json({ error: dict.tooManyAttempts }, { status: 429 })
  }

  const { data: participant } = await supabase
    .from('participants').select('id').eq('id', participantId).single()
  if (!participant) return NextResponse.json({ error: dict.participantNotFound }, { status: 404 })

  const { data: league } = await supabase
    .from('leagues').select('id, name').eq('invite_code', inviteCode.trim().toUpperCase()).maybeSingle()
  if (!league) return NextResponse.json({ error: dict.invalidCode }, { status: 404 })

  const { count: memberCount } = await supabase
    .from('league_members').select('*', { count: 'exact', head: true }).eq('league_id', league.id)
  const { count: alreadyMember } = await supabase
    .from('league_members').select('*', { count: 'exact', head: true }).eq('league_id', league.id).eq('participant_id', participantId)
  if ((memberCount ?? 0) >= MAX_LEAGUE_MEMBERS && !alreadyMember) {
    return NextResponse.json({ error: dict.full }, { status: 409 })
  }

  // Idempotent insert — ignore if already member
  await supabase
    .from('league_members')
    .upsert({ league_id: league.id, participant_id: participantId }, { onConflict: 'league_id,participant_id' })

  return NextResponse.json({ inviteCode: inviteCode.trim().toUpperCase(), leagueName: league.name })
}
