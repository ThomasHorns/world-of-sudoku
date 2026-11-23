/**
 * Spillreglene for ett enspiller-spill, som rene funksjoner uten UI.
 * Alle funksjoner returnerer en ny tilstand; den gamle endres aldri.
 *
 * Regler (fra PLAN.md):
 * - Auto-sjekk velges før start og kan ikke endres.
 * - Auto-sjekk PÅ: feil tall blir røde og gir tidsstraff. Spillet avsluttes
 *   automatisk når siste rute er riktig.
 * - Auto-sjekk AV: ingen sjekk og ingen straff for feil. «Lever brett» kan bare
 *   trykkes når brettet er fullt, og leveringen er endelig.
 * - Tips gir tidsstraff. Har brettet feil tall, sier tipset bare at det finnes en feil.
 * - Notater ryddes automatisk i samme rad, kolonne og boks når et tall settes inn.
 * - Klokken går bare mens spillet er aktivt (ikke ved pause eller når appen er lukket).
 */
import {
  bit,
  getHint,
  Hint,
  isComplete,
  isSolved,
  Level,
  parseGrid,
  PEERS,
  submitGrid,
} from '../../engine/src';

export interface Penalties {
  errorMs: number;
  hintMs: number;
}

/** Startverdier, avklart 17.11. Skal justeres etter testing. */
export const DEFAULT_PENALTIES: Penalties = { errorMs: 30_000, hintMs: 30_000 };

export type Slot = 'level-1' | 'level-2' | 'level-3' | 'level-4' | 'level-5' | 'daily';

export const slotForLevel = (level: Level): Slot => `level-${level}` as Slot;

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  version: 1;
  puzzleId: string;
  slot: Slot;
  level: Level;
  /** Dato (ÅÅÅÅ-MM-DD) hvis dette er dagens brett. */
  dailyDate: string | null;
  /** Utgangsbrettet, 81 tegn. */
  givens: string;
  /** Fasiten, 81 tegn. */
  solution: string;
  /** Tallene på brettet nå (utgangstall + spillerens tall), 0 = tom. */
  values: number[];
  /** Notater per rute som bitmaske (bit d-1 = siffer d). */
  notes: number[];
  autoCheck: boolean;
  /**
   * Spill uten hjelpemidler (Pro): auto-sjekk og tips er av. Notater og markering er tillatt.
   * Bare slike spill kan registreres på topplistene. Mangler i eldre lagrede spill (= false).
   */
  noAids?: boolean;
  /** Aktiv spilletid uten straff, fram til `runningSince`. */
  elapsedMs: number;
  /** Tidspunkt klokken ble startet, eller null hvis den står. */
  runningSince: number | null;
  penaltyMs: number;
  errorCount: number;
  hintCount: number;
  status: GameStatus;
  /** Ruter som var feil ved levering (auto-sjekk av, spillet tapt). */
  wrongCells: number[];
  startedAt: number;
  finishedAt: number | null;
}

export interface NewGame {
  puzzleId: string;
  puzzle: string;
  solution: string;
  level: Level;
  slot: Slot;
  dailyDate?: string | null;
  autoCheck: boolean;
  /** Uten hjelpemidler. Overstyrer `autoCheck` (blir alltid av). */
  noAids?: boolean;
  now: number;
}

export function createGame(g: NewGame): GameState {
  return {
    version: 1,
    puzzleId: g.puzzleId,
    slot: g.slot,
    level: g.level,
    dailyDate: g.dailyDate ?? null,
    givens: g.puzzle,
    solution: g.solution,
    values: parseGrid(g.puzzle),
    notes: new Array(81).fill(0),
    autoCheck: g.noAids ? false : g.autoCheck,
    noAids: !!g.noAids,
    elapsedMs: 0,
    runningSince: g.now,
    penaltyMs: 0,
    errorCount: 0,
    hintCount: 0,
    status: 'playing',
    wrongCells: [],
    startedAt: g.now,
    finishedAt: null,
  };
}

export const isGiven = (s: GameState, cell: number): boolean => s.givens[cell] !== '0';
export const solutionAt = (s: GameState, cell: number): number => Number(s.solution[cell]);

/** Er tallet i ruten feil? (Gjelder bare spillerens egne tall.) */
export const isWrong = (s: GameState, cell: number): boolean =>
  !isGiven(s, cell) && s.values[cell] !== 0 && s.values[cell] !== solutionAt(s, cell);

/** Er tips tilgjengelig i dette spillet? (Ikke uten hjelpemidler.) */
export const hintsAllowed = (s: GameState): boolean => !s.noAids;

/**
 * Kan resultatet sendes til topplisten? Bare løste spill uten hjelpemidler.
 * (At spilleren har Pro sjekkes av appen.)
 */
export const isLeaderboardEligible = (s: GameState): boolean =>
  !!s.noAids && s.status === 'won' && !s.autoCheck && s.hintCount === 0;

