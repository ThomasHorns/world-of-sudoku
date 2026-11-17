/**
 * Gradering og generering av brett.
 */
import { CELL_COUNT, Grid } from './board';
import { Level, solveLogically, TechniqueId } from './logic';
import { Rng, shuffle } from './random';
import { generateSolvedGrid, hasUniqueSolution, solve } from './solver';

export interface Grade {
  /** Nøyaktig én løsning. */
  unique: boolean;
  /** Kan løses helt med teknikkene motoren kjenner (uten gjetting). */
  solvableByLogic: boolean;
  /** Nivået brettet krever, eller null hvis det ikke kan graderes. */
  level: Level | null;
  /** Teknikkene som ble brukt, med antall ganger. */
  techniques: Partial<Record<TechniqueId, number>>;
}

export function gradePuzzle(puzzle: Grid): Grade {
  const unique = hasUniqueSolution(puzzle);
  const result = solveLogically(puzzle, 5);
  const techniques: Partial<Record<TechniqueId, number>> = {};
  for (const s of result.steps) techniques[s.technique] = (techniques[s.technique] ?? 0) + 1;
  const level = unique && result.solved && result.level !== 0 ? result.level : null;
  return { unique, solvableByLogic: result.solved, level, techniques };
}

export interface GeneratedPuzzle {
  puzzle: Grid;
  solution: Grid;
  level: Level;
}

/**
 * Lager ett forsøk på et brett for et nivå:
 * starter med en full løsning og fjerner tall i tilfeldig rekkefølge så lenge
 * brettet fortsatt kan løses med teknikker på eller under målnivået.
 * Et brett som kan løses helt logisk har alltid nøyaktig én løsning.
 *
 * Returnerer brettet hvis det faktisk krever målnivået, ellers null.
 */
export function tryGeneratePuzzle(level: Level, rng: Rng): GeneratedPuzzle | null {
  const solution = generateSolvedGrid(rng);
  const puzzle = solution.slice();
  for (const cell of shuffle([...Array(CELL_COUNT).keys()], rng)) {
    const keep = puzzle[cell];
    puzzle[cell] = 0;
    if (!solveLogically(puzzle, level).solved) puzzle[cell] = keep;
  }
  const result = solveLogically(puzzle, level);
  if (!result.solved || result.level !== level) return null;
  return { puzzle, solution, level };
}

/** Prøver inntil et brett på riktig nivå er funnet, eller gir opp etter `maxAttempts`. */
export function generatePuzzle(
  level: Level,
  rng: Rng,
  maxAttempts = 10_000,
): GeneratedPuzzle | null {
  for (let i = 0; i < maxAttempts; i++) {
    const p = tryGeneratePuzzle(level, rng);
    if (p) return p;
  }
  return null;
}

/** Full kontroll av et ferdig brett, som brukes når brettbanken verifiseres. */
export function verifyPuzzle(puzzle: Grid, solution: Grid, level: Level): string[] {
  const problems: string[] = [];
  const grade = gradePuzzle(puzzle);
  if (!grade.unique) problems.push('har ikke nøyaktig én løsning');
  if (!grade.solvableByLogic) problems.push('kan ikke løses uten gjetting');
  if (grade.level !== level) problems.push(`gradert til nivå ${grade.level}, forventet ${level}`);
  const solved = solve(puzzle);
  if (!solved || solved.join('') !== solution.join('')) problems.push('fasiten stemmer ikke');
  for (let c = 0; c < CELL_COUNT; c++) {
    if (puzzle[c] !== 0 && puzzle[c] !== solution[c]) {
      problems.push('utgangstall stemmer ikke med fasiten');
      break;
    }
  }
  return problems;
}
