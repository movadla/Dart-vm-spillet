-- PIN-innlogging ble aldri koblet til noe i UI-et (ingen verify-endepunkt
-- fantes) — reell auth for deltakere er magic link (se add_magic_links.sql).
-- participants.pin var i tillegg "not null" uten default, noe som ville
-- blokkert ENHVER ny påmelding mot en ekte database, siden ingen kode noen
-- gang satte en pin-verdi. Fjerner hele den døde/ødelagte PIN-veien.
-- Trygt å kjøre selv om ingen av delene finnes fra før (alt er "if exists").
alter table participants drop column if exists pin;
drop table if exists pin_attempts;
drop table if exists pin_send_log;
