-- Run this in Supabase Dashboard → SQL editor
alter table participants add column if not exists pin text not null default '';
alter table participants add column if not exists phone text;

-- Remove the temporary default (new rows must supply pin explicitly)
alter table participants alter column pin drop default;
