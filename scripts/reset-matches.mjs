// Nullstiller match_results og advancement — bevarer deltakere, picks og ligaer.
// Krever at dev-server kjører (npx next dev) eller at BASE_URL peker på Vercel.
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Les ADMIN_SECRET fra .env.local
const envPath = resolve(process.cwd(), '.env.local')
let adminSecret = ''
try {
  const env = readFileSync(envPath, 'utf8')
  const match = env.match(/^ADMIN_SECRET=(.+)$/m)
  if (match) adminSecret = match[1].trim()
} catch {
  console.error('❌ Fant ikke .env.local — legg ADMIN_SECRET der.')
  process.exit(1)
}
if (!adminSecret) {
  console.error('❌ ADMIN_SECRET ikke funnet i .env.local')
  process.exit(1)
}

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'

console.log(`Nullstiller kampdata via ${BASE_URL} ...`)

const res = await fetch(`${BASE_URL}/api/admin/reset-matches`, {
  method: 'POST',
  headers: { 'x-admin-secret': adminSecret },
})

if (!res.ok) {
  const body = await res.text()
  console.error(`❌ Feil (${res.status}): ${body}`)
  console.error('\nSjekk at dev-server kjører: npx next dev')
  process.exit(1)
}

console.log('✓ match_results og advancement er nullstilt.')
console.log('  Deltakere, picks og ligaer er beholdt.')
console.log('\nNeste steg:')
console.log('  node scripts/simulate-remaining-r32.mjs')
