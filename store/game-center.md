# Game Center – topplister i App Store Connect

Appen sender resultater til disse 31 listene. **ID-ene (Leaderboard ID) må skrives nøyaktig slik.** De kan ikke endres eller brukes på nytt etter at de er opprettet.

Startpunkt for alle gjentakende lister: **mandag 23. november 2026 kl. 00:00 norsk tid** (= 22. november 2026 kl. 23:00 UTC). Dette må stemme med appen (`LEADERBOARD_ANCHOR_MS` i `packages/game/src/leaderboard.ts`).

## Felles innstillinger

| | Raskest («fastest») | Flest løste («solved») |
|---|---|---|
| Score Format Type | Elapsed Time – **hundredths of a second** | Integer |
| Score Submission Type | Best Score | Best Score |
| Sort Order | **Low to High** (lavest tid er best) | **High to Low** |
| Score Range | La stå tom | La stå tom |

Appen sender tid i hundredeler av et sekund (1 min 23,45 s = 8345). Vises tidene feil i testing (f.eks. 100 ganger for lange), må formatet eller appen justeres – si fra.

| Periode | Type liste | Start | Varighet | Gjentas hver |
|---|---|---|---|---|
| `all` | Classic | – | – | – |
| `week` | Recurring | 23.11.2026 00:00 norsk tid | 7 dager | 7 dager |
| `4weeks` | Recurring | 23.11.2026 00:00 norsk tid | 28 dager | 28 dager |
| dagens brett | Recurring | 23.11.2026 00:00 norsk tid | 1 dag | 1 dag |

App Store Connect kan be om tid i en bestemt tidssone. Velg Oslo/CET hvis mulig, ellers UTC 22.11.2026 kl. 23:00.

## De 31 listene

Navn (Display Name) skal legges inn på engelsk og norsk. Apple tillater maks 30 tegn.

| Leaderboard ID | Type | English name | Norsk navn |
|---|---|---|---|
| `wos.l1.fastest.all` | Classic | Easy: Fastest | Lett: Raskest |
| `wos.l1.fastest.week` | Recurring 7 d | Easy: Fastest (week) | Lett: Raskest (uke) |
| `wos.l1.fastest.4weeks` | Recurring 28 d | Easy: Fastest (4 weeks) | Lett: Raskest (4 uker) |
| `wos.l1.solved.all` | Classic | Easy: Most solved | Lett: Flest løst |
| `wos.l1.solved.week` | Recurring 7 d | Easy: Most solved (week) | Lett: Flest løst (uke) |
| `wos.l1.solved.4weeks` | Recurring 28 d | Easy: Most solved (4 weeks) | Lett: Flest løst (4 uker) |
| `wos.l2.fastest.all` | Classic | Medium: Fastest | Middels: Raskest |
| `wos.l2.fastest.week` | Recurring 7 d | Medium: Fastest (week) | Middels: Raskest (uke) |
| `wos.l2.fastest.4weeks` | Recurring 28 d | Medium: Fastest (4 weeks) | Middels: Raskest (4 uker) |
| `wos.l2.solved.all` | Classic | Medium: Most solved | Middels: Flest løst |
| `wos.l2.solved.week` | Recurring 7 d | Medium: Most solved (week) | Middels: Flest løst (uke) |
| `wos.l2.solved.4weeks` | Recurring 28 d | Medium: Most solved (4 weeks) | Middels: Flest løst (4 uker) |
| `wos.l3.fastest.all` | Classic | Hard: Fastest | Vanskelig: Raskest |
| `wos.l3.fastest.week` | Recurring 7 d | Hard: Fastest (week) | Vanskelig: Raskest (uke) |
| `wos.l3.fastest.4weeks` | Recurring 28 d | Hard: Fastest (4 weeks) | Vanskelig: Raskest (4 uker) |
| `wos.l3.solved.all` | Classic | Hard: Most solved | Vanskelig: Flest løst |
| `wos.l3.solved.week` | Recurring 7 d | Hard: Most solved (week) | Vanskelig: Flest løst (uke) |
| `wos.l3.solved.4weeks` | Recurring 28 d | Hard: Most solved (4 weeks) | Vanskelig: Flest løst (4 uker) |
| `wos.l4.fastest.all` | Classic | Expert: Fastest | Ekspert: Raskest |
| `wos.l4.fastest.week` | Recurring 7 d | Expert: Fastest (week) | Ekspert: Raskest (uke) |
| `wos.l4.fastest.4weeks` | Recurring 28 d | Expert: Fastest (4 weeks) | Ekspert: Raskest (4 uker) |
| `wos.l4.solved.all` | Classic | Expert: Most solved | Ekspert: Flest løst |
| `wos.l4.solved.week` | Recurring 7 d | Expert: Most solved (week) | Ekspert: Flest løst (uke) |
| `wos.l4.solved.4weeks` | Recurring 28 d | Expert: Most solved (4 weeks) | Ekspert: Flest løst (4 uker) |
| `wos.l5.fastest.all` | Classic | Master: Fastest | Mester: Raskest |
| `wos.l5.fastest.week` | Recurring 7 d | Master: Fastest (week) | Mester: Raskest (uke) |
| `wos.l5.fastest.4weeks` | Recurring 28 d | Master: Fastest (4 weeks) | Mester: Raskest (4 uker) |
| `wos.l5.solved.all` | Classic | Master: Most solved | Mester: Flest løst |
| `wos.l5.solved.week` | Recurring 7 d | Master: Most solved (week) | Mester: Flest løst (uke) |
| `wos.l5.solved.4weeks` | Recurring 28 d | Master: Most solved (4 weeks) | Mester: Flest løst (4 uker) |
| `wos.daily.fastest` | Recurring 1 d | Daily puzzle: Fastest | Dagens brett: Raskest |

