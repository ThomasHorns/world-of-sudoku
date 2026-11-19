/**
 * Oppretter de 31 Game Center-topplistene i App Store Connect via App Store Connect API.
 *
 * Nøkkelen blir aldri lagret i prosjektet: du peker på .p8-filen der du har den.
 *
 * Bruk (fra prosjektmappen):
 *   npm run create-leaderboards -- --dry-run
 *   npm run create-leaderboards -- --key-id ABC123 --issuer-id 1234-... --key-file C:\sti\AuthKey_ABC123.p8 --only wos.l1.fastest.all
 *   npm run create-leaderboards -- --key-id ABC123 --issuer-id 1234-... --key-file C:\sti\AuthKey_ABC123.p8
 *
 * Valg:
 *   --app-id     Apple-ID for appen (standard: 6836692482, World of Sudoku)
 *   --only       Lag bare én liste (bra for å teste først)
 *   --dry-run    Vis hva som ville blitt sendt, uten nøkkel og uten å endre noe
 *
 * Lister som allerede finnes (samme ID) hoppes over, så skriptet kan kjøres flere ganger.
 */
import { createPrivateKey, sign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Level } from '../packages/engine/src';
import { leaderboardIds, Period, PERIODS } from '../packages/game/src';

const API = 'https://api.appstoreconnect.apple.com';

// Startpunkt for gjentakende lister: mandag 23.11.2026 kl. 00:00 norsk tid (= 22.11 kl. 23:00 UTC).
// Må være likt LEADERBOARD_ANCHOR_MS i packages/game/src/leaderboard.ts.
const RECURRENCE_START = '2026-11-22T23:00:00Z';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const flag = (name: string) => process.argv.includes(`--${name}`);

const DRY_RUN = flag('dry-run');
const APP_ID = arg('app-id') ?? '6836692482';
const ONLY = arg('only');

// ---------------------------------------------------------------------------
// Definisjon av listene

interface LeaderboardDef {
  id: string;
  kind: 'fastest' | 'solved';
  /** Varighet og gjentakelse i dager. */
  recurrence: { days: number } | null;
  names: { en: string; no: string };
}

/**
 * Apple krever varighet «med tidsdel» (P7D godtas ikke) og sier ikke nøyaktig hvilken form.
 * Skriptet prøver disse i rekkefølge og husker den første som godtas.
 */
const DURATION_FORMATS = [
  (d: number) => `P${d}DT0H0M0S`,
  (d: number) => `PT${d * 24}H`,
  (d: number) => `P${d}DT0H`,
];
const RULE_FORMATS = [
  (d: number) => `FREQ=DAILY;INTERVAL=${d}`,
  (d: number) => `RRULE:FREQ=DAILY;INTERVAL=${d}`,
  (d: number) => (d % 7 === 0 ? `FREQ=WEEKLY;INTERVAL=${d / 7}` : `FREQ=DAILY;INTERVAL=${d}`),
];
let durationFormat = 0;
let ruleFormat = 0;

const LEVEL_NAMES: Record<Level, { en: string; no: string }> = {
  1: { en: 'Easy', no: 'Lett' },
  2: { en: 'Medium', no: 'Middels' },
  3: { en: 'Hard', no: 'Vanskelig' },
  4: { en: 'Expert', no: 'Ekspert' },
  5: { en: 'Master', no: 'Mester' },
};

// Apple tillater maks 30 tegn i navnet. Lengste: «Vanskelig: Flest løst (4 uker)» = 30.
const PERIOD_TEXT: Record<Period, { en: string; no: string }> = {
  all: { en: '', no: '' },
  week: { en: ' (week)', no: ' (uke)' },
  fourWeeks: { en: ' (4 weeks)', no: ' (4 uker)' },
};
const MAX_NAME = 30;

const RECURRENCE: Record<Period, LeaderboardDef['recurrence']> = {
  all: null,
  week: { days: 7 },
  fourWeeks: { days: 28 },
};

function definitions(): LeaderboardDef[] {
  const defs: LeaderboardDef[] = [];
  for (const level of [1, 2, 3, 4, 5] as Level[]) {
    const ln = LEVEL_NAMES[level];
    for (const p of PERIODS) {
      defs.push({
        id: leaderboardIds.fastest(level, p),
        kind: 'fastest',
        recurrence: RECURRENCE[p],
        names: { en: `${ln.en}: Fastest${PERIOD_TEXT[p].en}`, no: `${ln.no}: Raskest${PERIOD_TEXT[p].no}` },
      });
    }
    for (const p of PERIODS) {
      defs.push({
        id: leaderboardIds.solved(level, p),
        kind: 'solved',
        recurrence: RECURRENCE[p],
        names: { en: `${ln.en}: Most solved${PERIOD_TEXT[p].en}`, no: `${ln.no}: Flest løst${PERIOD_TEXT[p].no}` },
      });
    }
  }
  defs.push({
    id: leaderboardIds.daily,
    kind: 'fastest',
    recurrence: { days: 1 },
    names: { en: 'Daily puzzle: Fastest', no: 'Dagens brett: Raskest' },
  });
  return defs;
}

