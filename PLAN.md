# World of Sudoku – prosjektplan

Sist oppdatert: 17.11.2026

Dokumentet skiller mellom tre ting:

- **Besluttet** – avklart med deg.
- **Forslag** – min anbefaling, ikke besluttet. Krever ditt ja/nei.
- **Åpent** – må avgjøres før den aktuelle fasen starter.

## Status – her fortsetter vi

Fase 0 er ferdig (17.11): motor, tester, brettbank og Expo-app er på plass (se kapittel 6). Fase 0 er committet i git (main).

Avklart 17.11: brettbank, nivånavn, teknikkinndeling, tilleggsfunksjoner, auto-sjekk (inkl. levering, avslutning og tips ved feil), lagring, appnavn, utseende (stil A, notatrad, klassisk rutenett), blå aksentfarge og logo A.

Fase 1 (enspiller) er bygget og testet i nettleser 17.11, men ikke på telefon og ikke committet.

Neste steg: teste på telefon med Expo Go, avklare åpne spørsmål 13–15, og deretter fase 2.

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
| Forretningsmodell | Ikke bestemt. Ingenting bygges for annonser/betaling i fase 1, men ingenting skal stenge for det |
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
| Kampform | Begge får samme brett samtidig. Først ferdig vinner |

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

### Fase 3 – Kontoer og backend
- Innlogging via Supabase.
- Flytte lokal statistikk til kontoen, synkronisering mellom enheter.
- Topplister (f.eks. for dagens brett).

**Ferdig når:** en spiller kan logge inn på ny telefon og finne igjen statistikken sin.

### Fase 4 – Online duell
- Matchmaking-kø basert på rating.
- Sanntidskamp på samme brett, med servervalidering og serverklokke.
- Ratingoppdatering etter kamp, kamphistorikk.
- Håndtering av frakobling og avbrutte kamper.

**Ferdig når:** to spillere med lik rating blir satt sammen, spiller en kamp og får oppdatert rating.

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
13. Dagens brett kan spilles én gang per dag, også hvis det ikke blir løst. Er det riktig?
14. «Lever brett» har ingen bekreftelse («Er du sikker?»), selv om leveringen er endelig. Ønskes en bekreftelse?
15. Nivå per ukedag for dagens brett: man Lett, tir Middels, ons Vanskelig, tor Ekspert, fre Vanskelig, lør Mester, søn Ekspert. Er fordelingen grei?

**Før fase 2**
7. Hvem står som utgiver i butikkene – privatperson eller firma?
8. Forretningsmodell. Annonser og kjøp påvirker personvernerklæring og butikkoppføring.

**Før fase 4**
9. Skal tips og auto-sjekk være tilgjengelig i online-kamper?
10. Hva skjer hvis det ikke finnes en motstander – vente, eller møte en datastyrt motstander?
11. Regel ved frakobling.
12. Skal det være én rating, eller én per nivå?

## 8. Risikoer

| Risiko | Tiltak |
|---|---|
| Logikkmotoren tar lengre tid enn ventet | Bygges først (fase 0), med de enkleste teknikkene først. Nivå 1–3 kan lanseres før 4–5 om nødvendig |
| Gradering oppleves feil av spillere | Justeres i fase 2 med reelle løsningstider fra testere |
| Juks online | Servervalidering, fasit aldri på klienten, mulighet for å flagge usannsynlig raske tider |
| For få spillere til matchmaking | Vennekamper og dagens brett gir verdi uten stor spillerbase. Åpent spørsmål 10 |
| iOS-bygging uten Mac | Expo sin skybygging (EAS) bygger iOS-apper uten Mac |
| Navnet er tatt i en app-butikk | Sjekkes tidlig i fase 2. Har et reservenavn klart |
