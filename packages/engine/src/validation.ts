/**
 * Validering av brett og trekk.
 */
import { CELL_COUNT, Grid, PEERS } from './board';

/** Ruter med et tall som også står i en rute i samme rad, kolonne eller boks. */
export function findConflicts(grid: Grid): number[] {
  const out: number[] = [];
  for (let c = 0; c < CELL_COUNT; c++) {
    const v = grid[c];
    if (v !== 0 && PEERS[c].some((p) => grid[p] === v)) out.push(c);
  }
  return out;
}

/** Alle ruter er fylt. */
export function isComplete(grid: Grid): boolean {
  return grid.every((v) => v !== 0);
}

/** Fylte ruter som ikke stemmer med fasiten. Tomme ruter regnes ikke som feil. */
export function findErrors(grid: Grid, solution: Grid): number[] {
  const out: number[] = [];
  for (let c = 0; c < CELL_COUNT; c++) {
    if (grid[c] !== 0 && grid[c] !== solution[c]) out.push(c);
  }
  return out;
}

/** Er et enkelt tall riktig i følge fasiten? (Brukes av auto-sjekk.) */
export function isCorrectEntry(cell: number, digit: number, solution: Grid): boolean {
  return solution[cell] === digit;
}

/** Brettet er fullt og helt riktig. */
export function isSolved(grid: Grid, solution: Grid): boolean {
  return isComplete(grid) && findErrors(grid, solution).length === 0;
}

/**
 * Resultat av «Lever brett» (auto-sjekk av).
 * Levering er bare tillatt når brettet er fullt.
 */
export type SubmitResult =
  | { status: 'incomplete' }
  | { status: 'correct' }
  | { status: 'wrong'; errors: number[] };

export function submitGrid(grid: Grid, solution: Grid): SubmitResult {
  if (!isComplete(grid)) return { status: 'incomplete' };
  const errors = findErrors(grid, solution);
  return errors.length === 0 ? { status: 'correct' } : { status: 'wrong', errors };
}
