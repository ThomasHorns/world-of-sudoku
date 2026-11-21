# App Store – tekster og utfylling

Utkast til App Store Connect. Felt i [HAKEPARENTES] må fylles inn. Kravene under er slik jeg kjenner dem – sjekk dem i App Store Connect når du fyller ut.

## Grunndata

| Felt | Verdi |
|---|---|
| Appnavn (maks 30 tegn) | World of Sudoku. **Navnet må være unikt i App Store** – det sjekkes når appen opprettes i App Store Connect |
| Bundle ID | `mchorn.worldofsudoku` (kan ikke endres etter første opplasting) |
| SKU (internt) | `worldofsudoku` |
| Primærspråk | Engelsk (valgt 19.11), med norsk (bokmål) lagt til som ekstra språk etter at appen er opprettet |
| Brukertilgang | Full tilgang (du er eneste bruker av kontoen) |
| Plattformer | iPhone og iPad |
| Kategori | Spill → Puslespill (sekundær: Brettspill) |
| Pris | Gratis |
| Personvernerklæring (URL) | https://sites.google.com/view/world-of-sudoku/start |
| Support-URL (påkrevd) | https://sites.google.com/view/world-of-sudoku/start (samme side, med kontakt-e-post) |
| Copyright | 2026 Thomas Hornsletten |
| Aldersgrense | 4+ (None/No på alt, Advertising = Yes, Contests = Infrequent – Frequent gir 13+. Ikke «Made for Kids») |
| Kryptering | Bruker ikke kryptering som må rapporteres (satt i `app.json`: `usesNonExemptEncryption: false`) |

## Personvern i App Store («App Privacy»)

Etter at AdMob kom inn (19.11) samler **annonsene** inn data. Appen selv sender ingenting ut. Svar «Yes, we collect data» og velg disse seks typene (basert på Googles oversikt for Google Mobile Ads SDK; fordelingen på linked/tracking er en forsiktig vurdering):

| Type | Formål | Linked to user | Used for tracking |
|---|---|---|---|
| Location → Coarse Location | Third-Party Advertising | Yes | Yes |
| Identifiers → Device ID | Third-Party Advertising, Analytics | Yes | Yes |
| Usage Data → Product Interaction | Third-Party Advertising, Analytics | Yes | Yes |
| Usage Data → Advertising Data | Third-Party Advertising, Analytics | Yes | Yes |
| Diagnostics → Crash Data | Analytics | No | No |
| Diagnostics → Performance Data | Analytics, Third-Party Advertising | Yes | No |

Ikke oppgi kjøp (håndteres av Apple), Game Center (Apples tjeneste) eller spill/statistikk (bare lokalt). Kilde: https://developers.google.com/admob/ios/privacy/data-disclosure

## Butikktekster – norsk

**Undertittel** (maks 30 tegn):

> Daglig brett og smarte tips

**Reklametekst** (maks 170 tegn, kan endres uten ny versjon):

> Fem nivåer, et nytt brett hver dag og tips som forklarer logikken. Kjøp Pro for å fjerne annonser og konkurrere på topplistene.

**Søkeord** (maks 100 tegn, kommaseparert, uten mellomrom):

> sudoku,tall,puslespill,logikk,hjernetrim,dagens,brett,tips,notater,klassisk,tankespill

**Beskrivelse** (maks 4000 tegn):

> World of Sudoku er en ren og rolig sudoku for iPhone og iPad.
>
> FEM NIVÅER
> Fra Lett til Mester. Nivået bestemmes av hvilke løsningsteknikker brettet krever, ikke bare av hvor mange tall som står fra start. Alle brett har nøyaktig én løsning og kan løses med logikk, uten gjetting.
>
> DAGENS BRETT
> Et nytt brett hver dag, med nivå som skifter gjennom uka.
>
> TIPS SOM FORKLARER
> Står du fast, viser tipset neste logiske steg og forklarer hvorfor – fra «siste ledige rute» til X-Wing og Swordfish. Tips koster litt tid.
>
> SPILL PÅ DIN MÅTE
> • Auto-sjekk: feil tall blir røde med en gang, men koster tid.
> • Uten auto-sjekk: lever brettet når det er fullt – leveringen er endelig.
> • Egen notatrad for blyantmerker. Notatene ryddes automatisk når du setter inn et tall.
> • Markering av like tall og notater med samme tall.
>
> ALLE SPILL TAS TID PÅ
> Følg beste tid og snittid per nivå, med egne rekorder med og uten auto-sjekk.
>
> WORLD OF SUDOKU PRO
> Et engangskjøp fjerner alle annonser og gir deg modusen «uten hjelpemidler» – ingen auto-sjekk og ingen tips. Løste brett uten hjelpemidler kommer på topplistene i Game Center: raskest tid og flest løste brett per nivå – for uken, for fire uker og totalt – pluss en egen liste for dagens brett.
>
> I TILLEGG
> • Pause skjuler brettet, og spillet lagres automatisk.
> • Lys og mørk modus.
> • Norsk og engelsk.

## Store texts – English

**Subtitle** (max 30 characters):

> Daily puzzles & smart hints

**Promotional text** (max 170 characters):

> Five levels, a new puzzle every day and hints that explain the logic. Go Pro to remove ads and climb the leaderboards.

**Keywords** (max 100 characters):

> sudoku,puzzle,logic,numbers,brain,daily,hints,notes,classic,grid,number,game

**Description** (max 4000 characters):

