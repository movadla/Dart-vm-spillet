-- Postgres indekserer IKKE foreign keys automatisk. picks.participant_id
-- spørres ved hver lagring, hver visning av leaderboard/deltaker-side/liga —
-- uten indeks blir det en seq scan på hele picks-tabellen ved hver av disse,
-- kostbart med tusenvis av deltakere × 6 picks.
create index if not exists picks_participant_idx on picks (participant_id);

-- Uten denne kunne to samtidige lagringer (dobbeltklikk, ustabilt nett) gi
-- duplikate rader for samme pott, eller (verre) et vindu der alle picks for
-- en deltaker var slettet før de nye var satt inn (delete+insert-mønsteret
-- i api/tipp/update). Endepunktet er nå endret til upsert med denne
-- constrainten, se route.ts.
alter table picks
  add constraint picks_participant_pot_unique unique (participant_id, pot_number);

-- Brukt i furthestStageReached/isPlayerEliminated (src/lib/scoring.ts) —
-- foreløpig i JS på hele tabellen i minnet, men indeksen koster ingenting nå
-- og trengs uansett den dagen dette flyttes til en DB-spørring.
create index if not exists match_results_player1_idx on match_results (player1);
create index if not exists match_results_player2_idx on match_results (player2);
