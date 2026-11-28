# Svar til App Review (Guideline 2.1 – Information Needed)

Apple avviste 1.0.0 den 21.11.2026 og ba om skjermopptak + svar på punkt 2–6 i **Notes** (App Review Information). Teksten under limes inn i Notes (maks 4000 tegn). Skjermopptaket lastes opp under **Attachment** på versjonssiden.

## Tekst til Notes (kopier alt mellom strekene)

---
SCREEN RECORDING
Attached (Attachment field): recorded on a physical iPhone running the latest iOS, using build 1.0.0 (6). The newly submitted build 1.0.0 (11) works the same way; it only adds hint improvements (each hint explains its reasoning, points out pencil notes that can be removed, and does not repeat while other hints are available), plus crash reporting. It starts at app launch and shows the tracking prompt, the home screen, playing a puzzle (number entry, notes, hint with explanation, pause), statistics, settings and the paid Pro features: Pro restored with "Restore purchases" (it was already purchased on the TestFlight account, so the purchase sheet cannot be shown again), no ads and the Game Center leaderboards. Without Pro, a banner ad is shown at the bottom of the home, statistics and settings screens, and "Buy Pro" opens the standard App Store purchase sheet.

1. PURPOSE AND AUDIENCE
World of Sudoku is a classic sudoku puzzle game for everyone (rated 4+). It offers calm, ad-supported play with five difficulty levels and a new daily puzzle. Its main value is that every puzzle is graded by the solving techniques it requires and has exactly one solution, and the hint button explains the next logical step (e.g. "naked single", "X-Wing") instead of just revealing a number, so players learn to solve harder puzzles.

2. HOW TO USE THE APP
- No account, login or sample files are needed. Everything works offline except ads, purchases and Game Center.
- Home screen: tap "Play today's puzzle" or choose a level (Easy to Master). Choose auto-check on or off and tap Start.
- In a game: tap a cell, then a number. The second row of numbers adds pencil notes. "Hint" explains the next logical step (+30 s). "Pause" hides the board.
- Statistics and Settings are on the home screen.
- Pro (non-consumable, product ID worldofsudoku_pro): Settings -> Pro -> Buy. Use a sandbox account. Pro removes all ads and unlocks "No aids" mode (no auto-check, no hints), selected in the start dialog.
- Leaderboards (Pro only): puzzles solved in No aids mode are submitted to Game Center. Open them via "Leaderboards" on the home screen. Until the leaderboards go live with this version, Game Center may say they are not active yet.
- "Restore purchases" is in Settings.
- Tapping the "Pro" heading in Settings 5 times shows a leaderboard status panel used for troubleshooting only.

3. EXTERNAL SERVICES
- Apple StoreKit: the Pro in-app purchase.
- Apple Game Center (GameKit): leaderboards.
- Google AdMob (Google Mobile Ads SDK) with Google's User Messaging Platform: banner ads on the home, statistics and settings screens (never during play) and an occasional interstitial after a finished game. Consent and App Tracking Transparency prompts are shown at first launch.
- Sentry (EU region): anonymous crash reports only (no IP address, no personal data, no tracking), to find and fix bugs.
- No own servers, no user accounts, no AI services and no third-party payment processors. All puzzles are bundled in the app and generated/verified by us.

4. REGIONAL DIFFERENCES
The app works the same in all regions. The interface is in English or Norwegian (follows the device, can be changed in Settings). The ad consent form is shown where required by law (e.g. EEA/UK), as decided by Google's consent platform. The daily puzzle follows the device's local date.

5. REGULATED INDUSTRY / THIRD-PARTY MATERIAL
Not applicable. The app is a puzzle game, contains no third-party protected content, and all puzzles, graphics and texts are our own.
---

## Slik tar du skjermopptaket (iPhone, bygg 6 fra TestFlight)

Forberedelse:
- iPhonen må ha nyeste iOS (Innstillinger → Generelt → Programvareoppdatering).
- Pro kan ikke vises kjøpt på nytt: i TestFlight ligger kjøpet på den ekte Apple-ID-en (testkontoene brukes ikke), og det kan ikke nullstilles. Opptaket viser derfor Pro aktivt + «Gjenopprett kjøp».
- Slett appen og installer bygg 6 på nytt fra TestFlight (så sporings- og samtykkespørsmålene vises).
- Legg til Skjermopptak i Kontrollsenter (Innstillinger → Kontrollsenter) hvis det ikke er der.

Opptaket (2–4 minutter er nok):
1. Start opptaket fra Kontrollsenter, så **åpne appen** (opptaket må starte med at appen åpnes).
2. Svar på sporingsspørsmålet og eventuelt samtykkeskjemaet.
3. Startsiden (uten annonse, fordi Pro er aktivt) → start **Lett** med auto-sjekk.
4. Sett inn noen tall, legg til et par notater, trykk **Tips** (vis forklaringen), trykk **Pause** og fortsett.
5. Tilbake → **Statistikk** → tilbake → **Innstillinger**.
6. Vis at Pro står som kjøpt → trykk **Gjenopprett kjøp** og vent på bekreftelsen.
7. Start et brett med **Uten hjelpemidler** på (vis bryteren).
8. Åpne **Topplister** fra startsiden.
9. Stopp opptaket. Det havner i Bilder.

Last opp: overfør videoen til PC-en (AirDrop/iCloud/kabel) og last den opp under **Attachment** i App Review Information. Blir filen for stor, kan opptaket kortes ned i Bilder (Rediger), eller sendes som vedlegg via **Reply to App Review**.
