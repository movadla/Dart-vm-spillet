# Lærdom fra World Grand Prix-generalprøven — les før VM i desember

Denne fila samler ALLE reelle bugs/feil som oppsto under generalprøven
(2026-09-27 til -04. okt), med rotårsak og hva som bør gjøres annerledes.
Formålet er at det ekte VM-oppsettet i desember skal fungere første gang,
ikke bli en ny runde med de samme feilene. Slett/arkiver denne fila etter at
den er lest og eventuelle sjekklister under er innarbeidet i den faktiske
desember-forberedelsen.

## Alvorlige, brukervendte bugs (fant vei til produksjon)

1. **KICKOFF var 2 timer feil** (`src/config/tournament.ts`). `new
   Date('2026-09-28T19:00:00Z')` ble skrevet med et `Z` (UTC)-suffiks for et
   tidspunkt som egentlig skulle være 19:00 NORSK tid. September er
   sommertid (CEST, UTC+2), så verdien betydde i praksis 21:00 norsk tid —
   nedtellingen viste 2t13min igjen når det egentlig var ca. 30 min til
   start. Funnet av brukeren RETT før faktisk kickoff.
   **Lærdom:** en «lokal tid» skrevet som en hardkodet UTC-ISO-streng er en
   klassisk felle — offset avhenger av sommer-/vintertid og er lett å bomme
   på. Verifiser ALLTID med en eksplisitt omregning
   (`toLocaleString('nb-NO', {timeZone:'Europe/Oslo'})`) før du stoler på en
   slik verdi, og skriv sjekk-kommandoen inn i kode-kommentaren.
   **Sjekk før desember:** samme bug er mistenkt å finnes i den
   opprinnelige VM-verdien (`2026-12-11T19:00:00Z`, trolig faktisk 20:00
   CET siden desember er vintertid) — allerede flagget i
   `WGP_PIVOT_REVERT.md`, men bekreft med samme metode FØR lansering.

2. **Runde 1 viste feil dato for halvparten av kampene.** Runde 1 spilles
   over TO kvelder, men `STAGE_SCHEDULE.r1.date` var én enkelt dato for hele
   runden — de 16 kampene på kveld 2 arvet feilaktig kveld 1 sin dato.
   **Lærdom:** ikke anta at «én dato per runde» holder for et
   turneringsformat før du har bekreftet den faktiske strukturen
   (fler-kvelds-runder finnes).

3. **Runde 1-tidspunkt lekket inn på runde 2-projeksjoner.**
   Per-kamp-overstyringen (`R1_MATCH_SCHEDULE`) ble brukt uansett hvilket
   stadium som ble spurt om, ikke bare runde 1 — en spiller som hadde
   vunnet runde 1 og fikk vist en eksempel-motstander i runde 2, arvet sitt
   eget bekreftede runde 1-tidspunkt på runde 2-raden i stedet for riktig
   «Ikke satt». Funnet av brukeren i produksjon rett etter at runde
   1-resultater begynte å komme inn.
   **Lærdom:** en «stadium-spesifikk» overstyringstabell MÅ ha en eksplisitt
   stadium-sjekk (`stage === 'r1'`) — ikke stol på at en gjenbrukt
   oppslagsfunksjon bare kalles fra den opprinnelige konteksten den ble
   bygget for.

4. **Fabrikkert kamptidspunkt.** Satte `time: '21:00'` for ALLE
   runde 1-kamper basert på turneringens generelle åpningstidspunkt, ikke en
   ekte kilde per kamp. Brukeren spurte direkte «hvor henter du denne dataen
   fra siden du ikke har fått det rett?».
   **Lærdom:** ALDRI sett et spesifikt tidspunkt/dato uten en ekte,
   navngitt kilde for AKKURAT den verdien — «det er sikkert sånn» holder
   ikke, selv om det virker plausibelt.

5. **96 fiktive «bot»-deltakere fikk alle samme fornavn** («Daniel»).
   Navn-genereringsskriptet hadde en fi/li-tellerlogikk der `fi`
   (fornavn-indeksen) aldri rakk å øke før løkken naturlig stoppet ved 96
   navn — kun etternavnene ble faktisk variert.
   **Lærdom:** verifiser ALLTID at generert data faktisk er variert (f.eks.
   `new Set(names.map(n => n.split(' ')[0])).size`) før du stoler på at et
   skript med tilfeldighet/shuffling faktisk produserte det du ba om — en
   subtil av-por-en-feil kan gi output som ser plausibelt ut ved et raskt
   blikk (ulike etternavn) men er faktisk ødelagt.

## Infrastruktur-/prosess-bugs

6. **`next.config.ts` fikk korrupte tegn hver gang tunnel-skriptet kjørte.**
   `start-dev.ps1` leste fila med `Get-Content` uten `-Encoding UTF8` —
   PowerShell 5.1 tolker da UTF-8-uten-BOM som ANSI, og alle norske tegn
   (å, —) ble til søppeltegn permanent. Lå ulagret i git i flere dager uten
   at noen merket det (endringen så ut som en vanlig "endret fil").
   **Lærdom:** spesifiser ALLTID eksplisitt tegnkoding ved lesing/skriving
   av tekstfiler i PowerShell — stille korrupsjon er lett å overse siden
   det ikke gir noen feilmelding, bare feil bytes.

