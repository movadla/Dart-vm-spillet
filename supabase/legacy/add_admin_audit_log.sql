-- Audit-logg for admin-handlinger. Admin-autentisering er én delt hemmelighet
-- (ingen individuelle admin-kontoer), så loggen kan registrere HVA som ble
-- gjort og NÅR, men ikke hvilken person — en kjent, dokumentert begrensning
-- (se TODO.md). Skrives av src/lib/adminAudit.ts fra hvert admin-mutasjons-
-- endepunkt. Kjør denne i Supabase Dashboard → SQL Editor mot en database
-- satt opp før denne loggen fantes.

create table if not exists dart_vm.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  detail jsonb,
  created_at timestamptz default now()
);

create index if not exists admin_audit_log_created_idx on dart_vm.admin_audit_log (created_at desc);

alter table dart_vm.admin_audit_log enable row level security;
-- Ingen anon-policy = blokkert for anon/authenticated. Kun service role
-- (src/lib/adminAudit.ts, kjører server-side) kan lese/skrive.
