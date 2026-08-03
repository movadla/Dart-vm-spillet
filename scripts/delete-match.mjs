// Sletter én enkelt kamp fra match_results via service role key (bypasser RLS).
// Krever SUPABASE_SERVICE_ROLE_KEY i .env.local
import { readFileSync } from 'fs'
import { resolve } from 'path'

const envPath = resolve(process.cwd(), '.env.local')
let serviceKey = ''
try {
  const env = readFileSync(envPath, 'utf8')
  const match = env.match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m)
  if (match) serviceKey = match[1].trim()
} catch {
  console.error('❌ Fant ikke .env.local')
  process.exit(1)
}

if (!serviceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY ikke funnet i .env.local')
  process.exit(1)
}

const BASE = 'https://oqwcftmudwrvkgfduyve.supabase.co/rest/v1'
const h = { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }

const matchId = process.argv[2] ?? 'ec7ba93b-c180-481c-aa99-440c5aa82a2e'

console.log(`Sletter match_results.id = ${matchId} ...`)

const res = await fetch(`${BASE}/match_results?id=eq.${matchId}`, {
  method: 'DELETE',
  headers: h,
})

if (!res.ok) {
  console.error(`❌ Feil (${res.status}): ${await res.text()}`)
  process.exit(1)
}

console.log('✓ Kamp slettet.')