7. **En Postgres-funksjon havnet i feil skjema første forsøk.**
   `check_rate_limit`-funksjonen ble limt inn i en FERSK Supabase SQL
   Editor-fane uten fila sin `set search_path to dart_vm` fra toppen, og
   havnet dermed i `public` i stedet for `dart_vm`.
   **Lærdom:** når du gir ut en ISOLERT SQL-snutt (ikke hele
   `schema.sql`-fila), skjema-kvalifiser ALLTID navn eksplisitt (`dart_vm.x`)
   — ikke stol på et `search_path` satt et annet sted.

8. **Mobil-scroll-bug som ikke ble fanget opp av visuell verifisering.**
   Kortene i tippe-flyten krevde scroll på en EKTE mobilnettleser, til tross
   for at alt så riktig ut i headless-emulering (430×900). Root cause: 900px
   logisk høyde er urealistisk stort sammenlignet med en ekte nettlesers
   synlige høyde MED adressefelt/verktøylinje (ofte 150–300px mindre).
   **Lærdom:** stol ikke på ÉN fast emulert skjermstørrelse — test mot
   realistisk trange høyder (390×600 e.l.) i tillegg, og — enda bedre —
   bygg layout som MÅLER faktisk tilgjengelig plass (ResizeObserver) i
   stedet for å gjette faste pikselverdier når innholdet må tilpasse seg
   svært varierende skjermstørrelser.

9. **Symmetrisk `margin: auto 0`-sentrering klippet tekst usynlig.**
   Da innhold ble høyere enn den synlige sonen, klippet den samme
   sentrerings-trikset likt av topp OG bunn — uten synlig scroll-indikasjon,
   så teksten så ut til å bare mangle.
   **Lærdom:** bruk `marginTop: auto` ALENE (ikke `margin: auto 0`) når
   innhold skal sentreres-hvis-det-får-plass, men falle tilbake til
   topp-justert-og-scrollbart når det ikke gjør det.

10. **Server-validering av spillervalg var ikke synkronisert med UI-et.**
    `/api/tipp` og `/api/tipp/update` bygde gyldighetslisten fra `pot.players`
    (HELE feltet) i stedet for `getPickablePlayers(pot)` — serveren ville
    stille godtatt et valg UI-et aldri tilbyr.
    **Lærdom:** når «hvilke valg er gyldige» finnes to steder (klient og
    server), sørg for at begge bruker SAMME kilde/funksjon — ikke dupliser
    logikken.

## Forsknings-/kilde-feil (ikke kodebugs, men verdt å huske)

11. **Stolte på et sekundært research-svar uten å verifisere selv.**
    En bakgrunnsagent rapporterte at TheSportsDB dekket World Grand Prix —
    da jeg sjekket direkte selv, fantes turneringen der ikke i det hele
    tatt (kun data frem til februar), og selv der de hadde data var det på
    dag-nivå, ikke kamp-nivå.
    **Lærdom:** verifiser en research-agents KONKRETE faktapåstander selv,
    direkte mot kilden, FØR du enten bygger noe på det eller rapporterer det
    videre til brukeren som et faktum — spesielt når brukeren presser
    tilbake på premisset (som var akkurat det som ledet til å finne PDC sin
    egen, faktisk fungerende API i stedet).

12. **Reverterings-sjekklisten for desember var opprinnelig ufullstendig.**
    Kun 12 av 40 filer med hardkodet «World Grand Prix»-tekst hadde en
    MIDLERTIDIG-kommentar — resten ble bare funnet via en egen,
    dedikert gjennomgang.
    **Lærdom:** stol ikke på at spredte kode-kommentarer holder seg
    fullstendige over tid — hold én sentral, selv-verifiserende sjekkliste
    (med en bokstavelig `grep`-kommando som kan kjøres på nytt) for
    gjennomgripende midlertidige endringer, se `WGP_PIVOT_REVERT.md`.

## Sjekkliste å faktisk gjøre før VM-lansering i desember

- [ ] Verifiser KICKOFF-tidspunktet med `toLocaleString('nb-NO', {timeZone:'Europe/Oslo'})` FØR det committes — ikke bare når det settes opp, men igjen rett før faktisk VM-start.
- [ ] Sjekk om VM-runder faktisk spilles over flere dager/kvelder (som runde 1 i WGP) — ikke anta én dato per runde uten å sjekke.
- [ ] Hvis per-kamp-tidspunkt legges inn igjen: dobbeltsjekk at enhver stadium-spesifikk overstyring har en eksplisitt stadium-sjekk.
- [ ] Ikke fabrikker noe tidspunkt/dato — spør brukeren om kilde er usikker, akkurat som instruksjonen alltid har sagt.
- [ ] Test mobilvisning mot BÅDE en romslig (430×900) og en trang (390×600) emulert skjerm, ikke bare én.
- [ ] Kryssjekk generert/fiktiv testdata (navn, e-poster) for faktisk variasjon før den tas i bruk.
- [ ] PowerShell-skript som leser/skriver tekstfiler: eksplisitt `-Encoding UTF8` alltid.
- [ ] SQL-snutter gitt isolert (ikke hele schema.sql): alltid skjema-kvalifisert.
- [ ] Verifiser enhver ekstern datakilde (API/nettside) direkte selv før den brukes til noe brukervendt — spesielt sekundære research-rapporter.