Reference Name (internt navn) kan være det samme som ID-en.

## Automatisk: skriptet `npm run create-leaderboards`

Skriptet (`tools/create-leaderboards.ts`) oppretter alle 31 listene med navn på engelsk og norsk. Lister som allerede finnes, hoppes over.

**1. Lag en API-nøkkel** (gjøres én gang):
1. App Store Connect → **Users and Access** → fanen **Integrations** → **App Store Connect API** → **Team Keys**.
2. Første gang: klikk **Request Access** og godta vilkårene.
3. Klikk **+** (Generate API Key). Navn: `Leaderboards`. Access: **App Manager**. Klikk **Generate**.
4. Klikk **Download** for å laste ned filen `AuthKey_XXXXXXXXXX.p8`. **Den kan bare lastes ned én gang.** Lagre den utenfor prosjektmappen, for eksempel i `C:\Users\<deg>\Documents\AppleKeys\`.
5. Noter **Key ID** (står i listen) og **Issuer ID** (står øverst på siden).

**2. Test med én liste først** (fra prosjektmappen, i en terminal):

```
npm run create-leaderboards -- --key-id KEY_ID --issuer-id ISSUER_ID --key-file "C:\Users\<deg>\Documents\AppleKeys\AuthKey_KEY_ID.p8" --only wos.l1.fastest.all
```

Sjekk i App Store Connect → Game Center at listen «Lett – Raskest» / «Easy – Fastest» finnes.

**3. Lag resten** – samme kommando uten `--only ...`.

**4. Slett nøkkelen** når listene er laget (Team Keys → Revoke), eller behold den hvis den skal brukes senere. Ikke del .p8-filen med noen.

Stopper skriptet med en feilmelding fra Apple, send meldingen til Claude.

## Steg i App Store Connect (for hånd)

1. **Apps → World of Sudoku → Game Center** (venstremenyen, under «Growth & Marketing»).
2. Velg at appen bruker Game Center for seg selv (ikke delt med andre apper), hvis den spør.
3. Under **Leaderboards**, klikk **+** for hver liste:
   - Velg **Classic** eller **Recurring** etter tabellen.
   - Reference Name og Leaderboard ID: ID-en fra tabellen.
   - Score Format, Submission Type, Sort Order: etter «Felles innstillinger».
   - For Recurring: startdato/-tid, varighet og gjentakelse etter tabellen.
   - **Localization**: legg til English og Norwegian med navnene fra tabellen. For «Elapsed Time» velges ingen enhet (suffix). For «Most solved» kan suffix være « solved» / « løste».
4. På **versjonssiden (1.0.0)**: huk av for **Game Center** og legg til listene der når appen sendes inn.

Listene kan testes i utviklerversjonen før de er godkjent av Apple. Spillere ser dem først når appen er publisert.
