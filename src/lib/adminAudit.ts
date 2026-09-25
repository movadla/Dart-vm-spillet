import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

/**
 * Logger en admin-handling til admin_audit_log. Feiler ALDRI synlig — en
 * feil her (f.eks. manglende tabell på en database uten migrasjonen kjørt
 * ennå) skal ikke blokkere selve admin-handlingen som allerede har skjedd.
 * Admin-autentisering er én delt hemmelighet uten individuelle kontoer, så
 * loggen sier HVA og NÅR, ikke HVEM — se supabase/legacy/add_admin_audit_log.sql.
 */
export async function logAdminAction(action: string, detail?: Record<string, unknown>): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()
    await supabase.from('admin_audit_log').insert({ action, detail: detail ?? null })
  } catch (e) {
    console.error('Admin audit log error:', e)
  }
}
