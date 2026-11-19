import { describe, expect, it } from 'vitest';
import {
  allLeaderboardIds,
  createGame,
  DAY_MS,
  enterDigit,
  FOUR_WEEKS_MS,
  GameState,
  LEADERBOARD_ANCHOR_MS,
  leaderboardIds,
  leaderboardSubmissions,
  periodEnd,
  periodIndex,
  stillValid,
  submit,
  WEEK_MS,
} from '../src';

const PUZZLE = '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
const SOLUTION = '534678912672195348198342567859761423426853791713924856961537284287419635345286179';

function solvedGame(opts: { noAids: boolean; start: number; durationMs: number; daily?: boolean }): GameState {
  let g = createGame({
    puzzleId: '3-0001',
    puzzle: PUZZLE,
    solution: SOLUTION,
    level: 3,
    slot: opts.daily ? 'daily' : 'level-3',
    dailyDate: opts.daily ? '2026-11-24' : null,
    autoCheck: false,
    noAids: opts.noAids,
    now: opts.start,
  });
  for (let c = 0; c < 81; c++) {
    if (PUZZLE[c] === '0') g = enterDigit(g, c, Number(SOLUTION[c]), opts.start).state;
  }
  return submit(g, opts.start + opts.durationMs);
}

// Tirsdag i første uke etter startpunktet.
const T0 = LEADERBOARD_ANCHOR_MS + DAY_MS + 10 * 3_600_000;

describe('liste-ID-er', () => {
  it('har 31 unike lister', () => {
    const ids = allLeaderboardIds();
    expect(ids).toHaveLength(31);
    expect(new Set(ids).size).toBe(31);
    expect(ids).toContain('wos.l3.fastest.4weeks');
    expect(ids).toContain('wos.daily.fastest');
  });
});

describe('perioder', () => {
  it('starter på 0 ved startpunktet og teller oppover', () => {
    expect(periodIndex(LEADERBOARD_ANCHOR_MS, WEEK_MS)).toBe(0);
    expect(periodIndex(LEADERBOARD_ANCHOR_MS + WEEK_MS - 1, WEEK_MS)).toBe(0);
    expect(periodIndex(LEADERBOARD_ANCHOR_MS + WEEK_MS, WEEK_MS)).toBe(1);
    expect(periodEnd(T0, WEEK_MS)).toBe(LEADERBOARD_ANCHOR_MS + WEEK_MS);
  });

  it('startpunktet er mandag kl. 00:00 norsk vintertid', () => {
    const d = new Date(LEADERBOARD_ANCHOR_MS + 3_600_000); // UTC+1
    expect(d.getUTCDay()).toBe(1); // mandag
    expect(d.getUTCHours()).toBe(0);
  });
});

describe('resultater', () => {
  it('sender ingenting for spill med hjelpemidler', () => {
    const g = solvedGame({ noAids: false, start: T0, durationMs: 60_000 });
    expect(leaderboardSubmissions(g, {}).submissions).toEqual([]);
  });

  it('sender tid i hundredeler og teller løste brett', () => {
    const g = solvedGame({ noAids: true, start: T0, durationMs: 123_450 });
    const { counters, submissions } = leaderboardSubmissions(g, {});
    const byId = Object.fromEntries(submissions.map((s) => [s.leaderboardId, s]));
    expect(byId[leaderboardIds.fastest(3, 'all')].score).toBe(12_345);
    expect(byId[leaderboardIds.fastest(3, 'all')].validUntil).toBeNull();
    expect(byId[leaderboardIds.fastest(3, 'week')].validUntil).toBe(LEADERBOARD_ANCHOR_MS + WEEK_MS);
    expect(byId[leaderboardIds.solved(3, 'all')].score).toBe(1);
    expect(byId[leaderboardIds.daily]).toBeUndefined();
    expect(counters[3]?.total).toBe(1);
  });

  it('nullstiller uketellingen i ny uke, men ikke totalen', () => {
    let counters = leaderboardSubmissions(solvedGame({ noAids: true, start: T0, durationMs: 1000 }), {}).counters;
    counters = leaderboardSubmissions(solvedGame({ noAids: true, start: T0 + 1000, durationMs: 1000 }), counters).counters;
    expect(counters[3]?.week.count).toBe(2);
    const next = leaderboardSubmissions(
      solvedGame({ noAids: true, start: T0 + WEEK_MS, durationMs: 1000 }),
      counters,
    );
    expect(next.counters[3]?.total).toBe(3);
    expect(next.counters[3]?.week.count).toBe(1);
    expect(next.counters[3]?.fourWeeks.count).toBe(3);
    const solvedWeek = next.submissions.find((s) => s.leaderboardId === leaderboardIds.solved(3, 'week'));
    expect(solvedWeek?.score).toBe(1);
  });

  it('sender dagens brett også til den daglige listen', () => {
    const g = solvedGame({ noAids: true, start: T0, durationMs: 90_000, daily: true });
    const daily = leaderboardSubmissions(g, {}).submissions.find((s) => s.leaderboardId === leaderboardIds.daily);
    expect(daily?.score).toBe(9_000);
    expect(daily?.validUntil).toBe(LEADERBOARD_ANCHOR_MS + 2 * DAY_MS);
  });

  it('dropper resultater for perioder som er over', () => {
    const { submissions } = leaderboardSubmissions(solvedGame({ noAids: true, start: T0, durationMs: 1000 }), {});
    const later = stillValid(submissions, T0 + WEEK_MS);
    expect(later.map((s) => s.leaderboardId)).toEqual(
      expect.arrayContaining([leaderboardIds.fastest(3, 'all'), leaderboardIds.solved(3, 'all')]),
    );
    expect(later.some((s) => s.leaderboardId === leaderboardIds.fastest(3, 'week'))).toBe(false);
    expect(stillValid(submissions, T0 + FOUR_WEEKS_MS).length).toBe(2);
  });
});
