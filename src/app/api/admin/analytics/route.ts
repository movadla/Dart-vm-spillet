import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/adminAuth'

// Vercel Analytics har ingen offentlig REST API.
// Trafikk vises i Vercel-dashbordet: vercel.com/dashboard → Analytics-fanen.
export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError
  return NextResponse.json({ unavailable: true })
}
