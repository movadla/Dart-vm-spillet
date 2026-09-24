import { NextRequest, NextResponse } from 'next/server'
import { getParticipantPageData } from '@/lib/participantData'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  // Samme datalag som Min side (inkl. demo-deltakeren), så tallene her og
  // der aldri kan sprike.
  const data = await getParticipantPageData(id, req.nextUrl.searchParams.get('fase'))
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    name: data.participant.name,
    points: data.totalPoints,
    rank: data.rank,
    totalParticipants: data.totalParticipants,
  })
}
