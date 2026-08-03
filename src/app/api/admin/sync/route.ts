import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const secret = process.env.SYNC_SECRET
  if (!secret) return NextResponse.json({ error: 'SYNC_SECRET ikke konfigurert' }, { status: 500 })

  const origin = req.nextUrl.origin
  const res = await fetch(`${origin}/api/sync-results?secret=${encodeURIComponent(secret)}`)
  const data = await res.json()

  return NextResponse.json(data, { status: res.status })
}