function leaderboardAttributes(def: LeaderboardDef) {
  return {
    referenceName: def.id,
    vendorIdentifier: def.id,
    defaultFormatter: def.kind === 'fastest' ? 'ELAPSED_TIME_CENTISECOND' : 'INTEGER',
    submissionType: 'BEST_SCORE',
    scoreSortType: def.kind === 'fastest' ? 'ASC' : 'DESC',
    ...(def.recurrence
      ? {
          recurrenceStartDate: RECURRENCE_START,
          recurrenceDuration: DURATION_FORMATS[durationFormat](def.recurrence.days),
          recurrenceRule: RULE_FORMATS[ruleFormat](def.recurrence.days),
        }
      : {}),
  };
}

function localizations(def: LeaderboardDef) {
  const suffix = def.kind === 'solved';
  return [
    {
      locale: 'en-US',
      name: def.names.en,
      ...(suffix ? { formatterSuffix: ' solved', formatterSuffixSingular: ' solved' } : {}),
    },
    {
      locale: 'no',
      name: def.names.no,
      ...(suffix ? { formatterSuffix: ' løste', formatterSuffixSingular: ' løst' } : {}),
    },
  ];
}

// ---------------------------------------------------------------------------
// API

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function makeToken(keyId: string, issuerId: string, keyFile: string): string {
  const header = { alg: 'ES256', kid: keyId, typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: issuerId, iat: now, exp: now + 15 * 60, aud: 'appstoreconnect-v1' };
  const data = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const key = createPrivateKey(readFileSync(keyFile));
  const signature = sign('sha256', Buffer.from(data), { key, dsaEncoding: 'ieee-p1363' });
  return `${data}.${base64url(signature)}`;
}

let token = '';

async function api(method: string, path: string, body?: unknown): Promise<any> {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const errors = (json?.errors ?? []).map((e: any) => `${e.title ?? ''}: ${e.detail ?? ''}`).join(' | ');
    const error = new Error(`${method} ${path} feilet (${res.status}): ${errors || text}`);
    (error as any).status = res.status;
    throw error;
  }
  return json;
}

async function gameCenterDetailId(): Promise<string> {
  try {
    const res = await api('GET', `/v1/apps/${APP_ID}/gameCenterDetail`);
    if (res?.data?.id) return res.data.id;
  } catch (e: any) {
    if (e.status !== 404) throw e;
  }
  console.log('Game Center er ikke slått på for appen ennå – slår det på.');
  const created = await api('POST', '/v1/gameCenterDetails', {
    data: { type: 'gameCenterDetails', relationships: { app: { data: { type: 'apps', id: APP_ID } } } },
  });
  return created.data.id;
}

/** Eksisterende lister: ID (vendorIdentifier) -> Apples interne ID. */
async function existingLeaderboards(detailId: string): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  let path: string | null =
    `/v1/gameCenterDetails/${detailId}/gameCenterLeaderboards?limit=200&fields[gameCenterLeaderboards]=vendorIdentifier`;
  while (path) {
    const res: any = await api('GET', path);
    for (const lb of res.data ?? []) ids.set(lb.attributes.vendorIdentifier, lb.id);
    path = res.links?.next ? res.links.next.replace(API, '') : null;
  }
  return ids;
}

async function postLeaderboard(def: LeaderboardDef, detailId: string): Promise<any> {
  const localVersionId = '${version}';
  return api('POST', '/v2/gameCenterLeaderboards', {
    data: {
      type: 'gameCenterLeaderboards',
      attributes: leaderboardAttributes(def),
      relationships: {
        gameCenterDetail: { data: { type: 'gameCenterDetails', id: detailId } },
        versions: { data: [{ type: 'gameCenterLeaderboardVersions', id: localVersionId }] },
      },
    },
    included: [{ type: 'gameCenterLeaderboardVersions', id: localVersionId }],
  });
}