/** Skal feil vises med rødt? Med auto-sjekk alltid, ellers bare etter tapt levering. */
export const showErrors = (s: GameState): boolean => s.autoCheck || s.status === 'lost';

// ---------------------------------------------------------------------------
// Klokke

export function activeMs(s: GameState, now: number): number {
  return s.elapsedMs + (s.runningSince !== null ? Math.max(0, now - s.runningSince) : 0);
}

/** Tiden som vises og lagres: aktiv tid + straff. */
export function totalMs(s: GameState, now: number): number {
  return activeMs(s, now) + s.penaltyMs;
}

export const isRunning = (s: GameState): boolean => s.runningSince !== null;

export function pause(s: GameState, now: number): GameState {
  if (s.runningSince === null) return s;
  return { ...s, elapsedMs: activeMs(s, now), runningSince: null };
}

export function resume(s: GameState, now: number): GameState {
  if (s.runningSince !== null || s.status !== 'playing') return s;
  return { ...s, runningSince: now };
}

function finish(s: GameState, status: GameStatus, now: number): GameState {
  return { ...pause(s, now), status, finishedAt: now };
}

// ---------------------------------------------------------------------------
// Trekk

const canEdit = (s: GameState, cell: number) =>
  s.status === 'playing' && cell >= 0 && cell < 81 && !isGiven(s, cell);

export interface MoveResult {
  state: GameState;
  /** Feil tall med auto-sjekk på (gir straff). */
  mistake: boolean;
}

export function enterDigit(
  s: GameState,
  cell: number,
  digit: number,
  now: number,
  penalties: Penalties = DEFAULT_PENALTIES,
): MoveResult {
  if (!canEdit(s, cell) || digit < 1 || digit > 9 || s.values[cell] === digit) {
    return { state: s, mistake: false };
  }
  const values = s.values.slice();
  const notes = s.notes.slice();
  values[cell] = digit;
  notes[cell] = 0;
  const clear = ~bit(digit);
  for (const p of PEERS[cell]) notes[p] &= clear;

  let next: GameState = { ...s, values, notes };
  const mistake = s.autoCheck && digit !== solutionAt(s, cell);
  if (mistake) {
    next = {
      ...next,
      errorCount: s.errorCount + 1,
      penaltyMs: s.penaltyMs + penalties.errorMs,
    };
  }
  if (s.autoCheck && isSolved(values, parseGrid(s.solution))) {
    next = finish(next, 'won', now);
  }
  return { state: next, mistake };
}

/** Slår et notat av/på. Bare i tomme ruter. */
export function toggleNote(s: GameState, cell: number, digit: number): GameState {
  if (!canEdit(s, cell) || s.values[cell] !== 0 || digit < 1 || digit > 9) return s;
  const notes = s.notes.slice();
  notes[cell] ^= bit(digit);
  return { ...s, notes };
}

/** Sletter tallet i ruten, eller notatene hvis ruten er tom. */
export function eraseCell(s: GameState, cell: number): GameState {
  if (!canEdit(s, cell)) return s;
  if (s.values[cell] !== 0) {
    const values = s.values.slice();
    values[cell] = 0;
    return { ...s, values };
  }
  if (s.notes[cell] === 0) return s;
  const notes = s.notes.slice();
  notes[cell] = 0;
  return { ...s, notes };
}

// ---------------------------------------------------------------------------
// Tips og levering

export interface HintResult {
  state: GameState;
  hint: Hint;
}

/**
 * @param skip Antall tips som allerede er vist uten at brettet eller notatene er endret.
 *             Da vises neste steg i stedet for det samme tipset igjen.
 */
export function requestHint(
  s: GameState,
  penalties: Penalties = DEFAULT_PENALTIES,
  skip = 0,
): HintResult {
  if (s.status !== 'playing' || !hintsAllowed(s)) return { state: s, hint: { kind: 'none' } };
  const hint = getHint(s.values, parseGrid(s.solution), s.notes, skip);
  if (hint.kind === 'none') return { state: s, hint };
  return {
    state: { ...s, hintCount: s.hintCount + 1, penaltyMs: s.penaltyMs + penalties.hintMs },
    hint,
  };
}

/** «Lever brett» er bare mulig uten auto-sjekk og når alle ruter er fylt. */
export const canSubmit = (s: GameState): boolean =>
  s.status === 'playing' && !s.autoCheck && isComplete(s.values);

export function submit(s: GameState, now: number): GameState {
  if (!canSubmit(s)) return s;
  const result = submitGrid(s.values, parseGrid(s.solution));
  if (result.status === 'correct') return finish(s, 'won', now);
  if (result.status === 'wrong') return { ...finish(s, 'lost', now), wrongCells: result.errors };
  return s;
}

/** Hvor mange av hvert siffer som står på brettet (indeks 1–9). */
export function digitCounts(s: GameState): number[] {
  const counts = new Array(10).fill(0);
  for (const v of s.values) if (v) counts[v]++;
  return counts;
}
