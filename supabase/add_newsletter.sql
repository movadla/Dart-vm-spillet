create table if not exists newsletter_signups (
  email text primary key,
  created_at timestamptz default now()
);
