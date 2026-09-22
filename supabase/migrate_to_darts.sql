-- Migrerer datamodellen fra fotball-VM (lag/mål/gruppespill) til PDC dart-VM (spillere/sett/rent knockout).
-- Kjør denne mot en allerede eksisterende cl-spillet-database (schema.sql + tidligere migrasjoner).

alter table picks rename column team_name to player_name;
alter table picks drop constraint if exists picks_pot_number_check;
alter table picks add constraint picks_pot_number_check check (pot_number between 1 and 6);

alter table advancement rename column team_name to player_name;

alter table match_results rename column home_team to player1;
alter table match_results rename column away_team to player2;
alter table match_results rename column home_goals to sets1;
alter table match_results rename column away_goals to sets2;
alter table match_results alter column stage set default 'r1';

drop table if exists match_goals;
