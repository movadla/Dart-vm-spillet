import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { checkAdminAuth } from '@/lib/adminAuth'
import { STAGE_ORDER } from '@/config/scoring'
import { validateMatchResultInput } from '@/lib/matchResultValidation'
import { upsertMatchResult } from '@/lib/upsertMatchResult'
import { logAdminAction } from '@/lib/adminAudit'

interface RowResult { index: number; ok: boolean; error?: string }

export async function POST(req: NextRequest) {
  // Klienten lages per kall — manglende Supabase-konfigurasjon skal gi et
  // forståelig svar fra handleren, ikke crash ved import av ruten.
  const supabase = getSupabaseAdmin()
  const authError = checkAdminAuth(req)
  if (authError) return authError
  try {
    const body = await req.json()
    const rows = body?.matches
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Mangler kamper å importere' }, { status: 400 })
    }
    if (rows.length > 200) {
      return NextResponse.json({ error: 'Maks 200 kamper per import' }, { status: 400 })
    }

    const results: RowResult[] = []
    for (let i = 0; i < rows.length; i++) {
      const validation = validateMatchResultInput(rows[i] ?? {}, STAGE_ORDER)
      if (!validation.ok) {
        results.push({ index: i, ok: false, error: validation.error })
        continue
      }
      const { error } = await upsertMatchResult(supabase, validation.value)
      results.push({ index: i, ok: !error, error: error ?? undefined })
    }

    const succeeded = results.filter((r) => r.ok).length
    await logAdminAction('match-result.bulk_import', { succeeded, failed: results.length - succeeded })
    return NextResponse.json({ succeeded, failed: results.length - succeeded, results })
  } catch (e) {
    console.error('Bulk match result route error:', e)
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}
