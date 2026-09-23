import { createClient } from '@supabase/supabase-js'

// Brukes kun server-side — bypasser RLS
// db.schema: "dart_vm" — alle tabellene ligger i et eget Postgres-skjema
// (ikke "public"), satt opp slik at dette Supabase-prosjektet trygt kan
// deles med en annen app (f.eks. vm-tipping) uten noen risiko for at de to
// påvirker hverandres tabeller/data. Se supabase/schema.sql.
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { db: { schema: 'dart_vm' } }
  )
}