/** Oppretter listen. For gjentakende lister prøves neste skrivemåte hvis Apple avviser varighet/regel. */
async function postWithFormatFallback(def: LeaderboardDef, detailId: string): Promise<any> {
  for (;;) {
    try {
      return await postLeaderboard(def, detailId);
    } catch (e: any) {
      const msg = String(e.message);
      if (def.recurrence && msg.includes('recurrenceDuration') && durationFormat < DURATION_FORMATS.length - 1) {
        durationFormat++;
        console.log(`  Apple godtok ikke varigheten, prøver ${DURATION_FORMATS[durationFormat](def.recurrence.days)}`);
        continue;
      }
      if (def.recurrence && msg.includes('recurrenceRule') && ruleFormat < RULE_FORMATS.length - 1) {
        ruleFormat++;
        console.log(`  Apple godtok ikke regelen, prøver ${RULE_FORMATS[ruleFormat](def.recurrence.days)}`);
        continue;
      }
      throw e;
    }
  }
}

/** Oppretter listen og returnerer Apples interne ID. */
async function createLeaderboard(def: LeaderboardDef, detailId: string): Promise<string> {
  const res = await postWithFormatFallback(def, detailId);
  return res.data.id;
}

/**
 * Sørger for at listen har riktig navn på engelsk og norsk:
 * legger til navn som mangler og retter navn som er annerledes.
 * Returnerer antall endringer.
 */
async function syncNames(def: LeaderboardDef, leaderboardId: string): Promise<number> {
  const versions = await api('GET', `/v2/gameCenterLeaderboards/${leaderboardId}/versions`);
  const versionId: string | undefined = versions.data?.[0]?.id;
  if (!versionId) throw new Error(`Fant ikke versjonen til ${def.id}, så navnene kunne ikke legges inn.`);
  const existing = await api('GET', `/v2/gameCenterLeaderboardVersions/${versionId}/localizations`);
  let changes = 0;
  for (const loc of localizations(def)) {
    const current = (existing.data ?? []).find((l: any) => l.attributes?.locale === loc.locale);
    if (!current) {
      await api('POST', '/v2/gameCenterLeaderboardLocalizations', {
        data: {
          type: 'gameCenterLeaderboardLocalizations',
          attributes: loc,
          relationships: { version: { data: { type: 'gameCenterLeaderboardVersions', id: versionId } } },
        },
      });
      changes++;
      continue;
    }
    const { locale: _locale, ...wanted } = loc as Record<string, string>;
    const differs = Object.entries(wanted).some(([k, v]) => current.attributes?.[k] !== v);
    if (differs) {
      await api('PATCH', `/v2/gameCenterLeaderboardLocalizations/${current.id}`, {
        data: { type: 'gameCenterLeaderboardLocalizations', id: current.id, attributes: wanted },
      });
      changes++;
    }
  }
  return changes;
}

// ---------------------------------------------------------------------------

async function main() {
  let defs = definitions();
  if (ONLY) {
    defs = defs.filter((d) => d.id === ONLY);
    if (defs.length === 0) throw new Error(`Ukjent liste: ${ONLY}`);
  }
  const tooLong = defs.flatMap((d) => [d.names.en, d.names.no]).filter((n) => n.length > MAX_NAME);
  if (tooLong.length) throw new Error(`Navn over ${MAX_NAME} tegn: ${tooLong.join(', ')}`);

  if (DRY_RUN) {
    console.log(`Tørrkjøring: ${defs.length} lister for app ${APP_ID}. Ingenting sendes.\n`);
    for (const def of defs) {
      console.log(def.id);
      console.log('  ', JSON.stringify(leaderboardAttributes(def)));
      for (const loc of localizations(def)) console.log('  ', JSON.stringify(loc));
    }
    return;
  }

  const keyId = arg('key-id');
  const issuerId = arg('issuer-id');
  const keyFile = arg('key-file');
  if (!keyId || !issuerId || !keyFile) {
    throw new Error('Mangler --key-id, --issuer-id og/eller --key-file. Se toppen av skriptet.');
  }
  token = makeToken(keyId, issuerId, keyFile);

  const detailId = await gameCenterDetailId();
  const existing = await existingLeaderboards(detailId);
  let created = 0;
  let renamed = 0;
  for (const def of defs) {
    let id = existing.get(def.id);
    const isNew = !id;
    if (!id) {
      id = await createLeaderboard(def, detailId);
      created++;
    }
    const changes = await syncNames(def, id);
    if (changes) renamed++;
    const status = isNew ? 'Opprettet' : changes ? 'Navn oppdatert' : 'Uendret';
    console.log(`${status}: ${def.id} (${def.names.no} / ${def.names.en})`);
  }
  console.log(`\nFerdig. ${created} nye lister, ${renamed} med nye/rettede navn, ${defs.length} totalt.`);
}

main().catch((e) => {
  console.error(`\nStoppet: ${e.message}`);
  console.error('Send meldingen over til Claude hvis du er usikker på hva den betyr.');
  process.exit(1);
});
