/**
 * Brettbanken: ferdig graderte brett for hvert nivå.
 * Lages med `npm run generate-bank` og kontrolleres med `npm run verify-bank`.
 */
import level1 from './data/level-1.json';
import level2 from './data/level-2.json';
import level3 from './data/level-3.json';
import level4 from './data/level-4.json';
import level5 from './data/level-5.json';

export interface BankPuzzle {
  /** Unik id, f.eks. "3-0042" (nivå 3, brett 42). */
  id: string;
  /** 81 tegn, 0 = tom rute. */
  puzzle: string;
  /** 81 tegn, fasit. */
  solution: string;
}

export type BankLevel = 1 | 2 | 3 | 4 | 5;

export const PUZZLE_BANK: Record<BankLevel, BankPuzzle[]> = {
  1: level1.puzzles,
  2: level2.puzzles,
  3: level3.puzzles,
  4: level4.puzzles,
  5: level5.puzzles,
};

export function getPuzzleById(id: string): BankPuzzle | undefined {
  const level = Number(id.split('-')[0]) as BankLevel;
  return PUZZLE_BANK[level]?.find((p) => p.id === id);
}
