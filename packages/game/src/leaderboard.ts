/**
 * Topplister (Apple Game Center), som rene funksjoner.
 *
 * Lister per nivå: raskeste tid og flest løste brett, hver for perioden totalt,
 * uke og 4 uker. I tillegg én daglig liste (raskeste tid) for dagens brett.
 * Bare løste spill uten hjelpemidler teller (se isLeaderboardEligible).
 *
 * Gjentakende lister nullstilles i faste perioder regnet fra LEADERBOARD_ANCHOR_MS.
 * Startpunktet MÅ være det samme som i App Store Connect.
 */
import { Level } from '../../engine/src';
import { GameState, isLeaderboardEligible, totalMs } from './game';

export const DAY_MS = 86_400_000;
export const WEEK_MS = 7 * DAY_MS;
export const FOUR_WEEKS_MS = 28 * DAY_MS;

/**
 * Start for de gjentakende listene: mandag 23. november 2026 kl. 00:00 norsk tid
 * (vintertid, UTC+1) = 22. november kl. 23:00 UTC.
 * Merk: Game Center bruker faste lengder, så om sommeren (UTC+2) skjer nullstillingen kl. 01:00 norsk tid.
 */
export const LEADERBOARD_ANCHOR_MS = Date.UTC(2026, 10, 22, 23, 0, 0);

export type Period = 'all' | 'week' | 'fourWeeks';

const PERIOD_SUFFIX: Record<Period, string> = { all: 'all', week: 'week', fourWeeks: '4weeks' };
const PERIOD_LENGTH: Record<Exclude<Period, 'all'>, number> = { week: WEEK_MS, fourWeeks: FOUR_WEEKS_MS };

/** ID-er som må opprettes likt i App Store Connect. */
export const leaderboardIds = {
  fastest: (level: Level, period: Period) => `wos.l${level}.fastest.${PERIOD_SUFFIX[period]}`,
  solved: (level: Level, period: Period) => `wos.l${level}.solved.${PERIOD_SUFFIX[period]}`,
  daily: 'wos.daily.fastest',
};

export const PERIODS: Period[] = ['all', 'week', 'fourWeeks'];

/** Alle 31 liste-ID-er (til oppsett og kontroll). */
export function allLeaderboardIds(): string[] {
  const ids: string[] = [];
  for (const level of [1, 2, 3, 4, 5] as Level[]) {
    for (const p of PERIODS) ids.push(leaderboardIds.fastest(level, p));
    for (const p of PERIODS) ids.push(leaderboardIds.solved(level, p));
  }
  ids.push(leaderboardIds.daily);
  return ids;
}

/** Hvilken periode (forekomst) et tidspunkt hører til. */
export function periodIndex(now: number, length: number): number {
  return Math.floor((now - LEADERBOARD_ANCHOR_MS) / length);
}

/** Når perioden som `now` er i, slutter. */
export function periodEnd(now: number, length: number): number {
  return LEADERBOARD_ANCHOR_MS + (periodIndex(now, length) + 1) * length;
}

/** Tid til topplisten: hundredeler av et sekund (Game Center-format «Elapsed Time – hundredths»). */
export const toLeaderboardTime = (ms: number): number => Math.round(ms / 10);

interface PeriodCount {
  index: number;
  count: number;
}

export interface SolvedCounter {
  total: number;
  week: PeriodCount;
  fourWeeks: PeriodCount;
}

export type LeaderboardCounters = Partial<Record<Level, SolvedCounter>>;

export interface ScoreSubmission {
  leaderboardId: string;
  score: number;
  /** Etter dette tidspunktet hører resultatet til en avsluttet periode og sendes ikke. Null = gjelder alltid. */
  validUntil: number | null;
}

function bump(counter: PeriodCount | undefined, index: number): PeriodCount {
  return counter && counter.index === index ? { index, count: counter.count + 1 } : { index, count: 1 };
}

/**
 * Lager resultatene et ferdig spill skal sende, og oppdaterer tellingen av løste brett.
 * Spill som ikke kan registreres gir ingen resultater og endrer ikke tellingen.
 */
export function leaderboardSubmissions(
  game: GameState,
  counters: LeaderboardCounters,
): { counters: LeaderboardCounters; submissions: ScoreSubmission[] } {
  if (!isLeaderboardEligible(game) || game.finishedAt === null) return { counters, submissions: [] };
  const now = game.finishedAt;
  const level = game.level;
  const time = toLeaderboardTime(totalMs(game, now));
  const submissions: ScoreSubmission[] = [];

  // Raskeste tid.
  submissions.push({ leaderboardId: leaderboardIds.fastest(level, 'all'), score: time, validUntil: null });
  for (const p of ['week', 'fourWeeks'] as const) {
    submissions.push({
      leaderboardId: leaderboardIds.fastest(level, p),
      score: time,
      validUntil: periodEnd(now, PERIOD_LENGTH[p]),
    });
  }
  if (game.dailyDate) {
    submissions.push({ leaderboardId: leaderboardIds.daily, score: time, validUntil: periodEnd(now, DAY_MS) });
  }

  // Flest løste.
  const old = counters[level];
  const next: SolvedCounter = {
    total: (old?.total ?? 0) + 1,
    week: bump(old?.week, periodIndex(now, WEEK_MS)),
    fourWeeks: bump(old?.fourWeeks, periodIndex(now, FOUR_WEEKS_MS)),
  };
  submissions.push({ leaderboardId: leaderboardIds.solved(level, 'all'), score: next.total, validUntil: null });
  submissions.push({
    leaderboardId: leaderboardIds.solved(level, 'week'),
    score: next.week.count,
    validUntil: periodEnd(now, WEEK_MS),
  });
  submissions.push({
    leaderboardId: leaderboardIds.solved(level, 'fourWeeks'),
    score: next.fourWeeks.count,
    validUntil: periodEnd(now, FOUR_WEEKS_MS),
  });

  return { counters: { ...counters, [level]: next }, submissions };
}

/** Resultater som fortsatt kan sendes (perioden er ikke over). */
export function stillValid(submissions: ScoreSubmission[], now: number): ScoreSubmission[] {
  return submissions.filter((s) => s.validUntil === null || now < s.validUntil);
}
