-- Prevents same person from registering multiple times
alter table participants
  add constraint participants_email_unique unique (email);
