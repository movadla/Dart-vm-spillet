# Grand Slam-Spillet — full app review (2026-10-08)

Reviewed by walking every screen in a mobile browser (430×900, plus 390×600 for the pick flow): front page, intro, the four pick steps, the player list and detail panel, summary, registration, "Min side" (before / during / after), leaderboard (all three states), league, guide (3 tabs), find-my-page. Demo data was used for the live states.

**Not verified** (be honest about the gaps): the English UI (my capture failed), the admin panel visually, the 404 and "registration closed" screens, real iPhone/Android browsers, performance on a slow connection, and any contrast measurement. They are on the list at the bottom.

**The idea being judged:** pick 4 players (one per pot) with no changes afterwards; if one of them wins the tournament you share the prize with everyone else who has that player; if nobody has the winner, it goes to whoever has the player who got furthest. It must be easy to fill in, easy to follow and understandable for people who don't know darts.

---

## 1. Verdict

**What already fits the idea well**
- The pick flow is the strongest part: big cards, one decision per screen, clear progress (flags fill in as you go), a pot title with a one-line hint, a short Rules panel.
- Four picks is the right size. The "Se alle 18" card keeps pot 4 manageable.
- The rules are stated plainly in four places (home, intro slide 2, the Regler panel, the guide), and "no changes" is stated.
- Branding is consistent now, and the pot colours (red / amber / blue / green) carry through every screen.

**What does not yet fit the idea** (the five that matter most)
1. **The leaderboard stops working in this format.** With a shared prize most people are tied most of the time. In the live demo, 11 of 12 people sit at rank 1, all glowing gold, ordered by sign-up time. It tells you nothing. (Section 3, screen "Leaderboard".)
2. **Nothing tells the user when their players play.** The "next matches" section was removed with the bracket code and nothing replaced it. During a tournament that is the first thing a fan wants to know.
3. **The deadline is not shown anywhere in the pick flow, the summary, the registration page, or the home page.** People can pick for ten minutes and then find sign-up closed.
4. **The cards speak darts jargon to people who don't know darts.** "ODDS 1,80", "SNITT 101,20", "RANK 1", "Checkout-%". The one number that matters in this game, the chance this player wins, is not shown. Odds are also hard to read (decimal odds, and a bookmaker concept).
5. **There is no reason to come back after you sign up.** Email is postponed, there are no notifications, and with two group matches per player the user's players can be out within a week. After that the app has nothing to say to them.

---

## 2. Quick lists

### Scrap / hide
- Rank arrows (▲▼) and the daily rank snapshot job: in a tied leaderboard they are mostly "–" and add noise.
- The "Seed" column and "Useedet" labels in the guide (meaningless for a 48-player Grand Slam with a group draw).
- "Checkout-%" in the player panel (jargon for beginners). Keep "Snitt" only if it is explained.
- Intro slide 3 ("Follow your players on Min side / start leagues"): not what a new visitor needs before signing up.
- The public "Prøv demo-deltakeren" button on the find-my-page screen, and the old `demo@dart-vm-spillet.no` address in it.
- The duplicated "Info" and "Info og regler" links, and the duplicated "Regler" entry points. One path to the rules is enough.
- The `vm-info` URL and "VM" wording in code/URLs: rename to `/guide` with redirects (cosmetic, but it confuses anyone reading links).

