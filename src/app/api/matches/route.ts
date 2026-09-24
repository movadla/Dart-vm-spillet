import { NextRequest, NextResponse } from 'next/server'
import { getMatches } from '@/lib/participantData'

// Alle registrerte kampresultater — fra Supabase, eller fra demo-verdenen når
// demo-cookien/`?fase=` er satt. Brukes av VM-guidens «Kamper»-fane, så den
// viser samme turnering som Min side/leaderboardet.
export async function GET(req: NextRequest) {
  const matches = await getMatches(req.nextUrl.searchParams.get('fase'))
  return NextResponse.json({ matches }, { headers: { 'Cache-Control': 'no-store' } })
}
