/**
 * Statistikk per nivå, med egne rekorder for spill med og uten auto-sjekk.
 * Tiden som lagres er total tid inkludert straff.
 */
import { Level } from '../../engine/src';
import { GameState, totalMs } from './game';

export interface ModeStats {
  won: number;
  lost: number;
  bestMs: number | null;
  /** Sum av tid for vunne spill (for snittid). */
  totalWonMs: number;
}

export interface LevelStats {
  autoCheck: ModeStats;
  noAutoCheck: ModeStats;
  hints: number;
  errors: number;
}

export type Stats = Record<Level, LevelStats>;

const LEVELS: Level[] = [1, 2, 3, 4, 5];

const emptyMode = (): ModeStats => ({ won: 0, lost: 0, bestMs: null, totalWonMs: 0 });

export function emptyStats(): Stats {
  const s = {} as Stats;
  for (const l of LEVELS) s[l] = { autoCheck: emptyMode(), noAutoCheck: emptyMode(), hints: 0, errors: 0 };
  return s;
}

export const averageMs = (m: ModeStats): number | null => (m.won ? m.totalWonMs / m.won : null);

export interface RecordResult {
  stats: Stats;
  /** Ny beste tid for nivået og modusen. */
  newRecord: boolean;
  timeMs: number;
}

/** Registrerer et ferdig spill. Spill som ikke er ferdige endrer ingenting. */
export function recordGame(stats: Stats, game: GameState): RecordResult {
  const timeMs = totalMs(game, game.finishedAt ?? 0);
  if (game.status === 'playing') return { stats, newRecord: false, timeMs };
  const key = game.autoCheck ? 'autoCheck' : 'noAutoCheck';
  const level = stats[game.level];
  const mode = { ...level[key] };
  let newRecord = false;
  if (game.status === 'won') {
    newRecord = mode.bestMs === null || timeMs < mode.bestMs;
    mode.won++;
    mode.totalWonMs += timeMs;
    if (newRecord) mode.bestMs = timeMs;
  } else {
    mode.lost++;
  }
  const errors = game.errorCount + game.wrongCells.length;
  return {
    stats: {
      ...stats,
      [game.level]: {
        ...level,
        [key]: mode,
        hints: level.hints + game.hintCount,
        errors: level.errors + errors,
      },
    },
    newRecord,
    timeMs,
  };
}
