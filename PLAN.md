# World of Sudoku – prosjektplan

Sist oppdatert: 17.11.2026

Dokumentet skiller mellom tre ting:

- **Besluttet** – avklart med deg.
- **Forslag** – min anbefaling, ikke besluttet. Krever ditt ja/nei.
- **Åpent** – må avgjøres før den aktuelle fasen starter.

## Status – her fortsetter vi

**Sist oppdatert 22.11.** Versjon 1.0.0 (bygg 6) ble sendt til Apple 21.11 sammen med Pro-kjøpet og alle 31 topplister. Apple svarte «Guideline 2.1 – Information Needed» (ingen feil i appen): de ville ha skjermopptak og svar på spørsmål om formål, bruk, eksterne tjenester og regioner. **Sendt inn på nytt 22.11** med opptak (Attachment) og ny tekst i Notes – se `store/app-review-notes.md`. Venter på svar. «Manually release» er valgt – appen kommer ikke ut før du trykker Release.
Merk: i TestFlight brukes den ekte Apple-ID-en til kjøp (i sandkasse), ikke testkontoene – et Pro-kjøp der kan ikke nullstilles med Clear Purchase History.

**Ferdig:** fase 0 og 1 (motor, enspiller), fase 2b i kode og testet på iPhone med utviklerversjonen: Pro-kjøp (sandbox-kjøp virker), «uten hjelpemidler», Game Center (31 lister opprettet, innsending virker – se logg-linjer `[toppliste]` i utviklerserveren), AdMob (samtykke, banner, mellomannonse). iPhone-skjermbilder (6 engelske + 6 norske, 1206×2622) er lastet opp i App Store Connect. Personvernside: https://sites.google.com/view/world-of-sudoku/start

**Lanseringsmål:** iPhone og iPad først (Android på pause). PVP kommer etter lansering (fase 4).

