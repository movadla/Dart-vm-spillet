import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = getSupabaseAdmin()

// Ligaer (invite_code) som skal vise rang-piler. Hold i synk med SNAPSHOT_LEAGUES i /api/snapshot-ranks.
export const RANK_ARROW_LEAGUES = ['4B86F9', 'QTXXCF']

// Siste lagrede rangering for et scope ('overall' eller liga-kode): { participant_id: rank_pos }.
// Tomt objekt hvis ingen snapshot finnes ennå (f.eks. før kickoff).
export async function getRankBaseline(scope: string): Promise<Record<string, number>> {
  const { data: latest } = await supabase
    .from('rank_snapshot')
    .select('snapshot_date')
    .eq('scope', scope)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!latest) return {}

  const { data: snap } = await supabase
    .from('rank_snapshot')
    .select('participant_id, rank_pos')
    .eq('scope', scope)
    .eq('snapshot_date', latest.snapshot_date)

  const map: Record<string, number> = {}
  for (const s of snap ?? []) map[s.participant_id as string] = s.rank_pos as number
  return map
}
