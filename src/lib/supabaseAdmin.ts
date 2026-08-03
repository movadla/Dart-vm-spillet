import { createClient } from '@supabase/supabase-js'

// Brukes kun server-side — bypasser RLS
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
