import { Resend } from 'resend'
import { createHmac } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = getSupabaseAdmin()
import { calcParticipantPoints, MatchResult } from '@/lib/scoring'
import { SCORING } from '@/config/scoring'
import { buildDailyEmail, buildDailyPlainText, VM_TOTAL_DAYS } from '@/lib/email-daily'

export const maxDuration = 60

const VM_START = new Date('2026-12-11T19:00:00Z')

function currentVmDay(now: Date): number {
  const day = Math.ceil((now.getTime() - VM_START.getTime()) / (1000 * 60 * 60 * 24))
  return Math.min(Math.max(day, 1), VM_TOTAL_DAYS)
}

function makeUnsubscribeToken(userId: string): string {
  return createHmac('sha256', process.env.CRON_SECRET ?? '').update(userId).digest('hex')
}

interface MatchResultWithDate extends MatchResult {
  played_at?: string
}

interface LeaderboardRow {
  id: string
  name: string
  email: string
  email_opt_out: boolean
  points: number
  picks: { participant_id: string; pot_number: number; player_name: string }[]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const testTo = searchParams.get('testTo')

  const authHeader = request.headers.get('authorization')
  const secretParam = searchParams.get('secret')
  const validSecret = process.env.CRON_SECRET
  if (authHeader !== `Bearer ${validSecret}` && secretParam !== validSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // VM pågår alle dager — helge-sperre fjernet. ?force=1 eller testTo overstyrer uansett.
  const force = searchParams.get('force') === '1'

  const resend = new Resend(process.env.RESEND_API_KEY)
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3001'

  const now = new Date()
  const cutoff24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const vmDay = currentVmDay(now)

  const [{ data: participants }, { data: matches }] = await Promise.all([
    supabase.from('participants').select('id, name, email, email_opt_out').order('created_at'),
    supabase.from('match_results').select('player1, player2, sets1, sets2, stage, winner, played_at'),
  ])

  const activeParticipants = (participants ?? []).filter(p => !p.email_opt_out)
  if (!activeParticipants.length) return Response.json({ sent: 0, message: 'No confirmed participants' })

  const { data: allPicks } = await supabase
    .from('picks')
    .select('participant_id, pot_number, player_name')
    .in('participant_id', activeParticipants.map(p => p.id))

  const matchResults = (matches as MatchResultWithDate[]) ?? []
  const recentMatches24h = matchResults.filter(m => m.played_at && m.played_at >= cutoff24h)
  const recentResults = recentMatches24h
    .slice()
    .sort((a, b) => (a.played_at ?? '').localeCompare(b.played_at ?? ''))
    .map(m => ({ player1: m.player1, player2: m.player2, sets1: m.sets1, sets2: m.sets2 }))

  const leaderboard: LeaderboardRow[] = activeParticipants.map(p => {
    const picks = (allPicks ?? []).filter(pk => pk.participant_id === p.id)
    return { ...p, picks, points: calcParticipantPoints(picks, matchResults) }
  }).sort((a, b) => b.points - a.points)

  // Overall-rang + ligaer per deltaker (til «Dine ligaer»-seksjonen)
  const pointsById: Record<string, number> = {}
  const rankById: Record<string, number> = {}
  leaderboard.forEach((r, i) => { pointsById[r.id] = r.points; rankById[r.id] = i + 1 })

  const [{ data: memberships }, { data: leaguesData }] = await Promise.all([
    supabase.from('league_members').select('participant_id, league_id'),
    supabase.from('leagues').select('id, name, invite_code'),
  ])
  const memberRows = (memberships ?? []) as { participant_id: string; league_id: string }[]
  const leagueInfo: Record<string, { name: string; code: string }> = {}
  for (const l of (leaguesData ?? []) as { id: string; name: string; invite_code: string }[]) {
    leagueInfo[l.id] = { name: l.name, code: l.invite_code }
  }
  const leagueMemberIds: Record<string, string[]> = {}
  for (const m of memberRows) (leagueMemberIds[m.league_id] ??= []).push(m.participant_id)
  const leagueRankByMember: Record<string, Record<string, number>> = {}
  for (const lid of Object.keys(leagueMemberIds)) {
    const ranks: Record<string, number> = {}
    leagueMemberIds[lid].slice().sort((a, b) => (pointsById[b] ?? 0) - (pointsById[a] ?? 0)).forEach((pid, i) => { ranks[pid] = i + 1 })
    leagueRankByMember[lid] = ranks
  }
  const leaguesByParticipant: Record<string, string[]> = {}
  for (const m of memberRows) (leaguesByParticipant[m.participant_id] ??= []).push(m.league_id)

  const subject = `Status etter dag ${vmDay} av ${VM_TOTAL_DAYS} i dart-VM`

  const recipients = testTo
    ? leaderboard.filter(r => r.email === testTo).length > 0
      ? leaderboard.filter(r => r.email === testTo)
      : [{ ...leaderboard[0], email: testTo }]
    : leaderboard

  const fromAddr = `Dart-VM-spillet <oppdatering@${process.env.EMAIL_DOMAIN ?? 'resend.dev'}>`

  const payloads = recipients.map(row => {
    const pointsDelta = row.picks.reduce((sum, pick) => {
      const recent = recentMatches24h.filter(m => m.player1 === pick.player_name || m.player2 === pick.player_name)
      if (!recent.length) return sum
      const rawPts = recent.reduce((s, m) => {
        const isP1 = m.player1 === pick.player_name
        const setPts = (isP1 ? m.sets1 : m.sets2) * SCORING.perSetWon
        const advPts = m.winner === pick.player_name ? SCORING.perAdvancement : 0
        const winnerBonus = m.winner === pick.player_name && m.stage === 'final' ? SCORING.tournamentWinner : 0
        return s + setPts + advPts + winnerBonus
      }, 0)
      return sum + rawPts * (SCORING.underdogMultiplier[pick.pot_number] ?? 1)
    }, 0)
    const ctaUrl = `${BASE_URL}/deltaker/${row.id}`
    const unsubscribeUrl = `${BASE_URL}/api/unsubscribe?id=${row.id}&token=${makeUnsubscribeToken(row.id)}`
    const myLeagues = (leaguesByParticipant[row.id] ?? [])
      .filter(lid => leagueInfo[lid])
      .map(lid => ({ name: leagueInfo[lid].name, code: leagueInfo[lid].code, rank: leagueRankByMember[lid]?.[row.id] ?? 0, total: leagueMemberIds[lid].length }))
      .sort((a, b) => a.name.localeCompare(b.name))
    const overallRank = rankById[row.id]
    const overallTotal = leaderboard.length
    return {
      from: fromAddr,
      to: row.email,
      reply_to: `kontakt@${process.env.EMAIL_DOMAIN ?? 'resend.dev'}`,
      subject,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:oppdatering@${process.env.EMAIL_DOMAIN ?? 'resend.dev'}?subject=unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      html: buildDailyEmail({
        name: row.name, userId: row.id, points: row.points,
        pointsDelta: Math.round(pointsDelta), vmDay,
        unsubscribeToken: makeUnsubscribeToken(row.id), baseUrl: BASE_URL,
        recentResults, overallRank, overallTotal, leagues: myLeagues,
      }),
      text: buildDailyPlainText({ name: row.name, points: row.points, pointsDelta: Math.round(pointsDelta), vmDay, ctaUrl, unsubscribeUrl, recentResults, overallRank, overallTotal, leagues: myLeagues }),
    }
  })

  // Send i batcher på 100 (Resend batch-API) — unngår rate-limit (2/sek) og funksjon-timeout.
  let sent = 0
  const errors: string[] = []
  for (let i = 0; i < payloads.length; i += 100) {
    const chunk = payloads.slice(i, i + 100)
    try {
      const { error } = await resend.batch.send(chunk)
      if (error) errors.push(error.message ?? String(error))
      else sent += chunk.length
    } catch (e) {
      errors.push(String(e))
    }
  }

  return Response.json({ sent, total: leaderboard.length, errors: errors.length ? errors : undefined })
}