**Neste steg, i rekkefølge:**
1. ~~**iPad**~~ – **ferdig 19.11**: iPad 6 registrert (UDID `950a7c83…`), utviklerbygg `a64f5fd5` med begge enhetene. 6+6 iPad-skjermbilder ligger i `store/screenshots/ipad/{en,no}/1–6.png` (2064×2752) – lastet opp i App Store Connect (iPad 13" Display, begge språk) 19.11. Merk: kjør alltid `eas` fra `app/`, ellers lager EAS en ny `eas.json`/`app.json` i rotmappen.
2. ~~**App Privacy** i App Store Connect~~ – **ferdig 19.11**: fylt ut og publisert etter tabellen i `store/app-store.md`. Sporingsspørsmålet (ATT) vises ved oppstart, så tracking = Yes er dekket.
3. ~~**App Information**~~ – **ferdig 19.11**: undertittel «Daily puzzles & smart hints» / «Daglig brett og smarte tips», kategori Games → Puzzle, aldersgrense 4+ (Contests = Infrequent; Frequent ga 13+). Ikke «Made for Kids» – Kids-kategorien tillater ikke sporende annonser. Appen selges ikke i Afghanistan og Marokko (lokale lover).
4. ~~**Produksjonsbygg**~~ – **ferdig 21.11**: bygg 4 og 5 lastet opp (`eas build … --profile production --auto-submit` fra `app/`). `eas submit` bruker en App Store Connect API-nøkkel (rolle App Manager, lagret hos EAS). ASC App ID `6836692482`. Testet i TestFlight: Pro og Game Center-innlogging virker (sporingsspørsmål og ekte annonser er ikke bekreftet ennå). **Topplister:** resultatene sendes (kø = 0, ingen feil), men Game Center viser «ikke aktiv ennå» til versjonen er godkjent og listene er Live – sjekk etter lansering. Bygg 5 har «Status for topplister» i Innstillinger; i neste bygg (6) er kortet skjult bak **5 trykk på Pro-overskriften**.
5. ~~**Versjonssiden**~~ – **sendt inn 21.11**: bygg 6, Pro (`worldofsudoku_pro`) og alle 31 topplister i samme innsending (33 elementer). Lærdom: i dagens App Store Connect må første kjøp og hver toppliste legges til utkastet én og én («Add for Review» → «Draft iOS Submission») – de følger ikke versjonen automatisk. Manglet før innsending: personvern-URL (App Privacy), support-URL på begge språk, norsk beskrivelse og søkeord.
   **Etter godkjenning:** trykk Release; løs et brett med Pro uten hjelpemidler og sjekk at det vises på topplisten; sjekk ekte annonser på en enhet uten Pro (f.eks. iPaden). Aldersskjemaet har to nye spørsmål (Location Sharing, Dating) som må besvares før 15.01.2027 – svar No.
6. Til slutt (valgfritt): endelig logo, nytt skjermbilde til Pro-produktet med pris.

**Praktisk:** utviklerserveren startes med `npx expo start` i `app/`. Git krever `-c safe.directory=*` (D: er exFAT). Sjekk nye filer før commit (`git status --untracked-files=all`) – private notater skal ikke i git.

---

## 1. Mål

En sudoku-app for mobil der alle spill tas tid på.

1. Først: enspiller med 5 vanskelighetsnivåer.
2. Senere: online dueller mot andre spillere, med matchmaking som gir jevne kamper.

## 2. Beslutninger

### Generelt

| Tema | Beslutning |
|---|---|
| Navn | World of Sudoku (samme navn på norsk og engelsk) |
| Plattform | iOS og Android, én felles kodebase |
| Teknologi | Expo / React Native (TypeScript) + Supabase som backend |
| Språk | Norsk og engelsk fra start |
| Forretningsmodell | Endret 19.11: gratis nedlasting med annonser. Engangskjøp «Pro» (49 kr) fjerner annonser og gir tilgang til topplister. Se fase 2b |
| Utgiver | Privatperson. iPhone og iPad lanseres først (endret 19.11), Android senere |
| App-ID | `mchorn.worldofsudoku` (Android og iOS) |
| Konto | Ingen innlogging i enspiller-fasen. Alt lagres lokalt på telefonen |

### Brett og nivåer

| Tema | Beslutning |
|---|---|
| Brett | Ferdiglagd brettbank som følger med appen. Lages og graderes av et skript i prosjektet. Samme bank brukes senere i online-kamper |
| Krav til brett | Nøyaktig én løsning, kan løses uten gjetting |
| Utgangstall | Tilfeldig antall per brett innenfor spennet for nivået (se tabell under). Tall som legges til, skal aldri gjøre brettet lettere enn nivået. Spennene kan justeres ved testing |
| Nivåer | 5 nivåer, definert av hvilke løsningsteknikker brettet krever (se tabell under) |

| Nivå | Norsk | Engelsk | Teknikker brettet krever | Utgangstall |
|---|---|---|---|---|
| 1 | Lett | Easy | Siste ledige rute i rad/kolonne/boks, åpenbare singler | 30–40 |
| 2 | Middels | Medium | Skjulte singler | 27–36 |
| 3 | Vanskelig | Hard | Par (åpne og skjulte), pekende par, boks/linje-reduksjon | 24–32 |
| 4 | Ekspert | Expert | Tripler, X-Wing | 22–30 |
| 5 | Mester | Master | Swordfish, XY-Wing | 22–30 |

### Spillregler

| Tema | Beslutning |
|---|---|
| Tidtaking | Alle spill tas tid på. Pause stopper klokken og skjuler brettet. Spillet lagres og kan fortsettes |
| Lagring | Pågående spill lagres alltid, også når appen lukkes eller går i bakgrunnen uten pause. Klokken stopper mens appen ikke er åpen |
| Notater | Blyantmerker (kandidattall). Skrives med en egen notatrad 1–9 under tallraden 1–9: et trykk slår notatet av/på i valgt rute. Ingen egen «Notater»-knapp. Når et tall settes inn, fjernes det automatisk fra notatene i samme rad, kolonne og boks. Notater sjekkes aldri |
| Angre-knapp | Ikke med. Feil rettes ved å slette eller overskrive tallet |
| Tips | Forklarer logikken bak neste steg (ikke bare et tall). Gir tidsstraff |
| Auto-sjekk | Velges før spillet starter og kan ikke endres underveis |
| Auto-sjekk PÅ | Feil tall markeres rødt med en gang og gir tidsstraff per feil. Spillet kan alltid fullføres. Spillet avsluttes automatisk når siste rute er riktig: klokken stopper og resultatskjermen vises |
| Auto-sjekk AV | Ingen sjekk underveis og ingen tidsstraff for feil. «Lever brett» kan bare trykkes når alle ruter er fylt. Brettet vises da som riktig eller feil, og feilene uthves rødt. Levering er endelig: med feil er spillet over og regnes som ikke løst |
| Tips ved feil (auto-sjekk AV) | Har brettet feil tall, sier tipset bare «Det finnes minst én feil på brettet», uten å vise hvor. Gir tidsstraff som vanlig tips |
| Straffestørrelse | Startverdier: 30 s per feil (auto-sjekk på) og 30 s per tips. Legges rett på klokken, og «+30 s» vises kort. Justeres etter testing |
| Pågående spill | Ett uferdig spill per nivå, pluss dagens brett. Starter man nytt på et nivå med uferdig spill, spør appen om det skal fortsettes eller forkastes |
| Språk | Følger telefonen (norsk hvis telefonen er på norsk, ellers engelsk), kan endres i innstillinger |

### Funksjoner i første versjon

- Statistikk per nivå: beste tid, snittid, antall løste, antall tips og feil. Egne rekorder for spill med og uten auto-sjekk.
- Dagens brett: samme brett for alle hver dag. Nivået skifter med ukedagen (se åpent spørsmål 15).
- Mørk modus.
- Markering av like tall og av rad/kolonne/boks for valgt rute.

### Utseende

- Stil A: ren og minimalistisk. Hvitt og grått med blå aksentfarge, runde former på knapper og ytterkant.
- Spillskjerm: tid og nivå øverst, brettet, verktøyrad (Slett, Tips, Pause), tallrad 1–9 og notatrad 1–9 under.
- Klassisk rutenett: tynne linjer mellom alle ruter, tykke linjer rundt hver 3×3-boks, avrundet ytterkant. Rutene er ikke avrundet inni rutenettet; runde former brukes på knapper og ytterkant.
- Lys og mørk modus.
- Logo: retning A – rutenett (3×3-boks med 9 i midten, avrundet firkant) i blått. Endelig logo tegnes i fase 2.

### Online (fase 4)

| Tema | Beslutning |
|---|---|
| Kampform | Begge får samme brett samtidig. Først ferdig vinner. Detaljer (Pro, Game Center, nedtelling 5→0, Elo per nivå) under fase 4 i kapittel 6 |

## 3. Vurdering

Rekkefølgen er riktig. Enspiller gir et komplett produkt alene, og alt som bygges der (brett, motor, tidtaking) gjenbrukes i online-modus. Nivåer basert på løsningsteknikker og tips som forklarer logikk bruker samme logikkmotor, som bygges én gang.

Auto-sjekk gir to tydelige spillestiler: én tilgivende med straff, og én der man må være sikker før man leverer. Fordi rekordene holdes adskilt, blir tidene rettferdig sammenlignbare innen hver stil.

To ting er vanskeligere enn de ser ut:

- **Logikkmotoren** (løse brett med menneskelige teknikker, gradere dem, forklare stegene) er den største enkeltjobben i fase 1.
- **Juks i online-modus.** Sudoku kan løses av et program på millisekunder. Online-kamper må derfor valideres på server, og rating må tåle at noen jukser.

## 4. Forslag (ikke besluttet)

### 4.1 Funksjoner som ikke kom med i første versjon
«Rent spill»-merke (tid uten tips og feil) ble ikke valgt. Kan vurderes senere. (Lagring når appen lukkes er avklart, se spilleregler.)

### 4.2 Online-modus
- **Rating:** Glicko-2 eller Elo per spiller. Matchmaking søker først etter nær lik rating og utvider gradvis søket mens man venter.
- **Brettvalg:** nivået på brettet velges ut fra spillernes rating.
- **Fremdrift:** man ser hvor mange ruter motstanderen har fylt, ikke hvilke tall.
- **Servervalidering:** fasiten sendes aldri til telefonen i online-kamper. Hvert trekk og sluttresultatet kontrolleres av serveren, som også eier klokken.
- **Vennekamp:** utfordre en bestemt person med kode eller lenke, uten rating.
- **Frakobling:** en fast regel for hva som skjer når en spiller mister nett (f.eks. 30 sekunder til å koble til igjen før tap).

## 5. Arkitektur

```
app/                     Expo-appen (skjermer, navigasjon, UI) – egen package.json og node_modules
packages/engine/         Sudoku-motoren – ren TypeScript, ingen UI
  src/board.ts           brettstruktur, rader/kolonner/bokser
  src/validation.ts      konflikter, feil, «Lever brett»
  src/solver.ts          rask backtracking-løser (fasit, unik løsning)
  src/logic.ts           logisk løser med de 12 teknikkene
  src/generator.ts       gradering og generering
  src/hint.ts            tips (neste logiske steg, eller «det finnes en feil»)
  src/explain.ts         forklaringstekster og navn på norsk og engelsk
  test/                  tester (vitest)
packages/game/           spillreglene (rene funksjoner): trekk, notater, klokke, straff,
                         tips, levering, statistikk, dagens brett, valg av brett
packages/puzzle-bank/    brettbanken, 1000 brett per nivå (data/level-N.json)
app/src/                 skjermer (hjem, spill, statistikk, innstillinger), brett,
                         tastatur, tekster (nb/en), farger og lokal lagring
tools/                   skript som lager og kontrollerer brettbanken
supabase/                database, innlogging og serverfunksjoner (fra fase 3)
```

**Kommandoer** (fra prosjektmappen):

- `npm test` – kjører testene for motoren
- `npm run typecheck` – typesjekk av motor, skript og brettbank
- `npm run generate-bank -- --count 1000 --seed 2026` – lager brettbanken på nytt (samme frø gir samme brett)
- `npm run verify-bank` – kontrollerer alle brett og viser statistikk
- `npm run web` – starter appen i nettleseren (http://localhost:8081)
- `npm start` – starter appen (åpnes i Expo Go på telefonen). Ikke kjør `npx expo start` direkte i prosjektmappen: appen ligger i `app/`, og Expo vil da installere seg selv på feil sted

**Teknisk merknad:** D:-disken er formatert som exFAT, som ikke støtter symlenker. Derfor brukes ikke npm workspaces. Appen importerer motoren med relative stier (`../packages/engine/src`), og `app/metro.config.js` peker Metro til `packages/`. Flyttes prosjektet til en NTFS-disk, kan workspaces tas i bruk igjen.

Motoren holdes helt adskilt fra appen. Da kan den testes grundig for seg, og den samme koden kan kjøres på serveren når online-kamper skal valideres.

Lokal lagring i fase 1: pågående spill, statistikk og innstillinger ligger på telefonen. Datamodellen lages slik at den kan flyttes til en konto senere uten at spillerne mister historikken.

## 6. Faser

### Fase 0 – Grunnlag
- Opprette prosjektet (Expo, TypeScript, git, testoppsett).
- Bygge sudoku-motoren med tester: løser, gradering, validering.
- Bygge skriptet som lager brettbanken for alle 5 nivåer.

**Ferdig når:** motoren graderer brett stabilt, og det finnes en brettbank for hvert nivå.

**Status 17.11: ferdig.**
- Motoren kan løse, gradere, validere og gi tips med forklaring for alle 12 teknikker. 29 tester går gjennom.
- Brettbanken har 1000 brett per nivå (5000 totalt, ca. 1 MB). Alle er kontrollert: nøyaktig én løsning, kan løses uten gjetting og er gradert til riktig nivå. Antall utgangstall er innenfor spennet for nivået.
- Expo-appen (SDK 58) er opprettet med en midlertidig startskjerm som bruker motoren og brettbanken. Appen bygger for Android, og expo-doctor finner ingen problemer.
- Ikke testet på en ekte telefon ennå.

### Fase 1 – Enspiller
- Spillskjerm: brett, tallknapper, notater, markering av like tall og rad/kolonne/boks.
- Auto-sjekk av/på før spillstart, og «Lever brett» når den er av.
- Tidtaker med pause (skjult brett) og tidsstraff for feil (auto-sjekk på) og tips.
- Tips som viser og forklarer neste logiske steg.
- Nivåvalg, dagens brett, fortsett-spill, resultatskjerm.
- Lokal lagring og statistikk, med egne rekorder med og uten auto-sjekk.
- Mørk modus.
- Norsk og engelsk.

**Ferdig når:** et spill på hvert nivå kan spilles fra start til slutt med og uten auto-sjekk, avbrytes og fortsettes, og tiden lagres.

**Status 17.11: bygget og testet i nettleser.**
- Hjem (dagens brett, nivåer, statistikk, innstillinger), startvalg med auto-sjekk, spillskjerm, resultat, statistikk og språkvalg er laget.
- Spillreglene ligger i `packages/game` med 21 tester. Totalt 50 tester går gjennom.
- Testet i nettleser (mobilstørrelse, lys og mørk modus): notater, feil med og uten auto-sjekk, straff, tips («det finnes en feil» og logisk steg), pause, automatisk avslutning, levering med feil, statistikk og lagring etter ny innlasting.
- På web kan tallene også skrives med tastaturet (1–9, Backspace, piltaster).
- Ikke testet på en ekte telefon ennå.

### Fase 2 – Testing og lansering
- Testing på ekte iOS- og Android-telefoner.
- Justere straffestørrelser og nivågrenser ut fra spilling.
- Sjekke at navnet «World of Sudoku» er ledig i App Store og Google Play.
- Ikon, butikkbilder, personvernerklæring.
- Utviklerkontoer: Apple (99 USD per år) og Google Play (25 USD, engangsavgift).
- Betatest (TestFlight / lukket test i Google Play), deretter publisering.

**Ferdig når:** appen ligger i begge butikkene.

**Avklart 17.11 (plattformvalget er endret 19.11, se under):** Android lanseres først (iPhone senere med samme kode). Utgiver er deg som privatperson. App-ID: `mchorn.worldofsudoku`. Første versjon er gratis, uten annonser og kjøp. Google-kontoen er ny, så en lukket test med minst 12 testere i 14 dager trengs før publisering. Android-telefon til testing lånes.

**Status 17.11 – forberedt:**
- `app/app.json`: app-ID for Android og iOS, oppstartsbilde (lys og mørk), ikonfarge.
- `app/eas.json`: byggeprofiler `preview` (APK til testing) og `production` (AAB til Google Play), med automatisk versjonsnummer.
- Midlertidige ikoner og oppstartsbilde fra logo A, laget med `npm run generate-icons`.
- `store/personvern.md`: personvernerklæring (nb/en).
- `store/google-play.md`: butikktekster (nb/en), datasikkerhet, innholdsvurdering, plan for lukket test og byggesteg.

**Endret 19.11: iPhone lanseres først, Android er satt på pause.** Appen lanseres for både iPhone og iPad. Testing skjer i Expo Go nå og i TestFlight når Apple-kontoen er klar. Android-oppsettet (test-APK, `store/google-play.md`) ligger klart til senere.

**Gjort for iPhone/iPad 19.11:**
- `app.json`: `requireFullScreen` (appen er bare laget for stående retning) og `usesNonExemptEncryption: false`.
- Brettet blir større på iPad og andre store skjermer (opptil 680 punkter), testet i nettleser i iPad-størrelse.
- `store/app-store.md`: tekster (nb/en), søkeord, personvern («Data Not Collected»), aldersgrense, skjermbilder og steg fra konto til App Store.

**Gjenstår for iPhone (krever deg):**
1. ~~Melde deg inn i Apple Developer Program~~ – godkjent 19.11. Første iOS-bygg (production, byggnummer 2) er ferdig. Sertifikater og profiler er laget av EAS og lagres hos Expo.
2. Velge kontakt-e-post (åpent spørsmål 17).
3. ~~Publisere personvernerklæring og support-side~~ – gjort 19.11: https://sites.google.com/view/world-of-sudoku/start
4. Opprette appen i App Store Connect (her vises det om navnet er ledig).
5. Bygge for iOS med EAS (du logger inn med Apple-ID-en i terminalen) og laste opp til TestFlight.
6. Teste med TestFlight på iPhone og iPad. Justere straff og nivåer ved behov.
7. Endelig logo og skjermbilder for iPhone og iPad.
8. Fylle ut butikksiden og sende til gjennomgang hos Apple.

**Android (på pause) – gjenstår:**
1. ~~Koble prosjektet til Expo-kontoen og bygge en testversjon~~ – gjort 17.11: prosjektet eies av `mchorn-team` på expo.dev, og første test-APK (versionCode 1) er bygget med profilen `preview`. Signeringsnøkkelen ble laget og lagres av Expo.
2. Teste på lånt Android-telefon (Galaxy A06 eller S22).
3. Funksjonsgrafikk og skjermbilder for Google Play.
4. Opprette appen i Play Console, fylle ut skjemaene og starte lukket test med 12 testere i 14 dager.
5. Søke om produksjonstilgang og publisere.

### Fase 2b – Annonser, Pro og toppliste (før lansering)

Besluttet 19.11. Dette kommer med i første versjon i App Store.

**Annonser (gratisversjonen)**

| Tema | Beslutning |
|---|---|
| Nettverk | Google AdMob. App-ID (iOS): `ca-app-pub-3041624447235807~3132374765`. Banner «Hjem banner»: `ca-app-pub-3041624447235807/6362666624`. Mellomannonse «Mellom spill»: `ca-app-pub-3041624447235807/1510182232`. GDPR-melding og IDFA-forklaring er publisert i AdMob (19.11). Under utvikling brukes Googles test-ID-er |
| Banner | Liten banner nederst på hjem, statistikk og innstillinger. **Ikke** på spillskjermen |
| Mellomannonse | Fullskjermsannonse etter hvert 2. fullførte spill |
| Sporing | Appen spør om sporing (Apples «Tillat sporing?») for personlige annonser, og viser EU-samtykke (GDPR) via AdMobs samtykkeskjema. Sier brukeren nei, vises ikke-personlige annonser |

**Pro (engangskjøp)**

| Tema | Beslutning |
|---|---|
| Pris | 49 kr, engangskjøp i App Store |
| Gir | Ingen annonser, og spill uten hjelpemidler registreres på topplistene |
| Gjenopprett kjøp | Knapp i innstillinger (Apple krever det) |
| Modus | Pro-brukere velger «uten hjelpemidler» ved start. Vanlig spill med hjelpemidler finnes fortsatt for alle |
| Uten hjelpemidler | Auto-sjekk og tips er av. Notater og markering av like tall er tillatt |

**Topplister (Apple Game Center)**

| Tema | Beslutning |
|---|---|
| Teknologi | Apple Game Center. Spilleren bruker sitt Game Center-navn. Bare iPhone/iPad – Android trenger en egen løsning senere, og listene blir ikke felles |
| Hva teller | Bare løste spill uten hjelpemidler, spilt av Pro-brukere. Tapte leveringer teller ikke |
| Lister per nivå | Raskeste tid, og flest løste brett |
| Perioder | Totalt, denne uken og denne måneden |
| Dagens brett | Teller på nivåets lister, og har i tillegg en egen liste per dag (alle har spilt samme brett) |

Det gir 5 nivåer × 2 lister × 3 perioder = 30 lister, pluss én daglig liste for dagens brett. Listene opprettes i App Store Connect.

**Konsekvenser (må gjøres eller endres):**
- **Expo Go kan ikke lenger brukes til testing.** Annonser, kjøp og Game Center krever native moduler. Testing skjer med en egen utviklerversjon (development build) eller via TestFlight. iPhonen din må registreres hos Expo for utviklerversjonen.
- **Personvern:** `store/personvern.md` og personvernskjemaet i App Store («App Privacy») må skrives om. Appen samler nå inn data via AdMob (enhets-ID, annonsedata, sporing), og Game Center deler resultater med Apple.
- **Butikktekster:** «ingen annonser» og «ingen innsamling av data» må fjernes fra `store/app-store.md` og `store/google-play.md`.
- **Kontoer og avtaler (du):** AdMob-konto med bankinformasjon. Avtalen for betalte apper («Paid Apps Agreement») med bank- og skatteinformasjon i App Store Connect. Game Center slås på for appen.
- **Pakker som skal velges og sjekkes mot Expo SDK 58-dokumentasjonen ved implementering:** AdMob (f.eks. `react-native-google-mobile-ads`), sporingsspørsmål (`expo-tracking-transparency`), kjøp (f.eks. `expo-iap`, `react-native-iap` eller RevenueCat) og Game Center (ingen offisiell Expo-modul – kan kreve en egen liten native modul).
- **Juks:** Game Center-lister kan i teorien manipuleres. Appen sender bare resultater fra spill den selv har sett fullført, men det finnes ingen servervalidering før fase 3/4.
- **Det eksisterende iOS-bygget (byggnummer 2)** har ikke annonser eller Pro. Det kan brukes til å teste spillet i TestFlight, men et nytt bygg trengs før lansering.

**Bygg 19.11:** utviklerversjon med Pro, Game Center og AdMob er bygget (EAS-bygg `ff9a0e64`). Game Center måtte slås på manuelt for app-ID-en i Apple Developer (Identifiers → mchorn.worldofsudoku → Capabilities), fordi EAS ikke gjorde det selv. Da ble signeringsprofilen laget på nytt. Det samme vil gjelde App Store-profilen ved neste produksjonsbygg.

**Rekkefølge (forslag):**
1. ~~Utviklerversjon (development build) for iPhone~~ – gjort 19.11: `expo-dev-client` og byggprofilen `development` er lagt til, iPhonen er registrert, og utviklerversjonen er bygget og installert. Start med `npx expo start` i `app/`, så åpner utviklerversjonen koden fra PC-en. Modusen «uten hjelpemidler» er lagt inn i spillreglene (`packages/game`), men vises ikke i appen før Pro-kjøpet er laget.
2. Pro-kjøp og «uten hjelpemidler»-modus – kode ferdig 19.11: `expo-iap` (6.5.1) direkte mot App Store, produkt-ID `worldofsudoku_pro`. Pro-seksjon med kjøp og «Gjenopprett kjøp» i innstillinger, valg av «uten hjelpemidler» ved start (bare Pro), «Tips av» og modus i tittel og resultat. Testet i nettleser med et testkjøp som bare finnes på web i utviklingsmodus. **Testet på iPhone 19.11:** kjøpet virker med sandbox-testkonto, og Pro aktiveres. Det krevde at Paid Apps-avtalen (bank og skatt) var Active og at produktet hadde skjermbilde til gjennomgang. Etterpå gikk det noen timer før App Store fant produktet. Appen henter nå produktet på nytt ved kjøp hvis det ikke ble funnet ved oppstart.
3. Game Center og topplister – kode ferdig 19.11: egen lokal Expo-modul (`app/modules/game-center`, Swift/GameKit) for innlogging, innsending og visning av lister. Resultater legges i kø og sendes når spilleren er logget inn i Game Center (bare Pro-brukere blir spurt). 31 lister: per nivå raskest og flest løste for totalt, uke og 4 uker, pluss dagens brett. Periodene starter mandag 23.11.2026 kl. 00:00 norsk tid. «Månedslisten» er 4 uker (Apple tillater maks 30 dager). Oppsett i App Store Connect: `store/game-center.md`. Testet i nettleser (kø og meldinger). De 31 listene er opprettet i App Store Connect 19.11 med skriptet `npm run create-leaderboards` (navn på engelsk og norsk, maks 30 tegn). Apple krever varighet med tidsdel (`PT168H` osv.). **Gjenstår:** nytt bygg og test på iPhone.
4. AdMob med samtykke og sporingsspørsmål – kode ferdig 19.11: `react-native-google-mobile-ads` (17.4.0). Ved oppstart viser Googles samtykkeverktøy (UMP) GDPR-meldingen og IDFA-forklaringen fra AdMob og deretter Apples sporingsspørsmål. Banner (320×50) nederst på hjem, statistikk og innstillinger, ikke under spill. Fullskjermsannonse etter hvert 2. fullførte spill, når spilleren forlater resultatet. Knappen «Personvern for annonser» i innstillinger (der Google krever det). Ingen annonser eller samtykkespørsmål for Pro. Under utvikling brukes Googles test-ID-er. Android-ID i `app.json` er Googles test-ID til Android får egen AdMob-app. Testet i nettleser med plassholder. **Gjenstår:** nytt bygg og test på iPhone.
5. Ny personvernerklæring, butikktekster og App Privacy.
6. Nytt bygg til TestFlight.

### Fase 3 – Kontoer og backend
- Innlogging via Supabase.
- Flytte lokal statistikk til kontoen, synkronisering mellom enheter.
- Topplister (f.eks. for dagens brett).

**Ferdig når:** en spiller kan logge inn på ny telefon og finne igjen statistikken sin.

### Fase 4 – Online duell (PVP)

Besluttet 19.11. Lages **etter** at versjon 1 er lansert, som en oppdatering.

| Tema | Beslutning |
|---|---|
| Hvem | Bare Pro |
| Teknologi | Apple Game Center: matchmaking, venneinvitasjoner og sanntidsforbindelse mellom telefonene. Ingen egen server i første omgang. Bare iPhone/iPad |
| Kampform | Begge får **samme brett**. Nedtelling **5 → 0** på begge telefonene samtidig, deretter starter klokken. Først ferdig med riktig brett vinner |
| Hjelpemidler | Som «uten hjelpemidler»: ingen auto-sjekk og ingen tips, notater og markering er tillatt |
| Feil levering | **30 s straff** og spill videre. Feilene vises ikke. Spilleren kan levere på nytt (straffen justeres etter testing) |
| Nivå | Spilleren velger nivå og matches mot noen på samme nivå med lignende rangering |
| Ingen motstander | «Søker etter motstander…» med avbryt-knapp. Søket utvides gradvis til større forskjell i rangering. I tillegg kan man **invitere en Game Center-venn** direkte |
| Frakobling | 30 sekunder til å koble til igjen, ellers tap. Å forlate kampen med vilje gir tap med en gang |
| Rangering | **Elo per nivå**, starter på 1000. Seier mot en sterkere spiller gir flere poeng |
| Rangeringstavle | Én Game Center-liste per nivå med rangeringen (`wos.pvp.l1.rating` … `l5`). Typen må være «Most Recent Score», fordi rangeringen også kan gå ned |

**Forslag til teknisk løsning (ikke besluttet):**
- Matchmaking med `GKMatchmaker`. Game Center matcher ikke på Elo direkte, så nivå og et rangeringsspenn legges i «player group» (f.eks. nivå 3, 950–1049). Etter en stund byttes det til bredere spenn.
- Den ene telefonen velger brettet fra brettbanken og sender ID-en. Nedtellingen startes med et felles tidspunkt, så begge starter likt.
- Underveis sendes bare fremdrift (antall fylte ruter), aldri tallene. Ved levering sendes brettet til motstanderen, som sjekker det mot fasiten.
- Ny rangering regnes ut på begge telefoner etter samme formel. Den sendes til Game Center-listen.

**Risiko:** uten egen server er det telefonene som avgjør resultatet. En jukser kan i teorien rapportere falsk seier eller rangering. Blir det et problem, flyttes kampene til en egen server (Supabase) slik planen opprinnelig foreslo.

**Ferdig når:** to Pro-spillere på samme nivå blir satt sammen (eller en venn invitert), ser nedtellingen samtidig, spiller samme brett, og vinneren får høyere rangering på tavlen.

### Fase 5 – Utvidelser
Vennekamper, turneringer, sesonger, temaer, eventuell inntektsmodell.

## 7. Åpne spørsmål

**Før fase 1**
1. ~~Levering, avslutning og tips ved feil~~ – avklart 17.11 (se spilleregler).
2. ~~Visuell stil~~ – avklart 17.11: stil A med runde former og notatrad (se utseende).
3. ~~Linjer rundt 3×3-boksene~~ – avklart 17.11: klassisk rutenett med runde hjørner.
4. ~~Farger og logo~~ – avklart 17.11: blå aksentfarge, logo A (rutenett).
5. ~~Lagring når appen lukkes~~ – avklart 17.11: lagres alltid.
6. ~~Antall utgangstall~~ – avklart 17.11: tilfeldig antall innenfor et eget spenn per nivå (se brett og nivåer).

**Fra fase 1 (valg jeg tok underveis – bekreft eller endre)**
13. ~~Dagens brett én gang per dag~~ – avklart 17.11: ja, også ved tap.
14. ~~Bekreftelse på «Lever brett»~~ – avklart 17.11: nei, leveres med en gang.
15. ~~Nivå per ukedag~~ – avklart 17.11: beholdes som foreslått.

**Før lansering (fase 2)**
16. ~~Navnet~~ – avklart 17.11: «World of Sudoku» beholdes, selv om en liten app med samme navn finnes fra før.
17. ~~Kontakt-e-post~~ – avklart 19.11: thomas.hornsletten@gmail.com.
18. ~~Publisering av personvernerklæringen~~ – avklart 17.11: Google Sites.
19. ~~Målgruppe~~ – avklart 17.11: 13 år og eldre.

**Før fase 2**
7. ~~Utgiver~~ – avklart 17.11: privatperson.
8. ~~Forretningsmodell for første versjon~~ – avklart 17.11: gratis, uten annonser og kjøp.

**Før fase 4**
9. ~~Tips og auto-sjekk i online-kamper~~ – avklart 19.11: som «uten hjelpemidler».
10. ~~Ingen motstander~~ – avklart 19.11: vente med avbryt, utvide søket, og mulighet til å invitere en venn.
11. ~~Frakobling~~ – avklart 19.11: 30 sekunder, så tap.
12. ~~Rangering~~ – avklart 19.11: Elo per nivå.

## 8. Risikoer

| Risiko | Tiltak |
|---|---|
| Logikkmotoren tar lengre tid enn ventet | Bygges først (fase 0), med de enkleste teknikkene først. Nivå 1–3 kan lanseres før 4–5 om nødvendig |
| Gradering oppleves feil av spillere | Justeres i fase 2 med reelle løsningstider fra testere |
| Juks online | Servervalidering, fasit aldri på klienten, mulighet for å flagge usannsynlig raske tider |
| For få spillere til matchmaking | Vennekamper og dagens brett gir verdi uten stor spillerbase. Åpent spørsmål 10 |
| iOS-bygging uten Mac | Expo sin skybygging (EAS) bygger iOS-apper uten Mac |
| Navnet er tatt i en app-butikk | Sjekkes tidlig i fase 2. Har et reservenavn klart |
