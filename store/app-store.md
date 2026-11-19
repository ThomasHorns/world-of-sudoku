# App Store – tekster og utfylling

Utkast til App Store Connect. Felt i [HAKEPARENTES] må fylles inn. Kravene under er slik jeg kjenner dem – sjekk dem i App Store Connect når du fyller ut.

## Grunndata

| Felt | Verdi |
|---|---|
| Appnavn (maks 30 tegn) | World of Sudoku. **Navnet må være unikt i App Store** – det sjekkes når appen opprettes i App Store Connect |
| Bundle ID | `mchorn.worldofsudoku` (kan ikke endres etter første opplasting) |
| SKU (internt) | `worldofsudoku` |
| Primærspråk | Norsk (bokmål), med engelsk (UK eller US) som ekstra språk |
| Plattformer | iPhone og iPad |
| Kategori | Spill → Puslespill (sekundær: Brettspill) |
| Pris | Gratis |
| Personvernerklæring (URL) | [URL fra Google Sites] |
| Support-URL (påkrevd) | [URL] – kan være samme Google Sites-side med en egen «Kontakt/hjelp»-del |
| Copyright | 2026 [NAVN] |
| Aldersgrense | 4+ (svar «Ingen» på alle spørsmål i aldersskjemaet) |
| Kryptering | Bruker ikke kryptering som må rapporteres (satt i `app.json`: `usesNonExemptEncryption: false`) |

## Personvern i App Store («App Privacy»)

Velg **Data Not Collected** («Ingen data samles inn»). Appen lagrer bare spill, statistikk og innstillinger lokalt på enheten.

## Butikktekster – norsk

**Undertittel** (maks 30 tegn):

> Logisk sudoku med tips

**Reklametekst** (maks 170 tegn, kan endres uten ny versjon):

> Fem nivåer, et nytt brett hver dag og tips som forklarer logikken. Ingen annonser, ingen konto.

**Søkeord** (maks 100 tegn, kommaseparert, uten mellomrom):

> sudoku,tall,puslespill,logikk,hjernetrim,dagens,brett,tips,notater,klassisk,tankespill

**Beskrivelse**: samme tekst som «Full beskrivelse – norsk» i `store/google-play.md`.

## Store texts – English

**Subtitle** (max 30 characters):

> Logic sudoku with smart hints

**Promotional text** (max 170 characters):

> Five levels, a new puzzle every day and hints that explain the logic. No ads, no account.

**Keywords** (max 100 characters):

> sudoku,puzzle,logic,numbers,brain,daily,hints,notes,classic,grid,number,game

**Description**: same text as "Full description – English" in `store/google-play.md`.

## Skjermbilder

Apple krever skjermbilder for de største skjermstørrelsene (andre størrelser skaleres automatisk):

| Enhet | Størrelse (stående) | Antall |
|---|---|---|
| iPhone 6,9" | 1320 × 2868 (eller 1290 × 2796) | 1–10, anbefalt 4–6 |
| iPad 13" | 2064 × 2752 (eller 2048 × 2732) | 1–10, anbefalt 4–6 |

Uten Mac kan skjermbildene tas fra TestFlight-versjonen på din egen iPhone, og på en iPad (egen eller lånt). Alternativt kan jeg lage dem fra web-versjonen i riktig størrelse.

Forslag til motiver: spillskjerm med markering av tall og notater, tips med forklaring, resultat med «Ny rekord!», hjemskjerm med dagens brett, mørk modus.

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
