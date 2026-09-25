-- Run this in Supabase Dashboard → SQL editor, for en database satt opp FØR
-- phone-kolonnen ble en del av schema.sql (nye oppsett trenger ikke dette,
-- se schema.sql).
alter table participants add column if not exists phone text;
