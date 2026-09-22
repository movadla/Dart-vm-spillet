-- Rate-limiting for /api/admin/login — samme mønster som pin_send_log.
create table if not exists admin_login_attempts (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  created_at timestamptz default now()
);

create index if not exists admin_login_attempts_ip_created_idx
  on admin_login_attempts (ip, created_at);
