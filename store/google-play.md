# Google Play – tekster og utfylling

Alt her er utkast som skal brukes i Google Play Console. Felt i [HAKEPARENTES] må fylles inn.

## Grunndata

| Felt | Verdi |
|---|---|
| Appnavn | World of Sudoku |
| Pakkenavn | `mchorn.worldofsudoku` (kan ikke endres etter første opplasting) |
| Standardspråk | Norsk (nb-NO), med engelsk (en-US) som oversettelse |
| App eller spill | Spill |
| Kategori | Puslespill (Puzzle) |
| Gratis eller betalt | Gratis. Merk: en gratis app kan ikke gjøres betalt senere |
| Annonser | Nei |
| Personvernerklæring | https://sites.google.com/view/world-of-sudoku/start – teksten ligger i `store/personvern.md` |
| Kontakt-e-post | thomas.hornsletten@gmail.com (vises offentlig i butikken) |

## Butikkoppføring – norsk

**Kort beskrivelse** (maks 80 tegn):

> Sudoku med 5 nivåer, dagens brett, tips som forklarer logikken og tidtaking.

**Full beskrivelse** (maks 4000 tegn):

> World of Sudoku er en ren og rolig sudoku uten annonser.
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
> I TILLEGG
> • Pause skjuler brettet, og spillet lagres automatisk.
> • Lys og mørk modus.
> • Norsk og engelsk.
> • Ingen konto, ingen annonser, ingen innsamling av data.

## Store listing – English

**Short description** (max 80 characters):

> Sudoku with 5 levels, a daily puzzle, hints that explain the logic and a timer.

**Full description** (max 4000 characters):

> World of Sudoku is a clean, calm sudoku with no ads.
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
> ALSO
> • Pause hides the board, and your game is saved automatically.
> • Light and dark mode.
> • Norwegian and English.
> • No account, no ads, no data collection.

## Grafikk som trengs

| Element | Krav (slik jeg kjenner dem – sjekk i Play Console) | Status |
|---|---|---|
| App-ikon | 512 × 512 PNG | Lages fra `app/assets/icon.png` når logoen er endelig |
| Funksjonsgrafikk | 1024 × 500 PNG/JPG | Mangler |
| Skjermbilder telefon | Minst 2, helst 4–8 | Tas fra testversjonen på telefon |

## Datasikkerhet (Data safety)

Svar i skjemaet, basert på at appen ikke sender noe fra enheten:

- Samler appen inn eller deler noen av de påkrevde brukerdatatypene? **Nei**
- (Når svaret er nei, hoppes resten av skjemaet over.)

## Innholdsvurdering (IARC-spørreskjema)

Kategori: puslespill/spill. Svar **nei** på alt om vold, sex, språk, rusmidler, gambling, brukerinteraksjon og deling av posisjon. Forventet resultat: laveste aldersgrense (f.eks. PEGI 3 / Everyone).

## Målgruppe

Avklart: **13 år og eldre**. Da gjelder ikke Googles ekstra krav for familieapper.

## Publisere personvernerklæringen på Google Sites

1. Gå til sites.google.com med Google-kontoen din og lag et nytt, tomt nettsted.
2. Gi det et navn, f.eks. «World of Sudoku – personvern».
3. Lim inn teksten fra `store/personvern.md`, med norsk og engelsk under hverandre. Fyll inn navn, dato og e-post.
4. Trykk **Publiser**, velg en adresse, og sørg for at siden er synlig for alle.
5. Kopier adressen og lim den inn i feltet for personvernerklæring i Play Console.

## Lukket test (krav for nye private kontoer)

Ifølge flere kilder (ikke sjekket mot Googles egen side) må nye private kontoer, opprettet etter 13. november 2023, kjøre en lukket test før appen kan publiseres for alle:

1. Last opp en versjon til sporet **Lukket testing** i Play Console.
2. Legg inn minst **12 testere** (Google-kontoer, f.eks. via en e-postliste eller Google-gruppe).
3. Testerne må takke ja via testlenken og ha appen installert i **14 dager i strekk**.
4. Søk deretter om produksjonstilgang i Play Console og svar på spørsmålene om testen.

Tips: be testerne faktisk spille og gi tilbakemelding. Google spør om hva testen ga av endringer.

## Steg for å bygge og laste opp (når kontoene er klare)

Kjøres fra `app/`-mappen. EAS bygger appen i skyen, så Android Studio trengs ikke.

1. `npx eas-cli@latest login` – logg inn med Expo-kontoen.
2. `npx eas-cli@latest init` – kobler prosjektet til Expo-kontoen (skriver prosjekt-ID inn i `app.json`).
3. `npx eas-cli@latest build --platform android --profile preview` – lager en APK som kan installeres direkte på en lånt Android-telefon for testing.
4. `npx eas-cli@latest build --platform android --profile production` – lager AAB-filen som lastes opp til Play Console.
5. Første opplasting gjøres for hånd i Play Console (lukket testing). Senere kan `eas submit` brukes.