> World of Sudoku is a clean, calm sudoku for iPhone and iPad.
>
> FIVE LEVELS
> From Easy to Master. The level is set by the solving techniques a puzzle needs, not just by how many numbers you start with. Every puzzle has exactly one solution and can be solved with logic, no guessing.
>
> DAILY PUZZLE
> A new puzzle every day, with a level that changes through the week.
>
> HINTS THAT EXPLAIN
> When you are stuck, the hint shows the next logical step and explains why – from "full house" to X-Wing and Swordfish. Hints cost a little time.
>
> PLAY YOUR WAY
> • Auto-check: wrong numbers turn red right away, but cost time.
> • Without auto-check: submit the board when it is full – the submission is final.
> • A separate notes row for pencil marks. Notes are cleared automatically when you place a number.
> • Highlighting of matching numbers and notes.
>
> EVERY GAME IS TIMED
> Track best and average times per level, with separate records with and without auto-check.
>
> WORLD OF SUDOKU PRO
> A one-time purchase removes all ads and unlocks the no-aids mode – no auto-check and no hints. Puzzles solved without aids go on the Game Center leaderboards: fastest time and most solved per level – weekly, every four weeks and all time – plus a daily leaderboard.
>
> ALSO
> • Pause hides the board, and your game is saved automatically.
> • Light and dark mode.
> • English and Norwegian.

## Skjermbilder

Apple krever skjermbilder for de største skjermstørrelsene (andre størrelser skaleres automatisk):

| Enhet | Størrelse (stående) | Antall |
|---|---|---|
| iPhone with Dynamic Island (medium display) | 1206 × 2622 (eller 1179 × 2556) – ferdige i `store/screenshots/iphone/` | 1–10, anbefalt 4–6 |
| iPhone 6,9" (hvis Apple ber om den) | 1320 × 2868 – ferdige i `store/screenshots/iphone-6.9/` | |
| iPad 13" | 2064 × 2752 (eller 2048 × 2732) | 1–10, anbefalt 4–6 |

Uten Mac kan skjermbildene tas fra TestFlight-versjonen på din egen iPhone, og på en iPad (egen eller lånt). Alternativt kan jeg lage dem fra web-versjonen i riktig størrelse.

Forslag til motiver: spillskjerm med markering av tall og notater, tips med forklaring, resultat med «Ny rekord!», hjemskjerm med dagens brett, mørk modus.

## Pro-kjøp (In-App Purchase)

Koden bruker produkt-ID **`worldofsudoku_pro`**. Den må skrives nøyaktig slik i App Store Connect, og kan ikke brukes på nytt hvis produktet slettes.

1. **Avtaler, skatt og bank** (App Store Connect → «Business» / «Avtaler, skatt og bank»): godta avtalen for betalte apper («Paid Apps Agreement») og fyll inn bankkonto og skatteopplysninger. Uten dette virker ikke kjøp, heller ikke i testmiljøet.
2. **Opprett appen** under «Apper» → «+» → «Ny app», hvis den ikke finnes ennå: plattform iOS, navn World of Sudoku, primærspråk engelsk, bundle ID `mchorn.worldofsudoku`, SKU `worldofsudoku`, brukertilgang «Full tilgang». Legg deretter til norsk under appens språkvalg.
3. **Opprett produktet**: appen → «Monetisering» / «In-App Purchases» → «+»:
   - Type: **Ikke-forbrukbart** (Non-Consumable)
   - Referansenavn: `Pro`
   - Produkt-ID: `worldofsudoku_pro`
   - Pris: 49 kr
   - Lokalisering norsk: visningsnavn «World of Sudoku Pro», beskrivelse «Fjerner annonser og gir toppliste for spill uten hjelpemidler.»
   - Lokalisering engelsk: «World of Sudoku Pro», «Removes ads and unlocks leaderboards for no-aids games.»
   - Skjermbilde til gjennomgang: trengs først når appen sendes inn (et bilde av Pro-seksjonen i innstillinger).
4. **Testbruker (Sandbox)**: «Brukere og tilgang» → «Sandbox» → legg til en testkonto med en e-postadresse som ikke er en ekte Apple-ID. På iPhonen logger du inn med den under **Innstillinger → App Store → Sandbox-konto**. Testkjøp koster ingenting.

Det kan ta 15–30 minutter fra produktet er opprettet til det kan hentes i appen.

## Steg fra konto til App Store

Kjøres fra `app/`-mappen. EAS bygger i skyen, så Mac trengs ikke.

1. **Apple Developer Program**: meld deg inn som privatperson på developer.apple.com (99 USD per år). Vent på godkjenning.
2. **Opprett appen i App Store Connect**: «Mine apper» → «+» → Ny app. Velg bundle ID `mchorn.worldofsudoku` (EAS kan registrere den i steg 3 hvis den ikke finnes ennå). Her ser du om navnet er ledig.
3. **Bygg for iPhone/iPad**: `npx eas-cli@latest build --platform ios --profile production`. EAS ber deg logge inn med Apple-ID-en din i terminalen og lager sertifikater og profiler. **Innloggingen gjør du selv.**
4. **Last opp**: `npx eas-cli@latest submit --platform ios --latest`. Bygget havner i App Store Connect og deretter TestFlight.
5. **TestFlight**: legg deg selv (og evt. andre) inn som interne testere. Installer TestFlight-appen på iPhone/iPad og test. Interne testere trenger ingen gjennomgang fra Apple. Eksterne testere (opptil 10 000 via lenke) krever en kort betagjennomgang.
6. **Fyll ut butikksiden** med tekstene over, skjermbilder, personvern og aldersgrense.
7. **Send til gjennomgang**. Apple bruker vanligvis 1–3 dager. Godkjent app kan publiseres med en gang eller på en valgt dato.

Det finnes ikke noe krav om 12 testere i 14 dager hos Apple.