### Add (highest value first)
1. A visible **deadline** (date, time, live countdown) on home, the pick flow, summary and registration.
2. **Win chance in %** on every card and in the player panel (derived from odds, with the source named); a **combined chance** on the summary ("chance that one of your four wins: ~X %").
3. A **"Overrask meg"** (random pick) button, per pot and for all four, for people who don't know the players.
4. **Next match with date and time** for each of your players on Min side, from the PDC fixtures.
5. A **group view** (16 groups of three with standings) in the guide, and each player's group on cards and Min side.
6. A **leaderboard redesign** for ties (section 3).
7. **A result screen after the final**: who won, who shares, "Din andel", with a shareable image.
8. **A way to stay informed**: at minimum the email recap (already planned), ideally also a web-app install prompt / push.
9. A short **FAQ** (cost? what do I win? when's the deadline? can I change? what if my player drops out?).
10. A **"Darts på 60 sekunder"** explainer in the guide (what a leg is, how groups and knockouts work), since many users have never watched the sport.
11. **Admin**: prize view (who shares, e-mails for payout), participant export, result entry for group matches.

### Change (the most impactful changes to what exists)
- Pick-step cards: replace ODDS with win chance; explain or drop SNITT and RANK.
- Summary: add pot label, win chance per player, the deadline and a one-line reminder of the rules before the user commits.
- Registration: warn that the name is public, allow a nickname, and make a mistyped email hard (confirm field or an immediate check).
- Home page: say the hook in the hero ("Treff vinneren og del premien"), add dates and place, show how many have joined.
- Leaderboard and league: group by level, secondary sort by picks still alive.
- Min side: show "x av 4 i live", next match, and a prominent invite-friends prompt.

---

## 3. Screen by screen

### Front page
**Good:** strong hero with the countdown; the how-it-works block with the animated card carousel is attractive; a single clear CTA.
**Problems seen:**
- The sticky header has too much in it for a phone. The brand wraps onto three lines ("GRAND / SLAM / 2026") and sits next to four links plus the language toggle. On a 390 px screen this looks broken.
- The hero says only "Velg 4 dartspillere. Følg dem gjennom turneringen." It never says the thing that makes this game different: share the prize.
- No date, no place, no deadline, no number of participants, no prize information. The only fact on the page is the countdown.
- Two different CTA labels for the same action ("KOM I GANG" at the top, "MELD DEG PÅ" at the bottom).
- The how-it-works pot picker shows only "POTT 1 … POTT 4"; the pick flow uses names (Favorittene, Utfordrerne …). Use the same names.
- "Treff vinneren" uses a rising-chart icon, which suggests analytics, not winning.
- The card carousel is cut off at both edges, which looks accidental.
- The footer shows a private-looking Gmail address as the only contact, and no organiser name.
**Suggestions:** shorter header (logo, "Bli med", menu); hero line with the hook; a facts strip ("14.–22. november · Wolverhampton · frist: …· N påmeldt"); one CTA wording; add FAQ and "who runs this".

### Intro (3 slides)
**Good:** slide 1 (the team-building animation) is charming and communicates "one from each pot" without words; slide 2 (Littler wins, 3 hold him, your share 1/3) explains the shared prize better than any paragraph.
**Problems:** the hook is on slide 2, not slide 1. Slide 3 is about Min side and leagues, which a new visitor does not care about yet. The large brand header takes a third of the screen on slide 1. The animation takes about 9 seconds before the first "Neste" feels useful.
**Suggestions:** two slides: (1) the hook and the example, (2) how to pick (animation) with the deadline. Make the intro skippable permanently (it already remembers) and let "Guide" re-open it.

### Pick steps (the core)
**Good:** exactly right in structure.
**Problems:**
- Jargon on the cards (see above). A beginner cannot judge "1,80" versus "12,00".
- No guidance about the strategic heart of the game: a rare winner pays more because fewer share. Only pot 4 hints at it.
- The detail panel ("Detaljer") is thin: ranking, average and checkout percent. No photo, no nationality text, no titles ("Verdensmester 2025"), no last Grand Slam result, no group, no chance. For the person who most needs help, it helps least.
- The quick-info line under the cards truncates the achievement text ("… ") as soon as the "Se alle" button appears.
- No random option.
- Two taps per step (pick, then Next): fine, but the Next button could become visually "armed" more clearly once a pick is made.
**Suggestions:** win chance first, odds in the detail panel only; add short plain-language tags ("Storfavoritt", "Mørkehest", "Outsider"); make the detail panel useful (photo, titles, last result, group, chance); add "Overrask meg"; show the deadline in the header strip.

### Summary and registration
**Problems:** the summary shows only names. It does not show which pot each is from, the chance, the deadline, or what happens after. The registration step asks for name and email only, which is good, but a mistyped email silently loses access (login is by email link). The name is shown publicly on the leaderboard, and nothing on the form says so.
**Suggestions:** see the "Change" list. After registering, send the user straight to a screen with "Bookmark this / add to home screen / invite friends".

### Min side
**Before the tournament:** just a countdown and the team list. It does not repeat the rules or the deadline, has no chance figure, and has no push toward inviting friends (the only growth loop the game has).
**During:**
- "Beste valg: SISTE 16 · Du deler ledelsen med 10 andre" sounds important, but at that stage everyone in the last 16 "leads". It is technically right and practically noise.
- The status "Gruppespill" in green for a group winner waiting for their first knockout match is ambiguous.
- No next match, time or opponent for any player.
- League rows say "#1 av 8" even when eleven people share rank 1.
**After:** the top card says "Premien gikk til andre denne gangen", which is accurate but flat. No result screen, no share image.
**Suggestions:** "x av 4 i live" as the primary status, a real next-match line per player, a prize-status line that only appears when it means something (semi-finals and later), and an after-final result card with the share image.

### Leaderboard and league
**The biggest design problem in the app.** In this format, ties are the norm, and the current list (one gold-glowing card per participant, ordered by sign-up time) is neither informative nor fair-looking. A person who signed up first appears above someone with the same result.
**Suggestions:**
- Group rows by level ("Siste 16 · 11 deltakere") with a collapsible list; the top group carries the prize status.
- Use "T1" style ranks for ties and drop the gold glow for tied groups.
- Within a level, order by number of picks still alive (it is the best honest measure of who is still in it), and say so.
- Add "Finn meg" (jump to me) and a search box, since lists will be long.
- Show "Hvem har Littler?" style views once sign-up is closed: tap a player to see how many and who share them.
- Keep the same grouping on league pages.

### Guide
**Players tab:** a copy of the pick data with "Seed / Rank / Odds". Useful as a reference, but the seed column is meaningless here and it does not show groups.
**Matches tab:** a clean result list. Missing: upcoming fixtures, group standings, live status. Long names are cut ("Michael van Ger…").
**Rules tab:** clear and well-structured. Missing FAQ and the deadline.
**Suggestions:** rename the tabs to Spillere / Grupper / Kamper / Regler; build the group tables; show fixtures with times.

### Find my page / privacy / other
- "Finn min side" works but forces users on a new device to type their email. A "send me a link" option would be friendlier.
- Privacy text does not mention prizes or payout data. If anything is collected for payout, it must.
- The 404 and closed-registration screens were not reviewed.

---

## 4. Cross-cutting

**Structure and navigation**
- There is no persistent navigation: moving between Min side, leaderboard and guide means small text links. A bottom tab bar for signed-in users (Hjem · Min side · Tabell · Guide) would make the app feel like an app.
- The login model is "remember me by cookie and localStorage". Cleaning the browser or switching phone means starting over. Offer the email-link login on the find page.

**Language**
- Mixed Norwegian/English product words ("Leaderboard", "Rank", "Seed", "Odds", "Snitt"). For a mainly Norwegian audience of non-experts, prefer "Tabell"/"Stilling", "Plassering", "Gruppe", "Vinnersjanse". Keep English darts terms only where they are the real term, and explain them once.
- The English text I wrote this week needs a native check.

**Visual / UI**
- The visual identity (gold-frame cards, bold condensed type) is strong and consistent. Keep it.
- Several secondary texts sit below the project's own minimum contrast rule (0.55 alpha). A proper contrast pass is needed, in particular on the guide and the footer.
- The "Se alle" card still shows a faint coin edge in its text panel.
- On tall phones the pick screen leaves large empty areas above and below the cards. Acceptable, but the space could carry the deadline and the chance figure.

**Trust and legal**
- Odds from bookmakers are shown as a number on every card. Promotion of betting is regulated in Norway, and I am not sure where the line is. Showing a derived win-chance percentage with a source line instead removes the question and is easier to read.
- No organiser name anywhere. Add one, and fill in the "behandlingsansvarlig" field in the privacy page (still empty).

**Accessibility**
- The new list sheet needs a focus trap and keyboard test. The card grid is a radio group (good); the sheet is too.
- Colour is used for state in places (green/red statuses): add icons or text so it does not rely on colour alone.

**Engagement and retention**
- The risk is real: with two group matches, a user's picks may all be out in days. Ideas that fit the format without changing the rules: a "watch party" view (all matches today and who of mine is playing), a daily recap, a "most picked players" reveal once sign-up closes, "your player's group" tracking, a result share image, and a league-vs-league view.

---

## 5. Suggested order of work

**Before any launch (small, high impact)**
1. Deadline visible everywhere, with a live countdown on the pick flow.
2. Fix the header (brand wrapping) and the hero hook; add the facts strip.
3. Win chance % on cards and summary; move odds into the detail panel.
4. Leaderboard grouping for ties, plus alive-count ordering.
5. "Overrask meg" random pick.
6. Registration: public-name notice and a mistyped-email safeguard.
7. Hide the demo link; clean the stale address.
8. Plain-language labels throughout the pick flow.

**Soon after (medium)**
9. Next match and group view from the PDC fixtures (needs the real data).
10. Useful player detail panel (photo, titles, last result, group).
11. Result screen and share image after the final.
12. Admin prize view and export.
13. FAQ and "Darts på 60 sekunder".
14. Bottom navigation for signed-in users; email-link login.

**Later / optional**
15. Push notifications or an installable-app prompt.
16. "Hvem har spilleren?" view after close, "most picked" reveal.
17. Accessibility and contrast pass; English review; real-device testing.

---

## 6. Decisions I need from you

- Show win chance in % instead of odds? (My recommendation: yes, with the source credited.)
- Keep the demo participant public at launch? (My recommendation: no.)
- Should the leaderboard order ties by "picks still alive", or leave ties fully equal and unordered? (My recommendation: alive count, clearly labelled.)
- Do you want a bottom tab bar, or is the current "Hjem / Min side" linking enough for a game that runs nine days?
- Is a random "Overrask meg" button in line with how you want people to play?

---

## 7. Beslutninger og status (2026-10-08, senere)

- **Spørsmål 1 (vinnersjanse i % i stedet for odds):** nei. Odds beholdes på kortene.
- **Spørsmål 2 (skjule demo-deltakeren):** nei. Den beholdes.
- **Spørsmål 3 (sortere uavgjort etter spillere igjen):** ja. Bygget: leaderboard og ligaer er gruppert per nivå med felles overskrift («1. Siste 16 · 11 deltakere · deler ledelsen»), og rader sorteres på nivå, deretter flest spillere igjen, deretter påmeldingstid.
- **Spørsmål 4 (fane-linje):** ja. Bygget som `BottomNav`: vises bare for påmeldte, og bare på Min side, leaderboard, liga og guide. Fanene heter Hjem · Min side · Leaderboard · Guide.
- **Spørsmål 5 («Overrask meg»):** ja. Bygget på hvert valgsteg (terning ved pott-tittelen) og som «Overrask hele laget» med «Angre» på oppsummeringen.
- Resten av listene over (frist, header, hero, registrering, neste kamp …) er **ikke** bestilt ennå.
