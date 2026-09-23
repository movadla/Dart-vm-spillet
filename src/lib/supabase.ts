import { createClient } from '@supabase/supabase-js'

// Lazy — createClient() kaster umiddelbart hvis env-variablene mangler. Var
// tidligere en ferdig-konstruert modul-nivå eksport, som crashet ETHVERT
// sted som importerte denne filen (f.eks. hele vm-info-siden, inkludert
// faner som "Regler"/"Trekning" som ikke trenger noen database i det hele
// tatt) selv om ingen faktisk spørring noensinne ble kjørt. Samme mønster
// som getSupabaseAdmin() i supabaseAdmin.ts.
// db.schema: "dart_vm" — se samme kommentar i supabaseAdmin.ts.
export function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: 'dart_vm' } }
  )
}
