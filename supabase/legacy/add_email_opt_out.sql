ALTER TABLE participants ADD COLUMN IF NOT EXISTS email_opt_out boolean NOT NULL DEFAULT false;
